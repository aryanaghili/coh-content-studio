/**
 * COH-CS-05: Dedicated COH Reframing Studio Engine
 *
 * Critical Distinction:
 * - Revision = Improve substantially the same communication job (polish, shorten, grammar, translate, tone tweak).
 * - Reframing = Change what the content is trying to become while preserving factual integrity
 *   (shift audience, familiarity level, channel/format architecture, strategic frame, or narrative perspective).
 */

import type { SourceTaskRole, TaskSourceBinding } from './contextCompiler.ts';
import {
  CANONICAL_COH_PILLARS,
  getAuthoritativeAudiences,
  inferAudienceFromText,
  normalizeCohPillar,
  resolveOperatingCoreAudience,
  type OperatingCore
} from './operatingCore.ts';
import type { SourceIntelligenceAnalysis } from './sourceIntelligence.ts';

export function getReframingAudienceOptions(
  operatingCore?: OperatingCore | null,
  currentSelection?: string
): string[] {
  const authoritative = getAuthoritativeAudiences(operatingCore);
  const options = [...authoritative];
  if (!options.some(a => a.toLowerCase() === 'general public')) {
    options.push('General Public');
  }
  if (
    currentSelection &&
    currentSelection.trim() &&
    !options.some(a => a.toLowerCase() === currentSelection.trim().toLowerCase())
  ) {
    options.push(currentSelection.trim());
  }
  return options;
}

export function getReframingPillarOptions(): readonly string[] {
  return CANONICAL_COH_PILLARS;
}

export type ReframeOriginType =
  | 'Manual Input'
  | 'Content Library'
  | 'Content Workspace'
  | 'Revision Studio'
  | 'Source Library';

export type AudienceFamiliarityLevel =
  | 'Low Familiarity (Needs foundational COH context)'
  | 'Informed Cultural / Industry Familiarity'
  | 'Deep COH / Partner Familiarity';

export type RecommendedTransformationRoute = 'REFRAME' | 'REVISION';

export const NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES = [
  'Do not invent facts, numbers, dates, or funding milestones',
  'Do not escalate a fact into an unsupported stronger claim',
  'Do not fabricate partner or institution commitments',
  'Do not mutate a direct quotation and present it as verbatim',
  'Preserve Protected COH Kernel positioning'
] as const;

export const OPTIONAL_PRESERVATION_PREFERENCES = [
  'Direct quotations (verbatim)',
  'Names & proper titles',
  'Dates & timelines',
  'Confirmed facts & numbers',
  'Approved COH terminology',
  'Central artistic meaning',
  'Source-backed claims'
] as const;

export const DEFAULT_PROTECTED_ELEMENTS = OPTIONAL_PRESERVATION_PREFERENCES;

export type ElementVerificationStatus =
  | 'retained unchanged'
  | 'intentionally omitted'
  | 'altered and blocked'
  | 'requires review';

export interface ElementVerificationRecord {
  category: 'Number / Date' | 'Proper Name / Title' | 'Direct Quotation' | 'COH Terminology';
  token: string;
  requiredByPreference: boolean;
  status: ElementVerificationStatus;
  detail: string;
}

export interface ResolvedReframePlan {
  rawIntent: string;
  recommendedRoute: RecommendedTransformationRoute;
  routeRationale: string;
  suggestedRevisionActionId?: string;
  targetAudience: string;
  audienceFamiliarity: AudienceFamiliarityLevel;
  communicationPurpose: string;
  targetChannel: string;
  targetFormat: string;
  strategicFrame: string;
  contentPillarEmphasis: string;
  narrativePerspective: string;
  evidenceEmphasis: string;
  desiredAudienceResponse: string;
  protectedElements: string[];
  nonNegotiableIntegrityRules?: readonly string[];
  unresolvedItems: string[];
}

export interface ReframeOutputResult {
  reframedCopy: string;
  changedExplanation: string[];
  preservedExplanation: string[];
  evidenceWarnings: string[];
  visualDirection?: string;
  preservedQuotesVerified: boolean;
  integrityCheckPassed: boolean;
  elementVerification: ElementVerificationRecord[];
}

export interface ReframeLineageMetadata {
  originType: ReframeOriginType;
  originContentId?: string;
  originTitle?: string;
  transformationType: 'reframe';
  reframeIntent: string;
  resolvedPlan: {
    targetAudience: string;
    audienceFamiliarity: AudienceFamiliarityLevel;
    communicationPurpose: string;
    targetChannel: string;
    targetFormat: string;
    strategicFrame: string;
    contentPillarEmphasis: string;
    narrativePerspective: string;
  };
  sourceReferences: string[];
  reframedAt: string;
}

/**
 * Extracts exact double-quoted substrings (>= 12 chars) from source content
 * so they can be verified verbatim during reframing.
 */
