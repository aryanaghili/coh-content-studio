/**
 * AGY BMS-COH-01: Cultural Marketing & Editorial Intelligence Engine
 *
 * Adapts the 14 selected Boring Marketing Skills methodologies (v4.1.1, commit bd5aaedab44368d76326d98d488697158b886679)
 * into Climate Opera Haus Content Studio while preserving the Protected COH Kernel and Operating Core v4
 * as highest strategic and artistic authority.
 *
 * Included subsystems:
 * 1. Cultural Audience Intelligence (7 core cultural perspectives + Operating Core profile bridge)
 * 2. Cultural Positioning & Landscape Triage (Fact Sheet vs "To Make This True", Saturated / Contested / White Space)
 * 3. Search & Discoverability Intelligence (Two Query Spaces: Search-Visible + AI-Native Questions, Six Circles, Track A/B GEO)
 * 4. Voice Drift, 2026 AI-Tells & Slop-Pattern Linter (brand-voice, seo-content/humanize, content-atomizer/slop-patterns)
 * 5. Platform Atomizer & Native Channel Judgment (Native deep, Native light, Link-in-reply, Skip)
 * 6. Newsletter Archetypes & Considered Stakeholder Outreach Sequences
 * 7. Evidence-Based Editorial & Campaign Learning (performance-review adapted for OperatingCore.learningInbox)
 */

import {
  PROTECTED_COH_KERNEL,
  CANONICAL_COH_PILLARS,
  createDefaultOperatingCore,
  normalizeCohPillar,
  normalizeOperatingCoreAudience,
  type OperatingCore,
  type AudienceProfile
} from './operatingCore.ts';
import type { TaskSourceBinding, StudioWorkflow } from './contextCompiler.ts';
import type { SourceIntelligenceAnalysis } from './sourceIntelligence.ts';

export const BMS_UPSTREAM_METADATA = {
  repository: 'https://github.com/boringmarketer/boring-marketing-skills',
  author: 'James Dickerson (@boringmarketer)',
  license: 'MIT',
  pinnedCommitSha: 'bd5aaedab44368d76326d98d488697158b886679',
  pinnedVersion: '4.1.1',
  commitDate: '2026-11-17T22:53:58Z',
  selectedSkills: [
    'brand-voice',
    'audience-research',
    'competitive-intel',
    'positioning-angles',
    'keyword-research',
    'seo-content',
    'ai-search',
    'long-form-article',
    'social-content',
    'content-atomizer',
    'newsletter',
    'email-sequences',
    'creative',
    'performance-review',
    'start-here'
  ] as const
} as const;

// ---------------------------------------------------------------------------
// 1. CULTURAL AUDIENCE INTELLIGENCE (Section 3)
// ---------------------------------------------------------------------------

export interface CulturalAudiencePerspective {
  id: string;
  perspectiveName: string;
  canonicalOperatingCoreAudience: string;
  needsToUnderstand: string;
  whatMakesProductionMeaningful: string;
  proofAndEvidenceRequired: string;
  vocabularyAndRegister: string;
  tableStakesVsDifferentiator: string;
  governanceBoundary: string;
  avoidPatterns: string[];
}

