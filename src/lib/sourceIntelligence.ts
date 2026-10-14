import {
  resolveOperatingCoreAudience,
  type OperatingCore
} from './operatingCore.ts';
import {
  inferDefaultSourceRole,
  type ContextManifestSourceItem,
  type SourceTaskRole,
  type StudioWorkflow,
  type TaskSourceBinding
} from './contextCompiler.ts';

export const SOURCE_INTELLIGENCE_STORAGE_KEY = 'coh_source_intelligence_v1';
export const SOURCE_INTELLIGENCE_SCHEMA_VERSION = '1.0' as const;
export const SOURCE_INTELLIGENCE_DISCLAIMER =
  'AI interpretation of the source, not the source itself.' as const;

export const DEFAULT_MAX_TOTAL_SOURCE_CHARS = 8000;
export const DEFAULT_MIN_PER_SOURCE_CHARS = 900;

export const ALL_SOURCE_TASK_ROLES: SourceTaskRole[] = [
  'Evidence',
  'Strategic Context',
  'Approved Example',
  'Quote / Language Source',
  'Visual Reference',
  'Must-use Material'
];

export const SOURCE_ROLE_DESCRIPTIONS: Record<SourceTaskRole, string> = {
  'Evidence': 'Supports factual statements within COH claim-safety rules.',
  'Strategic Context': 'Informs reasoning and framing without becoming a factual claim.',
  'Approved Example': 'Guides tone and structure only; example facts never leak into new copy.',
  'Quote / Language Source': 'Preserves exact quoted phrasing attributed to this source.',
  'Visual Reference': 'Influences Visual Direction only, never factual copy.',
  'Must-use Material': 'Prioritizes substance for the task while obeying Protected Kernel and claim safety.'
};

export interface SourceRecordLike {
  id: string;
  title: string;
  type: string;
  status?: string;
  content: string;
  notes?: string;
  url?: string;
  createdAt?: string;
  selected?: boolean;
  selectable?: boolean;
}

export interface GroundedEvidenceClaim {
  text: string;
  evidenceExcerpt: string;
  sourceId: string;
}

export interface SourceIntelligenceAnalysis {
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  schemaVersion: typeof SOURCE_INTELLIGENCE_SCHEMA_VERSION;
  analyzedAt: string;
  analysisMode: 'ai' | 'deterministic-fallback';
  disclaimer: typeof SOURCE_INTELLIGENCE_DISCLAIMER;
  keyFacts: string[];
  supportedClaims: string[];
  groundedFacts?: GroundedEvidenceClaim[];
  groundedClaims?: GroundedEvidenceClaim[];
  strategicContext: string;
  cautionsAndAmbiguities: string[];
  usefulExcerpts: string[];
  relevantAudiences: string[];
  relevantChannels: string[];
  relevantPillars: string[];
  contentOpportunityHints: string[];
}

export interface SourceIntelligenceStoreV1 {
  schemaVersion: typeof SOURCE_INTELLIGENCE_SCHEMA_VERSION;
  updatedAt: string;
  records: Record<string, SourceIntelligenceAnalysis>;
}

export interface TaskSourceRoleState {
  sourceId: string;
  role: SourceTaskRole;
  selectedExcerpts: string[];
}

export interface CompiledSourceGroundingResult {
  formattedSection: string;
  manifestSources: ContextManifestSourceItem[];
  evidenceSources: string[];
  styleReferenceSources: string[];
  visualReferenceSources: string[];
  truncationWarnings: string[];
  roleGovernanceSummary: string[];
}

export interface SourceReframingSeed {
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  role: SourceTaskRole;
  verbatimExcerpts: string[];
  keyFacts: string[];
  strategicContext: string;
  cautionsAndAmbiguities: string[];
}

function stripEmDashes(text: string): string {
  return String(text || '')
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*–\s*/g, ' - ')
    .trim();
}

function sanitizeStringArray(arr: unknown, maxItems = 8): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => (typeof item === 'string' ? stripEmDashes(item) : ''))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * Validates that a record conforms to SourceIntelligenceAnalysis v1.0.
 */
export function isValidSourceIntelligenceRecord(val: unknown): val is SourceIntelligenceAnalysis {
  if (!val || typeof val !== 'object') return false;
  const rec = val as Record<string, unknown>;
  return (
    typeof rec.sourceId === 'string' &&
    rec.sourceId.length > 0 &&
    typeof rec.sourceTitle === 'string' &&
    Array.isArray(rec.keyFacts) &&
    Array.isArray(rec.supportedClaims) &&
    typeof rec.strategicContext === 'string' &&
    Array.isArray(rec.cautionsAndAmbiguities) &&
    Array.isArray(rec.usefulExcerpts) &&
    Array.isArray(rec.relevantAudiences) &&
    Array.isArray(rec.relevantChannels) &&
    Array.isArray(rec.relevantPillars) &&
    Array.isArray(rec.contentOpportunityHints)
  );
}

/**
 * Normalizes a stored SourceIntelligenceAnalysis record so legacy records without
 * groundedFacts/groundedClaims are safely reconciled against usefulExcerpts without
 * fabricating fake evidence anchors.
 */
