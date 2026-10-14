import {
  PROTECTED_COH_KERNEL,
  normalizeOperatingCoreAudience,
  type OperatingCore,
  type AudienceProfile,
  type ChannelRule,
  type RevisionStandard
} from './operatingCore.ts';
import type { CoreDocument } from './coreDocumentsStorage.ts';
import {
  compileSourceGroundingContext,
  type SourceIntelligenceAnalysis
} from './sourceIntelligence.ts';

export type ContextProvenance = 'EXPLICIT' | 'INHERITED' | 'RESOLVED' | 'UNRESOLVED';

export interface ProvenancedValue<T = string> {
  value?: T;
  provenance: ContextProvenance;
  note?: string;
}

export type SourceTaskRole =
  | 'Evidence'
  | 'Strategic Context'
  | 'Approved Example'
  | 'Quote / Language Source'
  | 'Visual Reference'
  | 'Must-use Material';

export interface TaskSourceBinding {
  sourceId: string;
  title: string;
  type: string;
  role?: SourceTaskRole;
  selectedExcerpts?: string[];
  content?: string;
  summary?: string;
  usageNotes?: string;
}

export interface TransformationMetadata {
  actionId?: string;
  actionLabel?: string;
  transformationIntent?: string;
  previousStage?: string;
}

export interface WorkContext {
  origin?: string;
  originId?: string;
  originTitle?: string;
  originatingItemId?: string;
  originatingItemType?: 'idea' | 'calendar' | 'content' | 'source' | 'visual' | 'revision' | 'reframe' | 'manual';
  audience?: string;
  channel?: string;
  format?: string;
  pillar?: string;
  language?: string;
  communicationJob?: string;
  strategicAngle?: string;
  evidenceNotes?: string;
  unresolvedAssumptions?: string[];
  sourceBindings?: TaskSourceBinding[];
  evidenceRequirements?: string[];
  transformationMetadata?: TransformationMetadata;
  transformationHistory?: Array<{
    step: string;
    studio: string;
    timestamp: string;
  }>;
}

export type StudioWorkflow =
  | 'Simple Mode'
  | 'Quick Create'
  | 'Advanced Brief'
  | 'Content Workspace'
  | 'Revision Studio'
  | 'Reframing Studio'
  | 'Ideation Workspace'
  | 'Visual Studio'
  | 'Editorial Calendar'
  | 'Source Intelligence';

export interface ContextCompilerInput {
  workflow: StudioWorkflow;
  operatingCore: OperatingCore | null;
  coreDocuments?: CoreDocument[];
  action?: string;
  audience?: string;
  customAudience?: string;
  channel?: string;
  format?: string;
  pillar?: string;
  language?: string;
  communicationJob?: string;
  sourceBindings?: TaskSourceBinding[];
  derivedSourceAnalyses?: Record<string, SourceIntelligenceAnalysis>;
  maxTotalSourceChars?: number;
  userInstruction?: string;
  inheritedWorkContext?: Partial<WorkContext> | null;
  transformationIntent?: string;
  explicitFields?: Partial<Record<'audience' | 'channel' | 'format' | 'pillar' | 'language' | 'communicationJob', boolean>>;
}

export interface ContextManifestSourceItem {
  id: string;
  title: string;
  type: string;
  role: SourceTaskRole;
  excerptCount: number;
}

export interface ContextManifest {
  workflow: StudioWorkflow;
  activeCohKernel: boolean;
  operatingCoreActive: boolean;
  operatingCoreVersion: string;
  audience: ProvenancedValue<string>;
  channel: ProvenancedValue<string>;
  format: ProvenancedValue<string>;
  pillar: ProvenancedValue<string>;
  language: ProvenancedValue<string>;
  communicationJob: ProvenancedValue<string>;
  sourcesSelected: ContextManifestSourceItem[];
  evidenceSources: string[];
  styleReferenceSources: string[];
  explicitInputs: string[];
  inheritedInputs: string[];
  resolvedInputs: string[];
  unresolvedInputs: string[];
  applicableClaimsRestrictions: string[];
  activeGuidanceSummary: string[];
  authorityHierarchy: string[];
  conflictWarnings: string[];
}

export interface CompiledContextPackage {
  compiledInstructions: string;
  manifest: ContextManifest;
  sections: {
    protectedKernel: string;
    operatingCoreRules: string;
    sourceEvidenceContext: string;
    inheritedWorkContext: string;
    explicitTaskInstruction: string;
  };
}