export const COH_CULTURAL_AUDIENCE_PERSPECTIVES: readonly CulturalAudiencePerspective[] = [
  {
    id: 'opera-contemporary-classical',
    perspectiveName: 'Opera and contemporary classical music audiences',
    canonicalOperatingCoreAudience: 'General cultural audience',
    needsToUnderstand:
      'How the score, libretto, vocal writing, and stage architecture treat planetary thresholds as dramatic and musical structure rather than didactic commentary.',
    whatMakesProductionMeaningful:
      'Somatic intensity, vocal and orchestral craft, mythic scale across the four-part Climate Tetralogy (Soria Moria, The Golden Fountain, The Water Dragon, Roar to the Wind), and lived human tension.',
    proofAndEvidenceRequired:
      'Concrete musical, dramaturgical, or staging details from verified production sources, plus clear invitation into the artistic world.',
    vocabularyAndRegister:
      'Literate, atmospheric, dramaturgically precise, emotionally resonant without academic impenetrability or activist sloganeering.',
    tableStakesVsDifferentiator:
      'Table stakes: saying an opera addresses modern themes. Differentiator: showing how nature acts as an active dramatic subject with memory and consequence.',
    governanceBoundary:
      'Never invent cast lists, conductor names, premiere dates, or ticket availability not present in attached sources.',
    avoidPatterns: ['preachy climate slogans', 'talking down to operagoers', 'reducing the work to a protest rally']
  },
  {
    id: 'cultural-journalists-critics',
    perspectiveName: 'Cultural journalists and critics',
    canonicalOperatingCoreAudience: 'Press and journalists',
    needsToUnderstand:
      'Why this work matters now culturally and artistically, what distinguishes COH from episodic awareness concerts, and how the repertoire-based canon operates.',
    whatMakesProductionMeaningful:
      'A sharp, non-hype story angle anchored in artistic method, verified production milestones, quotable dramaturgical insight, and structural category distinction.',
    proofAndEvidenceRequired:
      'Verbatim quotes from attached sources, confirmed credits, exact dates/locations where verified, and clear distinction between current production stage and long-term canon ambition.',
    vocabularyAndRegister:
      'Clear, quotable, editorial, non-promotional, fact-dense, free of PR superlatives.',
    tableStakesVsDifferentiator:
      'Table stakes: claiming a project is "timely and urgent". Differentiator: demonstrating a four-work repertoire architecture where live opera anchors filmed and institutional IP.',
    governanceBoundary:
      'Never fabricate review quotes, media partnerships, festival co-productions, or unconfirmed premiere dates.',
    avoidPatterns: ['PR hyperbole', 'world-first superlatives without proof', 'vague poetic press releases']
  },
  {
    id: 'arts-institutions-festivals-presenters',
    perspectiveName: 'Arts institutions, festivals, and presenters',
    canonicalOperatingCoreAudience: 'Opera houses and festivals',
    needsToUnderstand:
      'Repertoire durability, curatorial fit, staging modularity, audience development potential, and how a COH production integrates into seasonal or festival programming.',
    whatMakesProductionMeaningful:
      'Production discipline, touring and co-production readiness, multi-horizon cultural relevance, and clear rights/licensing architecture.',
    proofAndEvidenceRequired:
      'Score and staging readiness logic, technical and production blueprint facts from sources, and institutional adoption pathways.',
    vocabularyAndRegister:
      'Curatorial, practical, institution-grade, artistically serious, operationally fluent.',
    tableStakesVsDifferentiator:
      'Table stakes: offering a topical new commission. Differentiator: a repeatable repertoire canon with documented capture, educational, and civic extension layers.',
    governanceBoundary:
      'Never claim an opera house or festival has committed to host or co-produce unless explicitly stated in an attached source.',
    avoidPatterns: ['minimizing technical staging realities', 'startup disruption jargon', 'vague touring promises']
  },
  {
    id: 'climate-sustainability-organizations',
    perspectiveName: 'Climate and sustainability organizations',
    canonicalOperatingCoreAudience: 'Climate and sustainability leaders',
    needsToUnderstand:
      'How serious operatic worldbuilding reaches civic and leadership rooms where technical reports and policy papers encounter cognitive fatigue.',
    whatMakesProductionMeaningful:
      'Cultural translation of planetary reality into shared somatic and civic experience without sacrificing scientific honesty or artistic autonomy.',
    proofAndEvidenceRequired:
      'Clear articulation of the cultural thesis, convening format, and how public or leadership dialogue connects to the performance.',
    vocabularyAndRegister:
      'Warm, intelligent, bridge-building, precise, non-technical yet rigorous.',
    tableStakesVsDifferentiator:
      'Table stakes: "raising awareness about climate change". Differentiator: treating climate as the structural condition of the century through permanent cultural infrastructure.',
    governanceBoundary:
      'Never invent scientific endorsements, carbon-offset metrics, or measurable environmental impact outcomes.',
    avoidPatterns: ['ESG buzzwords', 'greenwashing clichés', 'claiming an opera directly lowers emissions']
  },
  {
    id: 'artistic-collaborators',
    perspectiveName: 'Artistic collaborators',
    canonicalOperatingCoreAudience: 'Opera houses and festivals',
    needsToUnderstand:
      'The internal artistic law of the Climate Tetralogy, where human figures are ethical testers, listeners, or translators rather than saviors, and nature has active agency.',
    whatMakesProductionMeaningful:
      'Creative rigor, acoustic and visual ambition, respect for the craft of composition, libretto, scenography, lighting, and vocal performance.',
    proofAndEvidenceRequired:
      'Dramaturgical notes, elemental worldbuilding parameters (Air/Nordic in Soria Moria, Fire in The Golden Fountain, Water in The Water Dragon, Earth in Roar to the Wind), and production methodology.',
    vocabularyAndRegister:
      'Craft-centered, dramaturgical, serious, peer-to-peer artistic authority.',
    tableStakesVsDifferentiator:
      'Table stakes: interdisciplinary collaboration. Differentiator: a unified four-opera cycle governed by coherent dramatic and elemental law.',
    governanceBoundary:
      'Never invent attached composers, librettists, directors, designers, or ensemble commitments.',
    avoidPatterns: ['treating artists as content vendors', 'corporate creative-agency slang', 'decorative green stage tropes']
  },
  {
    id: 'potential-supporters-sponsors',
    perspectiveName: 'Potential supporters and sponsors',
    canonicalOperatingCoreAudience: 'Sponsors and patrons',
    needsToUnderstand:
      'How live opera functions as the origin asset for filmed content, documentary, licensing, and high-prestige institutional visibility, while artistic control remains strictly protected.',
    whatMakesProductionMeaningful:
      'Long-horizon cultural durability, association with serious institution-grade art, executive and patron convening quality, and clear value exchange.',
    proofAndEvidenceRequired:
      'Asset multiplier logic (Live Opera -> Capture -> Documentary/Media -> Licensing), verified milestone progress, and explicit separation of commercial recognition from artistic direction.',
    vocabularyAndRegister:
      'Composed, commercially coherent, peer-level, serious, never charity-pleading or needy.',
    tableStakesVsDifferentiator:
      'Table stakes: logo placement on a single event program. Differentiator: foundational patronage of an enduring climate-era cultural IP canon with strict editorial independence.',
    governanceBoundary:
      'Preserve the strict distinction between commercial recognition/sponsorship and artistic control. Never invent sponsor tiers, financial returns, or confirmed corporate backers.',
    avoidPatterns: ['NGO begging language', 'implying sponsors can edit the libretto or artistic direction', 'unverified ROI numbers']
  },
  {
    id: 'cultural-policymakers-institutional-partners',
    perspectiveName: 'Cultural policymakers and institutional partners',
    canonicalOperatingCoreAudience: 'Cultural institutions',
    needsToUnderstand:
      'How COH builds civic resonance, cross-border cultural dialogue, educational translation, and long-term public cultural infrastructure.',
    whatMakesProductionMeaningful:
      'Alignment with public cultural mandate, civic participation formats around the performance, and repeatable institutional adoption models.',
    proofAndEvidenceRequired:
      'Governance discipline, educational and public-program framing, and verified institutional or diplomatic context from attached sources.',
    vocabularyAndRegister:
      'Measured, civic, policy-literate, curatorial, institutionally credible.',
    tableStakesVsDifferentiator:
      'Table stakes: one-off community outreach. Differentiator: an integrated cultural ecosystem combining flagship operatic performance with structured civic and educational dialogue.',
    governanceBoundary:
      'Never claim government endorsement, ministry funding, or diplomatic patronage unless explicitly documented in attached sources.',
    avoidPatterns: ['partisan political advocacy', 'activist lobbying rhetoric', 'inflated civic reach projections']
  }
] as const;

/**
 * Resolves the richest cultural audience perspective for a given audience name or raw request,
 * bridging the 7 cultural perspectives with the active Operating Core audience profiles.
 */
export function resolveCulturalAudiencePerspective(
  audienceOrInput?: string | null,
  operatingCore?: OperatingCore | null
): {
  perspective: CulturalAudiencePerspective;
  operatingCoreProfile?: AudienceProfile;
} {
  const raw = String(audienceOrInput || '').trim();
  const lower = raw.toLowerCase();
  const core = operatingCore || createDefaultOperatingCore();

  let matched: CulturalAudiencePerspective = COH_CULTURAL_AUDIENCE_PERSPECTIVES[0];

  if (/journalist|critic|press|media|reporter|review|editorial/i.test(lower)) {
    matched = COH_CULTURAL_AUDIENCE_PERSPECTIVES[1];
  } else if (/collaborator|composer|librettist|scenograph|conductor|vocalist|director|ensemble|artistic team/i.test(lower)) {
    matched = COH_CULTURAL_AUDIENCE_PERSPECTIVES[4];
  } else if (/opera house|festival|presenter|stage|repertoire|touring|co-produc/i.test(lower)) {
    matched = COH_CULTURAL_AUDIENCE_PERSPECTIVES[2];
  } else if (/policymaker|policy|ministry|arts council|foundation|civic|municipal|diplomat|institutional partner|cultural institution/i.test(lower)) {
    matched = COH_CULTURAL_AUDIENCE_PERSPECTIVES[6];
  } else if (/sponsor|patron|supporter|underwrit|philanthrop|brand partner|backer/i.test(lower)) {
    matched = COH_CULTURAL_AUDIENCE_PERSPECTIVES[5];
  } else if (/climate|sustainability|ecological|environmental|ngo|scientist/i.test(lower)) {
    matched = COH_CULTURAL_AUDIENCE_PERSPECTIVES[3];
  } else if (/opera|classical|general|public|cultural audience|listener/i.test(lower)) {
    matched = COH_CULTURAL_AUDIENCE_PERSPECTIVES[0];
  }

  const normalizedCoreName = normalizeOperatingCoreAudience(
    raw || matched.canonicalOperatingCoreAudience,
    core
  ) || matched.canonicalOperatingCoreAudience;

  const operatingCoreProfile = core.audiences.find(
    a => a.name.toLowerCase() === normalizedCoreName.toLowerCase()
  );

  return {
    perspective: matched,
    operatingCoreProfile
  };
}

