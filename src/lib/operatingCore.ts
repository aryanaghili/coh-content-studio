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

export interface CompileContext {
  workspace: 'Simple Mode' | 'Quick Create' | 'Advanced Brief' | 'Ideation Workspace' | 'Revision Studio' | 'Visual Studio';
  channel?: string;
  audience?: string;
  format?: string;
  action?: string;
}

export function compileOperatingCoreContext(core: OperatingCore | null, context: CompileContext, appliedDocs: CoreDocument[] = []): string {
  // Always include the Protected Kernel at the very top.
  const sections: string[] = [
    PROTECTED_COH_KERNEL
  ];

  if (!core || !core.active) {
    return sections.join('\n');
  }

  sections.push("--- OPERATING CORE CONTEXT ---");

  // Core Passport is injected for most workspaces
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Ideation Workspace', 'Revision Studio'].includes(context.workspace)) {
    sections.push(`
CORE PASSPORT (IDENTITY LAYER):
- Organization: ${core.corePassport.organizationName} (${core.corePassport.category})
- Definition: ${core.corePassport.oneLineDefinition}
- Distinction: ${core.corePassport.coreDistinction}
- Operating Logic: ${core.corePassport.operatingLogic}
- Phase: ${core.corePassport.currentStrategicPhase}
- Strategic Priorities: ${core.corePassport.primaryStrategicPriorities}
- Posture: ${core.corePassport.defaultCommunicationPosture}
- NEVER COLLAPSE INTO: ${core.corePassport.neverCollapseInto}`);
  }

  // Strategy Kernel
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Ideation Workspace'].includes(context.workspace)) {
    sections.push(`
STRATEGY KERNEL:
- Positioning: ${core.strategyKernel.positioning}
- Ambition: ${core.strategyKernel.strategicAmbition}
- Value Prop: ${core.strategyKernel.valueProposition}
- Proof Ladder: ${core.strategyKernel.proofLadder}`);

    if (core.strategyKernel.internalLaw.length > 0) {
      const laws = core.strategyKernel.internalLaw
        .filter(law => law.appliesTo.includes('All workspaces') || law.appliesTo.includes('Content generation') || law.appliesTo.includes('Ideation Workspace'))
        .map(law => `- [${law.enforcement.toUpperCase()}] ${law.title}: ${law.rule}`)
        .join('\n');
      if (laws) {
        sections.push(`\nINTERNAL LAW (NON-NEGOTIABLES):\n${laws}`);
      }
    }
  }

  // Audience Logic
  if (context.audience) {
    const audienceMatch = core.audiences.find(a => a.name.toLowerCase() === context.audience?.toLowerCase());
    if (audienceMatch) {
      sections.push(`
AUDIENCE TARGET: ${audienceMatch.name}
- Cares About: ${audienceMatch.caresAbout}
- Proof Needed: ${audienceMatch.proofNeeded}
- Tone preference: ${audienceMatch.preferredTone}
- Level of Detail: ${audienceMatch.levelOfDetail}
- CTA: ${audienceMatch.cta}
- Avoid: ${audienceMatch.avoid}`);
    }
  }

  // Channel Rules
  if (context.channel) {
    const channelMatch = core.channels.find(c => c.name.toLowerCase() === context.channel?.toLowerCase());
    if (channelMatch) {
      sections.push(`
CHANNEL RULES: ${channelMatch.name}
- Purpose: ${channelMatch.purpose}
- Typical Structure: ${channelMatch.typicalStructure}
- Tone Guidance: ${channelMatch.toneGuidance}
- Formatting Rules: ${channelMatch.formattingRules}
- Avoid: ${channelMatch.avoid}`);
    }
  }

  // Claim boundaries
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision Studio', 'Ideation Workspace'].includes(context.workspace)) {
    const approved = core.claimsProofBoundaries.claims.filter(c => c.type === 'Approved').map(c => `- ${c.text}`).join('\n');
    const requiresProof = core.claimsProofBoundaries.claims.filter(c => c.type === 'Requires proof').map(c => `- ${c.text}`).join('\n');
    const forbidden = core.claimsProofBoundaries.claims.filter(c => c.type === 'Forbidden').map(c => `- ${c.text}`).join('\n');
    
    if (approved || requiresProof || forbidden) {
      sections.push(`\nCLAIMS & PROOF BOUNDARIES:`);
      sections.push(`OVERSTATEMENT WARNING: ${core.claimsProofBoundaries.overstatementWarnings}`);
      sections.push(`STYLE RULES: ${core.claimsProofBoundaries.claimStyleRules}`);
      if (approved) sections.push(`APPROVED CLAIMS:\n${approved}`);
      if (requiresProof) sections.push(`REQUIRES PROOF:\n${requiresProof}`);
      if (forbidden) sections.push(`FORBIDDEN CLAIMS (CRITICAL):\n${forbidden}`);
    }
  }

  // Voice & Language applies to all text generation
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision Studio'].includes(context.workspace)) {
    sections.push(`
VOICE & LANGUAGE:
- Overall Tone: ${core.voiceAndLanguage.overallTone}
- Writing Style: ${core.voiceAndLanguage.writingStyle}
- Founder Notes: ${core.voiceAndLanguage.founderVoiceNotes}`);
    
    if (core.voiceAndLanguage.avoidPhrases.length > 0) {
      sections.push(`- WORDS/PHRASES TO AVOID: ${core.voiceAndLanguage.avoidPhrases.join(', ')}`);
    }
    if (core.voiceAndLanguage.aiPhrasesToAvoid.length > 0) {
      sections.push(`- AI SYNTAX TO AVOID: ${core.voiceAndLanguage.aiPhrasesToAvoid.join(', ')}`);
    }
  }

  // Revision specific
  if (context.workspace === 'Revision Studio' && context.action) {
    const revMatch = core.revisionStandards.find(r => r.action === context.action || r.id === context.action);
    if (revMatch) {
      sections.push(`
REVISION STANDARD TO APPLY: ${revMatch.action}
- What this revision does: ${revMatch.does}
- What it avoids: ${revMatch.avoids}`);
    }
  }

  // Visual specific
  if (context.workspace === 'Visual Studio') {
    sections.push(`
VISUAL DNA:
- Visual Atmosphere: ${core.visualDNA.visualAtmosphere}
- Photography Style: ${core.visualDNA.photographyStyle}
- Principle: ${core.visualDNA.imagePromptRules}
- CLICHES TO AVOID (CRITICAL): ${core.visualDNA.visualClichesToAvoid}`);
  }

  return sections.join('\n');
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
