/**
 * COH-CS-04: Ideation 2.0 - Opportunity-Led, Evidence-Aware and Reuse-Aware Ideation
 *
 * Implements:
 * 1. COH Communication Jobs derived from COH strategic context
 * 2. Evidence-aware separation (Available Evidence vs Advisory Evidence Still Required)
 * 3. Lightweight staged Reuse Awareness across Idea Library and Content Library (no embeddings/DB)
 * 4. Opportunity Diversity evaluation and enforcement across COH strategic dimensions
 * 5. Context-preserving handoff from Ideation to Content Workspace
 */

import type { SourceTaskRole, TaskSourceBinding, WorkContext } from './contextCompiler.ts';
import {
  CANONICAL_COH_PILLARS,
  getAuthoritativeAudiences,
  normalizeCohPillar,
  normalizeOperatingCoreAudience,
  type OperatingCore
} from './operatingCore.ts';
import type { SourceIntelligenceAnalysis } from './sourceIntelligence.ts';

export const COH_COMMUNICATION_JOBS = [
  'Establish institutional credibility',
  'Explain artistic logic',
  'Create sponsor relevance',
  'Build climate literacy',
  'Invite public participation',
  'Clarify a milestone',
  'Deepen cultural meaning'
] as const;

export type CommunicationJob = (typeof COH_COMMUNICATION_JOBS)[number] | string;

export const COH_VALID_AUDIENCES: readonly string[] = getAuthoritativeAudiences();

export const COH_CONTENT_PILLARS = CANONICAL_COH_PILLARS;

export function getValidIdeationAudiences(operatingCore?: OperatingCore | null): string[] {
  return getAuthoritativeAudiences(operatingCore);
}

export type ReuseClassificationType =
  | 'New Ground'
  | 'Extend Existing Idea'
  | 'Reframe Existing Content'
  | 'Reuse Existing Argument';

export type ReuseConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface ReuseOpportunity {
  classification: ReuseClassificationType;
  confidence: ReuseConfidenceLevel;
  rationale: string;
  matchedItemId?: string;
  matchedItemType?: 'idea' | 'content';
  matchedItemTitle?: string;
  matchedItemChannel?: string;
  matchedItemAudience?: string;
  similarityScore?: number;
}

export interface IdeationOpportunityProposal {
  id: string;
  title: string;
  originalInput: string;
  category: string;
  explanation: string; // Core Idea / Concept
  communicationJob: string;
  whyItWorks: string; // Why It Matters
  coreTension: string; // Core Tension or Audience Problem
  desiredAudienceResponse: string;
  availableEvidence: string[];
  evidenceStillRequired: string[]; // Advisory signal, not placeholder-heavy blocker
  suggestedAudience: string;
  suggestedChannel: string;
  suggestedFormat: string;
  suggestedPillar: string;
  suggestedTone: string;
  strategicAngle: string;
  narrativePerspective?: string;
  evidenceEmphasis?: string;
  reuseOpportunity: ReuseOpportunity;
  riskToAvoid: string;
  unresolvedAssumptions: string[];
  possibleHook: string;
  possibleFirstPost?: string;
  possibleNextStep: string;
  language: string;
  dateCreated: string;
  status: 'New' | 'Promising' | 'Ready for Content' | 'Used' | 'Archived' | 'Not Useful';
  sourceIds?: string[];
  sourceRoles?: Record<string, SourceTaskRole>;
}

export interface LibraryIdeaCandidate {
  id: string;
  title: string;
  explanation: string;
  category?: string;
  suggestedChannel?: string;
  suggestedAudience?: string;
  suggestedPillar?: string;
  communicationJob?: string;
}

export interface LibraryContentCandidate {
  id: string;
  title: string;
  text: string;
  channel?: string;
  pillar?: string;
  audience?: string;
  angle?: string;
  purpose?: string;
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'about', 'what', 'when',
  'where', 'which', 'while', 'how', 'why', 'who', 'are', 'was', 'were', 'been', 'being',
  'have', 'has', 'had', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may',
  'might', 'must', 'our', 'your', 'their', 'its', 'climate', 'opera', 'haus', 'coh',
  'content', 'post', 'piece', 'write', 'create', 'make', 'more', 'less', 'than', 'very'
]);

