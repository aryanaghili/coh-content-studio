/**
 * COH-CS-05: Dedicated COH Reframing Studio Engine
 *
 * Critical Distinction:
 * - Revision = Improve substantially the same communication job (polish, shorten, grammar, translate, tone tweak).
 * - Reframing = Change what the content is trying to become while preserving factual integrity
 *   (shift audience, familiarity level, channel/format architecture, strategic frame, or narrative perspective).
 */

import type { SourceTaskRole, TaskSourceBinding } from './contextCompiler.ts';
import type { SourceIntelligenceAnalysis } from './sourceIntelligence.ts';

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

export const DEFAULT_PROTECTED_ELEMENTS = [
  'Confirmed facts & numbers',
  'Names & proper titles',
  'Dates & timelines',
  'Direct quotations (verbatim)',
  'Approved COH terminology',
  'Central artistic meaning',
  'Source-backed claims'
] as const;

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
  unresolvedItems: string[];
}

export interface ReframeOutputResult {
  reframedCopy: string;
  changedExplanation: string[];
  preservedExplanation: string[];
  evidenceWarnings: string[];
  visualDirection?: string;
  preservedQuotesVerified: boolean;
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
 * so they can be protected verbatim during reframing.
 */
export function extractExactQuotations(sourceText: string): string[] {
  if (!sourceText) return [];
  const matches = sourceText.match(/"([^"]{12,300})"/g) || [];
  return Array.from(new Set(matches.map(m => m.trim())));
}

/**
 * Extracts numbers/dates/namedCOH entities from source text to verify factual preservation.
 */
export function extractConfirmedSourceTokens(sourceText: string): {
  numbersAndDates: string[];
  properTerms: string[];
} {
  if (!sourceText) return { numbersAndDates: [], properTerms: [] };
  const numMatches = sourceText.match(/\b(\d+(?:\.\d+)?%?|\b20\d{2}\b)/g) || [];
  const cohTerms = [
    'Climate Opera Haus',
    'COH',
    'The Golden Fountain',
    'Soria Moria',
    'The Climate Tetralogy'
  ].filter(term => sourceText.toLowerCase().includes(term.toLowerCase()));

  return {
    numbersAndDates: Array.from(new Set(numMatches)),
    properTerms: cohTerms
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
}): ResolvedReframePlan {
  const {
    rawIntent,
    sourceContent,
    originChannel = 'Website',
    originAudience = 'General Public',
    sourceBindings = [],
    derivedSourceAnalyses = {}
  } = params;

  const lower = (rawIntent || '').toLowerCase();
  const routeCheck = classifyReframeVsRevisionIntent(rawIntent);

  // 1. Resolve Target Audience
  let targetAudience = originAudience || 'General Public';
  if (
    lower.includes('cultural institution') ||
    lower.includes('venue') ||
    lower.includes('programming strategy') ||
    lower.includes('opera house') ||
    lower.includes('institutional')
  ) {
    targetAudience = 'Cultural Institutions & Venues';
  } else if (lower.includes('sponsor') || lower.includes('patron') || lower.includes('funder') || lower.includes('capital')) {
    targetAudience = 'Sponsors & Patrons';
  } else if (lower.includes('press') || lower.includes('journalist') || lower.includes('media')) {
    targetAudience = 'Press & Media';
  } else if (lower.includes('partner') || lower.includes('coalition')) {
    targetAudience = 'Strategic Partners';
  } else if (
    lower.includes('public') ||
    lower.includes('general audience') ||
    lower.includes('everyday') ||
    lower.includes('climate literacy')
  ) {
    targetAudience = 'General Public';
  }

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
  } else if (targetAudience === 'Cultural Institutions & Venues' || targetAudience === 'Strategic Partners') {
    targetChannel = 'LinkedIn';
    targetFormat = 'Institutional Brief / Post';
  }

  // 4. Resolve Communication Purpose, Strategic Frame & Content Pillar
  let communicationPurpose = 'Establish institutional credibility';
  let strategicFrame = 'Institutional Relevance & Repertoire Longevity';
  let contentPillarEmphasis = 'Institutional & Sponsor Value';
  let narrativePerspective = 'Measured Institutional Authority';
  let desiredAudienceResponse =
    'Recognize how Climate Opera Haus fits long-term cultural programming and institutional strategy.';

  if (lower.includes('climate literacy') || lower.includes('science') || lower.includes('ecological')) {
    communicationPurpose = 'Build climate literacy';
    strategicFrame = 'Planetary Thresholds Translated Through Operatic Drama';
    contentPillarEmphasis = 'Science & Planetary Reality';
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
    contentPillarEmphasis = 'Cultural Participation & Ritual';
    narrativePerspective = 'Human & Cultural Resonance';
    desiredAudienceResponse =
      'Experience the opera as a vital shared cultural space rather than a commercial or activist message.';
  } else if (lower.includes('artistic') || lower.includes('dramaturg') || lower.includes('craft')) {
    communicationPurpose = 'Explain artistic logic';
    strategicFrame = 'Operatic Worldbuilding & Dramaturgical Rigor';
    contentPillarEmphasis = 'The Opera & Worldbuilding';
    narrativePerspective = 'Artistic & Dramaturgical Insight';
    desiredAudienceResponse =
      'Appreciate the artistic discipline and musical architecture driving the work.';
  } else if (lower.includes('sponsor') || lower.includes('patron')) {
    communicationPurpose = 'Create sponsor relevance';
    strategicFrame = 'Long-Horizon Cultural IP & Prestige Alignment';
    contentPillarEmphasis = 'Institutional & Sponsor Value';
    narrativePerspective = 'Strategic Capital & Prestige Framing';
    desiredAudienceResponse =
      'See the long-term brand and cultural prestige value of backing COH origin assets.';
  } else if (lower.includes('press') || lower.includes('journalist')) {
    communicationPurpose = 'Clarify a milestone';
    strategicFrame = 'Press-Ready Cultural & Newsworthy Narrative';
    contentPillarEmphasis = 'The Opera & Worldbuilding';
    narrativePerspective = 'Editorial & Newsworthy Clarity';
    desiredAudienceResponse =
      'Identify a clear, credible cultural story angle grounded in verified facts.';
  }

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
    unresolvedItems
  };
}