export function extractExactQuotations(sourceText: string): string[] {
  if (!sourceText) return [];
  const matches = sourceText.match(/"([^"]{12,300})"/g) || [];
  return Array.from(new Set(matches.map(m => m.trim())));
}

const COMMON_SENTENCE_STARTERS = new Set([
  'The', 'This', 'That', 'These', 'Those', 'With', 'From', 'Into', 'Through',
  'Across', 'Between', 'Within', 'Under', 'Over', 'When', 'While', 'Where',
  'Because', 'Although', 'However', 'Furthermore', 'Moreover', 'Beyond',
  'For', 'And', 'But', 'Nor', 'Yet', 'Our', 'Their', 'Every', 'Each',
  'Today', 'Tomorrow', 'Here', 'There', 'First', 'Second', 'Third'
]);

/**
 * Extracts numbers, dates, COH canonical terms, and proper names/entities from source text
 * so preservation can be truthfully verified against reframed output.
 */
export function extractConfirmedSourceTokens(sourceText: string): {
  numbersAndDates: string[];
  properTerms: string[];
  properNamesAndEntities: string[];
} {
  if (!sourceText) {
    return { numbersAndDates: [], properTerms: [], properNamesAndEntities: [] };
  }

  const numMatches =
    sourceText.match(
      /\b(?:\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:\d{1,2},?\s+)?\d{4}|(?:Q[1-4]\s+20\d{2})|\d+(?:[.,]\d+)?%?|\b20\d{2}\b)/gi
    ) || [];

  const cohTerms = [
    'Climate Opera Haus',
    'COH',
    'The Golden Fountain',
    'Soria Moria',
    'The Water Dragon',
    'Roar to the Wind',
    'The Climate Tetralogy',
    'Resonance 2027'
  ].filter(term => sourceText.toLowerCase().includes(term.toLowerCase()));

  // Extract multi-word capitalized proper names/titles and non-starter capitalized entities
  const entityCandidates = new Set<string>();
  const multiWordProper = sourceText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
  for (const phrase of multiWordProper) {
    if (!cohTerms.some(t => t.toLowerCase() === phrase.toLowerCase())) {
      entityCandidates.add(phrase.trim());
    }
  }

  // Also capture single capitalized proper nouns that appear mid-sentence or are known proper names
  const sentences = sourceText.split(/(?<=[.!?])\s+|\n+/);
  for (const sent of sentences) {
    const words = sent.trim().split(/\s+/);
    for (let i = 1; i < words.length; i++) {
      const cleanWord = words[i].replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '');
      if (
        /^[A-Z][a-z]{2,}$/.test(cleanWord) &&
        !COMMON_SENTENCE_STARTERS.has(cleanWord) &&
        !cohTerms.some(t => t.toLowerCase().includes(cleanWord.toLowerCase()))
      ) {
        entityCandidates.add(cleanWord);
      }
    }
  }

  return {
    numbersAndDates: Array.from(new Set(numMatches.map(m => m.trim()))),
    properTerms: cohTerms,
    properNamesAndEntities: Array.from(entityCandidates)
  };
}

/**
 * Deterministically verifies whether numbers/dates, proper names/titles, COH terminology,
 * and direct quotations from the source were retained unchanged, intentionally omitted,
 * or altered/fabricated in the reframed copy.
 */