/**
 * Tokenizes text into meaningful normalized terms for local reuse matching.
 */
export function tokenizeForReuse(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

function computeJaccardAndContainment(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  if (intersection === 0) return 0;
  const union = setA.size + setB.size - intersection;
  const jaccard = intersection / union;
  const containment = intersection / Math.min(setA.size, setB.size);
  return Number((jaccard * 0.45 + containment * 0.55).toFixed(3));
}

/**
 * Stage 1 & 2: Lightweight staged shortlist & conservative reuse classification
 * across existing Idea Library and Content Library items without embeddings or a DB.
 */
export function classifyReuseOpportunity(params: {
  candidateTitle: string;
  candidateConcept: string;
  candidateAudience?: string;
  candidateChannel?: string;
  candidatePillar?: string;
  savedIdeas: LibraryIdeaCandidate[];
  savedContents: LibraryContentCandidate[];
}): ReuseOpportunity {
  const queryTokens = tokenizeForReuse(`${params.candidateTitle} ${params.candidateConcept}`);
  if (queryTokens.length === 0) {
    return {
      classification: 'New Ground',
      confidence: 'High',
      rationale: 'No overlapping prior items found in Idea Library or Content Library.'
    };
  }

  let bestContentMatch: { item: LibraryContentCandidate; score: number } | null = null;
  for (const content of params.savedContents || []) {
    const titleTokens = tokenizeForReuse(content.title || '');
    const bodyTokens = tokenizeForReuse((content.text || '').slice(0, 600));
    const titleScore = computeJaccardAndContainment(queryTokens, titleTokens);
    const bodyScore = computeJaccardAndContainment(queryTokens, bodyTokens);
    const combinedScore = Number(Math.max(titleScore * 1.15, titleScore * 0.5 + bodyScore * 0.5).toFixed(3));

    if (!bestContentMatch || combinedScore > bestContentMatch.score) {
      bestContentMatch = { item: content, score: combinedScore };
    }
  }

  let bestIdeaMatch: { item: LibraryIdeaCandidate; score: number } | null = null;
  for (const idea of params.savedIdeas || []) {
    const titleTokens = tokenizeForReuse(idea.title || '');
    const expTokens = tokenizeForReuse(idea.explanation || '');
    const titleScore = computeJaccardAndContainment(queryTokens, titleTokens);
    const expScore = computeJaccardAndContainment(queryTokens, expTokens);
    const combinedScore = Number(Math.max(titleScore * 1.15, titleScore * 0.55 + expScore * 0.45).toFixed(3));

    if (!bestIdeaMatch || combinedScore > bestIdeaMatch.score) {
      bestIdeaMatch = { item: idea, score: combinedScore };
    }
  }

  const topContentScore = bestContentMatch?.score ?? 0;
  const topIdeaScore = bestIdeaMatch?.score ?? 0;

  // Threshold below which it is genuinely New Ground
  if (topContentScore < 0.18 && topIdeaScore < 0.18) {
    return {
      classification: 'New Ground',
      confidence: 'High',
      rationale: 'Explores an angle not yet covered in the existing Idea Library or Content Library.'
    };
  }

  // Prefer Content Library match if it is stronger or comparable
  if (bestContentMatch && topContentScore >= topIdeaScore && topContentScore >= 0.18) {
    const matched = bestContentMatch.item;
    const sameAudience =
      Boolean(params.candidateAudience && matched.audience) &&
      params.candidateAudience?.toLowerCase() === matched.audience?.toLowerCase();
    const sameChannel =
      Boolean(params.candidateChannel && matched.channel) &&
      params.candidateChannel?.toLowerCase() === matched.channel?.toLowerCase();

    const confidence: ReuseConfidenceLevel =
      topContentScore >= 0.45 ? 'High' : topContentScore >= 0.28 ? 'Medium' : 'Low';
    const lowConfPrefix =
      confidence === 'Low'
        ? 'Low confidence match (thematic overlap only): '
        : '';

    if (sameAudience && sameChannel && topContentScore >= 0.35) {
      return {
        classification: 'Reuse Existing Argument',
        confidence,
        rationale: `${lowConfPrefix}Closely aligns with existing Content Library piece "${matched.title}" (${matched.channel || 'General'}). Build directly on its established argument rather than starting from scratch.`,
        matchedItemId: matched.id,
        matchedItemType: 'content',
        matchedItemTitle: matched.title,
        matchedItemChannel: matched.channel,
        matchedItemAudience: matched.audience,
        similarityScore: topContentScore
      };
    }

    return {
      classification: 'Reframe Existing Content',
      confidence,
      rationale: `${lowConfPrefix}Shares core subject matter with Content Library piece "${matched.title}" (${matched.audience || 'General Public'} / ${matched.channel || 'General'}), which can be reframed for ${params.candidateAudience || 'this target audience'} on ${params.candidateChannel || 'this channel'}.`,
      matchedItemId: matched.id,
      matchedItemType: 'content',
      matchedItemTitle: matched.title,
      matchedItemChannel: matched.channel,
      matchedItemAudience: matched.audience,
      similarityScore: topContentScore
    };
  }

  if (bestIdeaMatch && topIdeaScore >= 0.18) {
    const matched = bestIdeaMatch.item;
    const confidence: ReuseConfidenceLevel =
      topIdeaScore >= 0.45 ? 'High' : topIdeaScore >= 0.28 ? 'Medium' : 'Low';
    const lowConfPrefix =
      confidence === 'Low'
        ? 'Low confidence match (thematic overlap only): '
        : '';

    return {
      classification: 'Extend Existing Idea',
      confidence,
      rationale: `${lowConfPrefix}Connects to saved Idea Library concept "${matched.title}". Consider extending or deepening that concept rather than duplicating it.`,
      matchedItemId: matched.id,
      matchedItemType: 'idea',
      matchedItemTitle: matched.title,
      matchedItemChannel: matched.suggestedChannel,
      matchedItemAudience: matched.suggestedAudience,
      similarityScore: topIdeaScore
    };
  }

  return {
    classification: 'New Ground',
    confidence: 'High',
    rationale: 'No closely matching items found in Idea Library or Content Library.'
  };
}

/**
 * Builds an Evidence Profile for an ideation opportunity based on attached task sources
 * and Source Intelligence analyses, strictly respecting task-level source roles.
 */
export function buildIdeationEvidenceProfile(params: {
  rawInput: string;
  communicationJob: string;
  sourceBindings: TaskSourceBinding[];
  derivedSourceAnalyses?: Record<string, SourceIntelligenceAnalysis>;
  aiAvailableEvidence?: string[];
  aiEvidenceStillRequired?: string[];
  aiUnresolvedAssumptions?: string[];
}): {
  availableEvidence: string[];
  evidenceStillRequired: string[];
  unresolvedAssumptions: string[];
} {
  const availableEvidence: string[] = [];
  const evidenceStillRequired: string[] = [];
  const unresolvedAssumptions: string[] = [];

  const bindings = params.sourceBindings || [];
  const analyses = params.derivedSourceAnalyses || {};

  // 1. Extract legitimate source-grounded evidence (excluding Approved Example & Visual Reference)
  for (const b of bindings) {
    if (b.role === 'Approved Example' || b.role === 'Visual Reference') {
      continue;
    }

    const analysis = analyses[b.sourceId];
    if (analysis) {
      for (const fact of analysis.keyFacts.slice(0, 3)) {
        availableEvidence.push(`[${b.title} - ${b.role}] ${fact}`);
      }
      for (const claim of analysis.supportedClaims.slice(0, 2)) {
        if (availableEvidence.length < 5) {
          availableEvidence.push(`[${b.title} - Supported] ${claim}`);
        }
      }
      for (const caution of analysis.cautionsAndAmbiguities.slice(0, 2)) {
        evidenceStillRequired.push(`Advisory (${b.title}): ${caution}`);
      }
    } else if (b.content && b.content.trim().length > 0) {
      const firstSentence = b.content
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .find(s => s.length >= 20 && s.length <= 220);
      if (firstSentence) {
        availableEvidence.push(`[${b.title} - ${b.role}] ${firstSentence}`);
      }
    }
  }

  // Merge AI-supplied evidence items only if they don't violate Approved Example / Visual Reference rules
  const factualSourceCount = bindings.filter(
    b => b.role !== 'Approved Example' && b.role !== 'Visual Reference'
  ).length;

  if (factualSourceCount > 0 && Array.isArray(params.aiAvailableEvidence)) {
    for (const item of params.aiAvailableEvidence) {
      if (item && typeof item === 'string' && availableEvidence.length < 6) {
        const clean = item.replace(/\u2014/g, ' - ').trim();
        if (!availableEvidence.includes(clean)) {
          availableEvidence.push(clean);
        }
      }
    }
  }

  if (availableEvidence.length === 0) {
    if (bindings.length === 0) {
      availableEvidence.push(
        'Protected COH Kernel & Operating Core positioning only (no task-specific factual source attached).'
      );
    } else {
      availableEvidence.push(
        'Attached sources are restricted to style/visual reference roles; factual claims must rely only on Protected COH Kernel positioning.'
      );
    }
  }

  // 2. Advisory Evidence Still Required (never placeholder-heavy blocker text)
  if (Array.isArray(params.aiEvidenceStillRequired)) {
    for (const req of params.aiEvidenceStillRequired) {
      if (req && typeof req === 'string' && evidenceStillRequired.length < 4) {
        const sanitized = req
          .replace(/\[INSERT[^\]]*\]/gi, 'specific confirmed detail')
          .replace(/\[TBD[^\]]*\]/gi, 'confirmed detail')
          .replace(/\u2014/g, ' - ')
          .trim();
        if (sanitized && !evidenceStillRequired.includes(sanitized)) {
          evidenceStillRequired.push(sanitized);
        }
      }
    }
  }

  if (evidenceStillRequired.length === 0) {
    if (params.communicationJob === 'Establish institutional credibility' || params.communicationJob === 'Create sponsor relevance') {
      evidenceStillRequired.push(
        'Advisory: If citing specific partner commitments, venue dates, or funding milestones in the final draft, attach a verified Milestone or Partner source first.'
      );
    } else if (params.communicationJob === 'Build climate literacy') {
      evidenceStillRequired.push(
        'Advisory: Keep scientific framing conceptual unless a specific research note or verified dataset is attached.'
      );
    } else {
      evidenceStillRequired.push(
        'Advisory: Keep claims anchored to COH artistic worldbuilding unless concrete production milestones are attached.'
      );
    }
  }

  // 3. Unresolved Assumptions
  if (Array.isArray(params.aiUnresolvedAssumptions) && params.aiUnresolvedAssumptions.length > 0) {
    for (const assump of params.aiUnresolvedAssumptions.slice(0, 3)) {
      if (assump && typeof assump === 'string') {
        unresolvedAssumptions.push(assump.replace(/\u2014/g, ' - ').trim());
      }
    }
  } else {
    if (bindings.length === 0) {
      unresolvedAssumptions.push(
        'Assumes this piece will focus on strategic or artistic framing rather than announcing a dated production milestone.'
      );
    } else {
      unresolvedAssumptions.push(
        'Assumes the attached source material reflects the latest approved framing for external communication.'
      );
    }
  }

  return {
    availableEvidence,
    evidenceStillRequired,
    unresolvedAssumptions
  };
}