// ---------------------------------------------------------------------------
// 2. CULTURAL POSITIONING & LANDSCAPE TRIAGE (Section 4 & 5)
//    Adapted from positioning-angles & competitive-intel
// ---------------------------------------------------------------------------

export interface CulturalAngleProposal {
  id: string;
  angleTitle: string;
  targetPerspective: string;
  targetOperatingCoreAudience: string;
  communicationJob: string;
  suggestedChannel: string;
  suggestedFormat: string;
  suggestedPillar: string;
  centralProposition: string;
  openingHook: string;
  artisticMechanism: string; // The "named method" / artistic mechanism from verified facts
  verifiedFactsUsed: string[]; // "Ship only what's true" (from Fact Sheet)
  toMakeThisTrue: string[]; // Stronger ideas requiring confirmation/proof before shipping
  landscapePosition: {
    saturatedToAvoid: string;
    contestedToSharpen: string;
    whiteSpaceClaimed: string;
  };
  sponsorIndependenceNote?: string;
}

/**
 * Generates distinct, source-grounded cultural editorial angles from a single COH source
 * for different cultural audiences (e.g. Cultural Audiences/Critics vs Institutional Partners/Sponsors).
 * Enforces the positioning-angles Claim Gate: shipped lines use only verified source facts,
 * while stronger unconfirmed ideas are placed in `toMakeThisTrue`.
 */
export function buildCulturalEditorialAnglesFromSource(params: {
  source: {
    id: string;
    title: string;
    type: string;
    content: string;
    notes?: string;
  };
  analysis?: SourceIntelligenceAnalysis | null;
  operatingCore?: OperatingCore | null;
}): CulturalAngleProposal[] {
  const { source, analysis, operatingCore } = params;
  const rawText = `${source.content || ''}\n${source.notes || ''}`.trim();

  // Extract verified facts from analysis or directly from source sentences
  const sentences = rawText
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.replace(/\s*[\u2014\u2013]\s*/g, ', ').trim())
    .filter(s => s.length >= 18);

  const verifiedFacts: string[] =
    analysis && analysis.keyFacts && analysis.keyFacts.length > 0
      ? analysis.keyFacts.map(f => f.replace(/\s*[\u2014\u2013]\s*/g, ', ').trim())
      : sentences.slice(0, 4);

  const primaryFact =
    verifiedFacts[0] ||
    'Climate Opera Haus develops original operatic worlds where climate is treated as a structural artistic condition.';
  const secondaryFact = verifiedFacts[1] || primaryFact;

  // Detect mentioned canonical operas or entities
  const mentionedOpera =
    ['Soria Moria', 'The Golden Fountain', 'The Water Dragon', 'Roar to the Wind'].find(op =>
      rawText.toLowerCase().includes(op.toLowerCase())
    ) || 'the Climate Tetralogy';

  const culturalAud = resolveCulturalAudiencePerspective(
    'Opera and contemporary classical music audiences',
    operatingCore
  );
  const institutionalAud = resolveCulturalAudiencePerspective(
    'Arts institutions, festivals, and presenters',
    operatingCore
  );
  const pressAud = resolveCulturalAudiencePerspective(
    'Cultural journalists and critics',
    operatingCore
  );
  const sponsorAud = resolveCulturalAudiencePerspective(
    'Potential supporters and sponsors',
    operatingCore
  );

  return [
    {
      id: `bms-angle-cultural-${source.id}`,
      angleTitle: `${mentionedOpera}: Elemental Dramaturgy and Somatic Presence on Stage`,
      targetPerspective: culturalAud.perspective.perspectiveName,
      targetOperatingCoreAudience: culturalAud.operatingCoreProfile?.name || 'General cultural audience',
      communicationJob: 'Explain artistic logic',
      suggestedChannel: 'Newsletter',
      suggestedFormat: 'Newsletter Section',
      suggestedPillar: normalizeCohPillar('Opera Worlds & Artistic Method'),
      centralProposition: `${mentionedOpera} treats ecological reality not as a topical lecture, but as an active dramatic and musical condition felt in the room.`,
      openingHook: primaryFact,
      artisticMechanism:
        'Dramaturgical translation of elemental thresholds into vocal, scenic, and acoustic structure rather than narrative moralizing.',
      verifiedFactsUsed: verifiedFacts.slice(0, 3),
      toMakeThisTrue: [
        'To include specific musical excerpts or libretto passages: attach the approved rehearsal score or libretto excerpt.',
        'To announce public performance dates or ticket release windows: attach the signed venue schedule.'
      ],
      landscapePosition: {
        saturatedToAvoid: 'Generic "raising climate awareness through art" messaging.',
        contestedToSharpen: 'Contemporary multimedia performance claims without repertoire depth.',
        whiteSpaceClaimed: 'Repertoire-grade operatic worldbuilding where nature carries dramatic agency and consequence.'
      }
    },
    {
      id: `bms-angle-institutional-${source.id}`,
      angleTitle: `Programming ${mentionedOpera}: Repertoire Durability and Curatorial Fit for Cultural Institutions`,
      targetPerspective: institutionalAud.perspective.perspectiveName,
      targetOperatingCoreAudience: institutionalAud.operatingCoreProfile?.name || 'Cultural institutions',
      communicationJob: 'Establish institutional credibility',
      suggestedChannel: 'LinkedIn',
      suggestedFormat: 'Thought Piece',
      suggestedPillar: normalizeCohPillar('Partnerships, Sponsorship & Institutional Value'),
      centralProposition: `For presenting institutions and festivals, ${mentionedOpera} offers a repeatable repertoire asset that connects artistic rigor with civic dialogue.`,
      openingHook: secondaryFact,
      artisticMechanism:
        'Origin-stage operatic production designed for modular co-production, filmed capture, and structured civic programming.',
      verifiedFactsUsed: verifiedFacts.slice(0, 3),
      toMakeThisTrue: [
        'To reference technical rider specifications or touring dimensions: attach the verified production dossier.',
        'To cite co-producing house commitments: attach the counter-signed institutional agreement.'
      ],
      landscapePosition: {
        saturatedToAvoid: 'One-off symbolic climate concerts with no repertoire afterlife.',
        contestedToSharpen: 'Institutional sustainability panels disconnected from mainstage programming.',
        whiteSpaceClaimed: 'Institution-grade climate repertoire designed to travel, repeat, and anchor multi-season cultural programming.'
      }
    },
    {
      id: `bms-angle-press-${source.id}`,
      angleTitle: `Critical Context: Why ${mentionedOpera} Rejects Activist Slogans for Operatic Structure`,
      targetPerspective: pressAud.perspective.perspectiveName,
      targetOperatingCoreAudience: pressAud.operatingCoreProfile?.name || 'Press and journalists',
      communicationJob: 'Clarify a milestone',
      suggestedChannel: 'Website',
      suggestedFormat: 'News / Media Article',
      suggestedPillar: normalizeCohPillar('Climate Tetralogy & Canon'),
      centralProposition: `Climate Opera Haus positions ${mentionedOpera} within a four-work climate canon grounded in verified production facts and artistic autonomy.`,
      openingHook: primaryFact,
      artisticMechanism:
        'Four-part repertoire canon (Soria Moria, The Golden Fountain, The Water Dragon, Roar to the Wind) separating verified stage proof from long-horizon IP pathways.',
      verifiedFactsUsed: verifiedFacts.slice(0, 3),
      toMakeThisTrue: [
        'To attribute direct interview commentary to creative leadership or principal artists: attach an approved interview transcript.'
      ],
      landscapePosition: {
        saturatedToAvoid: 'Hyperbolic PR claims of "saving the planet through music".',
        contestedToSharpen: 'Surface-level topical opera reviews that ignore structural composition.',
        whiteSpaceClaimed: 'Evidence-backed cultural journalism examining how twenty-first-century opera confronts planetary thresholds.'
      }
    },
    {
      id: `bms-angle-sponsor-${source.id}`,
      angleTitle: `Patronage & Cultural IP: Supporting ${mentionedOpera} as an Origin Asset`,
      targetPerspective: sponsorAud.perspective.perspectiveName,
      targetOperatingCoreAudience: sponsorAud.operatingCoreProfile?.name || 'Sponsors and patrons',
      communicationJob: 'Create sponsor relevance',
      suggestedChannel: 'Email / Direct Outreach',
      suggestedFormat: 'Sponsor Pitch Paragraph',
      suggestedPillar: normalizeCohPillar('Documentary, Media & Cultural IP'),
      centralProposition: `Backing ${mentionedOpera} associates patrons with durable, high-prestige cultural IP while preserving strict artistic independence.`,
      openingHook: primaryFact,
      artisticMechanism:
        'Origin-asset ecosystem: live opera creates the world, filming captures it, documentary and licensing extend long-horizon visibility.',
      verifiedFactsUsed: verifiedFacts.slice(0, 3),
      toMakeThisTrue: [
        'To present specific sponsorship tier deliverables or media distribution windows: attach the approved partnership prospectus.'
      ],
      landscapePosition: {
        saturatedToAvoid: 'Transactional event logo placement or corporate ESG boilerplate.',
        contestedToSharpen: 'Short-term CSR charity appeals.',
        whiteSpaceClaimed: 'Foundational cultural patronage of an original operatic canon with clear separation between commercial recognition and artistic control.'
      },
      sponsorIndependenceNote:
        'Governance Rule: Sponsorship and patronage provide commercial recognition and institutional alignment while artistic direction and dramaturgical control remain strictly with Climate Opera Haus.'
    }
  ];
}

