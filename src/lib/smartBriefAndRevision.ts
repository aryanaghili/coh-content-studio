import {
  REVISION_ACTIONS,
  type RevisionActionDef,
  getCanonicalRevisionAction
} from './revisionActions.ts';
import type { WorkContext } from './contextCompiler.ts';

export type SmartBriefProvenance = 'explicit' | 'inherited' | 'resolved' | 'unresolved';

export interface SmartBriefField<T = string> {
  value: T;
  provenance: SmartBriefProvenance;
  rationale?: string;
}

export interface SuggestedSourceMatch {
  sourceId: string;
  title: string;
  type: string;
  matchReason: string;
  status: 'suggested' | 'selected';
}

export interface ResolvedSmartBrief {
  topic: SmartBriefField;
  audience: SmartBriefField;
  purpose: SmartBriefField;
  channel: SmartBriefField;
  outputFormat: SmartBriefField;
  pillar: SmartBriefField;
  directionAngle: SmartBriefField;
  language: SmartBriefField;
  desiredLength: SmartBriefField;
  selectedSourceIds: string[];
  suggestedSources: SuggestedSourceMatch[];
  unresolvedWarnings: string[];
}

export interface ResolveSmartBriefInput {
  rawRequest: string;
  explicitChannel?: string;
  explicitFormat?: string;
  explicitAudience?: string;
  explicitPurpose?: string;
  explicitPillar?: string;
  explicitLanguage?: string;
  explicitLength?: string;
  explicitDirection?: string;
  selectedSourceIds?: string[];
  inheritedWorkContext?: Partial<WorkContext> | null;
  availableSources?: Array<{
    id: string;
    title: string;
    type: string;
    notes?: string;
    content?: string;
    url?: string;
    selectable?: boolean;
  }>;
}

export type GenerationSpeedMode = 'fast' | 'explore';

export interface GenerationSpeedConfig {
  mode: GenerationSpeedMode;
  label: string;
  description: string;
  draftCount: 1 | 3;
  includeAlternativeOptionB: boolean;
  includeShorterVersionCard: boolean;
  includeVisualDirection: boolean;
  includeQualityCheck: boolean;
}

export function resolveGenerationSpeedConfig(mode: GenerationSpeedMode): GenerationSpeedConfig {
  if (mode === 'fast') {
    return {
      mode: 'fast',
      label: 'Fast (1 Focused Draft)',
      description: 'Generates 1 strong primary draft + Visual Direction + Quality Check for rapid execution.',
      draftCount: 1,
      includeAlternativeOptionB: false,
      includeShorterVersionCard: false,
      includeVisualDirection: true,
      includeQualityCheck: true
    };
  }
  return {
    mode: 'explore',
    label: 'Explore (Multi-Angle Set)',
    description: 'Generates Option A (Direct/Institutional), Option B (Human/Narrative), Shorter Version, Visual Direction, and Strategy Fit Check.',
    draftCount: 3,
    includeAlternativeOptionB: true,
    includeShorterVersionCard: true,
    includeVisualDirection: true,
    includeQualityCheck: true
  };
}

const DEFAULT_CHANNEL_FORMATS: Record<string, string> = {
  LinkedIn: 'Thought Leadership Post',
  Instagram: 'Caption',
  Newsletter: 'Newsletter Section',
  Website: 'Website Copy',
  'Press Release': 'Press Release',
  'Partner / Sponsor Note': 'Partner Outreach Note',
  'YouTube / Video': 'Short Video Script',
  'Internal Strategy': 'Internal Memo'
};

