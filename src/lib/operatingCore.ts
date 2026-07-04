export type EnforcementLevel = 'Always apply' | 'Strong guidance' | 'Warn if violated' | 'Reference only';

export type AppliesTo = 'All workspaces' | 'Content generation' | 'Ideation' | 'Revision' | 'Visual Studio' | 'Sponsor-facing outputs' | 'Public-facing outputs' | 'Internal outputs';

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
  proofRequirement: string;
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

export interface OperatingCore {
  active: boolean;
  version: string;
  lastUpdated: string;
  coreStrategy: {
    definition: string;
    whatWeAreNot: string;
    categoryPositioning: string;
    strategicAmbition: string;
    valueProposition: string;
    internalLaw: RuleCard[];
    priorities: string[];
    currentFocus: string;
  };
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
  version: "v2",
  lastUpdated: new Date().toISOString(),
  coreStrategy: {
    definition: "COH is a cultural engine for climate transition. COH creates original climate-era operatic worlds.",
    whatWeAreNot: "COH is not a generic climate campaign, event brand, NGO campaign, ESG communication project, or conventional opera production company.",
    categoryPositioning: "A repertoire-based climate canon.",
    strategicAmbition: "Building long-term content and IP logic, starting with live opera.",
    valueProposition: "Live opera as the origin asset for wider cultural, institutional, sponsorship, content, and IP value.",
    internalLaw: [
      {
        id: generateId(),
        title: "Climate is not a theme",
        rule: "Climate must be treated as the structural condition of the century, not as decoration or campaign messaging.",
        enforcement: "Always apply",
        appliesTo: ["All workspaces"]
      },
      {
        id: generateId(),
        title: "Nature is not passive",
        rule: "Nature can be treated as an active subject with agency, memory, and consequence.",
        enforcement: "Strong guidance",
        appliesTo: ["Content generation", "Ideation", "Visual Studio"]
      },
      {
        id: generateId(),
        title: "Human is not savior",
        rule: "Human figures should not be framed as masters or saviors of the system. They should be listeners, ethical testers, learners, or decision-makers.",
        enforcement: "Strong guidance",
        appliesTo: ["Content generation", "Visual Studio", "Revision"]
      },
      {
        id: generateId(),
        title: "Protect artistic authority",
        rule: "COH communication should not collapse into generic activism, NGO language, shallow ESG wording, or campaign slogans.",
        enforcement: "Always apply",
        appliesTo: ["All workspaces"]
      }
    ],
    priorities: [
      "Cultural durability",
      "Institutional adoption",
      "Civic resonance",
      "Sponsorship credibility",
      "Long-term content/IP logic",
      "London as proof of delivery and asset creation",
      "Future adoption and repeatability"
    ],
    currentFocus: "Establishing cultural authority and securing institutional partners."
  },
  audiences: [
    {
      id: generateId(),
      name: "Sponsors and partners",
      caresAbout: "Credibility, unique value, audience reach, cultural relevance",
      proofNeeded: "Institutional adoption, concrete value exchange",
      preferredTone: "Professional, premium, strategic",
      levelOfDetail: "High-level strategic impact",
      avoid: "Over-promising unconfirmed deals, NGO begging language",
      cta: "Schedule a discussion, explore partnership",
      relevantMessages: "Cultural durability, institutional footprint"
    },
    {
      id: generateId(),
      name: "General public",
      caresAbout: "Story, emotion, accessibility",
      proofNeeded: "Relatable themes, accessible language",
      preferredTone: "Human, clear, engaging",
      levelOfDetail: "Evocative and broad",
      avoid: "Heavy jargon, corporate sustainability speak",
      cta: "Learn more, buy tickets, join the list",
      relevantMessages: "The artistic world, emotional experience"
    }
  ],
  channels: [
    {
      id: generateId(),
      name: "LinkedIn",
      purpose: "Thought leadership and institutional updates",
      typicalStructure: "Hook, context, institutional implication, clear next step",
      lengthGuidance: "Medium (2-3 short paragraphs)",
      toneGuidance: "Professional, institutional, strategic",
      ctaGuidance: "Professional engagement, contact for partnership",
      formattingRules: "Clean spacing, no emojis, clear hierarchy",
      avoid: "Emoji-heavy, overly casual, generic corporate hype"
    },
    {
      id: generateId(),
      name: "WhatsApp",
      purpose: "Direct connection with partners",
      typicalStructure: "Greeting, concise core message, single question/CTA",
      lengthGuidance: "Short (1-2 paragraphs)",
      toneGuidance: "Human, respectful, warm",
      ctaGuidance: "Simple conversational reply prompt",
      formattingRules: "Mobile optimized, very short lines",
      avoid: "Generic corporate language, long introductions, email subject lines"
    }
  ],
  claimsProofBoundaries: {
    claims: [
      {
        id: generateId(),
        text: "COH creates original climate-era operatic worlds.",
        type: "Approved",
        proofRequirement: "None",
        enforcement: "Always apply"
      },
      {
        id: generateId(),
        text: "COH is building a repertoire-based climate canon.",
        type: "Approved",
        proofRequirement: "None",
        enforcement: "Always apply"
      },
      {
        id: generateId(),
        text: "COH treats climate as a structural condition, not a decorative theme.",
        type: "Approved",
        proofRequirement: "None",
        enforcement: "Always apply"
      },
      {
        id: generateId(),
        text: "Specific audience numbers",
        type: "Requires proof",
        proofRequirement: "Actual ticket/reach data",
        enforcement: "Warn if violated"
      },
      {
        id: generateId(),
        text: "Confirmed institutional interest",
        type: "Requires proof",
        proofRequirement: "Formal LOI or agreement",
        enforcement: "Warn if violated"
      },
      {
        id: generateId(),
        text: "Confirmed partnerships that are not confirmed",
        type: "Forbidden",
        proofRequirement: "N/A",
        enforcement: "Always apply",
        notes: "Do not invent sponsors."
      },
      {
        id: generateId(),
        text: "Overstated commercial traction",
        type: "Forbidden",
        proofRequirement: "N/A",
        enforcement: "Always apply"
      },
      {
        id: generateId(),
        text: "Vague 'world-changing' claims without evidence",
        type: "Forbidden",
        proofRequirement: "N/A",
        enforcement: "Always apply"
      },
      {
        id: generateId(),
        text: "Shallow ESG or activism language that weakens artistic authority",
        type: "Forbidden",
        proofRequirement: "N/A",
        enforcement: "Always apply"
      }
    ],
    proofPoints: "London as proof of delivery and asset creation.",
    overstatementWarnings: "Avoid claiming we have single-handedly changed the climate discourse.",
    claimStyleRules: "State facts neutrally and powerfully. Let the artistic ambition speak for itself."
  },
  voiceAndLanguage: {
    overallTone: "Serious, precise, human, culturally intelligent, institution-grade.",
    writingStyle: "Direct, active voice, non-ornamental.",
    sentenceRhythm: "Varied, punchy, declarative.",
    preferredPhrases: ["structural condition", "origin asset", "repertoire-based", "cultural durability"],
    avoidPhrases: ["unlock potential", "drive impact", "game-changer", "innovative solution", "cutting-edge", "transformative journey", "generic sustainability language", "overused climate urgency clichés", "decorative green language"],
    aiPhrasesToAvoid: ["now more than ever", "in a world where", "it's important to remember", "a testament to"],
    formalityLevel: "High-end but accessible",
    emotionalIntensity: "Restrained but charged",
    founderVoiceNotes: "Authoritative but not arrogant.",
    cleanWritingRules: "No em dashes or AI-style long dash characters unless explicitly requested."
  },
  visualDNA: {
    visualAtmosphere: "Cinematic, atmospheric, elemental, prestigious, editorial, minimalist, serious.",
    mood: "Charged, anticipatory, grave but beautiful.",
    compositionPrinciples: "Clean, intentional, not overly busy, high contrast.",
    colorMaterialDirection: "Elemental tones: deep water, earth, fire, air. Organic textures.",
    photographyStyle: "Editorial, documentary, raw but composed.",
    typographyNotes: "Serif for authority, clean sans-serif for utility.",
    visualSymbolsToUseCarefully: "Nature motifs (use only when integrated, not pasted on).",
    visualClichesToAvoid: "Not cartoonish, not stock-photo corporate, no generic green leaves, no protest clichés, no disaster scenes, no melting earth cliché, no overdramatic apocalypse imagery, no decorative climate icons unless specifically justified.",
    imagePromptRules: "Always specify cinematic lighting, 35mm lens equivalent, highly detailed textures.",
    formatAspectPreferences: "16:9 for narrative, 4:5 for social portraits.",
    negativePromptRules: "cartoon, illustration, 3d render, low quality, bad anatomy, text, watermark, generic stock photo"
  },
  revisionStandards: [
    {
      id: generateId(),
      action: "Sharper",
      does: "Remove generic language, tighten logic, make the point clearer.",
      avoids: "Fluff, unnecessary adjectives.",
      whenToUse: "When copy feels too loose or academic.",
      exampleGuidance: "Change 'we are driving impact' to 'we built an engine'.",
      appliesTo: "All workspaces"
    },
    {
      id: generateId(),
      action: "More human",
      does: "Improve rhythm, warmth, and naturalness without becoming casual or weak.",
      avoids: "Corporate speak, robotic transitions.",
      whenToUse: "When copy feels too cold or institutional.",
      exampleGuidance: "Change 'the organization executed' to 'we built'.",
      appliesTo: "All workspaces"
    },
    {
      id: generateId(),
      action: "More institutional",
      does: "Ground the copy in seriousness, credibility, and decision-maker relevance.",
      avoids: "Casual slang, overdramatic claims, startup hype.",
      whenToUse: "When writing for sponsors or formal partners.",
      exampleGuidance: "Change 'super cool project' to 'cultural venture'.",
      appliesTo: "Sponsor-facing outputs"
    },
    {
      id: generateId(),
      action: "More sponsor-facing",
      does: "Clarify value exchange, credibility, and why the partner should care.",
      avoids: "Burying the lead, purely artistic self-indulgence.",
      whenToUse: "When the primary goal is funding or partnership.",
      exampleGuidance: "Highlight cultural durability and reach.",
      appliesTo: "Sponsor-facing outputs"
    },
    {
      id: generateId(),
      action: "Less corporate",
      does: "Remove jargon, inflated phrases, and empty business language.",
      avoids: "Synergy, impact-driven, leveraging assets.",
      whenToUse: "When the text feels like a generic B2B press release.",
      exampleGuidance: "Speak like a cultural leader, not a middle manager.",
      appliesTo: "All workspaces"
    },
    {
      id: generateId(),
      action: "Less NGO-like",
      does: "Avoid moralizing, campaign language, and generic climate advocacy.",
      avoids: "Save the planet, urgent crisis, we must act now.",
      whenToUse: "When the text sounds like a charity appeal.",
      exampleGuidance: "Focus on the art and the structure, not the guilt.",
      appliesTo: "All workspaces"
    },
    {
      id: generateId(),
      action: "Cleaner from AI-style characters",
      does: "Remove em dashes, zero-width characters, curly quotes if needed, formulaic AI phrasing, and over-polished structure.",
      avoids: "AI-style syntax.",
      whenToUse: "As a final polish step.",
      exampleGuidance: "Replace em dashes with commas or separate sentences.",
      appliesTo: "All workspaces"
    }
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

  // Core Identity applies to most content workspaces
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Ideation Workspace'].includes(context.workspace)) {
    sections.push(`
CORE STRATEGY & IDENTITY:
- Definition: ${core.coreStrategy.definition}
- What we are NOT: ${core.coreStrategy.whatWeAreNot}
- Positioning: ${core.coreStrategy.categoryPositioning}
- Ambition: ${core.coreStrategy.strategicAmbition}
- Value Proposition: ${core.coreStrategy.valueProposition}`);

    if (core.coreStrategy.internalLaw.length > 0) {
      const laws = core.coreStrategy.internalLaw
        .filter(law => law.appliesTo.includes('All workspaces') || law.appliesTo.includes('Content generation') || law.appliesTo.includes('Ideation'))
        .map(law => `- [${law.enforcement.toUpperCase()}] ${law.title}: ${law.rule}`)
        .join('\\n');
      if (laws) {
        sections.push(`\\nINTERNAL LAW (NON-NEGOTIABLES):\\n${laws}`);
      }
    }
    
    sections.push(`\\nSTRATEGIC PRIORITIES:\\n${core.coreStrategy.priorities.map(p => `- ${p}`).join('\\n')}`);
  }