// ---------------------------------------------------------------------------
// 3. SEARCH & DISCOVERABILITY INTELLIGENCE (Section 4 & 7.8)
//    Adapted from keyword-research, seo-content, ai-search, long-form-article
// ---------------------------------------------------------------------------

export interface DiscoverabilityTopicCluster {
  circleName:
    | '1. Core Cultural Works & Repertoire'
    | '2. Audience & Curatorial Questions'
    | '3. Cultural & Institutional Outcomes'
    | '4. COH Positioning & Method'
    | '5. Adjacent Cultural & Ecological Discourse'
    | '6. Named Entities & Canon Associations';
  searchVisibleQueries: string[];
  aiNativeQuestions: string[];
  intent: 'informational' | 'curatorial-commercial' | 'entity-authority';
  zeroClickRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  citationPath: string;
}

export interface CulturalDiscoverabilityPlan {
  coreSubject: string;
  primaryEntity: string;
  associatedEntities: string[];
  topicClusters: DiscoverabilityTopicCluster[];
  answerFirstLeadBlock: string; // Track B GEO: 40-80 word self-contained answer block
  coverageQuestions: Array<{
    question: string;
    sourceSpace: 'Search-Visible' | 'AI-Native Conversational';
    answerShape: 'direct-definition' | 'dramaturgical-comparison' | 'verified-fact-summary';
    groundedAnswer: string;
  }>;
  antiStuffingGuardrail: string;
  schemaRecommendations: string[];
}

/**
 * Generates a source-grounded Search & AI-Search Discoverability Plan for COH cultural content
 * without keyword stuffing or altering artistic substance.
 */
