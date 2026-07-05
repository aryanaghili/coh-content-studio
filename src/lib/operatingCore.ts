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
  learningInbox: any[];
}

// --------------------------------------------------
// PROTECTED COH FOUNDATION
// --------------------------------------------------
export const protectedCohFoundation = `
PROTECTED COH FOUNDATION (NON-NEGOTIABLE IDENTITY):
This app is Climate Opera Haus Content Studio. It is built specifically for COH, not as a generic multi-business content tool. COH is a climate-era cultural IP and opera-based content venture.

NON-NEGOTIABLE BOUNDARIES:
- COH is not a generic climate campaign.
- COH is not NGO communication.
- COH is not a conventional opera production company.
- COH is not an ESG content brand.
- COH is not an event brand.

CORE STRATEGIC GUARDRAILS:
- Climate is not a decorative theme. It is treated as the structural condition of the century.
- Nature is not a passive metaphor.
- Human figures are not saviors or masters.
- The work must protect artistic authority.
- Outputs should not collapse into generic activism, shallow ESG language, corporate innovation language, or climate clichés.

CLAIM SAFETY:
- Do not invent confirmed sponsors, partners, dates, audience numbers, financial commitments, media partnerships, or distribution deals.
- Distinguish proof, ambition, and future pathway.
- Claims requiring proof must be phrased carefully.

VISUAL SAFETY:
- Avoid generic green leaves.
- Avoid protest clichés.
- Avoid disaster imagery.
- Avoid melting earth imagery.
- Avoid corporate stock-photo aesthetics.
- Avoid cartoonish imagery unless explicitly requested.
- Visuals should feel like cultural world-building, not climate marketing.

WRITING CLEANLINESS:
- Avoid em dashes unless explicitly requested.
- Avoid AI-polished generic phrasing.
- Avoid empty corporate phrases.
- Avoid formulaic transitions.
`;

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createDefaultOperatingCore = (): OperatingCore => ({
  active: true,
  version: "v4",
  lastUpdated: new Date().toISOString(),
  corePassport: {
    organizationName: "Climate Opera Haus",
    category: "Climate-era cultural IP and opera-based content venture",
    oneLineDefinition: "COH creates original climate-era operatic worlds and turns them into cultural, institutional, sponsorship, content, and IP assets.",
    whatWeAreNot: "COH is not a generic climate campaign, NGO communication project, ESG content brand, event brand, or conventional opera production company.",
    coreDistinction: "COH treats climate as the structural condition of the century and uses opera to build serious cultural worlds that can repeat, travel, and accumulate meaning.",
    operatingLogic: "Live opera creates the world. Filming captures it. Documentary and content monetize it. Sponsors finance and elevate it. Institutions license, host, and extend it.",
    currentStrategicPhase: "Moving from proof of attention and legitimacy toward proof of delivery, capture, adoption readiness, and repeatability.",
    primaryStrategicPriorities: "Cultural durability, institutional adoption, civic resonance, sponsorship credibility, long-term content/IP logic, London delivery, capture, and adoption readiness.",
    defaultCommunicationPosture: "Serious, cultural, precise, human, institution-grade, artistically authoritative, commercially coherent.",
    neverCollapseInto: "Generic climate activism, corporate ESG language, shallow event marketing, disaster clichés, decorative green aesthetics, startup hype, or charity-style fundraising language."
  },
  strategyKernel: {
    positioning: "COH is a climate-era cultural IP venture using opera as the origin asset for a wider content, institutional, sponsorship, and rights ecosystem.",
    strategicAmbition: "Build a repertoire-based climate canon designed to repeat, travel, and accumulate cultural meaning over time.",
    valueProposition: "COH gives partners, institutions, and audiences access to rare, ownable, culturally differentiated climate-era content with artistic authority and long-term asset value.",
    proofLadder: "COP30 = proof of attention and legitimacy.\\nLondon = proof of delivery, capture, and productization.\\nPost-London = proof of adoption and repeatability.",
    internalLaw: [
      { id: generateId(), title: "Climate is not a theme", rule: "Climate is not a theme.", enforcement: "Always apply", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Nature is not passive", rule: "Nature is not passive.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Human is not savior", rule: "Human is not savior.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Protect artistic authority", rule: "Protect artistic authority.", enforcement: "Always apply", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Completion belongs to the cycle", rule: "Completion belongs to the cycle, not to a single work.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Do not treat live performance as the end product", rule: "Do not treat live performance as the end product.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Every output should support durability", rule: "Every output should support durability, adoption, civic resonance, sponsorship credibility, or long-term asset logic.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] }
    ]
  },
  audiences: [
    {
      id: generateId(), name: "Sponsors and partners",
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
      id: generateId(), name: "Climate and sustainability leaders",
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
      id: generateId(), name: "Philanthropists and patrons",
      caresAbout: "Legacy, cultural contribution, mission alignment, and supporting work that lasts.",
      mayMisunderstand: "Thinking COH is short-term arts funding.",
      proofNeeded: "Durability, artistic credibility, and long-term cultural value.",
      preferredTone: "Personal, meaningful, refined, not transactional.",
      levelOfDetail: "Focus on legacy and long-term asset value",
      avoid: "Transactional fundraising, desperation",
      cta: "Explore patron role in building the canon.",
      relevantMessages: "Building a cultural engine, legacy"
    },
    {
      id: generateId(), name: "Press and media",
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
      id: generateId(), name: "General public",
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
      id: generateId(), name: "Education and civic partners",
      caresAbout: "Learning value, public dialogue, youth relevance, civic meaning, and accessibility.",
      mayMisunderstand: "Thinking COH is only performance.",
      proofNeeded: "Formats that translate performance into dialogue and learning.",
      preferredTone: "Clear, accessible, serious, constructive.",
      levelOfDetail: "Focus on access and understanding",
      avoid: "Elitist tone, purely commercial framing",
      cta: "Explore learning/public program collaboration.",
      relevantMessages: "Civic resonance, shared cultural memory"
    }
  ],
  channels: [
    {
      id: generateId(), name: "LinkedIn",
      purpose: "Thought leadership, credibility, updates, and institutional narrative.",
      typicalStructure: "Sharp opening, strategic point, concrete proof or insight, clean close.",
      lengthGuidance: "Medium (2-3 short paragraphs)",
      toneGuidance: "Thoughtful, precise, human, serious.",
      ctaGuidance: "Professional engagement, contact for partnership",
      formattingRules: "Clean spacing, no emojis, clear hierarchy",
      avoid: "Hype, generic leadership language, excessive hashtags, motivational clichés."
    },
    {
      id: generateId(), name: "Newsletter",
      purpose: "Deeper narrative and public engagement.",
      typicalStructure: "Scene or insight, context, meaning, invitation.",
      lengthGuidance: "Medium to Long (500-800 words)",
      toneGuidance: "Warm, editorial, intelligent.",
      ctaGuidance: "Read more, share, support",
      formattingRules: "Editorial layout, strong headers, rich visuals",
      avoid: "Overexplaining, generic climate action language, NGO-style calls."
    },
    {
      id: generateId(), name: "Website",
      purpose: "High-trust positioning and conversion.",
      typicalStructure: "Clear proposition, distinction, proof, value exchange, next step.",
      lengthGuidance: "Varies by page, generally concise and scannable",
      toneGuidance: "Refined, structural, credible.",
      ctaGuidance: "Primary action (Contact, Buy, Learn)",
      formattingRules: "Highly visual, distinct sections, clear typography",
      avoid: "Vague poetry without functional meaning."
    },
    {
      id: generateId(), name: "Internal Teams",
      purpose: "Alignment and action.",
      typicalStructure: "What changed, why it matters, what is needed next.",
      lengthGuidance: "Short and direct",
      toneGuidance: "Direct, practical, human.",
      ctaGuidance: "Specific operational tasks",
      formattingRules: "Bullet points, bold key terms",
      avoid: "Long strategic essays."
    },
    {
      id: generateId(), name: "Sponsor email",
      purpose: "Open or advance a serious commercial conversation.",
      typicalStructure: "Personal relevance, COH context, why this partner, value exchange, soft next step.",
      lengthGuidance: "Short (1-2 paragraphs max)",
      toneGuidance: "Respectful, premium, commercially clear.",
      ctaGuidance: "A brief call or meeting",
      formattingRules: "Standard email, highly readable",
      avoid: "Begging, charity framing, generic sponsorship language."
    },
    {
      id: generateId(), name: "WhatsApp",
      purpose: "Fast human follow-up.",
      typicalStructure: "Short context, clear ask, warm close.",
      lengthGuidance: "Short (1-2 paragraphs)",
      toneGuidance: "Natural, concise, human.",
      ctaGuidance: "Simple conversational reply prompt",
      formattingRules: "Mobile optimized, very short lines",
      avoid: "Formal paragraphs, heavy strategy language."
    },
    {
      id: generateId(), name: "Event copy",
      purpose: "Describe the moment and invite participation.",
      typicalStructure: "What it is, why it matters, who it is for, what to do.",
      lengthGuidance: "Short, punchy",
      toneGuidance: "Elegant, clear, inviting.",
      ctaGuidance: "RSVP, Buy Tickets",
      formattingRules: "Scannable details",
      avoid: "Generic event promotion."
    },
    {
      id: generateId(), name: "Press/media note",
      purpose: "Make the story legible.",
      typicalStructure: "News angle, context, quote-ready idea, proof, contact.",
      lengthGuidance: "Standard press release length (400-600 words)",
      toneGuidance: "Clear, non-hype, media-friendly.",
      ctaGuidance: "Contact for interviews/assets",
      formattingRules: "Standard press format, easily copy-pasteable",
      avoid: "Internal jargon."
    },
    {
      id: generateId(), name: "Visual direction",
      purpose: "Translate strategy into imagery.",
      typicalStructure: "Concept, atmosphere, composition, style, avoid-list.",
      lengthGuidance: "Bullet points",
      toneGuidance: "Concise, visual, specific.",
      ctaGuidance: "N/A",
      formattingRules: "Clear lists",
      avoid: "Vague aesthetic adjectives without concrete direction."
    }
  ],
  claimsProofBoundaries: {
    claims: [
      { id: generateId(), type: 'Approved', text: 'COH creates original climate-era operatic worlds.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Approved', text: 'COH treats live opera as an origin asset for cultural, institutional, sponsorship, content, and IP value.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Approved', text: 'COH is building toward a repertoire-based climate canon.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Approved', text: 'COH treats climate as a structural condition, not a decorative theme.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Approved', text: 'COH connects artistic authority, cultural relevance, institutional adoption, and long-term content/IP logic.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Requires proof', text: 'confirmed sponsors', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'confirmed institutional adoption', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'audience numbers', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'media partnerships', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'distribution deals', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'production dates if not locked', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'financial commitments', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'commercial traction', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'named institutional interest', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'confirmed touring plans', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Aspirational', text: 'global canon', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'long-term institutional adoption', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'touring', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'documentary distribution', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'immersive/gaming expansion', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'recurring licensing', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'international repertoire placement', enforcement: 'Reference only' },
      { id: generateId(), type: 'Forbidden', text: 'world-leading unless externally validated', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'confirmed partner unless signed', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'guaranteed impact', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'saving the planet', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'generic climate movement language', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'overstated commercial traction', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'aspiration presented as fact', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'claiming cultural transformation without mechanism', enforcement: 'Always apply' }
    ],
    proofPoints: "London as proof of delivery and asset creation.",
    overstatementWarnings: "Separate proof from ambition. Use “designed to,” “built to,” “aims to,” or “creates the conditions for” when discussing future pathways. Use specific proof points only when available. Avoid inflated certainty.",
    claimStyleRules: "State facts neutrally and powerfully. Let the artistic ambition speak for itself."
  },
  voiceAndLanguage: {
    overallTone: "Serious, precise, human, culturally intelligent, institution-grade.",
    writingStyle: "precise cultural language, human consequence, structural clarity, measured ambition, institutional seriousness, emotional depth without sentimentality, commercial clarity when sponsor-facing",
    sentenceRhythm: "clean and direct sentence rhythm.",
    preferredPhrases: ["structural condition", "origin asset", "repertoire-based", "cultural durability"],
    avoidPhrases: ["corporate innovation language", "NGO campaign phrasing", "generic climate urgency", "startup hype", "overexplaining", "inflated adjectives", "generic 'join the movement' language", "unlock potential", "drive impact", "game-changing", "cutting-edge", "transformative journey"],
    aiPhrasesToAvoid: ["now more than ever", "in a world where", "it's important to remember", "a testament to", "AI-polished rhythm", "em dashes", "overly polished transitions", "formulaic AI phrasing"],
    formalityLevel: "High-end but accessible",
    emotionalIntensity: "Restrained but charged",
    founderVoiceNotes: "Authoritative but not arrogant.",
    cleanWritingRules: "No em dashes or AI-style long dash characters unless explicitly requested."
  },
  visualDNA: {
    visualAtmosphere: "Cinematic, elemental, atmospheric, editorial, serious, culturally premium.",
    mood: "Charged, anticipatory, grave but beautiful.",
    compositionPrinciples: "Clean, intentional, not overly busy, high contrast.",
    colorMaterialDirection: "Elemental tones: deep water, earth, fire, air. Organic textures.",
    photographyStyle: "Stage worlds, elemental systems, human listening and decision moments, institutional spaces, landscapes with atmosphere, mythic realism, cultural memory, production and capture logic.",
    typographyNotes: "Serif for authority, clean sans-serif for utility.",
    visualSymbolsToUseCarefully: "Nature motifs (use only when integrated, not pasted on).",
    visualClichesToAvoid: "Generic green leaves, protest signs, melting planet, disaster imagery, stock-photo handshakes, childish cartoon style, decorative climate icons, empty futuristic AI aesthetics, cartoon climate symbols, exaggerated apocalypse imagery.",
    imagePromptRules: "The image should feel like cultural world-building, not climate marketing.",
    formatAspectPreferences: "16:9 for narrative, 4:5 for social portraits.",
    negativePromptRules: "cartoon, illustration, 3d render, low quality, bad anatomy, text, watermark, generic stock photo"
  },
  revisionStandards: [
    { id: generateId(), action: "Sharper", does: "Remove repetition, tighten logic, and make the strategic point clearer.", avoids: "Fluff, unnecessary adjectives.", whenToUse: "When copy feels too loose or academic.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "More human", does: "Improve rhythm, warmth, and naturalness without becoming casual or weak.", avoids: "Corporate speak, robotic transitions.", whenToUse: "When copy feels too cold or institutional.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "More institutional", does: "Increase seriousness, credibility, and adoption logic. Reduce campaign language.", avoids: "Casual slang, overdramatic claims, startup hype.", whenToUse: "When writing for sponsors or formal partners.", exampleGuidance: "", appliesTo: "Sponsor-facing outputs" },
    { id: generateId(), action: "More sponsor-facing", does: "Clarify value exchange, partner relevance, credibility, and why the partner should care.", avoids: "Burying the lead, purely artistic self-indulgence.", whenToUse: "When the primary goal is funding or partnership.", exampleGuidance: "", appliesTo: "Sponsor-facing outputs" },
    { id: generateId(), action: "Less corporate", does: "Remove jargon, inflated phrases, and empty business language.", avoids: "Synergy, impact-driven, leveraging assets.", whenToUse: "When the text feels like a generic B2B press release.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Less NGO-like", does: "Remove moralizing, awareness-first language, and generic climate action framing.", avoids: "Save the planet, urgent crisis, we must act now.", whenToUse: "When the text sounds like a charity appeal.", exampleGuidance: "", appliesTo: "All workspaces" },
    { id: generateId(), action: "Cleaner from AI-style characters", does: "Remove em dashes, zero-width characters, curly quotes if needed, overly polished transitions, and formulaic AI phrasing.", avoids: "AI-style syntax.", whenToUse: "As a final polish step.", exampleGuidance: "", appliesTo: "All workspaces" }
  ],
  learningInbox: []
});

export interface CompileContext {
  workspace: 'Simple Mode' | 'Quick Create' | 'Advanced Brief' | 'Ideation Workspace' | 'Revision Studio' | 'Visual Studio';
  channel?: string;
  audience?: string;
  format?: string;
  action?: string;
}

export function compileOperatingCoreContext(core: OperatingCore | null, context: CompileContext): string {
  // If core is completely null, just return foundation.
  // If core is inactive, return ONLY foundation.
  
  if (!core || !core.active) {
    return protectedCohFoundation;
  }

  const sections: string[] = [
    "--- COH OPERATING CORE INSTRUCTIONS ---",
    protectedCohFoundation
  ];

  // Core Passport is injected for most workspaces
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Ideation Workspace', 'Revision Studio'].includes(context.workspace)) {
    sections.push(`
CORE PASSPORT (IDENTITY LAYER):
- Organization: ${core.corePassport.organizationName} (${core.corePassport.category})
- Definition: ${core.corePassport.oneLineDefinition}
- Distinction: ${core.corePassport.coreDistinction}
- Phase: ${core.corePassport.currentStrategicPhase}
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
- Proof Ladder: ${core.strategyKernel.proofLadder.replace(/\\n/g, ' -> ')}`);

    if (core.strategyKernel.internalLaw.length > 0) {
      const laws = core.strategyKernel.internalLaw
        .filter(law => law.appliesTo.includes('All workspaces') || law.appliesTo.includes('Content generation') || law.appliesTo.includes('Ideation Workspace'))
        .map(law => `- [${law.enforcement.toUpperCase()}] ${law.title}: ${law.rule}`)
        .join('\\n');
      if (laws) {
        sections.push(`\\nINTERNAL LAW (NON-NEGOTIABLES):\\n${laws}`);
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
- Avoid: ${audienceMatch.avoid}`);
    }
  }

  // Channel Rules
  if (context.channel) {
    const channelMatch = core.channels.find(c => c.name.toLowerCase() === context.channel?.toLowerCase());
    if (channelMatch) {
      sections.push(`
CHANNEL RULES: ${channelMatch.name}
- Typical Structure: ${channelMatch.typicalStructure}
- Tone Guidance: ${channelMatch.toneGuidance}
- Formatting Rules: ${channelMatch.formattingRules}
- Avoid: ${channelMatch.avoid}`);
    }
  }

  // Claim boundaries
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision Studio', 'Ideation Workspace'].includes(context.workspace)) {
    const approved = core.claimsProofBoundaries.claims.filter(c => c.type === 'Approved').map(c => `- ${c.text}`).join('\\n');
    const requiresProof = core.claimsProofBoundaries.claims.filter(c => c.type === 'Requires proof').map(c => `- ${c.text}`).join('\\n');
    const forbidden = core.claimsProofBoundaries.claims.filter(c => c.type === 'Forbidden').map(c => `- ${c.text}`).join('\\n');
    
    if (approved || requiresProof || forbidden) {
      sections.push(`\\nCLAIMS & PROOF BOUNDARIES:`);
      if (approved) sections.push(`APPROVED CLAIMS:\\n${approved}`);
      if (requiresProof) sections.push(`REQUIRES PROOF:\\n${requiresProof}`);
      if (forbidden) sections.push(`FORBIDDEN CLAIMS (CRITICAL):\\n${forbidden}`);
    }
  }

  // Voice & Language applies to all text generation
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision Studio'].includes(context.workspace)) {
    sections.push(`
VOICE & LANGUAGE:
- Overall Tone: ${core.voiceAndLanguage.overallTone}
- Writing Style: ${core.voiceAndLanguage.writingStyle}`);
    
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

  sections.push(`
PRIORITY ORDER FOR COMPILER:
1. Protected COH Foundation
2. Operating Core claim boundaries and internal law
3. Operating Core audience logic
4. Operating Core channel rules
5. User request
6. Source/context material
7. Creative generation`);

  return sections.join('\\n');
}