  // Voice & Language applies to all text generation
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision Studio'].includes(context.workspace)) {
    sections.push(`
VOICE & LANGUAGE:
- Overall Tone: ${core.voiceAndLanguage.overallTone}
- Writing Style: ${core.voiceAndLanguage.writingStyle}
- Formality: ${core.voiceAndLanguage.formalityLevel}
- Sentence Rhythm: ${core.voiceAndLanguage.sentenceRhythm}
- Clean Writing Rules: ${core.voiceAndLanguage.cleanWritingRules}`);
    
    if (core.voiceAndLanguage.preferredPhrases.length > 0) {
      sections.push(`- PREFERRED PHRASES: ${core.voiceAndLanguage.preferredPhrases.join(', ')}`);
    }
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
    const requiresProof = core.claimsProofBoundaries.claims.filter(c => c.type === 'Requires proof').map(c => `- ${c.text} (Proof required: ${c.proofRequirement})`).join('\\n');
    const forbidden = core.claimsProofBoundaries.claims.filter(c => c.type === 'Forbidden').map(c => `- ${c.text}`).join('\\n');
    
    sections.push(`
CLAIMS, PROOF & BOUNDARIES:
- Proof Points to Use: ${core.claimsProofBoundaries.proofPoints}
- Overstatement Warnings: ${core.claimsProofBoundaries.overstatementWarnings}
- Claim Style Rules: ${core.claimsProofBoundaries.claimStyleRules}`);