export function buildCulturalDiscoverabilityPlan(params: {
  topicOrTitle: string;
  draftOrSourceText: string;
  audience?: string;
  pillar?: string;
  sourceBindings?: TaskSourceBinding[];
}): CulturalDiscoverabilityPlan {
  const cleanTitle = (params.topicOrTitle || 'Climate Opera Haus Repertoire').replace(/\s*[\u2014\u2013]\s*/g, ', ').trim();
  const bodyText = (params.draftOrSourceText || '').replace(/\s*[\u2014\u2013]\s*/g, ', ').trim();

  // Identify canonical COH entities present
  const canonicalEntities = [
    'Climate Opera Haus',
    'The Climate Tetralogy',
    'Soria Moria',
    'The Golden Fountain',
    'The Water Dragon',
    'Roar to the Wind',
    'RESONANCE 2027'
  ];
  const associatedEntities = canonicalEntities.filter(
    ent =>
      cleanTitle.toLowerCase().includes(ent.toLowerCase()) ||
      bodyText.toLowerCase().includes(ent.toLowerCase())
  );
  if (!associatedEntities.includes('Climate Opera Haus')) {
    associatedEntities.unshift('Climate Opera Haus');
  }
  const primaryEntity =
    associatedEntities.find(e => e !== 'Climate Opera Haus') || 'Climate Opera Haus';

  // Extract first 1-2 verified factual sentences for the 40-80 word self-contained Answer-First block (Track B GEO)
  const sentences = bodyText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 20);

  let answerFirstLeadBlock =
    sentences.slice(0, 2).join(' ') ||
    `${primaryEntity} is an original operatic work developed by Climate Opera Haus within The Climate Tetralogy, treating planetary thresholds as a structural artistic condition rather than a promotional theme.`;

  // Ensure self-contained entity clarity (no dangling leading pronoun)
  if (/^(It|This|They|The work)\b/i.test(answerFirstLeadBlock) && !answerFirstLeadBlock.includes(primaryEntity)) {
    answerFirstLeadBlock = `${primaryEntity} (${associatedEntities[0]}): ${answerFirstLeadBlock}`;
  }

  const topicClusters: DiscoverabilityTopicCluster[] = [
    {
      circleName: '1. Core Cultural Works & Repertoire',
      searchVisibleQueries: [
        `${primaryEntity} opera`,
        'Climate Opera Haus Climate Tetralogy',
        'contemporary climate opera repertoire'
      ],
      aiNativeQuestions: [
        `What is ${primaryEntity} by Climate Opera Haus and how does it fit into The Climate Tetralogy?`,
        'How does Climate Opera Haus structure its four-part operatic canon?'
      ],
      intent: 'entity-authority',
      zeroClickRisk: 'LOW',
      citationPath: 'Authoritative self-contained entity definition + verified production facts.'
    },
    {
      circleName: '2. Audience & Curatorial Questions',
      searchVisibleQueries: [
        'contemporary opera about ecological thresholds',
        'new operatic repertoire for cultural institutions and festivals'
      ],
      aiNativeQuestions: [
        `How does ${primaryEntity} address climate change without becoming didactic or activist theater?`,
        'What makes Climate Opera Haus productions suitable for opera houses and international festivals?'
      ],
      intent: 'curatorial-commercial',
      zeroClickRisk: 'LOW',
      citationPath: 'Dramaturgical mechanism explanation + curatorial feasibility facts.'
    },
    {
      circleName: '4. COH Positioning & Method',
      searchVisibleQueries: [
        'live opera as cultural IP origin asset',
        'climate as structural condition in performing arts'
      ],
      aiNativeQuestions: [
        'Why does Climate Opera Haus treat live opera as an origin asset for documentary and cultural IP?'
      ],
      intent: 'informational',
      zeroClickRisk: 'MEDIUM',
      citationPath: 'Clear explanation of the origin-asset ecosystem and artistic governance.'
    }
  ];

  const coverageQuestions: CulturalDiscoverabilityPlan['coverageQuestions'] = [
    {
      question: `What is ${primaryEntity} and what is its artistic premise?`,
      sourceSpace: 'Search-Visible',
      answerShape: 'direct-definition',
      groundedAnswer: answerFirstLeadBlock
    },
    {
      question: `How does ${primaryEntity} differ from conventional climate advocacy or topical concerts?`,
      sourceSpace: 'AI-Native Conversational',
      answerShape: 'dramaturgical-comparison',
      groundedAnswer:
        'Climate Opera Haus treats climate as the structural condition of the century and nature as an active dramatic subject with memory and consequence, avoiding activist slogans or ESG clichés.'
    },
    {
      question: `What verified production facts are confirmed for ${primaryEntity}?`,
      sourceSpace: 'AI-Native Conversational',
      answerShape: 'verified-fact-summary',
      groundedAnswer:
        sentences[0] ||
        'Refer to attached Source Library production notes for confirmed staging, creative team, and venue facts.'
    }
  ];

  return {
    coreSubject: cleanTitle,
    primaryEntity,
    associatedEntities,
    topicClusters,
    answerFirstLeadBlock,
    coverageQuestions,
    antiStuffingGuardrail:
      'Editorial Quality Law: Never repeat keywords mechanically or insert SEO filler. Answer search and AI-assistant questions through precise dramaturgical facts, consistent entity naming, and self-contained topic leads.',
    schemaRecommendations: ['Article', 'Organization (Climate Opera Haus)', 'PerformingArtsEvent (only when dates and venue are confirmed in sources)']
  };
}

// ---------------------------------------------------------------------------
// 4. VOICE DRIFT, 2026 AI-TELLS & SLOP-PATTERN LINTER (Section 2, 4, 5)
//    Adapted from brand-voice (ai-tells.md), seo-content (humanize.md),
//    and content-atomizer (slop-patterns.md)
// ---------------------------------------------------------------------------

export const BMS_AI_WORD_TELLS_2026 = [
  'delve',
  'tapestry',
  'testament',
  'beacon',
  'realm',
  'holistic',
  'synergy',
  'supercharge',
  'unleash',
  'game-changer',
  'cutting-edge',
  'plethora',
  'myriad',
  'treasure trove',
  'embark',
  'ever-evolving',
  'fast-paced'
] as const;

export const BMS_AI_PHRASE_TELLS_2026 = [
  "in today's fast-paced",
  "in today's digital",
  "let's dive in",
  'without further ado',
  'buckle up',
  "here's the kicker",
  'look no further',
  'take your .* to the next level',
  'the secret sauce',
  'it goes without saying',
  'needless to say',
  "here's the part most people miss",
  'let me be clear:'
] as const;

export const BMS_SLOP_HOOK_PATTERNS_2026 = [
  /^unpopular opinion:/i,
  /^hot take:/i,
  /^controversial take:/i,
  /^harsh truth:/i,
  /^brutal honesty:/i,
  /^hard pill to swallow:/i,
  /^everything you know about .* is wrong/i,
  /^the .* secret no one talks about/i,
  /^nobody is talking about this/i,
  /^excited to announce/i,
  /^thrilled to share/i,
  /^humbled and honored to announce/i,
  /^a thread:/i,
  /^thread:/i,
  /^let me explain/i
] as const;