const AUTHORITY_HIERARCHY = [
  '1. Protected COH Kernel (Immutable highest authority)',
  '2. Applicable active Operating Core rules',
  '3. Applicable source and evidence context',
  '4. Inherited Work Context',
  '5. Explicit user or task instruction (cannot override Protected Kernel or claim safety)'
];

const UNSPECIFIED_SENTINELS = new Set([
  '',
  'none',
  'unspecified',
  'not specified',
  'select',
  'auto'
]);

function isMeaningfulValue(val?: string | null): val is string {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  return !UNSPECIFIED_SENTINELS.has(trimmed.toLowerCase());
}

/**
 * Resolves a single context field with strict provenance:
 * - EXPLICIT: Directly provided by user for this task and marked explicit (or distinct from inherited/default).
 * - INHERITED: Carried over from inheritedWorkContext when not explicitly overridden.
 * - RESOLVED: Matched/inferred from Operating Core or workflow rules when a valid domain value is supplied.
 * - UNRESOLVED: Unknown or missing; never falsely marked resolved.
 */
export function resolveFieldProvenance(
  fieldName: 'audience' | 'channel' | 'format' | 'pillar' | 'language' | 'communicationJob',
  directValue: string | undefined,
  inheritedContext: Partial<WorkContext> | null | undefined,
  explicitFlags: Partial<Record<string, boolean>> | undefined,
  operatingCore: OperatingCore | null
): ProvenancedValue<string> {
  const inheritedVal = inheritedContext?.[fieldName];
  const hasExplicitFlag = explicitFlags?.[fieldName];

  if (isMeaningfulValue(directValue)) {
    const trimmed = directValue.trim();

    if (hasExplicitFlag === true) {
      return { value: trimmed, provenance: 'EXPLICIT' };
    }

    if (isMeaningfulValue(inheritedVal) && inheritedVal.trim().toLowerCase() === trimmed.toLowerCase()) {
      return {
        value: trimmed,
        provenance: 'INHERITED',
        note: inheritedContext?.origin ? `From ${inheritedContext.origin}` : 'From active work item'
      };
    }

    if (hasExplicitFlag === false) {
      // Check if it resolves against Operating Core definitions
      if (fieldName === 'audience' && operatingCore?.audiences?.some(a => a.name.toLowerCase() === trimmed.toLowerCase())) {
        return { value: trimmed, provenance: 'RESOLVED', note: 'Operating Core audience profile' };
      }
      if (fieldName === 'channel' && operatingCore?.channels?.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
        return { value: trimmed, provenance: 'RESOLVED', note: 'Operating Core channel rule' };
      }
      return { value: trimmed, provenance: 'RESOLVED', note: 'Workflow default' };
    }

    return { value: trimmed, provenance: 'EXPLICIT' };
  }

  if (isMeaningfulValue(inheritedVal)) {
    return {
      value: inheritedVal.trim(),
      provenance: 'INHERITED',
      note: inheritedContext?.origin ? `From ${inheritedContext.origin}` : 'From active work item'
    };
  }

  return { value: undefined, provenance: 'UNRESOLVED' };
}

/**
 * Extracts a backward-compatible WorkContext from an existing WorkItem or partial state.
 */