export function resolveSmartBrief(input: ResolveSmartBriefInput): ResolvedSmartBrief {
  const raw = (input.rawRequest || '').trim();
  const lower = raw.toLowerCase();
  const inherited = input.inheritedWorkContext || null;

  // 1. Channel resolution
  let channelVal = 'LinkedIn';
  let channelProv: SmartBriefProvenance = 'resolved';
  if (/linkedin/i.test(raw)) {
    channelVal = 'LinkedIn';
    channelProv = 'resolved';
  } else if (/instagram|carousel|reel/i.test(raw)) {
    channelVal = 'Instagram';
    channelProv = 'resolved';
  } else if (/newsletter|substack|digest/i.test(raw)) {
    channelVal = 'Newsletter';
    channelProv = 'resolved';
  } else if (/press release|media alert|journalist/i.test(raw)) {
    channelVal = 'Press Release';
    channelProv = 'resolved';
  } else if (/partner note|sponsor note|outreach note|pitch/i.test(raw)) {
    channelVal = 'Partner / Sponsor Note';
    channelProv = 'resolved';
  } else if (/website|landing page|web copy/i.test(raw)) {
    channelVal = 'Website';
    channelProv = 'resolved';
  } else if (input.explicitChannel && input.explicitChannel !== 'General / Custom') {
    channelVal = input.explicitChannel;
    channelProv = 'explicit';
  } else if (inherited?.channel) {
    channelVal = inherited.channel;
    channelProv = 'inherited';
  }

  // 2. Output Format resolution
  let formatVal = DEFAULT_CHANNEL_FORMATS[channelVal] || 'Post';
  let formatProv: SmartBriefProvenance = 'resolved';
  if (/carousel/i.test(raw)) {
    formatVal = 'Carousel Copy';
    formatProv = 'resolved';
  } else if (/press release/i.test(raw)) {
    formatVal = 'Press Release';
    formatProv = 'resolved';
  } else if (/whatsapp/i.test(raw)) {
    formatVal = 'WhatsApp Message';
    formatProv = 'resolved';
  } else if (/email|outreach/i.test(raw)) {
    formatVal = 'Partner Outreach Note';
    formatProv = 'resolved';
  } else if (/article|essay/i.test(raw)) {
    formatVal = 'Editorial Article';
    formatProv = 'resolved';
  } else if (input.explicitFormat && input.explicitFormat !== 'General / Custom') {
    formatVal = input.explicitFormat;
    formatProv = 'explicit';
  } else if (inherited?.format) {
    formatVal = inherited.format;
    formatProv = 'inherited';
  }

  // 3. Audience resolution
  let audienceVal = 'Cultural Followers';
  let audienceProv: SmartBriefProvenance = 'resolved';
  if (/institution|museum|opera house|curator|theatre|venue|festival|programming/i.test(raw)) {
    audienceVal = 'Cultural Institutions';
    audienceProv = 'resolved';
  } else if (/sponsor|patron|csr|philanthrop|investor|brand partner|funder/i.test(raw)) {
    audienceVal = 'Sponsors / Patrons';
    audienceProv = 'resolved';
  } else if (/press|journalist|media|critic|editor/i.test(raw)) {
    audienceVal = 'Press / Media';
    audienceProv = 'resolved';
  } else if (/general public|community|citizen|broad audience|newcomer/i.test(raw)) {
    audienceVal = 'General Public';
    audienceProv = 'resolved';
  } else if (input.explicitAudience && input.explicitAudience !== 'General Public') {
    audienceVal = input.explicitAudience;
    audienceProv = 'explicit';
  } else if (inherited?.audience) {
    audienceVal = inherited.audience;
    audienceProv = 'inherited';
  }

  // 4. Purpose / Communication Job resolution
  let purposeVal = 'Build cultural authority';
  let purposeProv: SmartBriefProvenance = 'resolved';
  if (/programming|institution|curatorial|credibility|belong/i.test(raw)) {
    purposeVal = 'Establish institutional credibility and curatorial relevance';
    purposeProv = 'resolved';
  } else if (/sponsor|partner|patron|csr|align/i.test(raw)) {
    purposeVal = 'Support partner / sponsor conversations';
    purposeProv = 'resolved';
  } else if (/announce|milestone|launch|premiere/i.test(raw)) {
    purposeVal = 'Announce a milestone or update';
    purposeProv = 'resolved';
  } else if (/explain|clarify|literacy|understand|what is/i.test(raw)) {
    purposeVal = 'Explain COH clearly to new audiences';
    purposeProv = 'resolved';
  } else if (input.explicitPurpose && input.explicitPurpose !== 'General / Open') {
    purposeVal = input.explicitPurpose;
    purposeProv = 'explicit';
  } else if (inherited?.communicationJob) {
    purposeVal = inherited.communicationJob;
    purposeProv = 'inherited';
  }

  // 5. Content Pillar resolution
  let pillarVal = 'Climate Opera as Cultural IP';
  let pillarProv: SmartBriefProvenance = 'resolved';
  if (/tetralogy|nordic air|water dragon|soria moria|act |libretto|canon|myth/i.test(raw)) {
    pillarVal = 'The Tetralogy & Operatic Worldbuilding';
    pillarProv = 'resolved';
  } else if (/institution|venue|touring|licensing|business model|ip|franchise/i.test(raw)) {
    pillarVal = 'Climate Opera as Cultural IP';
    pillarProv = 'resolved';
  } else if (/climate|sustainability|ecological|emotional infrastructure|resilience/i.test(raw)) {
    pillarVal = 'Culture as Climate Agency';
    pillarProv = 'resolved';
  } else if (/behind the scenes|rehearsal|composer|craft|process/i.test(raw)) {
    pillarVal = 'Artistic Process & Craft';
    pillarProv = 'resolved';
  } else if (input.explicitPillar && input.explicitPillar !== 'General / Custom') {
    pillarVal = input.explicitPillar;
    pillarProv = 'explicit';
  } else if (inherited?.pillar) {
    pillarVal = inherited.pillar;
    pillarProv = 'inherited';
  }

  // 6. Language resolution (including PT-EU and Persian detection)
  let langVal = 'English';
  let langProv: SmartBriefProvenance = 'resolved';
  if (/portuguese|pt-eu|português/i.test(raw)) {
    langVal = 'Portuguese (European)';
    langProv = 'resolved';
  } else if (/persian|farsi|فارسی/i.test(raw)) {
    langVal = 'Persian (Farsi)';
    langProv = 'resolved';
  } else if (/german|deutsch/i.test(raw)) {
    langVal = 'German';
    langProv = 'resolved';
  } else if (/french|français/i.test(raw)) {
    langVal = 'French';
    langProv = 'resolved';
  } else if (/norwegian|norsk/i.test(raw)) {
    langVal = 'Norwegian';
    langProv = 'resolved';
  } else if (input.explicitLanguage && input.explicitLanguage !== 'English') {
    langVal = input.explicitLanguage;
    langProv = 'explicit';
  }

  // 7. Desired Length resolution
  let lengthVal = 'Medium: 120-180 words';
  let lengthProv: SmartBriefProvenance = 'resolved';
  if (formatVal === 'WhatsApp Message' || /\bshort\b|\bbrief\b|caption/i.test(raw)) {
    lengthVal = 'Short: 50-80 words';
    lengthProv = 'resolved';
  } else if (/article|long|essay|press release|deep dive/i.test(raw)) {
    lengthVal = 'Long: 250-350 words';
    lengthProv = 'resolved';
  } else if (input.explicitLength) {
    lengthVal = input.explicitLength;
    lengthProv = 'explicit';
  }

  // 8. Direction / Angle resolution
  let directionVal = `Position COH through ${pillarVal} for ${audienceVal} on ${channelVal}.`;
  let directionProv: SmartBriefProvenance = 'resolved';
  if (input.explicitDirection && input.explicitDirection.trim()) {
    directionVal = input.explicitDirection.trim();
    directionProv = 'explicit';
  } else if (inherited?.strategicAngle) {
    directionVal = inherited.strategicAngle;
    directionProv = 'inherited';
  }

  // 9. Topic provenance
  const topicVal = raw || inherited?.originTitle || '';
  const topicProv: SmartBriefProvenance = raw
    ? 'explicit'
    : inherited?.originTitle
      ? 'inherited'
      : 'unresolved';

  // 10. Selected vs Suggested Sources
  const inheritedSourceIds = (inherited?.sourceBindings || []).map(b => b.sourceId);
  const explicitSelectedIds = Array.from(
    new Set([...(input.selectedSourceIds || []), ...inheritedSourceIds])
  );

  const queryTokens = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !['create', 'write', 'draft', 'make', 'this', 'that', 'with', 'from', 'about', 'post'].includes(w));

  const suggestedSources: SuggestedSourceMatch[] = [];
  for (const src of input.availableSources || []) {
    if (src.selectable === false) continue;
    const isAlreadySelected = explicitSelectedIds.includes(src.id);
    const haystack = `${src.title || ''} ${src.notes || ''} ${src.content || ''}`.toLowerCase();
    const matchedTokens = queryTokens.filter(t => haystack.includes(t));

    if (isAlreadySelected) {
      suggestedSources.push({
        sourceId: src.id,
        title: src.title,
        type: src.type,
        matchReason: 'Explicitly selected for this brief',
        status: 'selected'
      });
    } else if (matchedTokens.length > 0) {
      suggestedSources.push({
        sourceId: src.id,
        title: src.title,
        type: src.type,
        matchReason: `Matches brief keywords (${matchedTokens.slice(0, 3).join(', ')})`,
        status: 'suggested'
      });
    }
  }

  // 11. Unresolved advisory warnings (never placeholder blockers)
  const unresolvedWarnings: string[] = [];
  if (!topicVal) {
    unresolvedWarnings.push('Topic or request is not yet specified. Enter a natural-language goal or select a starter.');
  }
  if (/exact date|ticket link|confirmed venue|confirmed sponsor|impact statistic/i.test(raw) && explicitSelectedIds.length === 0) {
    unresolvedWarnings.push('Your request references specific dates, partners, or statistics, but no supporting source is currently selected. Attach a source or keep claims conceptual.');
  }

  return {
    topic: { value: topicVal, provenance: topicProv },
    audience: { value: audienceVal, provenance: audienceProv },
    purpose: { value: purposeVal, provenance: purposeProv },
    channel: { value: channelVal, provenance: channelProv },
    outputFormat: { value: formatVal, provenance: formatProv },
    pillar: { value: pillarVal, provenance: pillarProv },
    directionAngle: { value: directionVal, provenance: directionProv },
    language: { value: langVal, provenance: langProv },
    desiredLength: { value: lengthVal, provenance: lengthProv },
    selectedSourceIds: explicitSelectedIds,
    suggestedSources: suggestedSources.slice(0, 5),
    unresolvedWarnings
  };
}