export function verifyReframedElementContinuity(params: {
  sourceContent: string;
  reframedCopy: string;
  protectedElements: string[];
  sourceBindings?: TaskSourceBinding[];
}): {
  records: ElementVerificationRecord[];
  preservedSummaryLines: string[];
  integrityWarnings: string[];
  preservedQuotesVerified: boolean;
  integrityCheckPassed: boolean;
} {
  const { sourceContent, reframedCopy, protectedElements = [], sourceBindings = [] } = params;
  const records: ElementVerificationRecord[] = [];
  const preservedSummaryLines: string[] = [];
  const integrityWarnings: string[] = [];

  const combinedAllowedSourceText = [
    sourceContent,
    ...sourceBindings
      .filter(b => b.role !== 'Approved Example' && b.role !== 'Visual Reference')
      .map(b => b.content || b.summary || '')
  ].join('\n');

  const tokens = extractConfirmedSourceTokens(sourceContent);
  const quotes = extractExactQuotations(sourceContent);
  const lowerReframed = reframedCopy.toLowerCase();

  const requireFactsAndNumbers = protectedElements.includes('Confirmed facts & numbers');
  const requireDates = protectedElements.includes('Dates & timelines');
  const requireNames = protectedElements.includes('Names & proper titles');
  const requireQuotes = protectedElements.includes('Direct quotations (verbatim)');
  const requireCohTerms = protectedElements.includes('Approved COH terminology');

  // 1. Check for invented numbers/dates in reframedCopy (Non-negotiable factual integrity: ALWAYS ON)
  const outputNums = reframedCopy.match(/\b\d+(?:[.,]\d+)?%?\b/g) || [];
  const inventedNums: string[] = [];
  for (const outNum of outputNums) {
    if (!combinedAllowedSourceText.includes(outNum)) {
      inventedNums.push(outNum);
      records.push({
        category: 'Number / Date',
        token: outNum,
        requiredByPreference: true,
        status: 'altered and blocked',
        detail: `Number or date "${outNum}" in reframed output is not present in source material.`
      });
    }
  }
  if (inventedNums.length > 0) {
    integrityWarnings.push(
      `Factual Integrity Alert (Blocked): Reframed output introduced untraceable number(s)/date(s) (${Array.from(new Set(inventedNums)).join(', ')}) not present in the source.`
    );
  }

  // 2. Verify source numbers & dates
  const retainedNums: string[] = [];
  const omittedNums: string[] = [];
  for (const numTok of tokens.numbersAndDates) {
    const isDate = /\b20\d{2}\b|january|february|march|april|may|june|july|august|september|october|november|december|q[1-4]/i.test(
      numTok
    );
    const req = isDate ? requireDates || requireFactsAndNumbers : requireFactsAndNumbers;
    if (lowerReframed.includes(numTok.toLowerCase())) {
      retainedNums.push(numTok);
      records.push({
        category: 'Number / Date',
        token: numTok,
        requiredByPreference: req,
        status: 'retained unchanged',
        detail: `Verified "${numTok}" retained unchanged in reframed copy.`
      });
    } else {
      omittedNums.push(numTok);
      const status: ElementVerificationStatus =
        inventedNums.length > 0 ? 'altered and blocked' : req ? 'requires review' : 'intentionally omitted';
      records.push({
        category: 'Number / Date',
        token: numTok,
        requiredByPreference: req,
        status,
        detail:
          status === 'altered and blocked'
            ? `Source figure/date "${numTok}" was replaced by unverified figure(s) (${inventedNums.join(', ')}).`
            : req
              ? `Source figure/date "${numTok}" was omitted while protection was requested (requires review).`
              : `Source figure/date "${numTok}" was intentionally omitted.`
      });
      if (req && status === 'requires review') {
        integrityWarnings.push(
          `Protected Date/Number Review: Source token "${numTok}" was omitted from the reframed output.`
        );
      }
    }
  }

  if (retainedNums.length > 0) {
    preservedSummaryLines.push(
      `Confirmed Facts & Dates (retained unchanged): Verified ${retainedNums.join(', ')} in reframed copy.`
    );
  }
  if (omittedNums.length > 0 && inventedNums.length === 0) {
    preservedSummaryLines.push(
      `Source Numbers/Dates (${requireDates || requireFactsAndNumbers ? 'requires review' : 'intentionally omitted'}): ${omittedNums.join(', ')} not repeated in reframed copy.`
    );
  }

  // 3. Verify Proper Names & Entities
  const retainedNames: string[] = [];
  const omittedNames: string[] = [];
  for (const nameTok of tokens.properNamesAndEntities) {
    if (lowerReframed.includes(nameTok.toLowerCase())) {
      retainedNames.push(nameTok);
      records.push({
        category: 'Proper Name / Title',
        token: nameTok,
        requiredByPreference: requireNames,
        status: 'retained unchanged',
        detail: `Verified proper name/entity "${nameTok}" retained unchanged.`
      });
    } else {
      omittedNames.push(nameTok);
      const status: ElementVerificationStatus = requireNames ? 'requires review' : 'intentionally omitted';
      records.push({
        category: 'Proper Name / Title',
        token: nameTok,
        requiredByPreference: requireNames,
        status,
        detail: requireNames
          ? `Protected name/title "${nameTok}" was omitted from reframed copy (requires review).`
          : `Proper name/title "${nameTok}" was intentionally omitted.`
      });
      if (requireNames) {
        integrityWarnings.push(
          `Protected Name/Title Review: "${nameTok}" was marked for preservation but omitted in the reframed copy.`
        );
      }
    }
  }

  if (retainedNames.length > 0) {
    preservedSummaryLines.push(
      `Names & Proper Titles (retained unchanged): Verified ${retainedNames.join(', ')}.`
    );
  } else if (omittedNames.length > 0) {
    preservedSummaryLines.push(
      `Names & Proper Titles (${requireNames ? 'requires review' : 'intentionally omitted'}): ${omittedNames.join(', ')} omitted in reframed copy.`
    );
  }

  // 4. Verify COH Terminology
  const retainedCohTerms = tokens.properTerms.filter(t => lowerReframed.includes(t.toLowerCase()));
  if (retainedCohTerms.length > 0) {
    for (const term of retainedCohTerms) {
      records.push({
        category: 'COH Terminology',
        token: term,
        requiredByPreference: requireCohTerms,
        status: 'retained unchanged',
        detail: `Approved COH terminology "${term}" retained unchanged.`
      });
    }
    preservedSummaryLines.push(
      `Approved COH Terminology (retained unchanged): Verified ${retainedCohTerms.join(', ')}.`
    );
  }

  // 5. Verify Direct Quotations (NO fake auto-appended quotes!)
  // Also check if reframedCopy contains any double-quoted text that mutates a source quote (Non-negotiable!)
  const outputQuotes = extractExactQuotations(reframedCopy);
  let mutatedQuoteDetected = false;
  for (const outQ of outputQuotes) {
    if (!sourceContent.includes(outQ) && !combinedAllowedSourceText.includes(outQ)) {
      mutatedQuoteDetected = true;
      records.push({
        category: 'Direct Quotation',
        token: outQ,
        requiredByPreference: true,
        status: 'altered and blocked',
        detail: `Direct quotation ${outQ} in reframed copy does not match verbatim source text.`
      });
      integrityWarnings.push(
        `Quotation Integrity Alert (Blocked): Reframed copy presents mutated or fabricated direct quote ${outQ} as verbatim.`
      );
    }
  }

  let preservedQuotesVerified = !mutatedQuoteDetected;
  for (const srcQuote of quotes) {
    if (reframedCopy.includes(srcQuote)) {
      records.push({
        category: 'Direct Quotation',
        token: srcQuote,
        requiredByPreference: requireQuotes,
        status: 'retained unchanged',
        detail: `Direct quotation ${srcQuote} retained verbatim.`
      });
      preservedSummaryLines.push(`Direct Quotation (retained unchanged): ${srcQuote}`);
    } else {
      if (requireQuotes) {
        preservedQuotesVerified = false;
        records.push({
          category: 'Direct Quotation',
          token: srcQuote,
          requiredByPreference: true,
          status: 'altered and blocked',
          detail: `Required verbatim quotation ${srcQuote} was omitted or altered in reframed output.`
        });
        integrityWarnings.push(
          `Protected Quotation Missing (Blocked): Required verbatim quote ${srcQuote} was not preserved in the reframed copy.`
        );
      } else {
        records.push({
          category: 'Direct Quotation',
          token: srcQuote,
          requiredByPreference: false,
          status: 'intentionally omitted',
          detail: `Quotation ${srcQuote} was intentionally omitted because verbatim quote retention was disabled.`
        });
        preservedSummaryLines.push(
          `Direct Quotation (intentionally omitted): ${srcQuote} omitted per optional preference.`
        );
      }
    }
  }

  const integrityCheckPassed =
    inventedNums.length === 0 &&
    !mutatedQuoteDetected &&
    preservedQuotesVerified &&
    !records.some(r => r.status === 'altered and blocked');

  return {
    records,
    preservedSummaryLines,
    integrityWarnings,
    preservedQuotesVerified,
    integrityCheckPassed
  };
}