export function extractWorkContextFromWorkItem(workItem: Record<string, any> | null | undefined): Partial<WorkContext> | null {
  if (!workItem || typeof workItem !== 'object') return null;

  const existingWorkContext = workItem.workContext as Partial<WorkContext> | undefined;

  return {
    origin: existingWorkContext?.origin || workItem.originModule || workItem.origin || undefined,
    originatingItemId:
      existingWorkContext?.originatingItemId ||
      workItem.linkedIdeaId ||
      workItem.linkedCalendarItemId ||
      workItem.linkedSavedContentId ||
      workItem.id ||
      undefined,
    originatingItemType:
      existingWorkContext?.originatingItemType ||
      (workItem.originModule === 'ideation'
        ? 'idea'
        : workItem.originModule === 'calendar'
          ? 'calendar'
          : workItem.originModule === 'content'
            ? 'content'
            : workItem.originModule === 'visual'
              ? 'visual'
              : workItem.originModule === 'revision'
                ? 'revision'
                : undefined),
    audience: isMeaningfulValue(existingWorkContext?.audience || workItem.audience)
      ? (existingWorkContext?.audience || workItem.audience)
      : undefined,
    channel: isMeaningfulValue(existingWorkContext?.channel || workItem.channel)
      ? (existingWorkContext?.channel || workItem.channel)
      : undefined,
    format: isMeaningfulValue(existingWorkContext?.format || workItem.format)
      ? (existingWorkContext?.format || workItem.format)
      : undefined,
    pillar: isMeaningfulValue(existingWorkContext?.pillar || workItem.pillar)
      ? (existingWorkContext?.pillar || workItem.pillar)
      : undefined,
    language: isMeaningfulValue(existingWorkContext?.language || workItem.language)
      ? (existingWorkContext?.language || workItem.language)
      : undefined,
    communicationJob: isMeaningfulValue(existingWorkContext?.communicationJob || workItem.objective || workItem.purpose)
      ? (existingWorkContext?.communicationJob || workItem.objective || workItem.purpose)
      : undefined,
    sourceBindings: Array.isArray(existingWorkContext?.sourceBindings)
      ? existingWorkContext.sourceBindings
      : undefined,
    evidenceRequirements: Array.isArray(existingWorkContext?.evidenceRequirements)
      ? existingWorkContext.evidenceRequirements
      : undefined,
    transformationMetadata: existingWorkContext?.transformationMetadata
  };
}

/**
 * Infers a default task role for a source when no explicit task role has been assigned yet.
 */
export function inferDefaultSourceRole(sourceType?: string): SourceTaskRole {
  const normalized = (sourceType || '').toLowerCase();
  if (normalized.includes('approved example')) return 'Approved Example';
  if (normalized.includes('visual reference')) return 'Visual Reference';
  if (normalized.includes('strategy') || normalized.includes('campaign') || normalized.includes('partner') || normalized.includes('sponsor')) {
    return 'Strategic Context';
  }
  return 'Evidence';
}

/**
 * Detects potential attempts in user instructions to override Protected COH Kernel rules
 * (such as inventing sponsors/numbers or using forbidden hype/activism).
 */
function detectKernelConflictWarnings(userInstruction?: string): string[] {
  if (!userInstruction || !userInstruction.trim()) return [];
  const warnings: string[] = [];
  const lower = userInstruction.toLowerCase();

  if (
    lower.includes('ignore protected') ||
    lower.includes('ignore kernel') ||
    lower.includes('ignore claim rules') ||
    lower.includes('bypass operating core')
  ) {
    warnings.push('User instruction requested bypassing governance rules. Protected COH Kernel remains enforced.');
  }

  if (
    lower.includes('invent a sponsor') ||
    lower.includes('make up numbers') ||
    lower.includes('fabricate') ||
    lower.includes('pretend we already signed')
  ) {
    warnings.push('User instruction conflicts with COH Claim Safety. Unverified sponsors, dates, and commitments cannot be stated as fact.');
  }

  return warnings;
}

function matchAudienceProfile(core: OperatingCore, audienceName?: string): AudienceProfile | undefined {
  if (!audienceName) return undefined;
  const normalizedName = normalizeOperatingCoreAudience(audienceName, core);
  if (normalizedName) {
    const matched = core.audiences.find(a => a.name.toLowerCase() === normalizedName.toLowerCase());
    if (matched) return matched;
  }
  const target = audienceName.trim().toLowerCase();
  const direct = core.audiences.find(
    a => a.name.toLowerCase() === target || target.includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(target)
  );
  if (direct) return direct;

  // Resolve UI dropdown labels to Operating Core audience profiles
  if (target.includes('sponsor') || target.includes('brand') || target.includes('patron')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('sponsor'));
  }
  if (target.includes('institution') || target.includes('venue') || target.includes('museum')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('institution'));
  }
  if (target.includes('opera') || target.includes('festival')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('opera'));
  }
  if (target.includes('foundation') || target.includes('council') || target.includes('grant')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('foundation'));
  }
  if (target.includes('press') || target.includes('journalist')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('press'));
  }
  if (target.includes('media') || target.includes('documentary')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('media'));
  }
  if (target.includes('education') || target.includes('civic') || target.includes('youth')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('education'));
  }
  if (target.includes('climate') || target.includes('sustainability')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('climate'));
  }
  if (target.includes('general') || target.includes('public')) {
    return core.audiences.find(a => a.name.toLowerCase().includes('general'));
  }
  return undefined;
}