// ============================================================================
// PART C & D: REVISION PRODUCTIVITY ENGINE (SUGGESTIONS, RECIPES & CONFLICTS)
// ============================================================================

export interface SuggestedRevisionAction {
  actionId: string;
  label: string;
  group: string;
  reason: string;
  priority: number;
}

export interface SuggestRevisionOptions {
  targetLanguage?: string;
  channel?: string;
  hasAttachedSources?: boolean;
}

export function suggestRevisionActions(
  draftText: string,
  options: SuggestRevisionOptions = {}
): SuggestedRevisionAction[] {
  const text = (draftText || '').trim();
  if (!text) return [];

  const suggestions: SuggestedRevisionAction[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Check for AI-style punctuation (em dashes, double hyphens, curly quotes, markdown bold)
  if (/[\u2014\u2013]|--|\*\*|Here is:|Please note:/i.test(text)) {
    const def = getCanonicalRevisionAction('clean-ai-punctuation');
    if (def) {
      suggestions.push({
        actionId: def.id,
        label: def.label,
        group: def.group,
        reason: 'Draft contains em dashes or AI-style formatting artifacts that violate COH typography standards.',
        priority: 100
      });
    }
  }

  // 2. Check for unhedged superlative or numeric claims without attached sources
  if (/\b(100%|guaranteed|world's first|proven to|millions of|undisputed|largest in history)\b/i.test(text) && !options.hasAttachedSources) {
    const def = getCanonicalRevisionAction('more-careful');
    if (def) {
      suggestions.push({
        actionId: def.id,
        label: def.label,
        group: def.group,
        reason: 'Draft includes strong superlative or numerical claims that should be calibrated for COH claim safety.',
        priority: 95
      });
    }
  }

  // 3. Check for length > 160 words
  if (wordCount > 160) {
    const def = getCanonicalRevisionAction('shorter');
    if (def) {
      suggestions.push({
        actionId: def.id,
        label: def.label,
        group: def.group,
        reason: `Draft is ${wordCount} words long; tightening it will improve reading momentum for ${options.channel || 'digital channels'}.`,
        priority: 85
      });
    }
  }

  // 4. Check for sentence/phrase repetition
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 15);
  const uniqueSentences = new Set(sentences);
  const wordFreq: Record<string, number> = {};
  for (const w of words) {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length >= 6 && !['climate', 'harmony', 'cultural'].includes(clean)) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  }
  const hasHighRepetition =
    uniqueSentences.size < sentences.length ||
    Object.values(wordFreq).some(count => count >= 4);

  if (hasHighRepetition) {
    const def = getCanonicalRevisionAction('remove-repetition');
    if (def) {
      suggestions.push({
        actionId: def.id,
        label: def.label,
        group: def.group,
        reason: 'Repeated phrases or sentence patterns detected across paragraphs.',
        priority: 82
      });
    }
  }

  // 5. Check for generic NGO / corporate buzzwords
  if (/\b(synergy|stakeholders|leverage|paradigm shift|save the planet|urgent crisis|catastrophe)\b/i.test(text)) {
    const isNgo = /\b(save the planet|urgent crisis|catastrophe)\b/i.test(text);
    const def = getCanonicalRevisionAction(isNgo ? 'less-ngo' : 'less-corporate');
    if (def) {
      suggestions.push({
        actionId: def.id,
        label: def.label,
        group: def.group,
        reason: isNgo
          ? 'Draft uses activist/crisis rhetoric; COH voice favors cultural agency and artistic authority.'
          : 'Draft contains corporate jargon that can be sharpened into authentic COH cultural language.',
        priority: 80
      });
    }
  }

  // 6. Check if COH identity is missing
  if (!/climate opera haus|\bcoh\b|cycle of harmony|tetralogy|operatic/i.test(text)) {
    const def = getCanonicalRevisionAction('coh-specific');
    if (def) {
      suggestions.push({
        actionId: def.id,
        label: def.label,
        group: def.group,
        reason: 'Draft does not explicitly anchor its argument in Climate Opera Haus cultural IP.',
        priority: 75
      });
    }
  }

  // 7. Check if targetLanguage is non-English
  if (options.targetLanguage && options.targetLanguage !== 'English') {
    const isPersian = options.targetLanguage.toLowerCase().includes('persian');
    const def = getCanonicalRevisionAction(isPersian ? 'persian-natural' : 'localize-selected');
    if (def) {
      suggestions.push({
        actionId: def.id,
        label: def.label,
        group: def.group,
        reason: `Target language is set to ${options.targetLanguage}; localize for authentic idiomatic flow.`,
        priority: 90
      });
    }
  }

  // Fallback suggestion if short clean draft still needs a stronger hook or clarity
  if (suggestions.length === 0) {
    const def = getCanonicalRevisionAction(wordCount < 45 ? 'add-hook' : 'improve-clarity');
    if (def) {
      suggestions.push({
        actionId: def.id,
        label: def.label,
        group: def.group,
        reason: wordCount < 45
          ? 'Short draft can benefit from a sharper opening hook to capture attention.'
          : 'Tighten sentence transitions and editorial clarity while preserving core meaning.',
        priority: 60
      });
    }
  }

  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}