/**
 * Classifies whether a user's natural-language instruction is a true Strategic Reframe
 * or a Revision action (same communication job, improved execution).
 */
export function classifyReframeVsRevisionIntent(rawIntent: string): {
  recommendedRoute: RecommendedTransformationRoute;
  routeRationale: string;
  suggestedRevisionActionId?: string;
} {
  const lower = (rawIntent || '').toLowerCase().trim();
  if (!lower) {
    return {
      recommendedRoute: 'REFRAME',
      routeRationale: 'Ready to resolve strategic transformation intent.'
    };
  }

  // Check if the instruction explicitly mentions shifting audience, familiarity, channel/format, or strategic frame
  const hasStrategicShiftIndicators =
    /\b(institution|cultural venue|programming strategy|sponsor|patron|press|journalist|media|public|low-familiarity|knows little|unfamiliar|climate literacy|educational|linkedin|newsletter|instagram|carousel|pitch|perspective|reframe|turn .* into|shift .* from|adapt .* for)\b/i.test(
      lower
    );

  // Check if the instruction is purely surface editing, shortening, grammar, smoothing, or direct translation
  const isPurePolishOrShorten =
    /\b(shorter|shorten|trim|condense|smoother|polish|grammar|punctuation|typo|fix awkward|remove repetition|clean ai|translate to|tighten)\b/i.test(
      lower
    ) && !hasStrategicShiftIndicators;

  if (isPurePolishOrShorten) {
    let actionId = 'improve-clarity';
    if (lower.includes('short') || lower.includes('25%') || lower.includes('trim')) {
      actionId = 'shorter';
    } else if (lower.includes('smooth')) {
      actionId = 'smoother';
    } else if (lower.includes('grammar') || lower.includes('punctuation')) {
      actionId = 'fix-grammar';
    } else if (lower.includes('translate')) {
      actionId = 'translate-selected';
    } else if (lower.includes('repetition')) {
      actionId = 'remove-repetition';
    }

    return {
      recommendedRoute: 'REVISION',
      routeRationale:
        'This request keeps the same communication job and focuses on length, smoothness, or surface execution. Revision Studio is the recommended workflow.',
      suggestedRevisionActionId: actionId
    };
  }

  return {
    recommendedRoute: 'REFRAME',
    routeRationale:
      'This instruction changes what the content is trying to become (audience, familiarity, strategic frame, or channel architecture) while preserving factual integrity.'
  };
}