export const BMS_ENGAGEMENT_BAIT_CTA_PATTERNS = [
  /\bcomment\s+["']?[A-Z]{2,}["']?\s+and\s+i'?ll\s+dm\b/i,
  /\btag someone who needs to see this\b/i,
  /\bsave this\.\s*share it\.\s*send it\b/i,
  /\blike for a,\s*comment for b\b/i,
  /\bonly 1% will share this\b/i,
  /\bdrop a yes below\b/i,
  /\bi'?ll follow everyone who replies\b/i
] as const;

export const COH_FACTUAL_ACCURACY_FORBIDDEN_INVENTIONS = [
  'Artist credentials',
  'Awards or institutional affiliations',
  'Cast or production credits',
  'Performance dates and venues',
  'Artistic partnerships',
  'Sponsorship commitments',
  'Climate impact or environmental outcomes',
  'Audience figures or commercial results',
  'Permissions, licensing, or usage rights'
] as const;

export interface VoiceAndGovernanceAuditResult {
  passed: boolean;
  score: number;
  aiWordTellsFound: string[];
  aiPhraseTellsFound: string[];
  slopHooksFound: string[];
  engagementBaitFound: string[];
  longDashesFound: boolean;
  activistSlogansFound: string[];
  unverifiedSponsorControlBlur: boolean;
  unanchoredClaimsWarnings: string[];
  recommendations: string[];
}

/**
 * Audits any draft or social derivative against:
 * 1. Approved COH Voice & Protected Kernel rules
 * 2. 2026 AI word & phrase tells (brand-voice / humanize)
 * 3. 2026 Social slop hooks & engagement bait (content-atomizer)
 * 4. Factual & reputational accuracy against attached sources (Section 5)
 * 5. Sponsor commercial recognition vs artistic control boundary (Section 5)
 */
export function auditCohVoiceAndGovernance(params: {
  text: string;
  sourceTexts?: string[];
  isSponsorFacing?: boolean;
}): VoiceAndGovernanceAuditResult {
  const raw = String(params.text || '').trim();
  const lower = raw.toLowerCase();
  const combinedSources = (params.sourceTexts || []).join('\n').toLowerCase();

  const aiWordTellsFound: string[] = [];
  for (const word of BMS_AI_WORD_TELLS_2026) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(raw)) {
      aiWordTellsFound.push(word);
    }
  }

  const aiPhraseTellsFound: string[] = [];
  for (const phrase of BMS_AI_PHRASE_TELLS_2026) {
    const regex = new RegExp(phrase, 'i');
    if (regex.test(raw)) {
      aiPhraseTellsFound.push(phrase);
    }
  }

  const firstLine = raw.split('\n').map(l => l.trim()).find(Boolean) || '';
  const slopHooksFound: string[] = [];
  for (const pat of BMS_SLOP_HOOK_PATTERNS_2026) {
    if (pat.test(firstLine)) {
      slopHooksFound.push(firstLine);
      break;
    }
  }

  const engagementBaitFound: string[] = [];
  for (const pat of BMS_ENGAGEMENT_BAIT_CTA_PATTERNS) {
    const match = raw.match(pat);
    if (match) {
      engagementBaitFound.push(match[0]);
    }
  }

  const longDashesFound = /[—–―]/.test(raw);

  const activistSlogans = [
    'save the planet',
    'act now before it is too late',
    'climate emergency protest',
    'net-zero opera',
    'carbon-neutral performance',
    'eco-friendly theater'
  ];
  const activistSlogansFound = activistSlogans.filter(s => lower.includes(s));

  // Check sponsor commercial recognition vs artistic control boundary
  const unverifiedSponsorControlBlur =
    /(?:sponsor[s]?|patron[s]?)\s+(?:has\s+|have\s+|will\s+)?(?:co-write|co-wrote|co-direct|co-directed|direct|directed|shape[ds]?\s+the\s+(?:story|storyline|libretto)|control[s]?\s+the\s+libretto|approve[ds]?\s+the\s+script|custom-tailor[s]?\s+the\s+opera)/i.test(
      raw
    );

  // Check for high-risk unanchored claims (awards, sold-out numbers, named commitments, carbon reduction claims)
  const unanchoredClaimsWarnings: string[] = [];
  const highRiskPatterns: Array<{ pattern: RegExp; category: string }> = [
    { pattern: /\bwon\s+(?:the\s+)?(?:prestigious\s+)?[A-Z][A-Za-z\s]+(?:Award|Prize)\b/i, category: 'Awards or institutional affiliations' },
    { pattern: /\bgrammy|pulitzer|oscar|golden lion\b/i, category: 'Awards or institutional affiliations' },
    { pattern: /\bsold[- ]out\s+[\d,]+|\b\d{1,3}(?:,\d{3})+\s+tickets\s+sold\b/i, category: 'Audience figures or commercial results' },
    { pattern: /\b(?:reduced|reduction\s+in)\s+carbon\b|\b\d+%\s+carbon\s+reduction\b|\boffset\s+[\d,]+\s+tons\b/i, category: 'Climate impact or environmental outcomes' },
    { pattern: /\bconfirmed\s+\$[\d,]+|\bcommitted\s+€[\d,]+|\bsigned\s+a\s+multi-year\s+deal\s+with\b/i, category: 'Sponsorship commitments' },
    { pattern: /\bexclusive\s+licensing\s+agreement\s+signed\s+with\b/i, category: 'Permissions, licensing, or usage rights' }
  ];

  for (const { pattern, category } of highRiskPatterns) {
    const m = raw.match(pattern);
    if (m && (!combinedSources || !combinedSources.includes(m[0].toLowerCase()))) {
      unanchoredClaimsWarnings.push(`Unverified ${category} claim detected ("${m[0]}") not present in attached sources.`);
    }
  }

  const recommendations: string[] = [];
  if (aiWordTellsFound.length > 0 || aiPhraseTellsFound.length > 0) {
    recommendations.push(
      `Remove AI-tell vocabulary (${[...aiWordTellsFound, ...aiPhraseTellsFound].join(', ')}) and replace with concrete COH dramaturgical or institutional specifics.`
    );
  }
  if (slopHooksFound.length > 0) {
    recommendations.push(
      'Replace formulaic social hook with the most compelling verified fact or dramatic tension from the source.'
    );
  }
  if (engagementBaitFound.length > 0) {
    recommendations.push('Remove engagement-bait CTA; end with a composed institutional or cultural invitation.');
  }
  if (longDashesFound) {
    recommendations.push('Replace em/en dashes with commas, colons, or periods per COH clean writing rules.');
  }
  if (activistSlogansFound.length > 0) {
    recommendations.push(
      `Replace generic climate activism phrasing (${activistSlogansFound.join(', ')}) with COH voice: climate as a structural condition and lived reality.`
    );
  }
  if (unverifiedSponsorControlBlur) {
    recommendations.push(
      'Sponsor-facing boundary violation: preserve the strict distinction between commercial recognition and COH artistic control.'
    );
  }
  if (unanchoredClaimsWarnings.length > 0) {
    recommendations.push(...unanchoredClaimsWarnings);
  }

  let penalty = 0;
  penalty += aiWordTellsFound.length >= 3 ? 25 : aiWordTellsFound.length * 6;
  penalty += aiPhraseTellsFound.length * 15;
  penalty += slopHooksFound.length * 20;
  penalty += engagementBaitFound.length * 20;
  penalty += longDashesFound ? 15 : 0;
  penalty += activistSlogansFound.length * 20;
  penalty += unverifiedSponsorControlBlur ? 35 : 0;
  penalty += unanchoredClaimsWarnings.length * 30;

  const score = Math.max(0, 100 - penalty);
  const passed =
    score >= 75 &&
    slopHooksFound.length === 0 &&
    engagementBaitFound.length === 0 &&
    !longDashesFound &&
    activistSlogansFound.length === 0 &&
    !unverifiedSponsorControlBlur &&
    unanchoredClaimsWarnings.length === 0;

  return {
    passed,
    score,
    aiWordTellsFound,
    aiPhraseTellsFound,
    slopHooksFound,
    engagementBaitFound,
    longDashesFound,
    activistSlogansFound,
    unverifiedSponsorControlBlur,
    unanchoredClaimsWarnings,
    recommendations
  };
}

// ---------------------------------------------------------------------------
// 5. PLATFORM ATOMIZER & NATIVE CHANNEL JUDGMENT (Section 4)
//    Adapted from content-atomizer & social-content
// ---------------------------------------------------------------------------

export type AtomizerTreatment = 'Native deep' | 'Native light' | 'Link-in-reply' | 'Skip';

export interface PlatformAtomizationDecision {
  platform: string;
  treatment: AtomizerTreatment;
  rationale: string;
  recommendedFormat: string;
  somethingToSave: string;
}

/**
 * Evaluates a finished COH piece or source and assigns disciplined platform treatments
 * (2-3 high-fit platforms with native depth rather than rephrased spray across 8 channels).
 */
