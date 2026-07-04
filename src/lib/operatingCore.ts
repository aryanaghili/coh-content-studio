export interface AudienceProfile {
  name: string;
  caresAbout: string;
  proofNeeded: string;
  preferredTone: string;
  avoid: string;
  cta: string;
}

export interface ChannelRule {
  name: string;
  purpose: string;
  tone: string;
  length: string;
  avoid: string;
}

export interface RevisionStandard {
  action: string;
  does: string;
  avoids: string;
}

export interface OperatingCore {
  active: boolean;
  version: string;
  lastUpdated: string;
  coreStrategy: {
    definition: string;
    whatWeAreNot: string;
    positioning: string;
    ambition: string;
    internalLaw: string;
    priorities: string;
    sourceReferences: string;
  };
  audiences: AudienceProfile[];
  channels: ChannelRule[];
  claimsProofBoundaries: {
    approvedClaims: string;
    requiresProof: string;
    forbidden: string;
    proofPoints: string;
    sourceReferences: string;
  };
  voiceAndLanguage: {
    tone: string;
    avoidPhrases: string;
    aiPhrasesToAvoid: string;
    formality: string;
    sourceReferences: string;
  };
  visualDNA: {
    atmosphere: string;
    composition: string;
    clichesToAvoid: string;
    formatPreferences: string;
    sourceReferences: string;
  };
  revisionStandards: RevisionStandard[];
  learningInbox: any[];
}

export const createDefaultOperatingCore = (): OperatingCore => ({
  active: true,
  version: "v1",
  lastUpdated: new Date().toISOString(),
  coreStrategy: {
    definition: "COH is a cultural engine for climate transition. COH creates original climate-era operatic worlds. COH treats live opera as the origin asset for wider cultural, institutional, sponsorship, content, and IP value.",
    whatWeAreNot: "COH is not a generic climate campaign, event brand, NGO campaign, ESG communication project, or conventional opera production company.",
    positioning: "A repertoire-based climate canon.",
    ambition: "Building long-term content and IP logic, starting with live opera.",
    internalLaw: "Climate is not a decorative theme, it is the structural condition of the century. Nature is not a passive metaphor. Human figures are ethical testers, not saviors. The work must protect artistic authority.",
    priorities: "Cultural durability, institutional adoption, civic resonance, sponsorship credibility.",
    sourceReferences: ""
  },
  audiences: [
    {
      name: "Sponsors and partners",
      caresAbout: "Credibility, unique value, audience reach, cultural relevance",
      proofNeeded: "Institutional adoption, concrete value exchange",
      preferredTone: "Professional, premium, strategic",
      avoid: "Over-promising unconfirmed deals, NGO begging language",
      cta: "Schedule a discussion, explore partnership"
    },
    {
      name: "General public",
      caresAbout: "Story, emotion, accessibility",
      proofNeeded: "Relatable themes",
      preferredTone: "Human, clear, engaging",
      avoid: "Heavy jargon, corporate sustainability speak",
      cta: "Learn more, buy tickets, join the list"
    }
  ],
  channels: [
    {
      name: "LinkedIn",
      purpose: "Thought leadership and institutional updates",
      tone: "Professional, institutional, strategic",
      length: "Medium (2-3 short paragraphs)",
      avoid: "Emoji-heavy, overly casual"
    },
    {
      name: "Email / Direct Outreach",
      purpose: "Direct connection with partners",
      tone: "Human, respectful, warm",
      length: "Short (1-2 paragraphs)",
      avoid: "Generic corporate language, long introductions"
    }
  ],
  claimsProofBoundaries: {
    approvedClaims: "COH creates original climate-era operatic worlds. Soria Moria (Air), The Golden Fountain (Fire), The Water Dragon (Water), Roar to the Wind (Earth).",
    requiresProof: "Audience numbers, sponsor traction, confirmed institutional interest, distribution deals.",
    forbidden: "Claiming confirmed partnerships that are not confirmed. Overstating commercial traction. Generic 'world-changing' claims.",
    proofPoints: "London as proof of delivery and asset creation.",
    sourceReferences: ""
  },
  voiceAndLanguage: {
    tone: "Serious, precise, human, culturally intelligent, institution-grade. Not corporate, not NGO-like, not childish.",
    avoidPhrases: "Unlock potential, drive impact, game-changer, innovative solution, cutting-edge, at scale, generic sustainability language.",
    aiPhrasesToAvoid: "Em dash (—), long dash, formulaic AI transitions like 'now more than ever', 'in a world where'.",
    formality: "High-end but accessible",
    sourceReferences: ""
  },
  visualDNA: {
    atmosphere: "Cinematic, atmospheric, elemental, editorial, prestigious, minimalist.",
    composition: "Clean, intentional, not overly busy.",
    clichesToAvoid: "No generic green leaves, no protest clichés, no disaster imagery, no corporate stock-photo aesthetics, no melting earth, no cartoonish imagery.",
    formatPreferences: "High contrast, editorial framing",
    sourceReferences: ""
  },
  revisionStandards: [
    {
      action: "Make it sharper",
      does: "Removes generic language, tightens argument",
      avoids: "Fluff, unnecessary adjectives"
    },
    {
      action: "Make it more human",
      does: "Improves rhythm and clarity, sounds like a real person",
      avoids: "Corporate speak, robotic transitions"
    },
    {
      action: "Make it more institutional",
      does: "Grounds the writing in seriousness and credibility",
      avoids: "Casual slang, overdramatic claims"
    },
    {
      action: "Clean AI-Style Characters",
      does: "Removes em dashes, robotic transitions, and cliché hooks",
      avoids: "AI-style syntax"
    }
  ],
  learningInbox: []
});

