import type { OperatingCore } from './operatingCore.ts';
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
        validated[key] = {
          ...value,
          schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
          disclaimer: SOURCE_INTELLIGENCE_DISCLAIMER
        };
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
    [analysis.sourceId]: {
      ...analysis,
      schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
      disclaimer: SOURCE_INTELLIGENCE_DISCLAIMER
    }
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

/**
 * Enforces COH claim discipline on any SourceIntelligenceAnalysis:
 * - Unsupported numeric/date inferences are flagged as interpretation in cautionsAndAmbiguities
 * - Aspirations are kept out of confirmed facts/supported claims
 * - Excerpts are verified verbatim against raw source text
 * - Approved Examples and Visual References do not produce factual supportedClaims
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
    verifiedFacts.push(fact);
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
      verifiedClaims.push(claim);
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

  const uniqueCautions = Array.from(new Set(cautions)).slice(0, 8);

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
    if (source.type.includes('Sponsor')) relevantAudiences.push('Sponsors & Corporate Partners');
    else if (source.type.includes('Partner')) relevantAudiences.push('Cultural Institutions & Venues');
    else if (source.type.includes('Media') || source.type.includes('Article')) relevantAudiences.push('Press & Cultural Journalists');
    else relevantAudiences.push('General Public & Cultural Citizens');
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
    relevantPillars.push('RESONANCE 2027 & Milestones');
  }
  if (lower.includes('partner') || lower.includes('sponsor') || lower.includes('coalition') || lower.includes('institution')) {
    relevantPillars.push('Partnerships & Coalition');
  }
  if (relevantPillars.length === 0) {
    relevantPillars.push('Artistic Vision & Cultural World-Building');
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

function boundTextCleanly(text: string, maxChars: number): { bounded: string; wasTruncated: boolean } {
  const cleaned = String(text || '').trim();
  if (cleaned.length <= maxChars) {
    return { bounded: cleaned, wasTruncated: false };
  }
  const slice = cleaned.slice(0, maxChars);
  const lastPeriod = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('\n'));
  const cutIndex = lastPeriod > Math.floor(maxChars * 0.6) ? lastPeriod + 1 : maxChars;
  return {
    bounded: slice.slice(0, cutIndex).trim() + '\n[...Bounded to preserve context budget...]',
    wasTruncated: true
  };
}

/**
 * Deterministic role-based source grounding and bounded context compiler.
 * Prioritizes sources by task role and selected verbatim excerpts so that one large source
 * cannot crowd out Protected COH Kernel, Operating Core, user instruction, or other evidence.
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

  if (!Array.isArray(bindings) || bindings.length === 0) {
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

  let remainingBudget = maxTotalChars;

  for (let i = 0; i < sortedBindings.length; i++) {
    const item = sortedBindings[i];
    const proportionalShare = Math.floor((item.weight / totalWeight) * maxTotalChars);
    const allocatedBudget = Math.max(
      minPerSourceChars,
      Math.min(remainingBudget, proportionalShare)
    );

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

    let bodyBlock = '';
    if (item.role === 'Visual Reference' && !isVisualWorkflow) {
      // In text workflows, keep Visual Reference strictly scoped to visual brief notes so it never becomes factual copy
      const rawVisualNotes = item.excerpts.length > 0
        ? item.excerpts.join(' | ')
        : (item.summary || item.content || '').slice(0, 450);
      bodyBlock = `VISUAL DIRECTION NOTES (For Visual Design Brief only, NOT for body copy facts):\n${rawVisualNotes}`;
    } else if (item.excerpts.length > 0) {
      const formattedExcerpts = item.excerpts
        .map((ex, idx) => `[Verbatim Excerpt ${idx + 1} from "${item.title}"] "${ex}"`)
        .join('\n');
      const { bounded, wasTruncated } = boundTextCleanly(formattedExcerpts, allocatedBudget);
      if (wasTruncated) {
        truncationWarnings.push(
          `Selected excerpts for "${item.title}" exceeded the per-source budget (${allocatedBudget} chars) and were bounded.`
        );
      }
      bodyBlock = `SELECTED VERBATIM EXCERPTS (Exact source text, distinct from AI interpretation):\n${bounded}`;
    } else {
      const rawText = (item.content || item.summary || '').trim();
      const { bounded, wasTruncated } = boundTextCleanly(rawText, allocatedBudget);
      if (wasTruncated) {
        truncationWarnings.push(
          `Source "${item.title}" (${rawText.length} chars) was bounded to ${allocatedBudget} chars to protect Kernel, Operating Core, and multi-source context limits. Select specific excerpts to pin exact passages.`
        );
      }
      bodyBlock = item.role === 'Approved Example'
        ? `REFERENCE TEXT FOR TONE & STRUCTURE ONLY (Do not copy factual specifics):\n${bounded}`
        : `RAW SOURCE TEXT (Bounded):\n${bounded}`;
    }

    if (derived && derived.cautionsAndAmbiguities.length > 0) {
      bodyBlock += `\nSOURCE CAUTIONS (${SOURCE_INTELLIGENCE_DISCLAIMER}):\n${derived.cautionsAndAmbiguities.slice(0, 3).map(c => `- ${c}`).join('\n')}`;
    }

    if (bodyBlock) {
      sourceSectionParts.push(
        `[SOURCE: ${item.title} | Type: ${item.type} | Active Task Role: ${item.role}]\n${roleDirective}\n${bodyBlock}`
      );
      remainingBudget = Math.max(minPerSourceChars, remainingBudget - bodyBlock.length);
    }
  }

  const formattedSection =
    sourceSectionParts.length > 0
      ? `GOVERNED SOURCE & EVIDENCE CONTEXT:\n${sourceSectionParts.join('\n\n')}`
      : '';

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