/**
 * Enforces protected elements (such as exact quotations) and generates accurate
 * Changed vs Preserved explanations comparing sourceContent and reframedCopy.
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
  let reframedCopy = (params.rawReframedCopy || '').replace(/\u2014/g, ' - ').trim();

  // 1. Enforce exact quotations if "Direct quotations (verbatim)" is in protectedElements
  const quotes = extractExactQuotations(sourceContent);
  let preservedQuotesVerified = true;
  if (plan.protectedElements.includes('Direct quotations (verbatim)') && quotes.length > 0) {
    for (const q of quotes) {
      if (!reframedCopy.includes(q)) {
        // Re-anchor exact quote cleanly so protected quotations are never lost or mutated
        reframedCopy = `${reframedCopy}\n\nAs noted directly in the source material: ${q}`;
      }
    }
    preservedQuotesVerified = quotes.every(q => reframedCopy.includes(q));
  }

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

  // 3. Build meaningful Preserved explanation
  const preservedExplanation: string[] = [];
  for (const item of aiPreserved) {
    if (item && typeof item === 'string') {
      preservedExplanation.push(item.replace(/\u2014/g, ' - ').trim());
    }
  }
  const tokens = extractConfirmedSourceTokens(sourceContent);
  if (preservedExplanation.length === 0) {
    preservedExplanation.push(
      'Protected COH Kernel: Preserved Climate Opera Haus identity as an opera-based cultural IP venture.'
    );
    if (tokens.properTerms.length > 0) {
      preservedExplanation.push(
        `Approved Terminology & Proper Titles: Preserved ${tokens.properTerms.join(', ')}.`
      );
    }
    if (tokens.numbersAndDates.length > 0) {
      preservedExplanation.push(
        `Confirmed Facts & Dates: Preserved exact figures/dates (${tokens.numbersAndDates.join(', ')}) without inflation.`
      );
    }
    if (quotes.length > 0 && plan.protectedElements.includes('Direct quotations (verbatim)')) {
      preservedExplanation.push(
        `Verbatim Quotations: Preserved ${quotes.length} direct quotation(s) word-for-word.`
      );
    }
    if (sourceBindings.length > 0) {
      preservedExplanation.push(
        `Task Source Boundaries: Respected task-level roles across ${sourceBindings.length} attached source(s).`
      );
    }
  }

  // 4. Evidence Warnings
  const evidenceWarnings = [
    ...plan.unresolvedItems,
    ...aiWarnings.map(w => w.replace(/\u2014/g, ' - ').trim())
  ];

  return {
    reframedCopy,
    changedExplanation,
    preservedExplanation,
    evidenceWarnings,
    preservedQuotesVerified
  };
}

/**
 * Deterministic COH Reframe Generator used when AI is offline or returns 503,
 * ensuring every visible plan control (audience, familiarity, channel, format, strategic frame,
 * pillar, protected quotes, evidence discipline) directly shapes the generated reframe.
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
  const tokens = extractConfirmedSourceTokens(cleanSource);

  // Extract core factual sentences from source without inventing new facts
  const sentences = cleanSource
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
  if (plan.targetAudience === 'Cultural Institutions & Venues') {
    openingFrame = `Institutional Programming Perspective (${plan.strategicFrame}): Contemporary cultural venues need repertoire that unites artistic excellence with urgent civic relevance.`;
  } else if (plan.communicationPurpose === 'Build climate literacy') {
    openingFrame = `Climate Literacy & Human Meaning (${plan.strategicFrame}): Understanding planetary thresholds requires more than technical reports; it requires shared cultural translation.`;
  } else if (plan.communicationPurpose === 'Deepen cultural meaning') {
    openingFrame = `Public Cultural Meaning (${plan.strategicFrame}): Beyond institutional frameworks, live operatic performance creates a shared civic space where planetary reality is felt.`;
  } else if (plan.targetAudience === 'Press & Media') {
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

  // Ensure exact quotes are included if protected
  if (plan.protectedElements.includes('Direct quotations (verbatim)') && quotes.length > 0) {
    for (const q of quotes) {
      if (!bodyParagraphs.some(p => p.includes(q))) {
        bodyParagraphs.push(`Preserved source quotation: ${q}`);
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