export function normalizeStoredSourceIntelligenceRecord(
  record: SourceIntelligenceAnalysis
): SourceIntelligenceAnalysis {
  const isRestrictedRole =
    record.sourceType === 'Approved Example' || record.sourceType === 'Visual Reference';
  if (isRestrictedRole) {
    return {
      ...record,
      schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
      disclaimer: SOURCE_INTELLIGENCE_DISCLAIMER,
      keyFacts: [],
      supportedClaims: [],
      groundedFacts: [],
      groundedClaims: []
    };
  }

  const pseudoSource: Pick<SourceRecordLike, 'id' | 'content' | 'notes'> = {
    id: record.sourceId,
    content: (record.usefulExcerpts || []).join('\n'),
    notes: ''
  };

  let groundedFacts: GroundedEvidenceClaim[] = [];
  if (Array.isArray(record.groundedFacts) && record.groundedFacts.length > 0) {
    groundedFacts = record.groundedFacts.filter(
      gf =>
        gf &&
        typeof gf.text === 'string' &&
        typeof gf.evidenceExcerpt === 'string' &&
        gf.evidenceExcerpt.trim().length > 0 &&
        typeof gf.sourceId === 'string'
    );
  } else if (pseudoSource.content.length > 0) {
    for (const fact of record.keyFacts || []) {
      const anchor = findGroundableSourceAnchor(pseudoSource, fact);
      if (anchor.grounded) {
        groundedFacts.push({
          text: fact,
          evidenceExcerpt: anchor.evidenceExcerpt,
          sourceId: record.sourceId
        });
      }
    }
  }

  let groundedClaims: GroundedEvidenceClaim[] = [];
  if (Array.isArray(record.groundedClaims) && record.groundedClaims.length > 0) {
    groundedClaims = record.groundedClaims.filter(
      gc =>
        gc &&
        typeof gc.text === 'string' &&
        typeof gc.evidenceExcerpt === 'string' &&
        gc.evidenceExcerpt.trim().length > 0 &&
        typeof gc.sourceId === 'string'
    );
  } else if (pseudoSource.content.length > 0) {
    for (const claim of record.supportedClaims || []) {
      const anchor = findGroundableSourceAnchor(pseudoSource, claim);
      if (anchor.grounded) {
        groundedClaims.push({
          text: claim,
          evidenceExcerpt: anchor.evidenceExcerpt,
          sourceId: record.sourceId
        });
      }
    }
  }

  return {
    ...record,
    schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
    disclaimer: SOURCE_INTELLIGENCE_DISCLAIMER,
    keyFacts: groundedFacts.length > 0 ? groundedFacts.map(f => f.text) : record.keyFacts,
    supportedClaims: groundedClaims.length > 0 ? groundedClaims.map(c => c.text) : record.supportedClaims,
    groundedFacts,
    groundedClaims
  };
}

/**
 * Non-destructively loads derived Source Intelligence records from versioned storage.
 * Corrupted payloads or individual malformed entries never throw or block raw source access.
 */
export function loadSourceIntelligenceStore(
  storage?: Pick<Storage, 'getItem'> | null
): Record<string, SourceIntelligenceAnalysis> {
  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof window !== 'undefined' && window.localStorage
          ? window.localStorage
          : null;
    if (!targetStorage) return {};

    const raw = targetStorage.getItem(SOURCE_INTELLIGENCE_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const candidateRecords =
      parsed.schemaVersion === SOURCE_INTELLIGENCE_SCHEMA_VERSION &&
      parsed.records &&
      typeof parsed.records === 'object'
        ? (parsed.records as Record<string, unknown>)
        : (parsed as Record<string, unknown>);

    const validated: Record<string, SourceIntelligenceAnalysis> = {};
    for (const [key, value] of Object.entries(candidateRecords)) {
      if (isValidSourceIntelligenceRecord(value)) {
        validated[key] = normalizeStoredSourceIntelligenceRecord(value);
      }
    }
    return validated;
  } catch (err) {
    console.warn('[SourceIntelligence] Recovered from corrupted derived analysis store:', err);
    return {};
  }
}

/**
 * Saves the versioned Source Intelligence map without touching raw SourceFile storage.
 */
export function saveSourceIntelligenceStore(
  records: Record<string, SourceIntelligenceAnalysis>,
  storage?: Pick<Storage, 'setItem'> | null
): boolean {
  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof window !== 'undefined' && window.localStorage
          ? window.localStorage
          : null;
    if (!targetStorage) return false;

    const payload: SourceIntelligenceStoreV1 = {
      schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      records
    };
    targetStorage.setItem(SOURCE_INTELLIGENCE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('[SourceIntelligence] Failed to persist derived analysis store:', err);
    return false;
  }
}

export function upsertSourceIntelligenceRecord(
  currentRecords: Record<string, SourceIntelligenceAnalysis>,
  analysis: SourceIntelligenceAnalysis,
  storage?: Pick<Storage, 'setItem'> | null
): Record<string, SourceIntelligenceAnalysis> {
  const next = {
    ...currentRecords,
    [analysis.sourceId]: normalizeStoredSourceIntelligenceRecord({
      ...analysis,
      schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
      disclaimer: SOURCE_INTELLIGENCE_DISCLAIMER
    })
  };
  saveSourceIntelligenceStore(next, storage);
  return next;
}

export function removeSourceIntelligenceRecord(
  currentRecords: Record<string, SourceIntelligenceAnalysis>,
  sourceId: string,
  storage?: Pick<Storage, 'setItem'> | null
): Record<string, SourceIntelligenceAnalysis> {
  if (!currentRecords[sourceId]) return currentRecords;
  const next = { ...currentRecords };
  delete next[sourceId];
  saveSourceIntelligenceStore(next, storage);
  return next;
}

const ASPIRATION_PATTERNS =
  /\b(aims?\s+to|hopes?\s+to|plans?\s+to|vision\s+for|aspir(?:e|es|ation)|potential\s+to|could\s+become|projected\s+to|intended\s+to|future\s+pathway|seeking\s+to|target(?:ing|ed)?\s+for|unconfirmed|proposed|exploratory)\b/i;

/**
 * Extracts verbatim sentences from raw source text for fallback or excerpt verification.
 */
