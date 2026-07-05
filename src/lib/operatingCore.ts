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

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createDefaultOperatingCore = (): OperatingCore => ({
  active: true,
  version: "v3",
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
      { id: generateId(), title: "Climate is not a theme", rule: "Climate must be treated as a structural condition, not a decorative theme.", enforcement: "Always apply", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Nature is not passive", rule: "Nature should not be treated as a passive backdrop.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Human is not savior", rule: "Humans are not saviors in these narratives.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Protect artistic authority", rule: "Do not dilute the artistic rigor with campaign phrasing.", enforcement: "Always apply", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Completion belongs to the cycle", rule: "Completion belongs to the cycle, not to a single work.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Do not treat live performance as the end product", rule: "Live performance is the origin asset, not the final product.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] },
      { id: generateId(), title: "Every output should support durability", rule: "Every output should support durability, adoption, civic resonance, sponsorship credibility, or long-term asset logic.", enforcement: "Strong guidance", appliesTo: ["All workspaces"] }
    ]
  },
  audiences: [
    {
      id: generateId(), name: "Sponsors and partners",
      caresAbout: "Credibility, unique value, audience reach, cultural relevance",
      mayMisunderstand: "Thinking we are a traditional NGO or standard opera company.",
      proofNeeded: "Institutional adoption, concrete value exchange",
      preferredTone: "Professional, premium, strategic",
      levelOfDetail: "High-level strategic impact",
      avoid: "Over-promising unconfirmed deals, NGO begging language",
      cta: "Schedule a discussion, explore partnership",
      relevantMessages: "Cultural durability, institutional footprint"
    },
    {
      id: generateId(), name: "Cultural institutions",
      caresAbout: "Artistic quality, civic relevance, prestige",
      mayMisunderstand: "Thinking the project is too commercial or activist.",
      proofNeeded: "Artistic rigor, peer institutional validation",
      preferredTone: "Institution-grade, serious, cultural",
      levelOfDetail: "High artistic and operational detail",
      avoid: "Corporate ROI language, startup disruption hype",
      cta: "Review the artistic brief, consider co-production",
      relevantMessages: "Repertoire-based climate canon, civic resonance"
    },
    {
      id: generateId(), name: "Opera houses and festivals",
      caresAbout: "Repertoire fit, production logistics, artistic scale",
      mayMisunderstand: "Thinking the work is an agitprop stunt rather than serious repertoire.",
      proofNeeded: "Scores, creative team pedigree, technical viability",
      preferredTone: "Artistically authoritative, practical",
      levelOfDetail: "High technical and artistic detail",
      avoid: "Marketing fluff, minimizing the complexity of live opera",
      cta: "Request full materials, discuss staging",
      relevantMessages: "New repertoire, touring flexibility"
    },
    {
      id: generateId(), name: "Climate and sustainability leaders",
      caresAbout: "Shifting narratives, reaching new audiences emotionally",
      mayMisunderstand: "Expecting literal policy communication.",
      proofNeeded: "Audience emotional engagement, scale of cultural impact",
      preferredTone: "Grounded, precise, visionary but not naive",
      levelOfDetail: "Medium, focusing on narrative impact",
      avoid: "Preaching to the choir, generic urgency clichés",
      cta: "Join the advisory circle, endorse the cultural approach",
      relevantMessages: "Climate as structural condition, cultural IP"
    },
    {
      id: generateId(), name: "Philanthropists and patrons",
      caresAbout: "Legacy, supporting ambitious cultural shifts",
      mayMisunderstand: "Thinking it's a standard donation rather than building an IP engine.",
      proofNeeded: "Long-term vision, credibility of the team",
      preferredTone: "Respectful, visionary, exclusive",
      levelOfDetail: "Focus on legacy and long-term asset value",
      avoid: "Transactional fundraising, desperation",
      cta: "Become a founding patron",
      relevantMessages: "Building a cultural engine, legacy"
    },
    {
      id: generateId(), name: "Press and media",
      caresAbout: "The 'first of its kind' angle, scale of ambition, cultural crossover",
      mayMisunderstand: "Reducing it to 'opera about global warming'.",
      proofNeeded: "Visuals, talent involved, confirmed dates/venues",
      preferredTone: "Clear, factual, culturally significant",
      levelOfDetail: "Concise facts with strong quotes",
      avoid: "Jargon, unverified claims, overused PR buzzwords",
      cta: "Request interview, download press kit",
      relevantMessages: "Original climate-era operatic worlds"
    },
    {
      id: generateId(), name: "Internal team",
      caresAbout: "Clarity, alignment, next steps",
      mayMisunderstand: "Losing the strategic thread in daily tasks.",
      proofNeeded: "Clear connection between tasks and the Proof Ladder",
      preferredTone: "Direct, supportive, rigorous",
      levelOfDetail: "High operational detail",
      avoid: "Corporate double-speak, vague directives",
      cta: "Execute, review, align",
      relevantMessages: "Current strategic phase focus"
    },
    {
      id: generateId(), name: "General public",
      caresAbout: "Story, emotion, accessibility, spectacle",
      mayMisunderstand: "Thinking opera is too elite or boring.",
      proofNeeded: "Stunning visuals, relatable human consequence",
      preferredTone: "Human, clear, engaging, evocative",
      levelOfDetail: "Broad strokes and emotional hooks",
      avoid: "Heavy jargon, corporate sustainability speak, academic art theory",
      cta: "Learn more, buy tickets, join the list",
      relevantMessages: "The artistic world, emotional experience"
    },
    {
      id: generateId(), name: "Education and civic partners",
      caresAbout: "Community access, educational value, youth engagement",
      mayMisunderstand: "Thinking it's too complex for general audiences.",
      proofNeeded: "Accessibility plans, educational materials",
      preferredTone: "Accessible, welcoming, civic-minded",
      levelOfDetail: "Focus on access and understanding",
      avoid: "Elitist tone, purely commercial framing",
      cta: "Partner for outreach, access educational packs",
      relevantMessages: "Civic resonance, shared cultural memory"
    }
  ],
  channels: [
    {
      id: generateId(), name: "LinkedIn",
      purpose: "Thought leadership and institutional updates",
      typicalStructure: "Hook, context, institutional implication, clear next step",
      lengthGuidance: "Medium (2-3 short paragraphs)",
      toneGuidance: "Professional, institutional, strategic",
      ctaGuidance: "Professional engagement, contact for partnership",
      formattingRules: "Clean spacing, no emojis, clear hierarchy",
      avoid: "Emoji-heavy, overly casual, generic corporate hype"
    },
    {
      id: generateId(), name: "Newsletter",
      purpose: "Deep-dive cultural updates and community building",
      typicalStructure: "Editorial intro, behind-the-scenes, strategic update, clear CTA",
      lengthGuidance: "Medium to Long (500-800 words)",
      toneGuidance: "Culturally premium, insider, visionary",
      ctaGuidance: "Read more, share, support",
      formattingRules: "Editorial layout, strong headers, rich visuals",
      avoid: "Salesy language, desperate tone, purely transactional feel"
    },
    {
      id: generateId(), name: "Website",
      purpose: "The definitive source of truth and primary conversion engine",
      typicalStructure: "Strong headline, clear value prop, proof points, detailed sections",
      lengthGuidance: "Varies by page, generally concise and scannable",
      toneGuidance: "Authoritative, definitive, premium",
      ctaGuidance: "Primary action (Contact, Buy, Learn)",
      formattingRules: "Highly visual, distinct sections, clear typography",
      avoid: "Clutter, burying the lead, generic templates"
    },
    {
      id: generateId(), name: "Internal Teams",
      purpose: "Alignment and operational clarity",
      typicalStructure: "Context, decision/update, required actions",
      lengthGuidance: "Short and direct",
      toneGuidance: "Clear, collaborative, rigorous",
      ctaGuidance: "Specific operational tasks",
      formattingRules: "Bullet points, bold key terms",
      avoid: "Corporate fluff, ambiguity"
    },
    {
      id: generateId(), name: "Sponsor email",
      purpose: "Initiate or advance high-value partnerships",
      typicalStructure: "Personalized hook, core value prop, specific ask/next step",
      lengthGuidance: "Short (1-2 paragraphs max)",
      toneGuidance: "Respectful, peer-to-peer, strategic",
      ctaGuidance: "A brief call or meeting",
      formattingRules: "Standard email, highly readable",
      avoid: "Mass-email feel, begging, over-explaining the art"
    },
    {
      id: generateId(), name: "WhatsApp",
      purpose: "Direct connection with partners",
      typicalStructure: "Greeting, concise core message, single question/CTA",
      lengthGuidance: "Short (1-2 paragraphs)",
      toneGuidance: "Human, respectful, warm",
      ctaGuidance: "Simple conversational reply prompt",
      formattingRules: "Mobile optimized, very short lines",
      avoid: "Generic corporate language, long introductions, email subject lines"
    },
    {
      id: generateId(), name: "Event copy",
      purpose: "Drive attendance and set expectations",
      typicalStructure: "What/When/Where, Why it matters, Who should attend",
      lengthGuidance: "Short, punchy",
      toneGuidance: "Anticipatory, exclusive, clear",
      ctaGuidance: "RSVP, Buy Tickets",
      formattingRules: "Scannable details",
      avoid: "Vague logistics, over-hyping without substance"
    },
    {
      id: generateId(), name: "Press/media note",
      purpose: "Provide journalists with clear, accurate narrative angles",
      typicalStructure: "Headline, Lead paragraph (Who/What/When), Core Distinction, Quotes",
      lengthGuidance: "Standard press release length (400-600 words)",
      toneGuidance: "Factual, culturally significant, objective",
      ctaGuidance: "Contact for interviews/assets",
      formattingRules: "Standard press format, easily copy-pasteable",
      avoid: "Marketing adjectives, unsupported claims"
    },
    {
      id: generateId(), name: "Visual direction",
      purpose: "Briefing photographers, designers, or AI generators",
      typicalStructure: "Atmosphere, Subject, Composition, Lighting, Exclusions",
      lengthGuidance: "Bullet points",
      toneGuidance: "Descriptive, precise",
      ctaGuidance: "N/A",
      formattingRules: "Clear lists",
      avoid: "Vague artistic terms without concrete grounding"
    }
  ],
  claimsProofBoundaries: {
    claims: [
      { id: generateId(), type: 'Approved', text: 'COH creates original climate-era operatic worlds.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Approved', text: 'COH treats live opera as an origin asset for cultural, institutional, sponsorship, content, and IP value.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Approved', text: 'COH is building toward a repertoire-based climate canon.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Approved', text: 'COH treats climate as a structural condition, not a decorative theme.', enforcement: 'Always apply' },
      { id: generateId(), type: 'Requires proof', text: 'confirmed sponsors', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'confirmed institutional adoption', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'audience numbers', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'media partnerships', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'distribution deals', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'production dates if not locked', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'financial commitments', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Requires proof', text: 'commercial traction', enforcement: 'Warn if violated' },
      { id: generateId(), type: 'Aspirational', text: 'global canon', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'long-term institutional adoption', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'touring', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'documentary distribution', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'immersive or gaming expansion', enforcement: 'Reference only' },
      { id: generateId(), type: 'Aspirational', text: 'recurring licensing', enforcement: 'Reference only' },
      { id: generateId(), type: 'Forbidden', text: 'world-leading unless externally validated', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'confirmed partner unless signed', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'guaranteed impact', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'saving the planet', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'generic climate movement language', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'overstated commercial traction', enforcement: 'Always apply' },
      { id: generateId(), type: 'Forbidden', text: 'aspiration presented as fact', enforcement: 'Always apply' }
    ],
    proofPoints: "London as proof of delivery and asset creation.",
    overstatementWarnings: "Avoid claiming we have single-handedly changed the climate discourse.",
    claimStyleRules: "State facts neutrally and powerfully. Let the artistic ambition speak for itself."
  },
  voiceAndLanguage: {
    overallTone: "Serious, precise, human, culturally intelligent, institution-grade.",
    writingStyle: "precise cultural language, human consequence, structural clarity, measured ambition, institutional seriousness, emotional depth without sentimentality, commercial clarity when sponsor-facing",
    sentenceRhythm: "Varied, punchy, declarative.",
    preferredPhrases: ["structural condition", "origin asset", "repertoire-based", "cultural durability"],
    avoidPhrases: ["corporate innovation language", "NGO campaign phrasing", "generic climate urgency", "startup hype", "overexplaining", "inflated adjectives", "generic 'join the movement' language"],
    aiPhrasesToAvoid: ["now more than ever", "in a world where", "it's important to remember", "a testament to", "AI-polished rhythm", "em dashes"],
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
    visualClichesToAvoid: "Generic green leaves, protest signs, melting planet, disaster imagery, stock-photo handshakes, childish cartoon style, decorative climate icons, empty futuristic AI aesthetics.",
    imagePromptRules: "The image should feel like cultural world-building, not climate marketing.",
    formatAspectPreferences: "16:9 for narrative, 4:5 for social portraits.",
    negativePromptRules: "cartoon, illustration, 3d render, low quality, bad anatomy, text, watermark, generic stock photo"
  },
  revisionStandards: [
    { id: generateId(), action: "Sharper", does: "Remove repetition, tighten logic, make the strategic point clearer.", avoids: "Fluff, unnecessary adjectives.", whenToUse: "When copy feels too loose or academic.", exampleGuidance: "", appliesTo: "All workspaces" },
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
  if (!core || !core.active) {
    return "OPERATING CORE: INACTIVE";
  }

  const sections: string[] = ["--- COH OPERATING CORE INSTRUCTIONS ---"];

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

  return sections.join('\\n');
}