function matchChannelRule(core: OperatingCore, channelName?: string): ChannelRule | undefined {
  if (!channelName) return undefined;
  const target = channelName.trim().toLowerCase();
  const direct = core.channels.find(
    c => c.name.toLowerCase() === target || target.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(target)
  );
  if (direct) return direct;

  if (target.includes('press') || target.includes('media')) {
    return core.channels.find(c => c.name.toLowerCase().includes('press'));
  }
  if (target.includes('sponsor') || target.includes('deck') || target.includes('outreach')) {
    return core.channels.find(c => c.name.toLowerCase().includes('sponsor') || c.name.toLowerCase().includes('outreach'));
  }
  return undefined;
}

function matchRevisionStandard(core: OperatingCore, action?: string): RevisionStandard | undefined {
  if (!action) return undefined;
  const target = action.trim().toLowerCase();
  return core.revisionStandards.find(
    r => r.id.toLowerCase() === target || r.action.toLowerCase() === target || r.action.toLowerCase().includes(target)
  );
}

/**
 * Compiles the smallest sufficient governed context package for any COH studio workflow.
 * Strictly enforces the 5-level Authority Hierarchy:
 * 1. Protected COH Kernel
 * 2. Applicable active Operating Core rules
 * 3. Applicable source/evidence context
 * 4. Inherited Work Context
 * 5. Explicit user/task instruction
 */