export interface RevisionConflict {
  actionA: string;
  actionB: string;
  severity: 'blocking' | 'warning';
  message: string;
}

const CONTRADICTORY_PAIRS: Array<{
  groupA: string[];
  groupB: string[];
  severity: 'blocking' | 'warning';
  message: string;
}> = [
  {
    groupA: ['shorter', 'shorter-version'],
    groupB: ['longer-version', 'stronger-proof'],
    severity: 'blocking',
    message: 'Conflicting length instructions: cannot simultaneously make the draft shorter and expand it into a longer version.'
  },
  {
    groupA: ['bullet-points', 'to-bullets'],
    groupB: ['paragraph'],
    severity: 'blocking',
    message: 'Conflicting structure instructions: cannot convert to bullet points and turn into a continuous paragraph in the same pass.'
  },
  {
    groupA: ['less-corporate', 'human', 'warmer'],
    groupB: ['institutional'],
    severity: 'warning',
    message: 'Tone tension: combining "Make it more institutional" with "Make it less corporate / warmer" requires balancing formal authority with accessible warmth.'
  },
  {
    groupA: ['persian-natural'],
    groupB: ['english-polished'],
    severity: 'blocking',
    message: 'Conflicting language instructions: cannot simultaneously optimize for spoken Persian and polished English.'
  }
];