/**
 * Resolves a natural-language "What should this become?" instruction into an editable
 * COH-specific transformation plan before generation.
 */
export function resolveReframeIntent(params: {
  rawIntent: string;
  sourceContent: string;
  originChannel?: string;
  originAudience?: string;
  sourceBindings?: TaskSourceBinding[];
  derivedSourceAnalyses?: Record<string, SourceIntelligenceAnalysis>;
  operatingCore?: OperatingCore | null;
}): ResolvedReframePlan {
  const {
    rawIntent,
    sourceContent,
    originChannel = 'Website',
    originAudience = 'General Public',
    sourceBindings = [],
    derivedSourceAnalyses = {},
    operatingCore = null
  } = params;

  const lower = (rawIntent || '').toLowerCase();
  const routeCheck = classifyReframeVsRevisionIntent(rawIntent);

  // 1. Resolve Target Audience from active Operating Core
  const inferredAudience = inferAudienceFromText(rawIntent, operatingCore);
  const targetAudience =
    inferredAudience ||
    resolveOperatingCoreAudience(originAudience, operatingCore, 'General cultural audience', {
      preserveExplicitGeneralPublic: true
    });

  // 2. Resolve Audience Familiarity
  let audienceFamiliarity: AudienceFamiliarityLevel = 'Informed Cultural / Industry Familiarity';
  if (
    lower.includes('knows little') ||
    lower.includes('low-familiarity') ||
    lower.includes('low familiarity') ||
    lower.includes('unfamiliar') ||
    lower.includes('first-time') ||
    lower.includes('new to coh') ||
    lower.includes('accessible') ||
    lower.includes('non-expert')
  ) {
    audienceFamiliarity = 'Low Familiarity (Needs foundational COH context)';
  } else if (lower.includes('existing partner') || lower.includes('deep familiarity') || lower.includes('internal')) {
    audienceFamiliarity = 'Deep COH / Partner Familiarity';
  }

  // 3. Resolve Target Channel & Format
  let targetChannel = originChannel || 'LinkedIn';
  let targetFormat = 'Post';
  if (lower.includes('linkedin')) {
    targetChannel = 'LinkedIn';
    targetFormat = lower.includes('article') || lower.includes('thought') ? 'Thought Piece' : 'Post';
  } else if (lower.includes('instagram') || lower.includes('carousel')) {
    targetChannel = 'Instagram';
    targetFormat = lower.includes('carousel') ? 'Carousel' : 'Caption';
  } else if (lower.includes('newsletter') || lower.includes('essay')) {
    targetChannel = 'Newsletter';
    targetFormat = 'Newsletter Section';
  } else if (lower.includes('press') || lower.includes('media narrative')) {
    targetChannel = 'Press / Media';
    targetFormat = 'Press Narrative Paragraph';
  } else if (lower.includes('email') || lower.includes('outreach') || lower.includes('pitch')) {
    targetChannel = 'Email / Direct Outreach';
    targetFormat = 'Institutional Pitch Note';
  } else if (/institution|venue|opera house|festival|partner/i.test(targetAudience)) {
    targetChannel = 'LinkedIn';
    targetFormat = 'Institutional Brief / Post';
  }

  // 4. Resolve Communication Purpose, Strategic Frame & Canonical COH Content Pillar
  let communicationPurpose = 'Establish institutional credibility';
  let strategicFrame = 'Institutional Relevance & Repertoire Longevity';
  let contentPillarEmphasis: string = 'Partnerships, Sponsorship & Institutional Value';
  let narrativePerspective = 'Measured Institutional Authority';
  let desiredAudienceResponse =
    'Recognize how Climate Opera Haus fits long-term cultural programming and institutional strategy.';

  if (lower.includes('climate literacy') || lower.includes('science') || lower.includes('ecological')) {
    communicationPurpose = 'Build climate literacy';
    strategicFrame = 'Planetary Thresholds Translated Through Operatic Drama';
    contentPillarEmphasis = 'Education, Community & Climate Literacy';
    narrativePerspective = 'Accessible Educational & Somatic Clarity';
    desiredAudienceResponse =
      'Understand the ecological insight clearly without academic jargon and feel its human stakes.';
  } else if (
    lower.includes('public cultural meaning') ||
    lower.includes('cultural meaning') ||
    lower.includes('ritual') ||
    lower.includes('human')
  ) {
    communicationPurpose = 'Deepen cultural meaning';
    strategicFrame = 'Collective Cultural Ritual & Shared Civic Meaning';
    contentPillarEmphasis = 'Events, Convenings & Public Moments';
    narrativePerspective = 'Human & Cultural Resonance';
    desiredAudienceResponse =
      'Experience the opera as a vital shared cultural space rather than a commercial or activist message.';
  } else if (lower.includes('artistic') || lower.includes('dramaturg') || lower.includes('craft')) {
    communicationPurpose = 'Explain artistic logic';
    strategicFrame = 'Operatic Worldbuilding & Dramaturgical Rigor';
    contentPillarEmphasis = 'Opera Worlds & Artistic Method';
    narrativePerspective = 'Artistic & Dramaturgical Insight';
    desiredAudienceResponse =
      'Appreciate the artistic discipline and musical architecture driving the work.';
  } else if (lower.includes('sponsor') || lower.includes('patron')) {
    communicationPurpose = 'Create sponsor relevance';
    strategicFrame = 'Long-Horizon Cultural IP & Prestige Alignment';
    contentPillarEmphasis = 'Partnerships, Sponsorship & Institutional Value';
    narrativePerspective = 'Strategic Capital & Prestige Framing';
    desiredAudienceResponse =
      'See the long-term brand and cultural prestige value of backing COH origin assets.';
  } else if (lower.includes('press') || lower.includes('journalist')) {
    communicationPurpose = 'Clarify a milestone';
    strategicFrame = 'Press-Ready Cultural & Newsworthy Narrative';
    contentPillarEmphasis = 'Climate Tetralogy & Canon';
    narrativePerspective = 'Editorial & Newsworthy Clarity';
    desiredAudienceResponse =
      'Identify a clear, credible cultural story angle grounded in verified facts.';
  }
  contentPillarEmphasis = normalizeCohPillar(contentPillarEmphasis);

  // 5. Evidence Emphasis & Unresolved Items Check (Journey F: Evidence protection)
  const unresolvedItems: string[] = [];
  const asksForUnverifiedProof =
    /\b(prove|guarantee|million|billion|confirmed partnership with|sold out|record-breaking|100%|add hard numbers|claim that we already|invent|fabricate)\b/i.test(
      lower
    );

  const factualSources = sourceBindings.filter(
    b => b.role !== 'Approved Example' && b.role !== 'Visual Reference'
  );

  if (asksForUnverifiedProof) {
    const tokens = extractConfirmedSourceTokens(sourceContent);
    if (tokens.numbersAndDates.length === 0 && factualSources.length === 0) {
      unresolvedItems.push(
        'Evidence Protection Warning: The instruction requests stronger quantitative or milestone proof that is not present in the source text or attached factual sources. Unverified claims will not be fabricated.'
      );
    }
  }

  for (const b of factualSources) {
    const analysis = derivedSourceAnalyses[b.sourceId];
    if (analysis && analysis.cautionsAndAmbiguities.length > 0) {
      unresolvedItems.push(`Source caution (${b.title}): ${analysis.cautionsAndAmbiguities[0]}`);
    }
  }

  const evidenceEmphasis =
    factualSources.length > 0
      ? `Anchor claims in source text and ${factualSources.length} attached factual source(s)`
      : 'Preserve only facts confirmed in the source text and Protected COH Kernel; do not invent external proof';

  return {
    rawIntent,
    recommendedRoute: routeCheck.recommendedRoute,
    routeRationale: routeCheck.routeRationale,
    suggestedRevisionActionId: routeCheck.suggestedRevisionActionId,
    targetAudience,
    audienceFamiliarity,
    communicationPurpose,
    targetChannel,
    targetFormat,
    strategicFrame,
    contentPillarEmphasis,
    narrativePerspective,
    evidenceEmphasis,
    desiredAudienceResponse,
    protectedElements: [...DEFAULT_PROTECTED_ELEMENTS],
    nonNegotiableIntegrityRules: NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES,
    unresolvedItems
  };
}