export function compileGovernedContext(input: ContextCompilerInput): CompiledContextPackage {
  const core = input.operatingCore;
  const coreActive = Boolean(core && core.active);
  const inherited = input.inheritedWorkContext || null;

  // Resolve fields with provenance
  const audienceField = resolveFieldProvenance(
    'audience',
    input.customAudience ? `Custom: ${input.customAudience}` : input.audience,
    inherited,
    input.explicitFields,
    core
  );
  const channelField = resolveFieldProvenance('channel', input.channel, inherited, input.explicitFields, core);
  const formatField = resolveFieldProvenance('format', input.format, inherited, input.explicitFields, core);
  const pillarField = resolveFieldProvenance('pillar', input.pillar, inherited, input.explicitFields, core);
  const languageField = resolveFieldProvenance('language', input.language, inherited, input.explicitFields, core);
  const jobField = resolveFieldProvenance('communicationJob', input.communicationJob, inherited, input.explicitFields, core);

  const trackedFields: Array<{ label: string; field: ProvenancedValue<string> }> = [
    { label: 'Audience', field: audienceField },
    { label: 'Channel', field: channelField },
    { label: 'Format', field: formatField },
    { label: 'Pillar', field: pillarField },
    { label: 'Language', field: languageField },
    { label: 'Objective', field: jobField }
  ];

  const explicitInputs: string[] = [];
  const inheritedInputs: string[] = [];
  const resolvedInputs: string[] = [];
  const unresolvedInputs: string[] = [];

  for (const item of trackedFields) {
    if (item.field.provenance === 'EXPLICIT' && item.field.value) {
      explicitInputs.push(`${item.label}: ${item.field.value}`);
    } else if (item.field.provenance === 'INHERITED' && item.field.value) {
      inheritedInputs.push(`${item.label}: ${item.field.value}`);
    } else if (item.field.provenance === 'RESOLVED' && item.field.value) {
      resolvedInputs.push(`${item.label}: ${item.field.value}`);
    } else {
      unresolvedInputs.push(item.label);
    }
  }

  if (isMeaningfulValue(input.userInstruction)) {
    explicitInputs.push('Task Instruction');
  }
  if (isMeaningfulValue(input.transformationIntent) || isMeaningfulValue(input.action)) {
    explicitInputs.push(`Action: ${input.transformationIntent || input.action}`);
  }

  // 1. Protected COH Kernel (Always Level 1)
  const protectedKernelSection = PROTECTED_COH_KERNEL.trim();

  // 2. Applicable Active Operating Core Rules (Level 2 - selective, never indiscriminate JSON dump)
  const coreRuleParts: string[] = [];
  const activeGuidanceSummary: string[] = ['Protected COH Kernel (Enforced)'];
  const applicableClaimsRestrictions: string[] = [
    'Separate verified proof, strategic ambition, and future pathway.',
    'Do not invent sponsors, dates, metrics, or institutional commitments.'
  ];

  const isVisualWorkflow = input.workflow === 'Visual Studio';
  const isRevisionWorkflow = input.workflow === 'Revision Studio';
  const isIdeationWorkflow = input.workflow === 'Ideation Workspace';
  const isTextGenerationWorkflow = !isVisualWorkflow;

  if (coreActive && core) {
    activeGuidanceSummary.push(`Operating Core (${core.version || 'Active'})`);

    // Identity & Strategy Kernel (concise and relevant to text/ideation workflows)
    if (isTextGenerationWorkflow) {
      coreRuleParts.push(
        `CORE IDENTITY & STRATEGY KERNEL:\n` +
        `- Organization: ${core.corePassport.organizationName} (${core.corePassport.category})\n` +
        `- Definition: ${core.corePassport.oneLineDefinition}\n` +
        `- Distinction: ${core.corePassport.coreDistinction}\n` +
        `- Operating Logic: ${core.corePassport.operatingLogic}\n` +
        `- Current Phase: ${core.corePassport.currentStrategicPhase}\n` +
        `- Posture: ${core.corePassport.defaultCommunicationPosture}\n` +
        `- Never Collapse Into: ${core.corePassport.neverCollapseInto}`
      );

      if (!isRevisionWorkflow) {
        coreRuleParts.push(
          `STRATEGIC POSITIONING:\n` +
          `- Positioning: ${core.strategyKernel.positioning}\n` +
          `- Value Proposition: ${core.strategyKernel.valueProposition}\n` +
          `- Proof Ladder: ${core.strategyKernel.proofLadder}`
        );
      }
    }

    // Audience guidance (only the matched audience profile)
    const matchedAudience = matchAudienceProfile(core, audienceField.value);
    if (matchedAudience) {
      activeGuidanceSummary.push(`Audience Profile: ${matchedAudience.name}`);
      coreRuleParts.push(
        `APPLICABLE AUDIENCE GUIDANCE (${matchedAudience.name}):\n` +
        `- Cares About: ${matchedAudience.caresAbout}\n` +
        `- Proof Needed: ${matchedAudience.proofNeeded}\n` +
        `- Preferred Tone: ${matchedAudience.preferredTone}\n` +
        `- Level of Detail: ${matchedAudience.levelOfDetail}\n` +
        `- Recommended CTA: ${matchedAudience.cta}\n` +
        `- Avoid: ${matchedAudience.avoid}`
      );
      if (audienceField.provenance === 'EXPLICIT' || audienceField.provenance === 'INHERITED') {
        resolvedInputs.push(`Audience Profile (${matchedAudience.name})`);
      }
    }

    // Channel guidance (only the matched channel rule)
    const matchedChannel = matchChannelRule(core, channelField.value);
    if (matchedChannel) {
      activeGuidanceSummary.push(`Channel Rule: ${matchedChannel.name}`);
      coreRuleParts.push(
        `APPLICABLE CHANNEL GUIDANCE (${matchedChannel.name}):\n` +
        `- Purpose: ${matchedChannel.purpose}\n` +
        `- Structure: ${matchedChannel.typicalStructure}\n` +
        `- Length Guidance: ${matchedChannel.lengthGuidance}\n` +
        `- Tone Guidance: ${matchedChannel.toneGuidance}\n` +
        `- Formatting Rules: ${matchedChannel.formattingRules}\n` +
        `- Avoid: ${matchedChannel.avoid}`
      );
      if (channelField.provenance === 'EXPLICIT' || channelField.provenance === 'INHERITED') {
        resolvedInputs.push(`Channel Rule (${matchedChannel.name})`);
      }
    }

    // Claims & Proof Boundaries
    if (isTextGenerationWorkflow) {
      const approved = core.claimsProofBoundaries.claims.filter(c => c.type === 'Approved').map(c => `- ${c.text}`);
      const requiresProof = core.claimsProofBoundaries.claims.filter(c => c.type === 'Requires proof').map(c => `- ${c.text}`);
      const forbidden = core.claimsProofBoundaries.claims.filter(c => c.type === 'Forbidden').map(c => `- ${c.text}`);

      if (core.claimsProofBoundaries.overstatementWarnings) {
        applicableClaimsRestrictions.push(core.claimsProofBoundaries.overstatementWarnings);
      }
      forbidden.forEach(f => applicableClaimsRestrictions.push(`Forbidden: ${f.replace(/^-\s*/, '')}`));

      const claimLines: string[] = [
        `CLAIMS & PROOF BOUNDARIES:`,
        `- Overstatement Warning: ${core.claimsProofBoundaries.overstatementWarnings}`,
        `- Claim Style Rules: ${core.claimsProofBoundaries.claimStyleRules}`
      ];
      if (approved.length > 0) claimLines.push(`APPROVED CLAIMS:\n${approved.join('\n')}`);
      if (requiresProof.length > 0) claimLines.push(`REQUIRES SUPPORTING PROOF:\n${requiresProof.join('\n')}`);
      if (forbidden.length > 0) claimLines.push(`FORBIDDEN CLAIMS (NEVER STATE):\n${forbidden.join('\n')}`);

      coreRuleParts.push(claimLines.join('\n'));
      activeGuidanceSummary.push('Claims & Proof Boundaries');
    }

    // Voice & Language rules
    if (isTextGenerationWorkflow && !isIdeationWorkflow) {
      const voiceLines: string[] = [
        `VOICE & LANGUAGE RULES:`,
        `- Overall Tone: ${core.voiceAndLanguage.overallTone}`,
        `- Writing Style: ${core.voiceAndLanguage.writingStyle}`,
        `- Clean Writing Rules: ${core.voiceAndLanguage.cleanWritingRules}`
      ];
      if (core.voiceAndLanguage.avoidPhrases.length > 0) {
        voiceLines.push(`- Avoid Phrases: ${core.voiceAndLanguage.avoidPhrases.join(', ')}`);
      }
      if (core.voiceAndLanguage.aiPhrasesToAvoid.length > 0) {
        voiceLines.push(`- Avoid AI Clichés: ${core.voiceAndLanguage.aiPhrasesToAvoid.join(', ')}`);
      }
      coreRuleParts.push(voiceLines.join('\n'));
      activeGuidanceSummary.push('Voice & Language Rules');
    }

    // Revision Standards (only when revising)
    if (isRevisionWorkflow) {
      const matchedRev = matchRevisionStandard(core, input.action);
      if (matchedRev) {
        coreRuleParts.push(
          `APPLICABLE REVISION STANDARD (${matchedRev.action}):\n` +
          `- Objective: ${matchedRev.does}\n` +
          `- Must Avoid: ${matchedRev.avoids}`
        );
        activeGuidanceSummary.push(`Revision Standard: ${matchedRev.action}`);
        resolvedInputs.push(`Revision Standard (${matchedRev.action})`);
      } else {
        coreRuleParts.push(
          `REVISION GOVERNANCE:\n` +
          `- Preserve verified facts, proper nouns, and institutional posture while improving clarity and precision.`
        );
        activeGuidanceSummary.push('General Revision Governance');
      }
    }

    // Visual DNA (only for Visual Studio)
    if (isVisualWorkflow) {
      coreRuleParts.push(
        `VISUAL DNA:\n` +
        `- Atmosphere: ${core.visualDNA.visualAtmosphere}\n` +
        `- Mood: ${core.visualDNA.mood}\n` +
        `- Composition: ${core.visualDNA.compositionPrinciples}\n` +
        `- Photography & Material: ${core.visualDNA.photographyStyle} | ${core.visualDNA.colorMaterialDirection}\n` +
        `- Prompt Rules: ${core.visualDNA.imagePromptRules}\n` +
        `- Clichés to Avoid (CRITICAL): ${core.visualDNA.visualClichesToAvoid}`
      );
      activeGuidanceSummary.push('COH Visual DNA');
    }

    // Applicable Core Documents (filtered by active workflow flags)
    if (Array.isArray(input.coreDocuments) && input.coreDocuments.length > 0) {
      const applicableDocs = input.coreDocuments.filter(doc => {
        if (!doc.appliedToOperatingCore && doc.status !== 'Active') return false;
        if (isVisualWorkflow) return Boolean(doc.extractedVisualGuidance || doc.brainArea?.toLowerCase().includes('visual'));
        if (isRevisionWorkflow) return Boolean(doc.extractedRevisionGuidance || doc.brainArea?.toLowerCase().includes('revision') || doc.appliedToOperatingCore);
        return true;
      });
      if (applicableDocs.length > 0) {
        const docSummaries = applicableDocs
          .slice(0, 4)
          .map(d => `- ${d.title} (${d.documentType || d.brainArea || 'Core Doc'}): ${(d.extractedText || d.shortContext || d.rawText || '').slice(0, 600)}`)
          .join('\n');
        coreRuleParts.push(`CORE REFERENCE DOCUMENTS:\n${docSummaries}`);
        activeGuidanceSummary.push(`${applicableDocs.length} Core Document(s)`);
      }
    }
  }

  const operatingCoreSection = coreRuleParts.join('\n\n');

  // 3. Applicable Source & Evidence Context (Level 3 - Role-governed & Bounded)
  const rawBindings = input.sourceBindings && input.sourceBindings.length > 0
    ? input.sourceBindings
    : inherited?.sourceBindings || [];

  const compiledSourceGrounding = compileSourceGroundingContext(rawBindings, input.workflow, {
    derivedAnalyses: input.derivedSourceAnalyses,
    maxTotalChars: input.maxTotalSourceChars
  });

  const manifestSources = compiledSourceGrounding.manifestSources;
  const evidenceSources = compiledSourceGrounding.evidenceSources;
  const styleReferenceSources = compiledSourceGrounding.styleReferenceSources;
  const sourceEvidenceSection = compiledSourceGrounding.formattedSection;

  // 4. Inherited Work Context (Level 4)
  const inheritedParts: string[] = [];
  if (inherited?.origin) {
    inheritedParts.push(`- Origin Studio: ${inherited.origin}`);
  }
  if (inherited?.communicationJob && jobField.provenance === 'INHERITED') {
    inheritedParts.push(`- Inherited Objective: ${inherited.communicationJob}`);
  }
  if (inherited?.transformationMetadata?.transformationIntent) {
    inheritedParts.push(`- Transformation Intent: ${inherited.transformationMetadata.transformationIntent}`);
  }
  const inheritedSection =
    inheritedParts.length > 0
      ? `INHERITED WORK CONTEXT:\n${inheritedParts.join('\n')}`
      : '';

  // 5. Explicit User / Task Instruction (Level 5 - governed by Levels 1-3)
  const conflictWarnings = [
    ...detectKernelConflictWarnings(input.userInstruction),
    ...compiledSourceGrounding.truncationWarnings
  ];
  const taskInstructionParts: string[] = [];
  if (isMeaningfulValue(input.transformationIntent)) {
    taskInstructionParts.push(`Transformation Intent: ${input.transformationIntent}`);
  }
  if (isMeaningfulValue(input.userInstruction)) {
    taskInstructionParts.push(
      `Task Instruction (Subject to Protected COH Kernel and Claim Safety):\n${input.userInstruction!.trim()}`
    );
  }
  if (conflictWarnings.length > 0) {
    taskInstructionParts.push(
      `GOVERNANCE ENFORCEMENT NOTICE:\n${conflictWarnings.map(w => `- ${w}`).join('\n')}`
    );
  }
  const explicitTaskSection = taskInstructionParts.join('\n\n');

  // Assemble final compiled instructions in strict authority order
  const orderedBlocks = [
    protectedKernelSection,
    operatingCoreSection ? `--- APPLICABLE OPERATING CORE RULES ---\n${operatingCoreSection}` : '',
    sourceEvidenceSection ? `--- SOURCE & EVIDENCE GROUNDING ---\n${sourceEvidenceSection}` : '',
    inheritedSection ? `--- CONTINUITY CONTEXT ---\n${inheritedSection}` : '',
    explicitTaskSection ? `--- GOVERNED TASK CONTEXT ---\n${explicitTaskSection}` : ''
  ].filter(Boolean);

  const manifest: ContextManifest = {
    workflow: input.workflow,
    activeCohKernel: true,
    operatingCoreActive: coreActive,
    operatingCoreVersion: core?.version || 'v4',
    audience: audienceField,
    channel: channelField,
    format: formatField,
    pillar: pillarField,
    language: languageField,
    communicationJob: jobField,
    sourcesSelected: manifestSources,
    evidenceSources,
    styleReferenceSources,
    explicitInputs,
    inheritedInputs,
    resolvedInputs,
    unresolvedInputs,
    applicableClaimsRestrictions,
    activeGuidanceSummary,
    authorityHierarchy: AUTHORITY_HIERARCHY,
    conflictWarnings
  };

  return {
    compiledInstructions: orderedBlocks.join('\n\n'),
    manifest,
    sections: {
      protectedKernel: protectedKernelSection,
      operatingCoreRules: operatingCoreSection,
      sourceEvidenceContext: sourceEvidenceSection,
      inheritedWorkContext: inheritedSection,
      explicitTaskInstruction: explicitTaskSection
    }
  };
}