export function extractVerbatimSentences(rawText: string, maxCount = 5): string[] {
  const cleaned = String(rawText || '').replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const rawSegments = cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.replace(/^[-*•#>\s]+/, '').trim())
    .filter(s => s.length >= 25 && s.length <= 280 && !s.startsWith('[URL reference:'));

  const unique: string[] = [];
  for (const seg of rawSegments) {
    if (!unique.includes(seg)) {
      unique.push(seg);
    }
    if (unique.length >= maxCount) break;
  }
  return unique;
}

/**
 * Validates that an excerpt is an exact verbatim substring of the source content or notes.
 * Prevents fabricated quotes in manual or AI excerpt selection.
 */
export function validateExactSourceExcerpt(
  source: Pick<SourceRecordLike, 'content' | 'notes'>,
  candidateExcerpt: string
): { valid: boolean; normalizedExcerpt: string; reason?: string } {
  const trimmed = String(candidateExcerpt || '').trim().replace(/^["“”']+|["“”']+$/g, '').trim();
  if (!trimmed) {
    return { valid: false, normalizedExcerpt: '', reason: 'Excerpt cannot be empty.' };
  }
  const haystack = `${source.content || ''}\n${source.notes || ''}`;
  if (haystack.includes(trimmed)) {
    return { valid: true, normalizedExcerpt: trimmed };
  }
  // Case-insensitive whitespace-normalized check that returns the exact substring from the source
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const match = haystack.match(new RegExp(escaped, 'i'));
  if (match && match[0]) {
    return { valid: true, normalizedExcerpt: match[0] };
  }
  return {
    valid: false,
    normalizedExcerpt: '',
    reason: 'Excerpt must match exact text present in the raw source (no fabricated or paraphrased quotes).'
  };
}

/**
 * Checks whether numbers/dates in a candidate fact or claim are traceable to the raw source text.
 */
function findUntraceableNumericTokens(claimText: string, rawSourceText: string): string[] {
  const tokens = claimText.match(/\b\d+(?:[.,]\d+)?%?\b/g) || [];
  const untraceable: string[] = [];
  for (const tok of tokens) {
    if (!rawSourceText.includes(tok)) {
      untraceable.push(tok);
    }
  }
  return untraceable;
}

const CLAIM_META_PREFIX_REGEX =
  /^(?:source[- ]grounded\s+statement|verified\s+fact|supported\s+claim|fact|claim)\s*:\s*/i;

const GROUNDING_STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'from', 'this', 'into', 'over', 'under',
  'have', 'has', 'had', 'were', 'was', 'are', 'been', 'being', 'will', 'would',
  'could', 'should', 'about', 'through', 'across', 'between', 'within', 'their',
  'there', 'where', 'which', 'while', 'when', 'what', 'who', 'whom', 'whose',
  'climate', 'opera', 'haus', 'source', 'grounded', 'statement', 'supported',
  'claim', 'confirmed', 'directly', 'stated', 'based', 'piece', 'content',
  'formally', 'officially', 'recently', 'currently', 'already', 'also', 'very',
  'more', 'most', 'some', 'such', 'than', 'then', 'only', 'both', 'each'
]);

const ALLOWED_META_PROPER_WORDS = new Set([
  'The', 'This', 'That', 'These', 'Those', 'Source', 'Statement', 'Supported',
  'Claim', 'Fact', 'Verified', 'Grounded', 'Climate', 'Opera', 'Haus', 'COH',
  'In', 'On', 'At', 'For', 'With', 'From', 'By', 'As', 'To', 'During', 'After',
  'Before', 'Across', 'Through', 'Within', 'Between', 'Under', 'Over', 'When',
  'While', 'Where', 'Because', 'Although', 'However', 'Furthermore', 'Moreover'
]);

/**
 * Finds a verified verbatim evidence excerpt in the raw source text that grounds a candidate
 * fact or supported claim. Rejects any claim that:
 * - introduces untraceable proper nouns/entities/institutions (e.g., "UNESCO", "Berlin Philharmonic")
 *   absent from the raw source text, OR
 * - lacks sufficient lexical/factual grounding in an actual verbatim sentence of the source.
 */
export function findGroundableSourceAnchor(
  source: Pick<SourceRecordLike, 'id' | 'content' | 'notes'>,
  candidateText: string,
  explicitEvidenceExcerpt?: string
): { grounded: boolean; evidenceExcerpt: string; reason?: string } {
  const combinedSourceText = `${source.content || ''}\n${source.notes || ''}`.trim();
  if (!combinedSourceText) {
    return { grounded: false, evidenceExcerpt: '', reason: 'Raw source text is empty.' };
  }

  const strippedCandidate = String(candidateText || '')
    .trim()
    .replace(CLAIM_META_PREFIX_REGEX, '')
    .trim();
  if (!strippedCandidate) {
    return { grounded: false, evidenceExcerpt: '', reason: 'Candidate claim is empty.' };
  }

  // 1. Check for any untraceable capitalized proper nouns / acronyms (e.g. "UNESCO", "NATO", "Louvre")
  const capitalizedTokens = strippedCandidate.match(/\b(?:[A-Z]{2,}|[A-Z][a-z]{2,})\b/g) || [];
  const lowerSource = combinedSourceText.toLowerCase();
  for (const capToken of capitalizedTokens) {
    if (ALLOWED_META_PROPER_WORDS.has(capToken)) continue;
    if (!lowerSource.includes(capToken.toLowerCase())) {
      return {
        grounded: false,
        evidenceExcerpt: '',
        reason: `Contains proper noun or entity "${capToken}" not present in the raw source.`
      };
    }
  }

  // 2. If an explicit evidenceExcerpt was provided, validate it verbatim first
  if (explicitEvidenceExcerpt && explicitEvidenceExcerpt.trim().length > 0) {
    const explicitCheck = validateExactSourceExcerpt(source, explicitEvidenceExcerpt);
    if (!explicitCheck.valid) {
      return {
        grounded: false,
        evidenceExcerpt: '',
        reason: `Provided evidenceExcerpt is not an exact substring of the raw source.`
      };
    }
    // Still verify that the candidate claim's content words relate to the explicit excerpt or source
    const contentWords = (strippedCandidate.toLowerCase().match(/\b[a-z]{4,}\b/g) || []).filter(
      w => !GROUNDING_STOPWORDS.has(w)
    );
    if (contentWords.length > 0) {
      const matchedInSource = contentWords.filter(w =>
        lowerSource.includes(w) || (w.length >= 6 && lowerSource.includes(w.slice(0, 5)))
      );
      if (matchedInSource.length / contentWords.length < 0.6) {
        return {
          grounded: false,
          evidenceExcerpt: '',
          reason: 'Claim content words are not sufficiently grounded in the raw source text.'
        };
      }
    }
    return { grounded: true, evidenceExcerpt: explicitCheck.normalizedExcerpt };
  }

  // 3. Direct substring check on the stripped candidate itself
  const directCheck = validateExactSourceExcerpt(source, strippedCandidate);
  if (directCheck.valid) {
    return { grounded: true, evidenceExcerpt: directCheck.normalizedExcerpt };
  }

  // 4. Token-grounding check against verbatim source sentences
  const contentWords = Array.from(
    new Set(
      (strippedCandidate.toLowerCase().match(/\b[a-z]{4,}\b/g) || []).filter(
        w => !GROUNDING_STOPWORDS.has(w)
      )
    )
  );

  if (contentWords.length === 0) {
    return {
      grounded: false,
      evidenceExcerpt: '',
      reason: 'Claim contains no specific groundable content tokens.'
    };
  }

  const allSourceSegments = combinedSourceText
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.replace(/^[-*•#>\s]+/, '').trim())
    .filter(s => s.length >= 15 && !s.startsWith('[URL reference:'));

  let bestSegment = '';
  let bestScore = 0;

  for (const seg of allSourceSegments) {
    const segLower = seg.toLowerCase();
    let matchedCount = 0;
    for (const word of contentWords) {
      if (segLower.includes(word) || (word.length >= 6 && segLower.includes(word.slice(0, 5)))) {
        matchedCount++;
      }
    }
    const ratio = matchedCount / contentWords.length;
    if (ratio > bestScore && (matchedCount >= 2 || (contentWords.length === 1 && matchedCount === 1))) {
      bestScore = ratio;
      bestSegment = seg;
    }
  }

  // Require at least 60% of specific content tokens to anchor to a single verbatim source sentence
  if (bestScore >= 0.6 && bestSegment) {
    const verifiedSeg = validateExactSourceExcerpt(source, bestSegment);
    if (verifiedSeg.valid) {
      return { grounded: true, evidenceExcerpt: verifiedSeg.normalizedExcerpt };
    }
  }

  return {
    grounded: false,
    evidenceExcerpt: '',
    reason: 'No verbatim evidence anchor in the raw source supports this factual statement.'
  };
}

/**
 * Enforces COH claim discipline on any SourceIntelligenceAnalysis:
 * - Every fact in keyFacts and claim in supportedClaims MUST have a verified verbatim source anchor
 * - Unsupported numeric/date inferences are flagged as interpretation in cautionsAndAmbiguities
 * - Non-numeric hallucinated factual claims (e.g., fabricated endorsements/partners) are rejected and moved to cautionsAndAmbiguities
 * - Aspirations are kept out of confirmed facts/supported claims
 * - Excerpts are verified verbatim against raw source text
 * - Approved Examples and Visual References do not produce factual supportedClaims or keyFacts
 * - Missing evidence remains flagged as missing
 */
export function enforceSourceIntelligenceClaimDiscipline(
  rawAnalysis: Partial<SourceIntelligenceAnalysis>,
  source: SourceRecordLike
): SourceIntelligenceAnalysis {
  const combinedSourceText = `${source.content || ''}\n${source.notes || ''}`.trim();
  const isApprovedExample = source.type === 'Approved Example';
  const isVisualReference = source.type === 'Visual Reference';
  const isUrlOnly =
    source.content?.trim().startsWith('[URL reference:') ||
    combinedSourceText.length < 40;

  const cautions: string[] = sanitizeStringArray(rawAnalysis.cautionsAndAmbiguities, 10);
  const verifiedFacts: string[] = [];
  const verifiedClaims: string[] = [];
  const groundedFacts: GroundedEvidenceClaim[] = [];
  const groundedClaims: GroundedEvidenceClaim[] = [];

  const rawGroundedFactsMap = new Map<string, string>();
  if (Array.isArray(rawAnalysis.groundedFacts)) {
    for (const gf of rawAnalysis.groundedFacts) {
      if (gf && typeof gf.text === 'string' && typeof gf.evidenceExcerpt === 'string') {
        rawGroundedFactsMap.set(stripEmDashes(gf.text), gf.evidenceExcerpt);
      }
    }
  }

  const rawGroundedClaimsMap = new Map<string, string>();
  if (Array.isArray(rawAnalysis.groundedClaims)) {
    for (const gc of rawAnalysis.groundedClaims) {
      if (gc && typeof gc.text === 'string' && typeof gc.evidenceExcerpt === 'string') {
        rawGroundedClaimsMap.set(stripEmDashes(gc.text), gc.evidenceExcerpt);
      }
    }
  }

  if (!isApprovedExample && !isVisualReference) {
    for (const fact of sanitizeStringArray(rawAnalysis.keyFacts, 8)) {
      const missingNums = findUntraceableNumericTokens(fact, combinedSourceText);
      if (missingNums.length > 0) {
        cautions.push(
          `Interpretation flag: "${fact}" contains numbers or dates (${missingNums.join(', ')}) not directly traceable to raw source text.`
        );
        continue;
      }
      if (ASPIRATION_PATTERNS.test(fact)) {
        cautions.push(`Aspiration kept separate from confirmed fact: "${fact}"`);
        continue;
      }
      const anchor = findGroundableSourceAnchor(source, fact, rawGroundedFactsMap.get(fact));
      if (!anchor.grounded) {
        cautions.push(
          `Unverified or unanchored fact moved to caution: "${fact}" (${anchor.reason || 'Not directly anchored in raw source text.'})`
        );
        continue;
      }
      verifiedFacts.push(fact);
      groundedFacts.push({
        text: fact,
        evidenceExcerpt: anchor.evidenceExcerpt,
        sourceId: source.id
      });
    }
  }

  if (isApprovedExample) {
    cautions.unshift(
      'Approved Example source: use for tone, rhythm, and structural guidance only. Specific facts, dates, or names in this example do not transfer as factual evidence to new work.'
    );
  } else if (isVisualReference) {
    cautions.unshift(
      'Visual Reference source: informs Visual Direction, atmosphere, and composition only. Do not convert into factual copy claims.'
    );
  } else {
    for (const claim of sanitizeStringArray(rawAnalysis.supportedClaims, 8)) {
      const missingNums = findUntraceableNumericTokens(claim, combinedSourceText);
      if (missingNums.length > 0) {
        cautions.push(
          `Unsupported inference flagged: "${claim}" cites figures (${missingNums.join(', ')}) not found in the source.`
        );
        continue;
      }
      if (ASPIRATION_PATTERNS.test(claim)) {
        cautions.push(`Aspiration or future pathway (not confirmed proof): "${claim}"`);
        continue;
      }
      const anchor = findGroundableSourceAnchor(source, claim, rawGroundedClaimsMap.get(claim));
      if (!anchor.grounded) {
        cautions.push(
          `Unverified or unanchored claim moved to caution: "${claim}" (${anchor.reason || 'Not directly anchored in raw source text.'})`
        );
        continue;
      }
      verifiedClaims.push(claim);
      groundedClaims.push({
        text: claim,
        evidenceExcerpt: anchor.evidenceExcerpt,
        sourceId: source.id
      });
    }
  }

  if (isUrlOnly) {
    cautions.push(
      'Missing evidence note: Source contains a link or brief note without full extracted text. Missing facts remain missing until verbatim text is provided.'
    );
  } else if (cautions.length === 0) {
    cautions.push(
      'Do not extrapolate unstated partner commitments, funding amounts, or confirmed dates beyond the verbatim source text.'
    );
  }

  // Verify every excerpt is exact verbatim text from the source
  const candidateExcerpts = sanitizeStringArray(rawAnalysis.usefulExcerpts, 8);
  const exactExcerpts: string[] = [];
  for (const ex of candidateExcerpts) {
    const check = validateExactSourceExcerpt(source, ex);
    if (check.valid && !exactExcerpts.includes(check.normalizedExcerpt)) {
      exactExcerpts.push(check.normalizedExcerpt);
    }
  }
  if (exactExcerpts.length === 0 && !isUrlOnly) {
    exactExcerpts.push(...extractVerbatimSentences(combinedSourceText, 3));
  }

  const uniqueCautions = Array.from(new Set(cautions)).slice(0, 10);

  return {
    sourceId: source.id,
    sourceTitle: source.title || 'Untitled Source',
    sourceType: source.type || 'Other',
    schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
    analyzedAt: rawAnalysis.analyzedAt || new Date().toISOString(),
    analysisMode: rawAnalysis.analysisMode || 'deterministic-fallback',
    disclaimer: SOURCE_INTELLIGENCE_DISCLAIMER,
    keyFacts: isApprovedExample || isVisualReference ? [] : verifiedFacts,
    supportedClaims: isApprovedExample || isVisualReference ? [] : verifiedClaims,
    groundedFacts: isApprovedExample || isVisualReference ? [] : groundedFacts,
    groundedClaims: isApprovedExample || isVisualReference ? [] : groundedClaims,
    strategicContext:
      stripEmDashes(rawAnalysis.strategicContext || '') ||
      `Source "${source.title}" (${source.type}) provides contextual material for Climate Opera Haus communications.`,
    cautionsAndAmbiguities: uniqueCautions,
    usefulExcerpts: exactExcerpts,
    relevantAudiences: sanitizeStringArray(rawAnalysis.relevantAudiences, 5),
    relevantChannels: sanitizeStringArray(rawAnalysis.relevantChannels, 5),
    relevantPillars: sanitizeStringArray(rawAnalysis.relevantPillars, 4),
    contentOpportunityHints: sanitizeStringArray(rawAnalysis.contentOpportunityHints, 5)
  };
}

/**
 * Generates a deterministic, claim-safe Source Intelligence analysis when AI is offline
 * or when normalizing partial outputs.
 */
export function buildDeterministicSourceAnalysis(
  source: SourceRecordLike,
  operatingCore?: OperatingCore | null
): SourceIntelligenceAnalysis {
  const combined = `${source.content || ''}\n${source.notes || ''}`.trim();
  const lower = combined.toLowerCase();
  const sentences = extractVerbatimSentences(combined, 8);

  const keyFacts: string[] = [];
  const supportedClaims: string[] = [];
  const cautions: string[] = [];

  for (const sentence of sentences) {
    if (ASPIRATION_PATTERNS.test(sentence)) {
      cautions.push(`Aspiration or pathway statement in source: "${sentence}"`);
    } else if (keyFacts.length < 4) {
      keyFacts.push(sentence);
    }
  }

  if (source.type !== 'Approved Example' && source.type !== 'Visual Reference') {
    for (const fact of keyFacts.slice(0, 3)) {
      supportedClaims.push(`Source-grounded statement: ${fact}`);
    }
  }

  // Match COH Audiences
  const relevantAudiences: string[] = [];
  if (operatingCore?.audiences) {
    for (const aud of operatingCore.audiences) {
      const keywords = aud.name.toLowerCase().split(/[\s/&,-]+/).filter(w => w.length > 3);
      if (keywords.some(k => lower.includes(k))) {
        relevantAudiences.push(aud.name);
      }
    }
  }
  if (relevantAudiences.length === 0) {
    if (source.type.includes('Sponsor')) {
      relevantAudiences.push(resolveOperatingCoreAudience('Sponsors and patrons', operatingCore));
    } else if (source.type.includes('Partner')) {
      relevantAudiences.push(resolveOperatingCoreAudience('Cultural institutions', operatingCore));
    } else if (source.type.includes('Media') || source.type.includes('Article')) {
      relevantAudiences.push(resolveOperatingCoreAudience('Press and journalists', operatingCore));
    } else {
      relevantAudiences.push(resolveOperatingCoreAudience('General cultural audience', operatingCore));
    }
  }

  // Match COH Channels
  const relevantChannels: string[] = [];
  if (lower.includes('linkedin') || source.type.includes('Partner') || source.type.includes('Sponsor')) {
    relevantChannels.push('LinkedIn');
  }
  if (lower.includes('newsletter') || lower.includes('dispatch') || combined.length > 500) {
    relevantChannels.push('Newsletter');
  }
  if (lower.includes('press') || source.type === 'Article / Media Coverage' || source.type === 'Event Notes') {
    relevantChannels.push('Website');
  }
  if (source.type === 'Visual Reference' || lower.includes('visual') || lower.includes('stage')) {
    relevantChannels.push('Instagram');
  }
  if (relevantChannels.length === 0) {
    relevantChannels.push('LinkedIn', 'Newsletter');
  }

  // Match COH Pillars
  const relevantPillars: string[] = [];
  if (lower.includes('soria moria') || lower.includes('tetralogy') || lower.includes('golden fountain') || lower.includes('water dragon') || lower.includes('roar to the wind')) {
    relevantPillars.push('Climate Tetralogy & Canon');
  }
  if (lower.includes('resonance') || lower.includes('2027') || lower.includes('milestone') || lower.includes('event')) {
    relevantPillars.push('Events, Convenings & Public Moments');
  }
  if (lower.includes('partner') || lower.includes('sponsor') || lower.includes('coalition') || lower.includes('institution')) {
    relevantPillars.push('Partnerships, Sponsorship & Institutional Value');
  }
  if (relevantPillars.length === 0) {
    relevantPillars.push('Opera Worlds & Artistic Method');
  }

  const strategicContext =
    source.type === 'Approved Example'
      ? `Benchmark reference piece ("${source.title}") illustrating approved COH cadence, structural pacing, and editorial restraint.`
      : source.type === 'Visual Reference'
        ? `Visual reference ("${source.title}") informing stagecraft, material palette, and atmospheric composition for Visual Studio.`
        : `Documented ${source.type.toLowerCase()} ("${source.title}") providing context for ${relevantPillars.join(' and ')}.`;

  const contentOpportunityHints: string[] =
    source.type === 'Approved Example'
      ? [
          `Use as an Approved Example role in Advanced Brief to mirror structural pacing for ${relevantChannels[0]}.`,
          'Extract opening hook cadence without copying historical specifics.'
        ]
      : source.type === 'Visual Reference'
        ? [
            'Attach with role Visual Reference to guide Visual Studio atmosphere and composition.',
            'Pair with an Evidence source when drafting accompanying caption copy.'
          ]
        : [
            `Develop a ${relevantChannels[0]} piece tailored to ${relevantAudiences[0]} using verified excerpts.`,
            `Explore ${relevantPillars[0]} angles in Ideation Workspace grounded in this source.`
          ];

  return enforceSourceIntelligenceClaimDiscipline(
    {
      sourceId: source.id,
      sourceTitle: source.title,
      sourceType: source.type,
      analyzedAt: new Date().toISOString(),
      analysisMode: 'deterministic-fallback',
      keyFacts,
      supportedClaims,
      strategicContext,
      cautionsAndAmbiguities: cautions,
      usefulExcerpts: sentences.slice(0, 4),
      relevantAudiences,
      relevantChannels,
      relevantPillars,
      contentOpportunityHints
    },
    source
  );
}

const ROLE_PRIORITY_WEIGHT: Record<SourceTaskRole, number> = {
  'Must-use Material': 1.5,
  'Evidence': 1.4,
  'Quote / Language Source': 1.25,
  'Strategic Context': 1.0,
  'Approved Example': 0.8,
  'Visual Reference': 0.75
};

const ROLE_SORT_ORDER: Record<SourceTaskRole, number> = {
  'Must-use Material': 1,
  'Evidence': 2,
  'Quote / Language Source': 3,
  'Strategic Context': 4,
  'Approved Example': 5,
  'Visual Reference': 6
};

const TRUNCATION_NOTICE = '\n[...Bounded to preserve context budget...]';

function boundTextCleanly(text: string, maxChars: number): { bounded: string; wasTruncated: boolean } {
  const cleaned = String(text || '').trim();
  if (maxChars <= 0) {
    return { bounded: '', wasTruncated: cleaned.length > 0 };
  }
  if (cleaned.length <= maxChars) {
    return { bounded: cleaned, wasTruncated: false };
  }
  if (maxChars <= TRUNCATION_NOTICE.length + 12) {
    return { bounded: cleaned.slice(0, maxChars), wasTruncated: true };
  }
  const availableForContent = maxChars - TRUNCATION_NOTICE.length;
  const slice = cleaned.slice(0, availableForContent);
  const lastPeriod = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('\n'));
  const cutIndex = lastPeriod > Math.floor(availableForContent * 0.6) ? lastPeriod + 1 : availableForContent;
  return {
    bounded: slice.slice(0, cutIndex).trim() + TRUNCATION_NOTICE,
    wasTruncated: true
  };
}

/**
 * Deterministic role-based source grounding and bounded context compiler.
 *
 * HARD CAP INVARIANT:
 * The total length of `formattedSection` (including section header, source headers, role directives,
 * bounded body blocks, and cautions) is strictly <= `maxTotalChars` (default 8000 chars).
 * - Sources are sorted by role priority (`Must-use Material` > `Evidence` > `Quote / Language Source` >
 *   `Strategic Context` > `Approved Example` > `Visual Reference`).
 * - When multiple sources are attached, no single source can consume more than 65% of `maxTotalChars`,
 *   preventing one huge source from starving subsequent high-priority sources.
 * - `remainingBudget` decreases monotonically toward 0; if many sources (e.g., 15+) exhaust the budget,
 *   lower-priority trailing sources are omitted or truncated and an explicit warning is recorded in `truncationWarnings`.
 */
export function compileSourceGroundingContext(
  bindings: TaskSourceBinding[],
  workflow: StudioWorkflow,
  options?: {
    derivedAnalyses?: Record<string, SourceIntelligenceAnalysis>;
    maxTotalChars?: number;
    minPerSourceChars?: number;
  }
): CompiledSourceGroundingResult {
  const maxTotalChars = options?.maxTotalChars ?? DEFAULT_MAX_TOTAL_SOURCE_CHARS;
  const minPerSourceChars = options?.minPerSourceChars ?? DEFAULT_MIN_PER_SOURCE_CHARS;
  const derivedAnalyses = options?.derivedAnalyses || {};
  const isVisualWorkflow = workflow === 'Visual Studio';

  if (!Array.isArray(bindings) || bindings.length === 0 || maxTotalChars <= 0) {
    return {
      formattedSection: '',
      manifestSources: [],
      evidenceSources: [],
      styleReferenceSources: [],
      visualReferenceSources: [],
      truncationWarnings: [],
      roleGovernanceSummary: []
    };
  }

  // Normalize and sort by role priority so Must-use Material and Evidence get first priority
  const normalizedBindings = bindings.map(b => {
    const role: SourceTaskRole = b.role || inferDefaultSourceRole(b.type);
    const excerpts = Array.isArray(b.selectedExcerpts)
      ? b.selectedExcerpts.map(e => String(e || '').trim()).filter(Boolean)
      : [];
    return {
      ...b,
      role,
      excerpts,
      weight: ROLE_PRIORITY_WEIGHT[role] || 1.0,
      sortOrder: ROLE_SORT_ORDER[role] || 5
    };
  });

  const sortedBindings = [...normalizedBindings].sort((a, b) => a.sortOrder - b.sortOrder);
  const totalWeight = sortedBindings.reduce((acc, item) => acc + item.weight, 0) || 1;

  const manifestSources: ContextManifestSourceItem[] = [];
  const evidenceSources: string[] = [];
  const styleReferenceSources: string[] = [];
  const visualReferenceSources: string[] = [];
  const truncationWarnings: string[] = [];
  const roleGovernanceSummary: string[] = [];
  const sourceSectionParts: string[] = [];

  for (const item of normalizedBindings) {
    manifestSources.push({
      id: item.sourceId,
      title: item.title,
      type: item.type,
      role: item.role,
      excerptCount: item.excerpts.length
    });

    if (item.role === 'Evidence' || item.role === 'Must-use Material' || item.role === 'Quote / Language Source') {
      evidenceSources.push(`${item.title} (${item.role})`);
    } else if (item.role === 'Visual Reference') {
      visualReferenceSources.push(`${item.title} (Visual Reference)`);
      styleReferenceSources.push(`${item.title} (Visual Reference)`);
    } else {
      styleReferenceSources.push(`${item.title} (${item.role})`);
    }
  }

  const sectionPrefix = 'GOVERNED SOURCE & EVIDENCE CONTEXT:\n';
  let remainingBudget = Math.max(0, maxTotalChars - sectionPrefix.length);
  const maxSingleSourceShare =
    sortedBindings.length > 1 ? Math.floor(remainingBudget * 0.65) : remainingBudget;

  for (let i = 0; i < sortedBindings.length; i++) {
    const item = sortedBindings[i];
    const separatorLen = sourceSectionParts.length > 0 ? 2 : 0; // '\n\n'

    const derived = derivedAnalyses[item.sourceId];
    let roleDirective = '';
    if (item.role === 'Evidence') {
      roleDirective =
        'ROLE: EVIDENCE (May support factual statements strictly within the bounds of the source text below and COH Claim Safety. Do not extrapolate beyond stated facts.)';
      roleGovernanceSummary.push(`${item.title}: Factual evidence (claim-safety enforced)`);
    } else if (item.role === 'Strategic Context') {
      roleDirective =
        'ROLE: STRATEGIC CONTEXT (Informs framing and strategic reasoning. Do NOT convert strategic framing or unverified aspirations into confirmed factual claims.)';
      roleGovernanceSummary.push(`${item.title}: Strategic context only (not factual proof)`);
    } else if (item.role === 'Approved Example') {
      roleDirective =
        'ROLE: APPROVED EXAMPLE [STYLE & STRUCTURE REFERENCE ONLY] (Guide tone, cadence, and structure ONLY. CRITICAL RULE: Specific facts, dates, partner names, or numbers inside this example MUST NOT leak into new work as factual evidence unless separately grounded in an Evidence source.)';
      roleGovernanceSummary.push(`${item.title}: Approved Example (facts blocked from leaking as evidence)`);
    } else if (item.role === 'Quote / Language Source') {
      roleDirective =
        `ROLE: QUOTE / LANGUAGE SOURCE (Preserve exact quoted wording verbatim and attribute internally to "${item.title}". Do not alter or fabricate quotes.)`;
      roleGovernanceSummary.push(`${item.title}: Exact quote/language source`);
    } else if (item.role === 'Visual Reference') {
      if (isVisualWorkflow) {
        roleDirective =
          'ROLE: VISUAL REFERENCE (Primary atmospheric, material, and compositional reference for Visual Studio, governed by COH Visual DNA.)';
      } else {
        roleDirective =
          'ROLE: VISUAL REFERENCE [VISUAL DIRECTION ONLY - DO NOT USE AS FACTUAL COPY] (Use ONLY to inform the Visual Design Brief / Visual Direction. Never treat this visual reference as factual copy claims.)';
      }
      roleGovernanceSummary.push(`${item.title}: Visual Reference (excluded from factual copy)`);
    } else {
      roleDirective =
        'ROLE: MUST-USE MATERIAL (Incorporate key substance into the task output, while remaining strictly subordinate to the Protected COH Kernel and COH Claim Safety rules.)';
      roleGovernanceSummary.push(`${item.title}: Must-use Material (governed by Kernel & Claim Safety)`);
    }

    const headerPrefix = `[SOURCE: ${item.title} | Type: ${item.type} | Active Task Role: ${item.role}]\n${roleDirective}\n`;
    const bodyLabel =
      item.role === 'Visual Reference' && !isVisualWorkflow
        ? 'VISUAL DIRECTION NOTES (For Visual Design Brief only, NOT for body copy facts):\n'
        : item.excerpts.length > 0
          ? 'SELECTED VERBATIM EXCERPTS (Exact source text, distinct from AI interpretation):\n'
          : item.role === 'Approved Example'
            ? 'REFERENCE TEXT FOR TONE & STRUCTURE ONLY (Do not copy factual specifics):\n'
            : 'RAW SOURCE TEXT (Bounded):\n';

    const fixedOverhead = separatorLen + headerPrefix.length + bodyLabel.length;
    if (remainingBudget <= fixedOverhead + 30) {
      truncationWarnings.push(
        `Source budget cap (${maxTotalChars} chars) reached; omitted remaining source "${item.title}" (${item.role}) to preserve hard context ceiling.`
      );
      continue;
    }

    const availableForEntry = remainingBudget - fixedOverhead;
    const proportionalShare = Math.floor((item.weight / totalWeight) * (maxTotalChars - sectionPrefix.length));
    const effectiveMinPerSource = Math.min(
      minPerSourceChars,
      Math.max(120, Math.floor((maxTotalChars - sectionPrefix.length) / Math.max(1, sortedBindings.length)) - fixedOverhead)
    );
    const targetBodyBudget = Math.min(
      availableForEntry,
      maxSingleSourceShare,
      Math.max(effectiveMinPerSource, proportionalShare)
    );

    let cautionsBlock = '';
    if (derived && derived.cautionsAndAmbiguities.length > 0) {
      const candidateCautions = `\nSOURCE CAUTIONS (${SOURCE_INTELLIGENCE_DISCLAIMER}):\n${derived.cautionsAndAmbiguities.slice(0, 2).map(c => `- ${c}`).join('\n')}`;
      if (candidateCautions.length < Math.floor(targetBodyBudget * 0.35)) {
        cautionsBlock = candidateCautions;
      }
    }

    const maxBodyContentChars = Math.max(24, targetBodyBudget - cautionsBlock.length);

    let boundedContent = '';
    if (item.role === 'Visual Reference' && !isVisualWorkflow) {
      const rawVisualNotes = item.excerpts.length > 0
        ? item.excerpts.join(' | ')
        : (item.summary || item.content || '').slice(0, 450);
      const { bounded, wasTruncated } = boundTextCleanly(rawVisualNotes, maxBodyContentChars);
      if (wasTruncated) {
        truncationWarnings.push(
          `Visual reference notes for "${item.title}" were bounded to ${maxBodyContentChars} chars to respect the context budget.`
        );
      }
      boundedContent = bounded;
    } else if (item.excerpts.length > 0) {
      const formattedExcerpts = item.excerpts
        .map((ex, idx) => `[Verbatim Excerpt ${idx + 1} from "${item.title}"] "${ex}"`)
        .join('\n');
      const { bounded, wasTruncated } = boundTextCleanly(formattedExcerpts, maxBodyContentChars);
      if (wasTruncated) {
        truncationWarnings.push(
          `Selected excerpts for "${item.title}" exceeded the per-source budget (${maxBodyContentChars} chars) and were bounded.`
        );
      }
      boundedContent = bounded;
    } else {
      const rawText = (item.content || item.summary || '').trim();
      const { bounded, wasTruncated } = boundTextCleanly(rawText, maxBodyContentChars);
      if (wasTruncated) {
        truncationWarnings.push(
          `Source "${item.title}" (${rawText.length} chars) was bounded to ${maxBodyContentChars} chars to protect Kernel, Operating Core, and multi-source context limits. Select specific excerpts to pin exact passages.`
        );
      }
      boundedContent = bounded;
    }

    if (boundedContent) {
      const fullEntry = `${headerPrefix}${bodyLabel}${boundedContent}${cautionsBlock}`;
      if (separatorLen + fullEntry.length <= remainingBudget) {
        sourceSectionParts.push(fullEntry);
        remainingBudget = Math.max(0, remainingBudget - (separatorLen + fullEntry.length));
      } else {
        truncationWarnings.push(
          `Source budget cap (${maxTotalChars} chars) reached; omitted "${item.title}" (${item.role}).`
        );
      }
    }
  }

  let formattedSection =
    sourceSectionParts.length > 0
      ? `${sectionPrefix}${sourceSectionParts.join('\n\n')}`
      : '';

  if (formattedSection.length > maxTotalChars) {
    formattedSection = formattedSection.slice(0, maxTotalChars);
  }

  return {
    formattedSection,
    manifestSources,
    evidenceSources,
    styleReferenceSources,
    visualReferenceSources,
    truncationWarnings,
    roleGovernanceSummary
  };
}

/**
 * Architectural hook prepared for COH-CS-05 (Reframing Studio).
 * Allows packaging a source and its derived intelligence for Reframing without rendering dead UI links prior to COH-CS-05.
 */
export function prepareSourceForReframing(
  source: SourceRecordLike,
  analysis?: SourceIntelligenceAnalysis | null,
  role?: SourceTaskRole
): SourceReframingSeed {
  const effectiveRole = role || inferDefaultSourceRole(source.type);
  const fallbackExcerpts = extractVerbatimSentences(`${source.content || ''}\n${source.notes || ''}`, 3);
  return {
    sourceId: source.id,
    sourceTitle: source.title,
    sourceType: source.type,
    role: effectiveRole,
    verbatimExcerpts: analysis?.usefulExcerpts?.length ? analysis.usefulExcerpts : fallbackExcerpts,
    keyFacts: analysis?.keyFacts || [],
    strategicContext: analysis?.strategicContext || source.notes || '',
    cautionsAndAmbiguities: analysis?.cautionsAndAmbiguities || []
  };
}