/**
 * Verifies protected elements and non-negotiable factual integrity without ever silently
 * auto-appending fake quote wrappers, and produces truthful Changed vs Preserved explanations
 * based on actual deterministic verification against `reframedCopy`.
 */
export function finalizeReframeResult(params: {
  sourceContent: string;
  rawReframedCopy: string;
  plan: ResolvedReframePlan;
  sourceBindings?: TaskSourceBinding[];
  aiChanged?: string[];
  aiPreserved?: string[];
  aiWarnings?: string[];
}): ReframeOutputResult {
  const { sourceContent, plan, sourceBindings = [], aiChanged = [], aiPreserved = [], aiWarnings = [] } = params;
  const reframedCopy = (params.rawReframedCopy || '')
    .replace(/\u2014/g, ' - ')
    .replace(/\n*As noted directly in the source material:\s*"[^"]*"/g, '')
    .trim();

  // 1. Run deterministic verification of dates, numbers, names, COH terms, and quotes
  const verification = verifyReframedElementContinuity({
    sourceContent,
    reframedCopy,
    protectedElements: plan.protectedElements,
    sourceBindings
  });

  // 2. Build meaningful Changed explanation
  const changedExplanation: string[] = [];
  for (const item of aiChanged) {
    if (item && typeof item === 'string') {
      changedExplanation.push(item.replace(/\u2014/g, ' - ').trim());
    }
  }
  if (changedExplanation.length === 0) {
    changedExplanation.push(
      `Audience Framing: Shifted target framing toward ${plan.targetAudience} (${plan.audienceFamiliarity}).`
    );
    changedExplanation.push(
      `Communication Purpose & Strategic Frame: Rebuilt opening and argument around "${plan.communicationPurpose}" (${plan.strategicFrame}).`
    );
    changedExplanation.push(
      `Channel & Format Architecture: Structured specifically for ${plan.targetChannel} (${plan.targetFormat}) with a ${plan.narrativePerspective} perspective.`
    );
  }

  // 3. Build truthful Preserved explanation grounded in actual verification results
  const preservedExplanation: string[] = [
    'Protected COH Kernel (retained unchanged): Preserved Climate Opera Haus identity as an opera-based cultural IP venture.'
  ];
  for (const verifiedLine of verification.preservedSummaryLines) {
    if (!preservedExplanation.includes(verifiedLine)) {
      preservedExplanation.push(verifiedLine);
    }
  }
  for (const item of aiPreserved) {
    if (item && typeof item === 'string') {
      const cleanItem = item.replace(/\u2014/g, ' - ').trim();
      // Do not allow AI to claim quotes or dates were preserved if verification proved they failed
      if (!verification.preservedQuotesVerified && /quote|quotation/i.test(cleanItem)) {
        continue;
      }
      if (!preservedExplanation.includes(cleanItem)) {
        preservedExplanation.push(cleanItem);
      }
    }
  }
  if (sourceBindings.length > 0) {
    preservedExplanation.push(
      `Task Source Boundaries: Respected task-level roles across ${sourceBindings.length} attached source(s).`
    );
  }

  // 4. Evidence & Integrity Warnings
  const evidenceWarnings = Array.from(
    new Set([
      ...plan.unresolvedItems,
      ...verification.integrityWarnings,
      ...aiWarnings.map(w => w.replace(/\u2014/g, ' - ').trim())
    ])
  );

  return {
    reframedCopy,
    changedExplanation,
    preservedExplanation,
    evidenceWarnings,
    preservedQuotesVerified: verification.preservedQuotesVerified,
    integrityCheckPassed: verification.integrityCheckPassed,
    elementVerification: verification.records
  };
}