export function detectRevisionConflicts(
  selectedActionIds: string[],
  settings?: { targetLanguage?: string }
): RevisionConflict[] {
  const conflicts: RevisionConflict[] = [];
  const uniqueIds = Array.from(new Set(selectedActionIds));

  for (const rule of CONTRADICTORY_PAIRS) {
    const hitA = uniqueIds.find(id => rule.groupA.includes(id));
    const hitB = uniqueIds.find(id => rule.groupB.includes(id));
    if (hitA && hitB) {
      conflicts.push({
        actionA: hitA,
        actionB: hitB,
        severity: rule.severity,
        message: rule.message
      });
    }
  }

  if (
    uniqueIds.includes('persian-natural') &&
    settings?.targetLanguage &&
    !settings.targetLanguage.toLowerCase().includes('persian')
  ) {
    conflicts.push({
      actionA: 'persian-natural',
      actionB: `Language: ${settings.targetLanguage}`,
      severity: 'warning',
      message: 'You selected "Make Persian more natural and spoken", so Target Language will be treated as Persian (Farsi).'
    });
  }

  return conflicts;
}

export interface CompiledRevisionRecipeStep {
  stage: 1 | 2 | 3 | 4 | 5 | 6;
  stageName: string;
  actionId: string;
  label: string;
}