/**
 * Evaluates and enforces strategic diversity across a set of generated opportunities
 * so the user never receives 5 cosmetic variations of the same angle.
 */
export function evaluateOpportunityDiversity(proposals: IdeationOpportunityProposal[]): {
  isDiverse: boolean;
  uniqueCommunicationJobs: number;
  uniqueStrategicAngles: number;
  uniqueNarrativePerspectives: number;
  diversityScore: number;
  warnings: string[];
} {
  if (proposals.length <= 1) {
    return {
      isDiverse: true,
      uniqueCommunicationJobs: proposals.length,
      uniqueStrategicAngles: proposals.length,
      uniqueNarrativePerspectives: proposals.length,
      diversityScore: 1,
      warnings: []
    };
  }

  const jobs = new Set(proposals.map(p => (p.communicationJob || '').toLowerCase().trim()).filter(Boolean));
  const angles = new Set(proposals.map(p => (p.strategicAngle || '').toLowerCase().trim()).filter(Boolean));
  const perspectives = new Set(
    proposals.map(p => (p.narrativePerspective || p.category || '').toLowerCase().trim()).filter(Boolean)
  );

  const jobRatio = jobs.size / proposals.length;
  const angleRatio = angles.size / proposals.length;
  const perspectiveRatio = perspectives.size / proposals.length;
  const diversityScore = Number(((jobRatio * 0.4) + (angleRatio * 0.35) + (perspectiveRatio * 0.25)).toFixed(2));

  const warnings: string[] = [];
  if (jobs.size < Math.min(3, proposals.length)) {
    warnings.push('Multiple opportunities shared the same communication job; diversified across COH strategic jobs.');
  }
  if (angles.size < Math.min(3, proposals.length)) {
    warnings.push('Multiple opportunities shared similar strategic framing; diversified across COH pillars.');
  }

  return {
    isDiverse: diversityScore >= 0.55 && jobs.size >= Math.min(3, proposals.length),
    uniqueCommunicationJobs: jobs.size,
    uniqueStrategicAngles: angles.size,
    uniqueNarrativePerspectives: perspectives.size,
    diversityScore,
    warnings
  };
}

