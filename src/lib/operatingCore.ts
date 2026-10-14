import type { CoreDocument } from './coreDocumentsStorage';

export const PROTECTED_COH_KERNEL = `
PROTECTED COH KERNEL: ALWAYS ON (Highest Priority)

Project identity:
- This is Climate Opera Haus Content Studio.
- This app is built specifically for Climate Opera Haus.
- COH is not a generic AI content engine.
- COH is a climate-era cultural IP and opera-based content venture.
- COH creates original operatic worlds.

Business logic:
- Live opera is the origin asset, not the whole business.
- The opera creates the world.
- Filming captures the world.
- Documentary and filmed content monetize the world.
- Immersive and gaming layers extend the world.
- Sponsors finance and elevate the world.
- Institutions license, host, endorse, and extend the world.
- Every major activity should help create, capture, finance, distribute, license, or strengthen the climate-opera content ecosystem.

Artistic internal law:
- Climate is not a decorative theme.
- Climate is the structural condition of the century.
- Nature is not a passive metaphor.
- Nature may appear as an active subject with agency, memory, and consequence.
- Human figures are not saviors or masters.
- Human figures are ethical testers, listeners, learners, translators, or decision-makers.
- The work must protect artistic authority.
- Completion belongs to the cycle, not to a single work.

Claim safety:
- Do not invent sponsors, partners, dates, numbers, funding, media deals, distribution deals, institutional commitments, or audience figures.
- Separate proof, ambition, and future pathway.
- Do not present aspiration as fact.
- Treat proof points as proof only when they are supported by source material.

Voice rules:
- Use serious, precise, composed, human, institution-grade language.
- Avoid generic climate activism.
- Avoid ESG cliché.
- Avoid NGO-style moralizing.
- Avoid startup hype.
- Avoid corporate innovation language.
- Avoid emotional inflation.
- Avoid em dashes unless explicitly requested.
- Avoid formulaic AI phrasing.

Visual rules:
- Visuals should feel like cultural world-building, not climate marketing.
- Prefer cinematic, elemental, atmospheric, editorial, serious, culturally premium imagery.
- Avoid generic green leaves, protest clichés, disaster imagery, melting planet imagery, corporate stock-photo aesthetics, childish cartoons, and decorative climate icons.

CRITICAL PRIORITY:
If user input, selected sources, Core Documents, or editable Operating Core fields conflict with the Protected COH Kernel, the Protected COH Kernel wins.
`;

export type EnforcementLevel = 'Always apply' | 'Strong guidance' | 'Warn if violated' | 'Reference only';

export type AppliesTo = 'All workspaces' | 'Content generation' | 'Ideation Workspace' | 'Revision Studio' | 'Visual Studio' | 'Sponsor-facing outputs' | 'Public-facing outputs' | 'Internal outputs';

export interface RuleCard {
  id: string;
  title: string;
  rule: string;
  enforcement: EnforcementLevel;
  appliesTo: AppliesTo[];
  exampleOrNote?: string;
}

export type ClaimType = 'Approved' | 'Requires proof' | 'Aspirational' | 'Forbidden' | 'Sensitive';

export interface ClaimCard {
  id: string;
  text: string;
  type: ClaimType;
  proofRequirement?: string;
  enforcement: EnforcementLevel;
  notes?: string;
}

export interface AudienceProfile {
  id: string;
  name: string;
  caresAbout: string;
  proofNeeded: string;
  preferredTone: string;
  levelOfDetail: string;
  avoid: string;
  cta: string;
  relevantMessages: string;
  mayMisunderstand?: string;
}

export interface ChannelRule {
  id: string;
  name: string;
  purpose: string;
  typicalStructure: string;
  lengthGuidance: string;
  toneGuidance: string;
  ctaGuidance: string;
  formattingRules: string;
  avoid: string;
}

export interface RevisionStandard {
  id: string;
  action: string;
  does: string;
  avoids: string;
  whenToUse: string;
  exampleGuidance: string;
  appliesTo: string;
}

export interface CoreEvidenceItem {
  id: string;
  title: string;
  sourceType: string;
  supportsSection: string;
  relevanceNote: string;
  linkOrSourceName?: string;
}

export interface CorePassport {
  organizationName: string;
  category: string;
  oneLineDefinition: string;
  whatWeAreNot: string;
  coreDistinction: string;
  operatingLogic: string;
  currentStrategicPhase: string;
  primaryStrategicPriorities: string;
  defaultCommunicationPosture: string;
  neverCollapseInto: string;
}

export interface StrategyKernel {
  positioning: string;
  strategicAmbition: string;
  valueProposition: string;
  proofLadder: string;
  internalLaw: RuleCard[];
}