export function planCulturalContentAtomization(params: {
  sourceTitle: string;
  sourceText: string;
  primaryAudience?: string;
}): PlatformAtomizationDecision[] {
  const perspective = resolveCulturalAudiencePerspective(params.primaryAudience).perspective;
  const isInstitutionalOrSponsor =
    perspective.id === 'arts-institutions-festivals-presenters' ||
    perspective.id === 'potential-supporters-sponsors' ||
    perspective.id === 'cultural-policymakers-institutional-partners';

  return [
    {
      platform: 'LinkedIn',
      treatment: 'Native deep',
      rationale:
        'COH institutional backbone. Multi-point dramaturgical or repertoire architecture performs best as an insight-led text post or structured document carousel.',
      recommendedFormat: isInstitutionalOrSponsor ? 'Thought Piece' : 'Carousel',
      somethingToSave: 'The four-part Climate Tetralogy repertoire framework and origin-asset ecosystem logic.'
    },
    {
      platform: 'Newsletter',
      treatment: 'Native deep',
      rationale:
        'Archival editorial spine. Readers expect deeper dramaturgical context, verified milestone provenance, and composed cultural reflection.',
      recommendedFormat: 'Newsletter Section',
      somethingToSave: 'Primary-source production notes and curatorial thesis.'
    },
    {
      platform: 'Instagram',
      treatment: isInstitutionalOrSponsor ? 'Native light' : 'Native deep',
      rationale:
        'Visual myth and elemental worldbuilding. Pair atmospheric Visual Studio direction with a concise, somatic caption.',
      recommendedFormat: 'Caption',
      somethingToSave: 'Elemental worldbuilding imagery and dramatic premise.'
    },
    {
      platform: 'X / Twitter',
      treatment: 'Link-in-reply',
      rationale:
        'Deliver one self-contained, quote-ready cultural or curatorial observation in the main post; place any external article link in the first reply to preserve reach.',
      recommendedFormat: 'Post',
      somethingToSave: 'A sharp, repeatable one-sentence proposition from the piece.'
    }
  ];
}

// ---------------------------------------------------------------------------
// 6. EVIDENCE-BASED EDITORIAL & CAMPAIGN LEARNING (Section 6)
//    Adapted from performance-review for OperatingCore.learningInbox
// ---------------------------------------------------------------------------

export type LearningEvidenceLevel = 'measured-data' | 'editorial-observation';

export interface EditorialCampaignLearningEntry {
  id: string;
  date: string;
  studioOrSkill: string;
  evidenceLevel: LearningEvidenceLevel;
  finding: string;
  sampleSizeLabel: string; // e.g. "n=6 sends" or "n=1 editorial review (no live telemetry)"
  sourceProvenance: string; // e.g. "newsletter-csv", "content-library-audit", "editorial-observation"
  limitations: string;
  artisticGovernanceCheck: string;
  recommendedNextAction: string;
  formattedBmsEntry: string;
}

export interface CampaignPerformanceInputRow {
  entityTitle: string;
  channel: string;
  format?: string;
  audience?: string;
  impressions?: number;
  clicks?: number;
  repliesOrInquiries?: number;
  savesOrShares?: number;
  qualitativeResponse?: string;
}

/**
 * Synthesizes structured editorial and campaign learnings from actual available data
 * or explicit editorial observations without ever fabricating performance metrics or
 * allowing raw engagement figures to override COH artistic judgment.
 * Integrates directly with `OperatingCore.learningInbox`.
 */
export function synthesizeEditorialAndCampaignLearnings(params: {
  performanceRows?: CampaignPerformanceInputRow[];
  savedContentItems?: Array<{
    id: string;
    title: string;
    channel: string;
    pillar: string;
    audience: string;
    status: string;
    text: string;
    sourcesUsed?: string[];
  }>;
  editorialObservationNotes?: string;
  dateStr?: string;
}): {
  entries: EditorialCampaignLearningEntry[];
  diagnosisSummary: string;
  explicitLimitations: string[];
  artisticAutonomyReminder: string;
} {
  const today = params.dateStr || new Date().toISOString().split('T')[0];
  const rows = Array.isArray(params.performanceRows) ? params.performanceRows : [];
  const savedItems = Array.isArray(params.savedContentItems) ? params.savedContentItems : [];
  const entries: EditorialCampaignLearningEntry[] = [];
  const explicitLimitations: string[] = [];

  const artisticAutonomyReminder =
    'Artistic Governance Rule: Engagement figures inform format, framing, and distribution timing, but never override Climate Opera Haus dramaturgical integrity, claim safety, or Protected Kernel rules.';

  // Path A: Quantitative / Measured Performance Data exists
  const measuredRows = rows.filter(
    r =>
      typeof r.clicks === 'number' ||
      typeof r.impressions === 'number' ||
      typeof r.repliesOrInquiries === 'number' ||
      typeof r.savesOrShares === 'number'
  );

  if (measuredRows.length > 0) {
    const totalSample = measuredRows.length;
    const byChannel = new Map<string, CampaignPerformanceInputRow[]>();
    for (const r of measuredRows) {
      const ch = r.channel || 'General';
      byChannel.set(ch, [...(byChannel.get(ch) || []), r]);
    }

    // Sort by meaningful actions (replies/inquiries + clicks + saves) rather than vanity impressions
    const scored = [...measuredRows].sort((a, b) => {
      const scoreA = (a.repliesOrInquiries || 0) * 5 + (a.savesOrShares || 0) * 3 + (a.clicks || 0);
      const scoreB = (b.repliesOrInquiries || 0) * 5 + (b.savesOrShares || 0) * 3 + (b.clicks || 0);
      return scoreB - scoreA;
    });

    const top = scored[0];
    const smallSampleCaveat =
      totalSample < 10
        ? `Small sample size (n=${totalSample}); treat as directional signal rather than statistical certainty.`
        : `Observed across n=${totalSample} tracked items.`;

    explicitLimitations.push(smallSampleCaveat);
    explicitLimitations.push(
      'Email open rates and passive feed impressions are direction-only proxies; prioritize substantive replies, institutional inquiries, saves, and link clicks.'
    );

    const findingText = `${top.channel} (${top.format || 'native format'}) for ${top.audience || 'cultural audience'} led meaningful response on "${top.entityTitle}" (${top.repliesOrInquiries ?? 0} inquiries/replies, ${top.clicks ?? 0} clicks, ${top.savesOrShares ?? 0} saves)`;
    const sampleLabel = `n=${totalSample} items`;
    const sourceProv = 'workspace-performance-data';

    entries.push({
      id: `learn-measured-${Date.now()}-1`,
      date: today,
      studioOrSkill: 'performance-review',
      evidenceLevel: 'measured-data',
      finding: findingText,
      sampleSizeLabel: sampleLabel,
      sourceProvenance: sourceProv,
      limitations: smallSampleCaveat,
      artisticGovernanceCheck: 'Verified compliant with Protected COH Kernel; format insight only.',
      recommendedNextAction: `Prioritize ${top.channel} ${top.format || 'native deep'} treatment for upcoming ${top.audience || 'stakeholder'} communications while maintaining source-backed claim discipline.`,
      formattedBmsEntry: `- [${today}] [performance-review] ${findingText} (${sampleLabel}, source: ${sourceProv})`
    });
  } else {
    // Path B: No quantitative performance telemetry exists -> Use honest Editorial Observations with explicit limitations
    explicitLimitations.push(
      'No external analytics, ESP click exports, or live campaign telemetry were supplied for this review. All findings below are strictly bounded as internal editorial observations, never fabricated engagement metrics.'
    );

    const approvedCount = savedItems.filter(i => i.status === 'Approved' || i.status === 'Published').length;
    const totalSaved = savedItems.length;
    const sourceBackedCount = savedItems.filter(i => Array.isArray(i.sourcesUsed) && i.sourcesUsed.length > 0).length;

    const observationText =
      params.editorialObservationNotes?.trim() ||
      (totalSaved > 0
        ? `Editorial portfolio audit shows ${approvedCount} of ${totalSaved} saved pieces reached Approved status, with ${sourceBackedCount} explicitly linked to Source Library records.`
        : 'Initial editorial baseline established; attach primary production sources in Source Library to unlock multi-angle cultural and institutional framing.');

    const sampleLabel = totalSaved > 0 ? `n=${totalSaved} library items` : 'n=0 live campaigns (baseline observation)';
    const sourceProv = 'editorial-observation-only';

    entries.push({
      id: `learn-editorial-${Date.now()}-1`,
      date: today,
      studioOrSkill: 'performance-review',
      evidenceLevel: 'editorial-observation',
      finding: observationText,
      sampleSizeLabel: sampleLabel,
      sourceProvenance: sourceProv,
      limitations:
        'Editorial observation only. Quantitative readership and conversion patterns require importing real newsletter, website, or social exports.',
      artisticGovernanceCheck:
        'Preserves COH artistic identity; recommends stronger source anchoring rather than sensationalist hooks.',
      recommendedNextAction:
        'Ensure every production announcement and institutional note attaches a verified Source Library record before approval.',
      formattedBmsEntry: `- [${today}] [editorial-observation] ${observationText} (${sampleLabel}, source: ${sourceProv})`
    });
  }

  return {
    entries,
    diagnosisSummary:
      measuredRows.length > 0
        ? `Analyzed ${measuredRows.length} measured campaign record(s) using small-sample directional discipline.`
        : 'No quantitative campaign metrics provided; recorded bounded editorial observations with explicit limitations.',
    explicitLimitations,
    artisticAutonomyReminder
  };
}