export interface CompiledRevisionRecipe {
  orderedSteps: CompiledRevisionRecipeStep[];
  conflicts: RevisionConflict[];
  hasBlockingConflict: boolean;
  compiledInstruction: string;
  summaryLabel: string;
  languageGovernanceNote?: string;
}

const STAGE_NAMES: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'Preserve Core Meaning & Facts',
  2: 'Evidence & Claim Discipline',
  3: 'Structural Transformation',
  4: 'Channel, Format & COH Strategic Fit',
  5: 'Voice, Tone & Editorial Polish',
  6: 'Translation & Localization'
};

export function compileRevisionRecipe(
  selectedActionIds: string[],
  settings: {
    channel?: string;
    format?: string;
    targetLanguage?: string;
    tone?: string;
    optionalContext?: string;
    customInstruction?: string;
  } = {}
): CompiledRevisionRecipe {
  const uniqueIds = Array.from(new Set(selectedActionIds.filter(Boolean)));
  const conflicts = detectRevisionConflicts(uniqueIds, { targetLanguage: settings.targetLanguage });
  const hasBlockingConflict = conflicts.some(c => c.severity === 'blocking');

  const steps: CompiledRevisionRecipeStep[] = uniqueIds.map(id => {
    const def: RevisionActionDef | undefined = REVISION_ACTIONS.find(a => a.id === id);
    const stage = def?.executionStage || 5;
    return {
      stage,
      stageName: STAGE_NAMES[stage],
      actionId: id,
      label: def?.label.replace(/^[^\w\s]+\s*/, '') || id
    };
  });

  // Sort deterministically by stage (1 -> 6)
  steps.sort((a, b) => a.stage - b.stage);

  // Language governance rules (PT-EU and Persian regression protection)
  const targetLang = settings.targetLanguage || 'English';
  let languageGovernanceNote: string | undefined;

  const hasTranslationStep =
    steps.some(s => s.stage === 6) ||
    targetLang !== 'English';

  if (hasTranslationStep) {
    if (/portuguese|pt-eu/i.test(targetLang)) {
      languageGovernanceNote =
        'CRITICAL PT-EU GOVERNANCE: Write strictly in European Portuguese (Português Europeu, PT-EU). Use European Portuguese vocabulary, syntax, and clitic placement (e.g., "a criar", "equipa", "económico", "contacto"). Never use Brazilian Portuguese ("criando", "equipe", "econômico", "contato"). Preserve approved COH titles in original form.';
    } else if (/persian|farsi/i.test(targetLang) || uniqueIds.includes('persian-natural')) {
      languageGovernanceNote =
        'CRITICAL PERSIAN GOVERNANCE: Output must be natural, readable, and spoken-friendly Persian (Farsi). Avoid stiff, literal machine-translation patterns or overly bureaucratic phrasing while preserving COH cultural dignity.';
    } else if (targetLang === 'English') {
      languageGovernanceNote =
        'Maintain polished, clear international English aligned with the Climate Opera Haus voice. Never use em dashes.';
    } else {
      languageGovernanceNote =
        `Localize idiomatically into natural ${targetLang} while preserving Climate Opera Haus terminology and factual boundaries. Never use em dashes.`;
    }
  }

  const instructionLines: string[] = [
    'Execute this governed Revision Recipe in the following strict sequence while preserving factual integrity and the Protected COH Kernel:'
  ];

  steps.forEach((step, index) => {
    instructionLines.push(`${index + 1}. [Stage ${step.stage}: ${step.stageName}] ${step.label}`);
  });

  if (settings.customInstruction && settings.customInstruction.trim()) {
    instructionLines.push(`Additional Editorial Instruction: ${settings.customInstruction.trim()}`);
  }

  if (settings.channel && settings.channel !== 'General / Custom') {
    instructionLines.push(`Target Channel Fit: ${settings.channel}`);
  }
  if (settings.format && settings.format !== 'General / Custom') {
    instructionLines.push(`Target Structural Format: ${settings.format}`);
  }
  if (languageGovernanceNote) {
    instructionLines.push(languageGovernanceNote);
  }
  instructionLines.push('Typography constraint: Never use em dashes (\u2014). Use commas, periods, or colons.');

  const summaryLabel =
    steps.length > 0
      ? steps.map(s => s.label).join(' + ')
      : settings.customInstruction
        ? `Custom: ${settings.customInstruction}`
        : 'Standard Revision';

  return {
    orderedSteps: steps,
    conflicts,
    hasBlockingConflict,
    compiledInstruction: instructionLines.join('\n'),
    summaryLabel,
    languageGovernanceNote
  };
}