/**
 * Ensures each opportunity in a batch has a distinct communication job, strategic angle,
 * and valid COH audience without inventing non-COH segments.
 */
export function enforceOpportunityDiversity(
  proposals: IdeationOpportunityProposal[],
  defaultAudience: string = 'General Public',
  operatingCore?: OperatingCore | null
): IdeationOpportunityProposal[] {
  const usedJobs = new Set<string>();
  const strategicFrames = [
    'Origin Asset & Worldbuilding Multiplier',
    'Somatic Experience vs Abstract Data Distance',
    'Long-Horizon Cultural Infrastructure & Prestige',
    'Scientific Grounding & Planetary Thresholds',
    'Behind-the-Scenes Artistic Rigor & Craft',
    'Collective Cultural Ritual & Public Meaning',
    'Milestone Clarity & Institutional Momentum'
  ];

  const fallbackAudience =
    normalizeOperatingCoreAudience(defaultAudience, operatingCore, { preserveExplicitGeneralPublic: true }) ||
    defaultAudience;

  return proposals.map((proposal, idx) => {
    let job = proposal.communicationJob?.trim() || COH_COMMUNICATION_JOBS[idx % COH_COMMUNICATION_JOBS.length];
    if (usedJobs.has(job.toLowerCase()) && idx < COH_COMMUNICATION_JOBS.length) {
      const replacement = COH_COMMUNICATION_JOBS.find(j => !usedJobs.has(j.toLowerCase()));
      if (replacement) job = replacement;
    }
    usedJobs.add(job.toLowerCase());

    // Ensure audience is resolved from active Operating Core (no non-COH segment leakage)
    const rawAud = (proposal.suggestedAudience || defaultAudience).trim();
    const normalizedAudience = normalizeOperatingCoreAudience(rawAud, operatingCore, {
      preserveExplicitGeneralPublic: true
    });
    const safeAudience = normalizedAudience || fallbackAudience;

    const strategicAngle =
      proposal.strategicAngle?.trim() || strategicFrames[idx % strategicFrames.length];
    const suggestedPillar = normalizeCohPillar(
      proposal.suggestedPillar,
      CANONICAL_COH_PILLARS[idx % CANONICAL_COH_PILLARS.length]
    );

    return {
      ...proposal,
      communicationJob: job.replace(/\u2014/g, ' - '),
      suggestedAudience: safeAudience,
      strategicAngle: strategicAngle.replace(/\u2014/g, ' - '),
      suggestedPillar
    };
  });
}