export interface CompileContext {
  workspace: 'Simple Mode' | 'Quick Create' | 'Advanced Brief' | 'Ideation' | 'Revision' | 'Visual Studio';
  channel?: string;
  audience?: string;
  format?: string;
  action?: string;
  userRequest?: string;
}

export function compileOperatingCoreContext(core: OperatingCore | null, context: CompileContext): string {
  if (!core || !core.active) {
    return "OPERATING CORE: INACTIVE";
  }

  const sections: string[] = ["--- COH OPERATING CORE INSTRUCTIONS ---"];

  // Core Identity applies to most content workspaces
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Ideation'].includes(context.workspace)) {
    sections.push(`
CORE STRATEGY & IDENTITY:
- Definition: ${core.coreStrategy.definition}
- What we are NOT: ${core.coreStrategy.whatWeAreNot}
- Internal Law (Non-negotiables): ${core.coreStrategy.internalLaw}`);
  }

  // Voice & Language applies to all text generation
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision'].includes(context.workspace)) {
    sections.push(`
VOICE & LANGUAGE:
- Tone: ${core.voiceAndLanguage.tone}
- Formality: ${core.voiceAndLanguage.formality}
- Words/Phrases to AVOID: ${core.voiceAndLanguage.avoidPhrases}
- AI Syntax to AVOID: ${core.voiceAndLanguage.aiPhrasesToAvoid}`);
  }

  // Claim boundaries
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision', 'Ideation'].includes(context.workspace)) {
    sections.push(`
CLAIMS, PROOF & BOUNDARIES:
- Approved Claims: ${core.claimsProofBoundaries.approvedClaims}
- Requires Proof: ${core.claimsProofBoundaries.requiresProof}
- FORBIDDEN CLAIMS: ${core.claimsProofBoundaries.forbidden}`);
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
- Tone: ${channelMatch.tone}
- Length: ${channelMatch.length}
- Avoid: ${channelMatch.avoid}`);
    }
  }

  // Revision specific
  if (context.workspace === 'Revision' && context.action) {
    const revMatch = core.revisionStandards.find(r => r.action === context.action);
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
- Atmosphere: ${core.visualDNA.atmosphere}
- Composition: ${core.visualDNA.composition}
- Format Preferences: ${core.visualDNA.formatPreferences}
- CLICHES TO AVOID (CRITICAL): ${core.visualDNA.clichesToAvoid}`);
  }

  return sections.join('\\n');
}