export function cleanTypographyArtifacts(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u200b|\u200c|\u200d|\ufeff/g, '')
    .replace(/\s*[\u2014\u2013]\s*/g, ', ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\b(Note:|Disclaimer:|Here is:|Sure,|Here are:|Please note:)\s*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function executeDeterministicRevisionRecipe(
  draftText: string,
  recipe: CompiledRevisionRecipe,
  settings: {
    channel?: string;
    format?: string;
    targetLanguage?: string;
    tone?: string;
    customInstruction?: string;
  } = {}
): string {
  let working = cleanTypographyArtifacts(draftText);
  if (!working) return '';

  const actionIds = recipe.orderedSteps.map(s => s.actionId);

  // Stage 2: Evidence & Claim Discipline
  if (
    actionIds.some(id =>
      ['remove-unsupported', 'flag-claims', 'more-careful', 'less-exaggerated', 'simplify-claims'].includes(id)
    )
  ) {
    working = working
      .replace(/\b(100%|guaranteed|undisputed|world's first|largest in history)\b/gi, 'significant')
      .replace(/\bproven to\b/gi, 'designed to');
    if (actionIds.includes('flag-claims')) {
      working += '\n\n[Claim Check: Verify any specific dates, partner names, or metrics against attached Source Library records before external publication.]';
    }
  }

  // Stage 3: Structural Transformation
  if (actionIds.includes('remove-repetition')) {
    const sentences = working.split(/(?<=[.!?])\s+/);
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const s of sentences) {
      const norm = s.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(norm)) {
        seen.add(norm);
        deduped.push(s);
      }
    }
    working = deduped.join(' ');
  }

  if (actionIds.includes('shorter') || actionIds.includes('shorter-version')) {
    const sentences = working.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 2) {
      working = sentences.slice(0, Math.max(2, Math.ceil(sentences.length * 0.65))).join(' ');
    }
  } else if (actionIds.includes('longer-version') || actionIds.includes('stronger-proof')) {
    working +=
      '\n\nWithin the Climate Opera Haus ecosystem, live operatic performance serves as the origin asset for a broader cultural IP architecture connecting artistic storytelling, educational engagement, and long-term institutional partnerships.';
  }

  if (actionIds.includes('bullet-points') || actionIds.includes('to-bullets') || settings.format === 'Bullet Points') {
    const sentences = working
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(Boolean);
    working = sentences.map(s => (s.startsWith('- ') ? s : `- ${s}`)).join('\n');
  } else if (actionIds.includes('paragraph') && working.includes('- ')) {
    working = working
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(Boolean)
      .join(' ');
  }

  if (actionIds.includes('add-hook') || actionIds.includes('openings') || actionIds.includes('stronger-headline')) {
    const hook = 'Cultural memory shapes how societies respond to ecological transition.';
    if (!working.includes(hook)) {
      working = `${hook}\n\n${working}`;
    }
  }

  if (actionIds.includes('add-cta') || actionIds.includes('ctas')) {
    const cta = 'Explore how Climate Opera Haus builds long-horizon cultural programming with partner institutions.';
    if (!working.includes(cta)) {
      working = `${working}\n\n${cta}`;
    }
  }

  // Stage 4: COH & Strategic Fit
  if (actionIds.includes('coh-specific') && !/Climate Opera Haus/i.test(working)) {
    working = `At Climate Opera Haus, ${working.charAt(0).toLowerCase()}${working.slice(1)}`;
  }
  if (actionIds.includes('institutional')) {
    working = working.replace(/\bawesome\b|\bamazing\b|\bcool\b/gi, 'compelling');
    if (!/programming|institutional/i.test(working)) {
      working += ' This framework supports multi-season institutional programming and curatorial continuity.';
    }
  }
  if (actionIds.includes('sponsor-facing')) {
    if (!/partner|alignment/i.test(working)) {
      working += ' For strategic partners, this creates high-credibility cultural visibility grounded in artistic excellence.';
    }
  }

  // Stage 5: Voice & Tone / Clean Polish
  if (actionIds.includes('less-ngo') || actionIds.includes('less-corporate')) {
    working = working
      .replace(/\bsave the planet\b/gi, 'strengthen cultural resilience')
      .replace(/\bsynergy\b/gi, 'collaboration')
      .replace(/\bleverage\b/gi, 'use');
  }

  // Stage 6: Translation & Localization (PT-EU and Persian deterministic support when offline)
  const targetLang = settings.targetLanguage || 'English';
  const hasTranslationAction = actionIds.some(id =>
    ['translate', 'translate-selected', 'localize', 'localize-selected', 'persian-natural', 'adapt-channel-lang'].includes(id)
  );

  if (hasTranslationAction && targetLang !== 'English') {
    if (/portuguese|pt-eu/i.test(targetLang)) {
      working = `[PT-EU | Português Europeu] Na Climate Opera Haus, a equipa está a criar mundos operáticos originais que ligam a excelência artística ao diálogo cultural e ecológico.\n\n${working}`;
    } else if (/persian|farsi/i.test(targetLang) || actionIds.includes('persian-natural')) {
      working = `[FA | فارسی روان و طبیعی] در خانه اپرای اقلیمی (Climate Opera Haus)، ما روایت‌های هنری و اپرایی را به تجربه‌ای ملموس، انسانی و الهام‌بخش برای مخاطبان تبدیل می‌کنیم.\n\n${working}`;
    } else {
      working = `[Localized for ${targetLang}]\n\n${working}`;
    }
  } else if (actionIds.includes('persian-natural')) {
    working = `[FA | فارسی روان و طبیعی] در خانه اپرای اقلیمی (Climate Opera Haus)، روایت هنری با زبانی طبیعی و گفتاری بازآفرینی شده است:\n\n${working}`;
  }

  if (settings.customInstruction && settings.customInstruction.trim()) {
    working = `${working}\n\n[Applied editorial note: ${cleanTypographyArtifacts(settings.customInstruction.trim())}]`;
  }

  return cleanTypographyArtifacts(working);
}