/**
 * Builds the complete handoff package when promoting an Idea to Content Workspace.
 * Carries forward communication job, audience, channel, format, pillar, selected sources/roles,
 * available evidence, advisory evidence required, strategic angle, and unresolved assumptions.
 */
export function buildIdeationToContentHandoff(params: {
  idea: IdeationOpportunityProposal;
  currentSelectedSourceIds: string[];
  currentTaskSourceRoleMap: Record<string, { role: SourceTaskRole; selectedExcerpts?: string[] }>;
}): {
  advancedBriefPatch: {
    topic: string;
    channel: string;
    audience: string;
    pillar: string;
    purpose: string;
    outputFormat: string;
    language: string;
    directionMode: 'custom';
    customDirection: string;
    mustInclude: string;
    mustAvoid: string;
    selectedSourceIds: string[];
  };
  workContext: WorkContext;
  restoredRoleMap: Record<string, { role: SourceTaskRole; selectedExcerpts: string[] }>;
} {
  const { idea, currentSelectedSourceIds, currentTaskSourceRoleMap } = params;

  const mergedSourceIds = Array.from(
    new Set([...(idea.sourceIds || []), ...(currentSelectedSourceIds || [])])
  );

  const restoredRoleMap: Record<string, { role: SourceTaskRole; selectedExcerpts: string[] }> = {};
  for (const [k, v] of Object.entries(currentTaskSourceRoleMap)) {
    restoredRoleMap[k] = {
      role: v.role,
      selectedExcerpts: v.selectedExcerpts || []
    };
  }
  if (idea.sourceRoles) {
    for (const [srcId, role] of Object.entries(idea.sourceRoles)) {
      restoredRoleMap[srcId] = {
        role,
        selectedExcerpts: currentTaskSourceRoleMap[srcId]?.selectedExcerpts || []
      };
    }
  }

  const directionLines: string[] = [
    `Core Concept: ${idea.explanation}`,
    `Communication Job: ${idea.communicationJob || 'Establish institutional credibility'}`,
    `Strategic Angle: ${idea.strategicAngle || idea.category}`,
    `Why It Matters: ${idea.whyItWorks}`
  ];
  if (idea.coreTension) {
    directionLines.push(`Core Tension / Audience Problem: ${idea.coreTension}`);
  }
  if (idea.desiredAudienceResponse) {
    directionLines.push(`Desired Audience Response: ${idea.desiredAudienceResponse}`);
  }
  if (idea.possibleHook) {
    directionLines.push(`Suggested Opening Hook: "${idea.possibleHook}"`);
  }
  if (idea.evidenceStillRequired && idea.evidenceStillRequired.length > 0) {
    directionLines.push(`Evidence Advisory: ${idea.evidenceStillRequired.join(' | ')}`);
  }
  if (idea.unresolvedAssumptions && idea.unresolvedAssumptions.length > 0) {
    directionLines.push(`Unresolved Assumptions to Verify: ${idea.unresolvedAssumptions.join(' | ')}`);
  }

  const mustIncludeLines =
    idea.availableEvidence && idea.availableEvidence.length > 0
      ? idea.availableEvidence.slice(0, 3).join('\n')
      : '';

  const canonicalPillar = normalizeCohPillar(idea.suggestedPillar, 'Climate Tetralogy & Canon');

  const workContext: WorkContext = {
    origin: 'Ideation Workspace',
    originId: idea.id,
    originTitle: idea.title,
    communicationJob: idea.communicationJob || 'Establish institutional credibility',
    audience: idea.suggestedAudience || 'General Public',
    channel: idea.suggestedChannel || 'LinkedIn',
    format: idea.suggestedFormat || 'Post',
    pillar: canonicalPillar,
    language: idea.language || 'English',
    strategicAngle: idea.strategicAngle || idea.category,
    evidenceNotes: [
      ...(idea.availableEvidence || []).map(e => `Available: ${e}`),
      ...(idea.evidenceStillRequired || [])
    ].join('\n'),
    unresolvedAssumptions: idea.unresolvedAssumptions || [],
    sourceBindings: mergedSourceIds.map(id => ({
      sourceId: id,
      title: id,
      type: 'Source',
      role: restoredRoleMap[id]?.role || 'Evidence',
      selectedExcerpts: restoredRoleMap[id]?.selectedExcerpts || []
    })),
    transformationHistory: [
      {
        step: 'Promoted from Ideation 2.0 Opportunity',
        studio: 'Ideation Workspace',
        timestamp: new Date().toISOString()
      }
    ]
  };

  return {
    advancedBriefPatch: {
      topic: idea.title,
      channel: idea.suggestedChannel || 'LinkedIn',
      audience: idea.suggestedAudience || 'General Public',
      pillar: canonicalPillar,
      purpose: idea.communicationJob || 'Establish institutional credibility',
      outputFormat: idea.suggestedFormat || 'Post',
      language: idea.language || 'English',
      directionMode: 'custom',
      customDirection: directionLines.join('\n\n'),
      mustInclude: mustIncludeLines,
      mustAvoid: idea.riskToAvoid || '',
      selectedSourceIds: mergedSourceIds
    },
    workContext,
    restoredRoleMap
  };
}