export interface OperatingCore {
  active: boolean;
  version: string;
  lastUpdated: string;
  corePassport: CorePassport;
  strategyKernel: StrategyKernel;
  audiences: AudienceProfile[];
  channels: ChannelRule[];
  claimsProofBoundaries: {
    claims: ClaimCard[];
    proofPoints: string;
    overstatementWarnings: string;
    claimStyleRules: string;
  };
  voiceAndLanguage: {
    overallTone: string;
    writingStyle: string;
    sentenceRhythm: string;
    preferredPhrases: string[];
    avoidPhrases: string[];
    aiPhrasesToAvoid: string[];
    formalityLevel: string;
    emotionalIntensity: string;
    founderVoiceNotes: string;
    cleanWritingRules: string;
  };
  visualDNA: {
    visualAtmosphere: string;
    mood: string;
    compositionPrinciples: string;
    colorMaterialDirection: string;
    photographyStyle: string;
    typographyNotes: string;
    visualSymbolsToUseCarefully: string;
    visualClichesToAvoid: string;
    imagePromptRules: string;
    formatAspectPreferences: string;
    negativePromptRules: string;
  };
  revisionStandards: RevisionStandard[];
  coreEvidence: CoreEvidenceItem[];
  learningInbox: any[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createDefaultOperatingCore = (): OperatingCore => ({
  active: true,
  version: "v4",
  lastUpdated: new Date().toISOString(),
  corePassport: {
    organizationName: "Climate Opera Haus",
    category: "Climate-era cultural IP and opera-based content venture",
    oneLineDefinition: "COH creates original climate-era operatic worlds and turns them into cultural, institutional, sponsorship, content, and IP assets.",
    whatWeAreNot: "COH is not a generic AI content engine, not a generic climate campaign, not an ESG content brand, not an NGO communication project.",
    coreDistinction: "COH treats climate as the structural condition of the century and uses opera to build serious cultural worlds that can repeat, travel, and accumulate meaning.",
    operatingLogic: "Live opera creates the world. Filming captures it. Documentary and content monetize it. Sponsors finance and elevate it. Institutions license, host, endorse, and extend it.",
    currentStrategicPhase: "Moving from proof of attention and legitimacy toward proof of delivery, capture, adoption readiness, and repeatability.",
    primaryStrategicPriorities: "Cultural durability, institutional adoption, civic resonance, sponsorship credibility, long-term content/IP logic.",
    defaultCommunicationPosture: "Serious, cultural, precise, human, institution-grade, artistically authoritative, commercially coherent.",
    neverCollapseInto: "Generic climate activism, corporate ESG language, shallow event marketing, disaster clichés, decorative green aesthetics, startup hype, NGO-style moralizing."
  },
  strategyKernel: {
    positioning: "COH is a climate-era cultural IP venture using opera as the origin asset for a wider content, institutional, sponsorship, and rights ecosystem.",
    strategicAmbition: "Build a repertoire-based climate canon designed to repeat, travel, and accumulate cultural meaning over time.",
    valueProposition: "COH gives partners, institutions, and audiences access to rare, ownable, culturally differentiated climate-era content with artistic authority and long-term asset value.",
    proofLadder: "Proof of attention -> Proof of delivery and capture -> Proof of adoption and repeatability.",
    internalLaw: [
      { id: generateId(), title: "Operating Decision Rule", rule: "Does this activity create, capture, finance, distribute, license, or strengthen the climate-opera ecosystem?", enforcement: "Always apply", appliesTo: ["All workspaces"] }
    ]
  },
  audiences: [
    {
      id: generateId(), name: "Sponsors and patrons",
      caresAbout: "Prestige, credible association, differentiated climate-era positioning, access to cultural and institutional environments, and long-term visibility.",
      mayMisunderstand: "Thinking COH is an event sponsorship, arts donation, or climate campaign.",
      proofNeeded: "Credibility, value exchange, audience/context quality, asset logic, and how support becomes long-term visibility.",
      preferredTone: "Premium, serious, commercially clear, not needy, not charity-led.",
      levelOfDetail: "High-level strategic impact and value exchange",
      avoid: "NGO begging language, generic sponsorship language.",
      cta: "Focused conversation on where their objectives intersect with COH.",
      relevantMessages: "Cultural durability, institutional footprint"
    },
    {
      id: generateId(), name: "Cultural institutions",
      caresAbout: "Artistic seriousness, program fit, audience relevance, institutional credibility, and operational feasibility.",
      mayMisunderstand: "Thinking COH is advocacy theater or a symbolic climate event.",
      proofNeeded: "Artistic quality, production discipline, adoption readiness, and institutional fit.",
      preferredTone: "Serious, precise, curatorial, credible.",
      levelOfDetail: "High artistic and operational detail",
      avoid: "Corporate ROI language, startup disruption hype",
      cta: "Explore placement, co-production, residency, or programming fit.",
      relevantMessages: "Repertoire-based climate canon, civic resonance"
    },
    {
      id: generateId(), name: "Opera houses and festivals",
      caresAbout: "Repertoire quality, production feasibility, artistic standards, audience development, and rights clarity.",
      mayMisunderstand: "Thinking COH is a one-off climate performance.",
      proofNeeded: "Score/readiness logic, production blueprint, technical feasibility, capture assets, and licensing pathway.",
      preferredTone: "Artistically serious, practical, institution-grade.",
      levelOfDetail: "High technical and artistic detail",
      avoid: "Marketing fluff, minimizing the complexity of live opera",
      cta: "Explore staging, licensing, or production conversation.",
      relevantMessages: "New repertoire, touring flexibility"
    },
    {
      id: generateId(), name: "Foundations and arts councils",
      caresAbout: "Public meaning, climate relevance, civic engagement, and credible non-technical communication.",
      mayMisunderstand: "Thinking COH is awareness campaigning.",
      proofNeeded: "Proof that COH creates cultural depth rather than simplified advocacy.",
      preferredTone: "Thoughtful, bridge-building, serious, human.",
      levelOfDetail: "Medium, focusing on narrative impact",
      avoid: "Preaching to the choir, generic urgency clichés",
      cta: "Explore civic programming, dialogue, or partnership.",
      relevantMessages: "Climate as structural condition, cultural IP"
    },
    {
      id: generateId(), name: "Climate and sustainability leaders",
      caresAbout: "Meaning, emotional accessibility, relevance to life, and invitation into the work.",
      mayMisunderstand: "Thinking opera is inaccessible or climate opera is preachy.",
      proofNeeded: "Human language, simple entry points, and clear invitation.",
      preferredTone: "Warm, clear, intelligent, not simplistic.",
      levelOfDetail: "Broad strokes and emotional hooks",
      avoid: "Heavy jargon, corporate sustainability speak, academic art theory",
      cta: "Attend, explore, learn, join a public moment.",
      relevantMessages: "The artistic world, emotional experience"
    },
    {
      id: generateId(), name: "Media and documentary partners",
      caresAbout: "Story, relevance, originality, people, context, and why now.",
      mayMisunderstand: "Reducing it to niche opera or climate messaging.",
      proofNeeded: "Clear narrative hook, proof points, human angle, and category distinction.",
      preferredTone: "Clear, quotable, precise, non-hype.",
      levelOfDetail: "Concise facts with strong quotes",
      avoid: "Internal jargon, unverified claims, overused PR buzzwords",
      cta: "Request interview, press note, or story conversation.",
      relevantMessages: "Original climate-era operatic worlds"
    },
    {
      id: generateId(), name: "Education and civic partners",
      caresAbout: "Learning value, public dialogue, youth relevance, civic meaning, and accessibility.",
      mayMisunderstand: "Thinking COH is only performance.",
      proofNeeded: "Formats that translate performance into dialogue and learning.",
      preferredTone: "Clear, accessible, serious, constructive.",
      levelOfDetail: "Focus on access and understanding",
      avoid: "Elitist tone, purely commercial framing",
      cta: "Explore learning/public program collaboration.",
      relevantMessages: "Civic resonance, shared cultural memory"
    },
    {
      id: generateId(), name: "Press and journalists",
      caresAbout: "Story, relevance, originality, people, context, and why now.",
      mayMisunderstand: "Reducing it to niche opera or climate messaging.",
      proofNeeded: "Clear narrative hook, proof points, human angle, and category distinction.",
      preferredTone: "Clear, quotable, precise, non-hype.",
      levelOfDetail: "Concise facts with strong quotes",
      avoid: "Internal jargon, unverified claims, overused PR buzzwords",
      cta: "Request interview, press note, or story conversation.",
      relevantMessages: "Original climate-era operatic worlds"
    },
    {
      id: generateId(), name: "Internal team",
      caresAbout: "Clarity, priorities, next steps, alignment, and what changed.",
      mayMisunderstand: "Misunderstanding strategy language as abstract.",
      proofNeeded: "Concise decisions, rationale, owners, and implications.",
      preferredTone: "Practical, human, direct.",
      levelOfDetail: "High operational detail",
      avoid: "Corporate double-speak, vague directives",
      cta: "Confirm action, feedback, or next step.",
      relevantMessages: "Current strategic phase focus"
    },
    {
      id: generateId(), name: "General cultural audience",
      caresAbout: "Meaning, emotional accessibility, relevance to life, and invitation into the work.",
      mayMisunderstand: "Thinking opera is inaccessible or climate opera is preachy.",
      proofNeeded: "Human language, simple entry points, and clear invitation.",
      preferredTone: "Warm, clear, intelligent, not simplistic.",
      levelOfDetail: "Broad strokes and emotional hooks",
      avoid: "Heavy jargon, corporate sustainability speak, academic art theory",
      cta: "Attend, explore, learn, join a public moment.",
      relevantMessages: "The artistic world, emotional experience"
    }
  ],
  channels: [
    {
      id: generateId(), name: "LinkedIn",
      purpose: "Institutional backbone. Thought leadership, credibility, updates, and institutional narrative.",
      typicalStructure: "Sharp opening, strategic point, concrete proof or insight, clean close.",
      lengthGuidance: "Medium (2-3 short paragraphs)",
      toneGuidance: "Thoughtful, precise, human, serious.",
      ctaGuidance: "Professional engagement, contact for partnership",
      formattingRules: "Clean spacing, no emojis, clear hierarchy",
      avoid: "Hype, generic leadership language, excessive hashtags, motivational clichés."
    },
    {
      id: generateId(), name: "Instagram",
      purpose: "Visual myth and artistic atmosphere.",
      typicalStructure: "Visceral description with visual designer context.",
      lengthGuidance: "Short to medium caption",
      toneGuidance: "Cinematic, elemental, atmospheric.",
      ctaGuidance: "Immersive engagement",
      formattingRules: "Clean aesthetic, focus on imagery",
      avoid: "Disaster imagery, generic green leaves, marketing fluff."
    },
    {
      id: generateId(), name: "Facebook",
      purpose: "Event amplification and community stability.",
      typicalStructure: "What it is, why it matters, who it is for, what to do.",
      lengthGuidance: "Short, punchy",
      toneGuidance: "Elegant, clear, inviting.",
      ctaGuidance: "RSVP, Buy Tickets, Share",
      formattingRules: "Scannable details",
      avoid: "Generic event promotion, excessive corporate language."
    },
    {
      id: generateId(), name: "TikTok",
      purpose: "Human access to opera discipline.",
      typicalStructure: "Short hook, behind-the-scenes reality, human focal point.",
      lengthGuidance: "Very short text, focus on video script/hook",
      toneGuidance: "Authentic, human, accessible.",
      ctaGuidance: "Watch, follow, comment",
      formattingRules: "Native app text styling",
      avoid: "Overly polished corporate videos, preachy climate messages."
    },
    {
      id: generateId(), name: "X",
      purpose: "Intellectual real-time presence.",
      typicalStructure: "News angle, context, quote-ready idea.",
      lengthGuidance: "Short character-bound announcement or thread",
      toneGuidance: "Clear, non-hype, media-friendly.",
      ctaGuidance: "Read more, engage",
      formattingRules: "Concise, punchy",
      avoid: "Internal jargon, unverified claims."
    },
    {
      id: generateId(), name: "Snapchat",
      purpose: "Active-cycle intimacy.",
      typicalStructure: "Short caption, immediate context.",
      lengthGuidance: "Extremely short",
      toneGuidance: "Natural, concise, human.",
      ctaGuidance: "Swipe up, view story",
      formattingRules: "Native app text styling",
      avoid: "Heavy strategy language."
    },
    {
      id: generateId(), name: "Newsletter",
      purpose: "Archival spine. Deeper narrative and public engagement.",
      typicalStructure: "Scene or insight, context, meaning, invitation.",
      lengthGuidance: "Medium to Long (500-800 words)",
      toneGuidance: "Warm, editorial, intelligent.",
      ctaGuidance: "Read more, share, support",
      formattingRules: "Editorial layout, strong headers, rich visuals",
      avoid: "Overexplaining, generic climate action language, NGO-style calls."
    },
    {
      id: generateId(), name: "Website",
      purpose: "Structural anchor. High-trust positioning and conversion.",
      typicalStructure: "Clear proposition, distinction, proof, value exchange, next step.",
      lengthGuidance: "Varies by page, generally concise and scannable",
      toneGuidance: "Refined, structural, credible.",
      ctaGuidance: "Primary action (Contact, Buy, Learn)",
      formattingRules: "Highly visual, distinct sections, clear typography",
      avoid: "Vague poetry without functional meaning."
    }
  ],
  claimsProofBoundaries: {
    claims: [
      { id: generateId(), type: 'Approved', text: 'COH creates original climate-era operatic worlds.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Requires proof', text: 'Confirmed sponsors, partners, or institutional adoption', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Aspirational', text: 'Global canon, long-term touring, immersive/gaming expansion', enforcement: 'Reference only' },
      { id: generateId(), type: 'Forbidden', text: 'Inventing numbers, media deals, distribution deals, funding, or dates', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'Presenting aspiration as fact', enforcement: 'Always apply' }
    ],
    proofPoints: "Only use proof points supported by source material.",
    overstatementWarnings: "Separate proof, ambition, and future pathway. Do not present aspiration as fact. Do not invent sponsors, partners, dates, numbers, funding, media deals, distribution deals, institutional commitments, or audience figures.",
    claimStyleRules: "State facts neutrally and powerfully. Let the artistic ambition speak for itself. Do not invent facts."
  },
  voiceAndLanguage: {
    overallTone: "Serious, precise, composed, human, institution-grade language.",
    writingStyle: "precise cultural language, structural clarity, measured ambition, institutional seriousness",
    sentenceRhythm: "clean and direct sentence rhythm.",
    preferredPhrases: ["structural condition", "origin asset", "cultural durability"],
    avoidPhrases: ["generic climate activism", "ESG cliché", "NGO-style moralizing", "startup hype", "corporate innovation language", "emotional inflation"],
    aiPhrasesToAvoid: ["formulaic AI phrasing", "em dashes unless explicitly requested"],
    formalityLevel: "Structural authority, institutional fluency, human through function",
    emotionalIntensity: "Composed and unemotional tone, long-horizon perspective",
    founderVoiceNotes: "Specificity, clear approval tests, avoid drift patterns.",
    cleanWritingRules: "No em dashes or formulaic AI phrasing."
  },
  visualDNA: {
    visualAtmosphere: "Cinematic, elemental, atmospheric, editorial, serious, culturally premium imagery.",
    mood: "Cultural world-building, not climate marketing.",
    compositionPrinciples: "Clean, intentional, not overly busy.",
    colorMaterialDirection: "Brand colors and typography if available.",
    photographyStyle: "Photography direction, design direction, documentary realism versus elemental world-building.",
    typographyNotes: "Element coding.",
    visualSymbolsToUseCarefully: "Visual principles.",
    visualClichesToAvoid: "Generic green leaves, protest clichés, disaster imagery, melting planet imagery, corporate stock-photo aesthetics, childish cartoons, decorative climate icons.",
    imagePromptRules: "The image should feel like cultural world-building, not climate marketing. AI image quality rules apply.",
    formatAspectPreferences: "16:9 for narrative, 4:5 for social portraits.",
    negativePromptRules: "cartoon, illustration, 3d render, low quality, bad anatomy, text, watermark, generic stock photo"
  },
  revisionStandards: [
    { id: generateId(), action: "Make sharper", does: "Remove repetition, tighten logic.", avoids: "Fluff.", whenToUse: "When copy feels too loose.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Make more human", does: "Improve warmth and naturalness.", avoids: "Robotic transitions.", whenToUse: "When copy feels too cold.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Make more institutional", does: "Increase seriousness, credibility.", avoids: "Startup hype.", whenToUse: "When writing for formal partners.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Make more sponsor-facing", does: "Clarify value exchange.", avoids: "Self-indulgence.", whenToUse: "When funding is the goal.", exampleGuidance: "", appliesTo: "Sponsor-facing outputs" },
    { id: generateId(), action: "Make less corporate", does: "Remove jargon.", avoids: "Business language.", whenToUse: "When it sounds B2B.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Make less NGO-like", does: "Remove moralizing.", avoids: "Campaign framing.", whenToUse: "When it sounds like a charity.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Make more structurally precise", does: "Ensure logic holds.", avoids: "Vague poetry.", whenToUse: "When logic is weak.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Remove AI-style phrasing", does: "Clean syntax.", avoids: "Formulaic AI.", whenToUse: "Final polish.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Remove emotional inflation", does: "Calm the text.", avoids: "Hype adjectives.", whenToUse: "When text is exaggerated.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Remove unsupported claims", does: "Verify facts.", avoids: "Aspiration as fact.", whenToUse: "Safety check.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Restore Canon / Touring / Institutional logic", does: "Anchor to long-term goals.", avoids: "Short-term event focus.", whenToUse: "When the big picture is lost.", exampleGuidance: "", appliesTo: "All workspaces" }
  ],
  coreEvidence: [],
  learningInbox: []
});

import { compileGovernedContext } from './contextCompiler.ts';

export interface CompileContext {
  workspace: 'Simple Mode' | 'Quick Create' | 'Advanced Brief' | 'Ideation Workspace' | 'Revision Studio' | 'Visual Studio';
  channel?: string;
  audience?: string;
  format?: string;
  action?: string;
}

export function compileOperatingCoreContext(core: OperatingCore | null, context: CompileContext, appliedDocs: CoreDocument[] = []): string {
  return compileGovernedContext({
    workflow: context.workspace,
    operatingCore: core,
    coreDocuments: appliedDocs,
    channel: context.channel,
    audience: context.audience,
    format: context.format,
    action: context.action
  }).compiledInstructions;
}

export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\n/g, '\n').replace(/\s+$/, '');
}

export function safeMergeOperatingCore(savedData: any): OperatingCore {
  const defaults = createDefaultOperatingCore();
  if (!savedData || typeof savedData !== 'object') return defaults;

  // Deep merge strategy ensuring critical properties exist
  const merged: OperatingCore = {
    ...defaults,
    ...savedData,
    corePassport: {
      ...defaults.corePassport,
      ...(savedData.corePassport || {})
    },
    strategyKernel: {
      ...defaults.strategyKernel,
      ...(savedData.strategyKernel || {})
    },
    claimsProofBoundaries: {
      ...defaults.claimsProofBoundaries,
      ...(savedData.claimsProofBoundaries || {})
    },
    voiceAndLanguage: {
      ...defaults.voiceAndLanguage,
      ...(savedData.voiceAndLanguage || {})
    },
    visualDNA: {
      ...defaults.visualDNA,
      ...(savedData.visualDNA || {})
    },
    audiences: Array.isArray(savedData.audiences) && savedData.audiences.length > 0 
      ? savedData.audiences 
      : defaults.audiences,
    channels: Array.isArray(savedData.channels) && savedData.channels.length > 0
      ? savedData.channels
      : defaults.channels,
    revisionStandards: Array.isArray(savedData.revisionStandards) && savedData.revisionStandards.length > 0
      ? savedData.revisionStandards
      : defaults.revisionStandards,
    coreEvidence: Array.isArray(savedData.coreEvidence) ? savedData.coreEvidence : defaults.coreEvidence,
    learningInbox: Array.isArray(savedData.learningInbox) ? savedData.learningInbox : defaults.learningInbox
  };

  return merged;
}

// --- Canonical Strategic Authority & Alias Normalization ---

export const CANONICAL_COH_PILLARS = [
  'Climate Tetralogy & Canon',
  'Opera Worlds & Artistic Method',
  'Production & Behind the Work',
  'Documentary, Media & Cultural IP',
  'Partnerships, Sponsorship & Institutional Value',
  'Events, Convenings & Public Moments',
  'Education, Community & Climate Literacy',
  'Team, Leadership & Proof'
] as const;

export type CanonicalCohPillar = (typeof CANONICAL_COH_PILLARS)[number];

export const PILLAR_ALIAS_NORMALIZATION_MAP: Record<string, CanonicalCohPillar> = {
  // Canonical self-mappings (lowercase)
  'climate tetralogy & canon': 'Climate Tetralogy & Canon',
  'opera worlds & artistic method': 'Opera Worlds & Artistic Method',
  'production & behind the work': 'Production & Behind the Work',
  'documentary, media & cultural ip': 'Documentary, Media & Cultural IP',
  'partnerships, sponsorship & institutional value': 'Partnerships, Sponsorship & Institutional Value',
  'events, convenings & public moments': 'Events, Convenings & Public Moments',
  'education, community & climate literacy': 'Education, Community & Climate Literacy',
  'team, leadership & proof': 'Team, Leadership & Proof',
  // Legacy / parallel module aliases normalized to canonical COH pillars
  'the opera & worldbuilding': 'Climate Tetralogy & Canon',
  'the tetralogy & operatic worldbuilding': 'Climate Tetralogy & Canon',
  'cultural durability': 'Climate Tetralogy & Canon',
  'opera production and repertoire': 'Opera Worlds & Artistic Method',
  'artistic vision & cultural world-building': 'Opera Worlds & Artistic Method',
  'behind the creation & craft': 'Production & Behind the Work',
  'artistic process & craft': 'Production & Behind the Work',
  'climate opera as cultural ip': 'Documentary, Media & Cultural IP',
  'documentary and media': 'Documentary, Media & Cultural IP',
  'institutional & sponsor value': 'Partnerships, Sponsorship & Institutional Value',
  'partnerships & coalition': 'Partnerships, Sponsorship & Institutional Value',
  'sponsorship and institutional adoption': 'Partnerships, Sponsorship & Institutional Value',
  'strategic partners': 'Partnerships, Sponsorship & Institutional Value',
  'cultural participation & ritual': 'Events, Convenings & Public Moments',
  'resonance 2027 & milestones': 'Events, Convenings & Public Moments',
  'science & planetary reality': 'Education, Community & Climate Literacy',
  'culture as climate agency': 'Education, Community & Climate Literacy',
  'climate literacy': 'Education, Community & Climate Literacy',
  'education and community': 'Education, Community & Climate Literacy'
};

export function normalizeCohPillar(
  rawPillar?: string | null,
  fallback: CanonicalCohPillar = 'Climate Tetralogy & Canon'
): CanonicalCohPillar {
  if (!rawPillar || typeof rawPillar !== 'string') return fallback;
  const trimmed = rawPillar.trim();
  if (!trimmed || trimmed.toLowerCase() === 'general / custom') return fallback;

  const exactMatch = CANONICAL_COH_PILLARS.find(p => p.toLowerCase() === trimmed.toLowerCase());
  if (exactMatch) return exactMatch;

  const mapped = PILLAR_ALIAS_NORMALIZATION_MAP[trimmed.toLowerCase()];
  if (mapped) return mapped;

  const lower = trimmed.toLowerCase();
  if (/tetralogy|canon|soria moria|nordic air|water dragon|golden fountain|roar to the wind/.test(lower)) {
    return 'Climate Tetralogy & Canon';
  }
  if (/opera world|artistic method|dramaturg|worldbuilding/.test(lower)) {
    return 'Opera Worlds & Artistic Method';
  }
  if (/production|behind|craft|rehearsal|process/.test(lower)) {
    return 'Production & Behind the Work';
  }
  if (/documentary|cultural ip|media|licensing|ip/.test(lower)) {
    return 'Documentary, Media & Cultural IP';
  }
  if (/sponsor|partner|institutional|coalition|patron/.test(lower)) {
    return 'Partnerships, Sponsorship & Institutional Value';
  }
  if (/event|convening|public moment|ritual|milestone|resonance/.test(lower)) {
    return 'Events, Convenings & Public Moments';
  }
  if (/science|planetary|climate literacy|education|community|agency|ecological/.test(lower)) {
    return 'Education, Community & Climate Literacy';
  }
  if (/team|leadership|proof/.test(lower)) {
    return 'Team, Leadership & Proof';
  }

  return fallback;
}

export function inferPillarFromText(rawText: string): CanonicalCohPillar {
  const raw = rawText || '';
  if (/tetralogy|nordic air|water dragon|soria moria|golden fountain|roar to the wind|act |libretto|canon|myth/i.test(raw)) {
    return 'Climate Tetralogy & Canon';
  }
  if (/behind the scenes|rehearsal|composer|craft|process|production/i.test(raw)) {
    return 'Production & Behind the Work';
  }
  if (/documentary|licensing|business model|cultural ip|franchise|broadcast/i.test(raw)) {
    return 'Documentary, Media & Cultural IP';
  }
  if (/sponsor|partner|patron|csr|institution|venue|touring|curatorial/i.test(raw)) {
    return 'Partnerships, Sponsorship & Institutional Value';
  }
  if (/event|convening|symposium|premiere|resonance 2027|ritual|gathering/i.test(raw)) {
    return 'Events, Convenings & Public Moments';
  }
  if (/climate|sustainability|ecological|planetary|science|literacy|education|community|resilience/i.test(raw)) {
    return 'Education, Community & Climate Literacy';
  }
  if (/team|leadership|founder|governance|track record/i.test(raw)) {
    return 'Team, Leadership & Proof';
  }
  if (/opera|artistic|stage|music|worldbuilding/i.test(raw)) {
    return 'Opera Worlds & Artistic Method';
  }
  return 'Documentary, Media & Cultural IP';
}

export function getOperatingCoreAudienceProfiles(operatingCore?: OperatingCore | null): AudienceProfile[] {
  if (operatingCore && Array.isArray(operatingCore.audiences) && operatingCore.audiences.length > 0) {
    return operatingCore.audiences;
  }
  return createDefaultOperatingCore().audiences;
}

export function getAuthoritativeAudiences(operatingCore?: OperatingCore | null): string[] {
  return getOperatingCoreAudienceProfiles(operatingCore).map(a => a.name);
}

export const AUDIENCE_ALIAS_NORMALIZATION_MAP: Record<string, string> = {
  'sponsors & patrons': 'Sponsors and patrons',
  'sponsors / patrons': 'Sponsors and patrons',
  'sponsors and patrons': 'Sponsors and patrons',
  'sponsors & corporate partners': 'Sponsors and patrons',
  'sponsors': 'Sponsors and patrons',
  'patrons': 'Sponsors and patrons',
  'arts patrons': 'Sponsors and patrons',
  'sponsor': 'Sponsors and patrons',
  'cultural institutions': 'Cultural institutions',
  'cultural institution': 'Cultural institutions',
  'cultural institutions & venues': 'Cultural institutions',
  'institutional partners': 'Cultural institutions',
  'institutional partner': 'Cultural institutions',
  'strategic partners': 'Cultural institutions',
  'strategic partner': 'Cultural institutions',
  'opera houses and festivals': 'Opera houses and festivals',
  'cultural institutions & festivals': 'Opera houses and festivals',
  'opera audience': 'Opera houses and festivals',
  'art & opera community': 'Opera houses and festivals',
  'opera house': 'Opera houses and festivals',
  'foundations and arts councils': 'Foundations and arts councils',
  'foundations': 'Foundations and arts councils',
  'arts councils': 'Foundations and arts councils',
  'climate and sustainability leaders': 'Climate and sustainability leaders',
  'climate & sustainability leaders': 'Climate and sustainability leaders',
  'climate, policy & philanthropy leaders': 'Climate and sustainability leaders',
  'media and documentary partners': 'Media and documentary partners',
  'documentary partners': 'Media and documentary partners',
  'education and civic partners': 'Education and civic partners',
  'education & community': 'Education and civic partners',
  'press and journalists': 'Press and journalists',
  'press & media': 'Press and journalists',
  'press / media': 'Press and journalists',
  'media / press': 'Press and journalists',
  'media & journalists': 'Press and journalists',
  'press & cultural journalists': 'Press and journalists',
  'internal team': 'Internal team',
  'general cultural audience': 'General cultural audience',
  'cultural followers': 'General cultural audience',
  'cultural audience': 'General cultural audience',
  'cultural consumers': 'General cultural audience',
  'general public & cultural citizens': 'General cultural audience',
  'general public': 'General cultural audience',
  'skeptics / public': 'General cultural audience'
};

const NON_COH_SEGMENT_PATTERNS = /\b(enterprise|saas|b2b|buyers|crypto|retailers|e-commerce|funnel|churn)\b/i;

function resolveCanonicalTargetInProfiles(
  canonicalName: string,
  profiles: AudienceProfile[]
): string {
  const exact = profiles.find(p => p.name.toLowerCase() === canonicalName.toLowerCase());
  if (exact) return exact.name;

  // If the active OperatingCore mutated the default profile's name, match by id or keyword
  const defaultProfiles = createDefaultOperatingCore().audiences;
  const defaultMatch = defaultProfiles.find(d => d.name.toLowerCase() === canonicalName.toLowerCase());
  if (defaultMatch) {
    const byId = profiles.find(p => p.id === defaultMatch.id);
    if (byId) return byId.name;
  }

  const lower = canonicalName.toLowerCase();
  if (lower.includes('sponsor')) {
    const m = profiles.find(p => /sponsor|patron/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('institution')) {
    const m = profiles.find(p => /institution|venue|partner/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('opera')) {
    const m = profiles.find(p => /opera|festival/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('foundation')) {
    const m = profiles.find(p => /foundation|council/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('climate')) {
    const m = profiles.find(p => /climate|sustainability/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('documentary')) {
    const m = profiles.find(p => /documentary/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('education')) {
    const m = profiles.find(p => /education|civic/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('press')) {
    const m = profiles.find(p => /press|journalist/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('internal')) {
    const m = profiles.find(p => /internal/i.test(p.name));
    if (m) return m.name;
  }
  if (lower.includes('general')) {
    const m = profiles.find(p => /general|cultural audience|public/i.test(p.name));
    if (m) return m.name;
  }

  return canonicalName;
}

export function normalizeOperatingCoreAudience(
  rawAudience?: string | null,
  operatingCore?: OperatingCore | null,
  options?: { preserveExplicitGeneralPublic?: boolean }
): string | undefined {
  if (!rawAudience || typeof rawAudience !== 'string') return undefined;
  const trimmed = rawAudience.trim();
  if (!trimmed) return undefined;

  if (NON_COH_SEGMENT_PATTERNS.test(trimmed)) {
    return undefined;
  }

  if (options?.preserveExplicitGeneralPublic && trimmed.toLowerCase() === 'general public') {
    return 'General Public';
  }

  const profiles = getOperatingCoreAudienceProfiles(operatingCore);
  const lower = trimmed.toLowerCase();

  // 1. Direct match in active Operating Core audience profiles
  const direct = profiles.find(p => p.name.toLowerCase() === lower);
  if (direct) return direct.name;

  // 2. Alias map lookup
  const mappedCanonical = AUDIENCE_ALIAS_NORMALIZATION_MAP[lower];
  if (mappedCanonical) {
    return resolveCanonicalTargetInProfiles(mappedCanonical, profiles);
  }

  // 3. Substring / token match against active Operating Core profiles (including custom profiles)
  for (const profile of profiles) {
    const pLower = profile.name.toLowerCase();
    if (pLower.includes(lower) || lower.includes(pLower)) {
      return profile.name;
    }
    const tokens = pLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 5 && !['general', 'partners', 'leaders', 'audience'].includes(t));
    if (tokens.length > 0 && tokens.some(t => lower.includes(t))) {
      return profile.name;
    }
  }

  return undefined;
}

export function resolveOperatingCoreAudience(
  rawAudience?: string | null,
  operatingCore?: OperatingCore | null,
  fallbackAudience: string = 'General cultural audience',
  options?: { preserveExplicitGeneralPublic?: boolean }
): string {
  const normalized = normalizeOperatingCoreAudience(rawAudience, operatingCore, options);
  if (normalized) return normalized;

  const fallbackNormalized = normalizeOperatingCoreAudience(fallbackAudience, operatingCore, options);
  if (fallbackNormalized) return fallbackNormalized;

  const profiles = getOperatingCoreAudienceProfiles(operatingCore);
  return profiles[profiles.length - 1]?.name || 'General cultural audience';
}

export function inferAudienceFromText(
  rawText: string,
  operatingCore?: OperatingCore | null
): string | undefined {
  if (!rawText || typeof rawText !== 'string') return undefined;
  const raw = rawText.trim();
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  const profiles = getOperatingCoreAudienceProfiles(operatingCore);

  // 1. Check if any active Operating Core audience profile (especially custom or mutated profiles) is directly mentioned
  for (const profile of profiles) {
    const pLower = profile.name.toLowerCase();
    if (lower.includes(pLower)) {
      return profile.name;
    }
  }

  // Check distinctive multi-token custom profiles in operatingCore
  const defaultIds = new Set(createDefaultOperatingCore().audiences.map(a => a.id));
  for (const profile of profiles) {
    if (!defaultIds.has(profile.id)) {
      const tokens = profile.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length >= 4 && !['general', 'partners', 'leaders', 'audience'].includes(t));
      if (tokens.length > 0 && tokens.some(t => lower.includes(t))) {
        return profile.name;
      }
    }
  }

  // 2. Standard natural-language intent patterns mapped to active Operating Core profiles
  if (/opera house|festival|art & opera/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Opera houses and festivals', profiles);
  }
  if (/cultural institution|institutional partner|institution|venue|museum|curatorial|programming/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Cultural institutions', profiles);
  }
  if (/foundation|arts council|philanthrop|grantmaker/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Foundations and arts councils', profiles);
  }
  if (/sponsor|patron|csr|brand partner|funding|investor/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Sponsors and patrons', profiles);
  }
  if (/climate leader|sustainability leader|climate.*leader|policy leader/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Climate and sustainability leaders', profiles);
  }
  if (/documentary partner|media partner|broadcast partner|co-producer/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Media and documentary partners', profiles);
  }
  if (/education|school|university|civic partner|learning/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Education and civic partners', profiles);
  }
  if (/press|journalist|media|critic|editor/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Press and journalists', profiles);
  }
  if (/internal team|internal update|staff/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('Internal team', profiles);
  }
  if (/general public|cultural followers|cultural audience|community|citizen|broad audience|newcomer/i.test(raw)) {
    return resolveCanonicalTargetInProfiles('General cultural audience', profiles);
  }

  return undefined;
}