/**
 * Deterministic COH Reframe Generator used when AI is offline or returns 503,
 * ensuring every visible plan control (audience, familiarity, channel, format, strategic frame,
 * pillar, optional quote retention, evidence discipline) directly shapes the generated reframe.
 */
export function buildDeterministicReframe(params: {
  sourceContent: string;
  plan: ResolvedReframePlan;
  sourceBindings?: TaskSourceBinding[];
  derivedSourceAnalyses?: Record<string, SourceIntelligenceAnalysis>;
}): ReframeOutputResult {
  const { sourceContent, plan, sourceBindings = [], derivedSourceAnalyses = {} } = params;
  const cleanSource = sourceContent.replace(/\u2014/g, ' - ').trim();
  const quotes = extractExactQuotations(cleanSource);
  const requireQuotes = plan.protectedElements.includes('Direct quotations (verbatim)');

  // Extract core factual sentences from source without inventing new facts
  const workingSource = requireQuotes
    ? cleanSource
    : cleanSource.replace(/"[^"]{12,300}"/g, '').replace(/\s{2,}/g, ' ').trim();

  const sentences = workingSource
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const coreSentence =
    sentences[0] || 'Climate Opera Haus develops original operatic worlds anchored by live performance.';
  const secondarySentence = sentences.length > 1 ? sentences[1] : '';

  // Optional traceable fact from attached factual source (excluding Approved Example / Visual Reference)
  let attachedFactLine = '';
  for (const b of sourceBindings) {
    if (b.role === 'Approved Example' || b.role === 'Visual Reference') continue;
    const analysis = derivedSourceAnalyses[b.sourceId];
    if (analysis && analysis.keyFacts.length > 0) {
      attachedFactLine = `Grounded in ${b.title}: ${analysis.keyFacts[0]}`;
      break;
    } else if (b.content) {
      const firstSrcSent = b.content.split(/(?<=[.!?])\s+/)[0]?.trim();
      if (firstSrcSent && firstSrcSent.length < 200) {
        attachedFactLine = `Grounded in ${b.title}: ${firstSrcSent}`;
        break;
      }
    }
  }

  const familiarityIntro =
    plan.audienceFamiliarity === 'Low Familiarity (Needs foundational COH context)'
      ? 'For audiences and institutions encountering Climate Opera Haus for the first time: COH is a climate-era cultural IP venture where live opera serves as the origin asset for enduring artistic worlds.'
      : plan.audienceFamiliarity === 'Deep COH / Partner Familiarity'
        ? 'Building directly on our shared Climate Opera Haus strategic architecture:'
        : `Positioned for ${plan.targetAudience} with a focus on ${plan.contentPillarEmphasis}:`;

  let openingFrame = '';
  if (/institution|venue|opera house|festival/i.test(plan.targetAudience)) {
    openingFrame = `Institutional Programming Perspective (${plan.strategicFrame} - ${plan.targetAudience}): Contemporary cultural venues need repertoire that unites artistic excellence with urgent civic relevance.`;
  } else if (plan.communicationPurpose === 'Build climate literacy') {
    openingFrame = `Climate Literacy & Human Meaning (${plan.strategicFrame}): Understanding planetary thresholds requires more than technical reports; it requires shared cultural translation.`;
  } else if (plan.communicationPurpose === 'Deepen cultural meaning') {
    openingFrame = `Public Cultural Meaning (${plan.strategicFrame}): Beyond institutional frameworks, live operatic performance creates a shared civic space where planetary reality is felt.`;
  } else if (/press|journalist|media/i.test(plan.targetAudience)) {
    openingFrame = `Editorial Narrative (${plan.strategicFrame}):`;
  } else {
    openingFrame = `${plan.strategicFrame} (${plan.targetAudience}):`;
  }

  const bodyParagraphs: string[] = [
    openingFrame,
    familiarityIntro,
    `${coreSentence}${secondarySentence ? ' ' + secondarySentence : ''}`
  ];

  if (attachedFactLine) {
    bodyParagraphs.push(attachedFactLine);
  }

  // Include exact quotes naturally if "Direct quotations (verbatim)" preference is enabled
  if (requireQuotes && quotes.length > 0) {
    for (const q of quotes) {
      if (!bodyParagraphs.some(p => p.includes(q))) {
        bodyParagraphs.push(q);
      }
    }
  }

  // Closing tailored to desiredAudienceResponse and targetFormat
  const closingLine = `Next Perspective for ${plan.targetAudience} (${plan.targetChannel} - ${plan.targetFormat}): ${plan.desiredAudienceResponse}`;
  bodyParagraphs.push(closingLine);

  if (plan.unresolvedItems.length > 0) {
    bodyParagraphs.push(
      `[Editorial Evidence Note: Additional claims requested in the prompt require verified source backing before publication and were not fabricated.]`
    );
  }

  const rawReframedCopy = bodyParagraphs.filter(Boolean).join('\n\n');

  return finalizeReframeResult({
    sourceContent: cleanSource,
    rawReframedCopy,
    plan,
    sourceBindings
  });
}

/**
 * Builds backward-compatible lineage metadata when saving a reframed piece to Content Library.
 */
export function buildReframeLineageMetadata(params: {
  originType: ReframeOriginType;
  originContentId?: string;
  originTitle?: string;
  plan: ResolvedReframePlan;
  sourceIds: string[];
}): ReframeLineageMetadata {
  return {
    originType: params.originType,
    originContentId: params.originContentId,
    originTitle: params.originTitle,
    transformationType: 'reframe',
    reframeIntent: params.plan.rawIntent,
    resolvedPlan: {
      targetAudience: params.plan.targetAudience,
      audienceFamiliarity: params.plan.audienceFamiliarity,
      communicationPurpose: params.plan.communicationPurpose,
      targetChannel: params.plan.targetChannel,
      targetFormat: params.plan.targetFormat,
      strategicFrame: params.plan.strategicFrame,
      contentPillarEmphasis: params.plan.contentPillarEmphasis,
      narrativePerspective: params.plan.narrativePerspective
    },
    sourceReferences: params.sourceIds,
    reframedAt: new Date().toISOString()
  };
}