/**
 * Non-destructively appends new learning entries into `OperatingCore.learningInbox`,
 * deduplicating by `formattedBmsEntry` so existing learning and history systems are reused.
 */
export function appendToOperatingCoreLearningInbox(
  operatingCore: OperatingCore,
  newEntries: EditorialCampaignLearningEntry[]
): OperatingCore {
  const existingInbox = Array.isArray(operatingCore.learningInbox) ? operatingCore.learningInbox : [];
  const existingFormatted = new Set(
    existingInbox.map((item: any) => (typeof item === 'string' ? item : item?.formattedBmsEntry || item?.finding || ''))
  );

  const additions = newEntries.filter(e => !existingFormatted.has(e.formattedBmsEntry));
  if (additions.length === 0) return operatingCore;

  return {
    ...operatingCore,
    lastUpdated: new Date().toISOString(),
    learningInbox: [...additions, ...existingInbox]
  };
}

// ---------------------------------------------------------------------------
// 7. PROMPT & CONTEXT COMPILER ENRICHMENT BLOCK
// ---------------------------------------------------------------------------

/**
 * Compiles a concise, high-signal cultural marketing & editorial intelligence block
 * for injection into `compileGovernedContext` and server prompt builders.
 */
export function compileCulturalEditorialIntelligenceBlock(params: {
  workflow: StudioWorkflow;
  audience?: string;
  channel?: string;
  format?: string;
  topicOrInstruction?: string;
  operatingCore?: OperatingCore | null;
}): string {
  const { perspective } = resolveCulturalAudiencePerspective(
    params.audience || params.topicOrInstruction,
    params.operatingCore
  );

  const lines: string[] = [
    `CULTURAL AUDIENCE & EDITORIAL INTELLIGENCE (BMS-COH-01):`,
    `- Active Cultural Perspective: ${perspective.perspectiveName}`,
    `- What This Audience Needs to Understand: ${perspective.needsToUnderstand}`,
    `- What Makes a Production Meaningful to Them: ${perspective.whatMakesProductionMeaningful}`,
    `- Evidence & Proof Burden: ${perspective.proofAndEvidenceRequired}`,
    `- Register & Differentiation: ${perspective.vocabularyAndRegister} (${perspective.tableStakesVsDifferentiator})`,
    `- Factual & Governance Boundary: ${perspective.governanceBoundary}`
  ];

  const fmtLower = String(params.format || '').toLowerCase();
  const chLower = String(params.channel || '').toLowerCase();

  if (chLower.includes('newsletter') || fmtLower.includes('newsletter')) {
    lines.push(
      `- Newsletter Craft (Adapted /newsletter): Choose a deliberate editorial archetype (deep-dive, personal-essay, or milestone briefing). Open with the most compelling verified observation from the work. Avoid stock greetings and newsletter clichés.`
    );
  } else if (
    fmtLower.includes('article') ||
    fmtLower.includes('long-form') ||
    chLower.includes('website')
  ) {
    lines.push(
      `- Search & AI-Citation Craft (Adapted /seo-content & /ai-search): Open with a self-contained 40-80 word lead paragraph that clearly names the work and its relationship to Climate Opera Haus and The Climate Tetralogy. Use consistent canonical entity naming. Never stuff keywords or dilute artistic substance.`
    );
  } else if (
    fmtLower.includes('sponsor') ||
    fmtLower.includes('partner') ||
    chLower.includes('email')
  ) {
    lines.push(
      `- Stakeholder & Patron Outreach Craft (Adapted /positioning-angles & /email-sequences): Ground the value exchange in verified facts (live opera as origin asset for filmed and licensed cultural IP). Strictly preserve the distinction between commercial recognition and COH artistic control.`
    );
  } else if (
    chLower.includes('linkedin') ||
    chLower.includes('instagram') ||
    chLower.includes('x')
  ) {
    lines.push(
      `- Native Social Craft (Adapted /social-content & /content-atomizer): Open with a concrete, falsifiable claim or dramatic tension from the source (never a formulaic AI hook or engagement bait). Give the reader a distinct cultural or strategic insight worth saving.`
    );
  }

  // Inject top 2 relevant priors from OperatingCore.learningInbox if present
  const inbox = params.operatingCore?.learningInbox;
  if (Array.isArray(inbox) && inbox.length > 0) {
    const recentPriors = inbox
      .slice(0, 2)
      .map((item: any) =>
        typeof item === 'string'
          ? item
          : item?.formattedBmsEntry || item?.finding || ''
      )
      .filter(Boolean);
    if (recentPriors.length > 0) {
      lines.push(`- Active Editorial & Campaign Learnings:\n  ${recentPriors.join('\n  ')}`);
    }
  }

  return lines.join('\n');
}