/**
 * Enriches raw or fallback ideation proposals with full Ideation 2.0 fields:
 * - Communication Job
 * - Core Tension & Desired Audience Response
 * - Evidence Awareness (Available vs Advisory Required)
 * - Reuse Awareness against Idea Library & Content Library
 * - Strategic Diversity Enforcement
 * - Attached Source Traceability
 */
export function enrichAndDiversifyOpportunities(params: {
  rawProposals: Array<Partial<IdeationOpportunityProposal>>;
  rawInput: string;
  defaultAudience: string;
  defaultChannel: string;
  defaultLanguage: string;
  sourceBindings: TaskSourceBinding[];
  derivedSourceAnalyses?: Record<string, SourceIntelligenceAnalysis>;
  savedIdeas: LibraryIdeaCandidate[];
  savedContents: LibraryContentCandidate[];
  operatingCore?: OperatingCore | null;
}): IdeationOpportunityProposal[] {
  const {
    rawProposals,
    rawInput,
    defaultAudience,
    defaultChannel,
    defaultLanguage,
    sourceBindings,
    derivedSourceAnalyses,
    savedIdeas,
    savedContents,
    operatingCore
  } = params;

  const sourceIds = sourceBindings.map(b => b.sourceId);
  const sourceRoles: Record<string, SourceTaskRole> = {};
  for (const b of sourceBindings) {
    sourceRoles[b.sourceId] = b.role || 'Evidence';
  }

  const defaultTensions = [
    'Audiences are saturated with abstract climate statistics that fail to create emotional or institutional commitment.',
    'Cultural decision-makers often view climate programming as short-term activism rather than enduring artistic repertoire.',
    'Prospective partners need clear strategic and prestige value before committing to a multi-horizon cultural venture.',
    'Public audiences often feel excluded by traditional opera conventions or overwhelmed by technical climate discourse.'
  ];

  const defaultResponses = [
    'Recognize Climate Opera Haus as a credible, high-prestige cultural venture built around enduring operatic IP.',
    'Understand how live operatic worldbuilding bridges scientific reality and somatic human resonance.',
    'See a clear pathway for institutional partnership, sponsorship alignment, or cultural programming.',
    'Feel invited into an accessible, emotionally resonant cultural experience rather than a lecture.'
  ];

  const enriched: IdeationOpportunityProposal[] = rawProposals.map((item, idx) => {
    const job =
      item.communicationJob ||
      COH_COMMUNICATION_JOBS[idx % COH_COMMUNICATION_JOBS.length];

    const evidenceProfile = buildIdeationEvidenceProfile({
      rawInput,
      communicationJob: job,
      sourceBindings,
      derivedSourceAnalyses,
      aiAvailableEvidence: item.availableEvidence,
      aiEvidenceStillRequired: item.evidenceStillRequired,
      aiUnresolvedAssumptions: item.unresolvedAssumptions
    });

    const title = (item.title || `Opportunity ${idx + 1}: ${rawInput}`).replace(/\u2014/g, ' - ');
    const explanation = (item.explanation || '').replace(/\u2014/g, ' - ');
    const suggestedAudience = item.suggestedAudience || defaultAudience;
    const suggestedChannel = item.suggestedChannel || defaultChannel || 'LinkedIn';
    const suggestedPillar = normalizeCohPillar(
      item.suggestedPillar,
      CANONICAL_COH_PILLARS[idx % CANONICAL_COH_PILLARS.length]
    );

    const reuseOpportunity =
      item.reuseOpportunity && item.reuseOpportunity.classification
        ? item.reuseOpportunity
        : classifyReuseOpportunity({
            candidateTitle: title,
            candidateConcept: explanation,
            candidateAudience: suggestedAudience,
            candidateChannel: suggestedChannel,
            candidatePillar: suggestedPillar,
            savedIdeas,
            savedContents
          });

    return {
      id: item.id || `idea-opp-${idx}-${Date.now()}`,
      title,
      originalInput: item.originalInput || rawInput,
      category: (item.category || 'Strategic Opportunities').replace(/\u2014/g, ' - '),
      explanation,
      communicationJob: job,
      whyItWorks: (item.whyItWorks || 'Aligns COH operatic worldbuilding with audience relevance.').replace(/\u2014/g, ' - '),
      coreTension: (item.coreTension || defaultTensions[idx % defaultTensions.length]).replace(/\u2014/g, ' - '),
      desiredAudienceResponse: (
        item.desiredAudienceResponse || defaultResponses[idx % defaultResponses.length]
      ).replace(/\u2014/g, ' - '),
      availableEvidence: evidenceProfile.availableEvidence,
      evidenceStillRequired: evidenceProfile.evidenceStillRequired,
      suggestedAudience,
      suggestedChannel,
      suggestedFormat: item.suggestedFormat || 'Post',
      suggestedPillar,
      suggestedTone: item.suggestedTone || 'Measured / Credible',
      strategicAngle: (item.strategicAngle || item.category || 'Origin Asset & Worldbuilding').replace(/\u2014/g, ' - '),
      narrativePerspective: item.narrativePerspective || item.category || 'Institutional & Artistic Lens',
      evidenceEmphasis:
        sourceBindings.length > 0 ? 'Source-backed factual & strategic grounding' : 'Protected COH Kernel positioning',
      reuseOpportunity,
      riskToAvoid: (
        item.riskToAvoid ||
        'Avoid generic activist slogans, unverified milestone claims, or preachy NGO rhetoric.'
      ).replace(/\u2014/g, ' - '),
      unresolvedAssumptions: evidenceProfile.unresolvedAssumptions,
      possibleHook: (item.possibleHook || '').replace(/\u2014/g, ' - '),
      possibleFirstPost: item.possibleFirstPost ? item.possibleFirstPost.replace(/\u2014/g, ' - ') : undefined,
      possibleNextStep: (
        item.possibleNextStep || 'Promote to Content Workspace with attached evidence and communication job.'
      ).replace(/\u2014/g, ' - '),
      language: item.language || defaultLanguage || 'English',
      dateCreated: item.dateCreated || new Date().toISOString().split('T')[0],
      status: item.status || 'New',
      sourceIds: sourceIds.length > 0 ? sourceIds : undefined,
      sourceRoles: sourceIds.length > 0 ? sourceRoles : undefined
    };
  });

  return enforceOpportunityDiversity(enriched, defaultAudience, operatingCore);
}