    if (approved) sections.push(`\\nAPPROVED CLAIMS:\\n${approved}`);
    if (requiresProof) sections.push(`\\nREQUIRES PROOF:\\n${requiresProof}`);
    if (forbidden) sections.push(`\\nFORBIDDEN CLAIMS (CRITICAL):\\n${forbidden}`);
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
- Relevant Messages: ${audienceMatch.relevantMessages}
- CTA Focus: ${audienceMatch.cta}
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
- Length Guidance: ${channelMatch.lengthGuidance}
- CTA Guidance: ${channelMatch.ctaGuidance}
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
- What it avoids: ${revMatch.avoids}
- Example Guidance: ${revMatch.exampleGuidance}`);
    }
  }

  // Visual specific
  if (context.workspace === 'Visual Studio') {
    sections.push(`
VISUAL DNA:
- Visual Atmosphere: ${core.visualDNA.visualAtmosphere}
- Mood: ${core.visualDNA.mood}
- Composition Principles: ${core.visualDNA.compositionPrinciples}
- Color/Material Direction: ${core.visualDNA.colorMaterialDirection}
- Photography Style: ${core.visualDNA.photographyStyle}
- Format/Aspect Preferences: ${core.visualDNA.formatAspectPreferences}
- Typography Notes: ${core.visualDNA.typographyNotes}
- Visual Symbols to Use Carefully: ${core.visualDNA.visualSymbolsToUseCarefully}
- Image Prompt Rules: ${core.visualDNA.imagePromptRules}
- CLICHES TO AVOID (CRITICAL): ${core.visualDNA.visualClichesToAvoid}
- NEGATIVE PROMPT: ${core.visualDNA.negativePromptRules}`);

    if (core.coreStrategy.internalLaw.length > 0) {
      const laws = core.coreStrategy.internalLaw
        .filter(law => law.appliesTo.includes('All workspaces') || law.appliesTo.includes('Visual Studio'))
        .map(law => `- [${law.enforcement.toUpperCase()}] ${law.title}: ${law.rule}`)
        .join('\\n');
      if (laws) {
        sections.push(`\\nINTERNAL LAW (NON-NEGOTIABLES):\\n${laws}`);
      }
    }
  }

  return sections.join('\\n');
}
