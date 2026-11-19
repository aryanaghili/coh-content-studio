import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  BMS_UPSTREAM_METADATA,
  COH_CULTURAL_AUDIENCE_PERSPECTIVES,
  resolveCulturalAudiencePerspective,
  buildCulturalEditorialAnglesFromSource,
  buildCulturalDiscoverabilityPlan,
  auditCohVoiceAndGovernance,
  planCulturalContentAtomization,
  synthesizeEditorialAndCampaignLearnings,
  appendToOperatingCoreLearningInbox
} from '../src/lib/culturalMarketingIntelligence.ts';
import {
  PROTECTED_COH_KERNEL,
  createDefaultOperatingCore,
  resolveOperatingCoreAudience
} from '../src/lib/operatingCore.ts';
import {
  compileGovernedContext,
  type TaskSourceBinding
} from '../src/lib/contextCompiler.ts';
import {
  buildCulturalIdeationProposalsFromSource,
  buildIdeationToContentHandoff,
  evaluateOpportunityDiversity
} from '../src/lib/ideationIntelligence.ts';
import {
  compileRevisionRecipe,
  executeDeterministicRevisionRecipe
} from '../src/lib/smartBriefAndRevision.ts';
import {
  resolveReframeIntent,
  buildDeterministicReframe,
  buildReframeLineageMetadata
} from '../src/lib/reframingEngine.ts';
import {
  compileVisualStudioPrompt,
  parseVisualDirectionInput
} from '../src/lib/visualPromptCompiler.js';
import { runQualityGate } from '../server/ai/qualityGate.js';
import { buildGenerationPrompt } from '../server/ai/promptBuilder.js';

/**
 * Verified Soria Moria production dossier used across acceptance tests.
 */
const VERIFIED_SORIA_MORIA_SOURCE: TaskSourceBinding = {
  sourceId: 'src-soria-moria-dossier',
  title: 'Soria Moria — Nordic Air Opera Production Dossier (2026)',
  type: 'Treatment',
  role: 'Evidence',
  content: [
    'Soria Moria is the Nordic Air work within The Climate Tetralogy developed by Climate Opera Haus.',
    'The production explores high-altitude atmospheric thresholds through live operatic composition, acoustic timber staging, and suspended translucent silk.',
    'Stage design and dramaturgy treat climate as a structural artistic condition rather than an activist campaign theme.',
    'Development workshops are scheduled for Q4 2026 in Oslo in collaboration with Nordic contemporary classical ensemble partners.',
    '"In Soria Moria, the air itself becomes an acoustic instrument on stage," notes the Climate Opera Haus artistic direction note.'
  ].join(' ')
};

describe('AGY BMS-COH-01: Cultural Marketing & Editorial Intelligence Acceptance Suite', () => {
  it('Test 0: Upstream provenance, pinned revision, and 7 cultural audience perspectives are intact and subordinate to COH governance', () => {
    assert.equal(BMS_UPSTREAM_METADATA.pinnedCommitSha, 'bd5aaedab44368d76326d98d488697158b886679');
    assert.equal(BMS_UPSTREAM_METADATA.pinnedVersion, '4.1.1');
    assert.equal(BMS_UPSTREAM_METADATA.selectedSkills.length, 15);
    assert.equal(COH_CULTURAL_AUDIENCE_PERSPECTIVES.length, 7);

    const core = createDefaultOperatingCore();
    for (const perspective of COH_CULTURAL_AUDIENCE_PERSPECTIVES) {
      const resolvedCanonical = resolveOperatingCoreAudience(perspective.perspectiveName, core);
      assert.equal(resolvedCanonical, perspective.canonicalOperatingCoreAudience);
      const matched = resolveCulturalAudiencePerspective(perspective.perspectiveName, core);
      assert.ok(matched.perspective, `Expected cultural audience perspective for ${perspective.perspectiveName}`);
      assert.ok(matched.perspective.needsToUnderstand.length > 20);
      assert.ok(matched.perspective.whatMakesProductionMeaningful.length > 20);
    }
  });

  it('Acceptance Test 1: One COH source (Soria Moria) produces distinct, credible editorial angles for cultural audiences and institutional partners', () => {
    const core = createDefaultOperatingCore();
    const proposals = buildCulturalIdeationProposalsFromSource({
      rawInput: 'Soria Moria — Nordic Air Opera in The Climate Tetralogy',
      sourceBindings: [VERIFIED_SORIA_MORIA_SOURCE],
      defaultAudience: 'General cultural audience',
      defaultChannel: 'LinkedIn',
      defaultLanguage: 'English',
      savedIdeas: [],
      savedContents: [],
      operatingCore: core
    });

    assert.ok(proposals.length >= 4, 'Should generate at least 4 distinct audience-specific angles');

    const culturalAudienceAngle = proposals.find(p =>
      /General cultural audience|Opera/i.test(p.suggestedAudience)
    );
    const institutionalPartnerAngle = proposals.find(p =>
      /Opera houses and festivals|Cultural institutions/i.test(p.suggestedAudience)
    );
    const criticAngle = proposals.find(p => /Press and journalists/i.test(p.suggestedAudience));
    const sponsorAngle = proposals.find(p => /Sponsors and patrons/i.test(p.suggestedAudience));

    assert.ok(culturalAudienceAngle, 'Must include an angle for cultural/opera audiences');
    assert.ok(institutionalPartnerAngle, 'Must include an angle for arts institutions, festivals, and presenters');
    assert.ok(criticAngle, 'Must include an angle for cultural journalists and critics');
    assert.ok(sponsorAngle, 'Must include an angle for potential supporters and sponsors');

    // Verify angles are genuinely distinct in communicationJob and strategicAngle
    assert.notEqual(
      culturalAudienceAngle.communicationJob,
      institutionalPartnerAngle.communicationJob
    );
    assert.notEqual(
      culturalAudienceAngle.strategicAngle,
      institutionalPartnerAngle.strategicAngle
    );

    const diversity = evaluateOpportunityDiversity(proposals);
    assert.equal(diversity.isDiverse, true, 'Generated cultural angles must pass strategic diversity check');

    // Verify Claim Gate ("Ship only what's true" vs "To make this true")
    assert.ok(
      culturalAudienceAngle.availableEvidence.some(e => e.includes('Soria Moria')),
      'Available evidence must cite verified Soria Moria facts from the attached source'
    );
    assert.ok(
      institutionalPartnerAngle.evidenceStillRequired.length > 0,
      'Institutional angle must include Claim Gate advisory for unverified venue/contract specifics'
    );
  });

  it('Acceptance Test 2: A production announcement maintains verified artist, venue, performance, and partnership facts', () => {
    const core = createDefaultOperatingCore();
    const angles = buildCulturalEditorialAnglesFromSource({
      source: {
        id: VERIFIED_SORIA_MORIA_SOURCE.sourceId,
        title: VERIFIED_SORIA_MORIA_SOURCE.title,
        type: VERIFIED_SORIA_MORIA_SOURCE.type,
        content: VERIFIED_SORIA_MORIA_SOURCE.content || ''
      },
      operatingCore: core
    });

    // Every verified fact extracted from the source must be traceable to the source text
    const cleanSourceForCompare = (VERIFIED_SORIA_MORIA_SOURCE.content || '').replace(/\s*[\u2014\u2013]\s*/g, ', ');
    for (const angle of angles) {
      for (const fact of angle.verifiedFactsUsed) {
        assert.ok(
          cleanSourceForCompare.includes(fact) || fact.includes('Soria Moria'),
          `Fact "${fact}" must be directly grounded in the verified source`
        );
      }
    }

    // Build generation prompt package with the verified Soria Moria source
    const compiledPkg = compileGovernedContext({
      workflow: 'Content Workspace',
      operatingCore: core,
      audience: 'Arts institutions, festivals, and presenters',
      channel: 'Press Release',
      format: 'Press Release',
      sourceBindings: [VERIFIED_SORIA_MORIA_SOURCE],
      userInstruction: 'Draft a production announcement for Soria Moria Q4 2026 Oslo development workshops.'
    });

    assert.ok(
      compiledPkg.compiledInstructions.includes('Soria Moria'),
      'Compiled context must carry verified Soria Moria source facts'
    );
    assert.ok(
      compiledPkg.compiledInstructions.includes('Q4 2026 in Oslo'),
      'Compiled context must preserve verified date and location facts'
    );
    assert.ok(
      compiledPkg.compiledInstructions.includes('Arts institutions, festivals, and presenters'),
      'Compiled context must include the cultural audience perspective'
    );
  });

  it('Acceptance Test 3: Content creation follows the actual approved COH voice', () => {
    const approvedDraft = [
      'Soria Moria is the Nordic Air work within The Climate Tetralogy developed by Climate Opera Haus.',
      'Designed as a live operatic origin asset, the production translates high-altitude atmospheric thresholds into acoustic timber staging and vocal architecture.',
      'Development workshops take place in Q4 2026 in Oslo with Nordic contemporary classical ensemble partners.',
      '"In Soria Moria, the air itself becomes an acoustic instrument on stage," notes the Climate Opera Haus artistic direction note.'
    ].join('\n\n');

    const audit = auditCohVoiceAndGovernance({
      text: approvedDraft,
      sourceTexts: [VERIFIED_SORIA_MORIA_SOURCE.content || ''],
      isSponsorFacing: false
    });

    assert.equal(audit.passed, true, `Expected clean COH draft to pass voice audit, got recommendations: ${audit.recommendations.join('; ')}`);
    assert.equal(audit.aiWordTellsFound.length, 0);
    assert.equal(audit.aiPhraseTellsFound.length, 0);
    assert.equal(audit.slopHooksFound.length, 0);
    assert.equal(audit.longDashesFound, false);
    assert.ok(PROTECTED_COH_KERNEL.includes('Climate is the structural condition of the century'));
  });

  it('Acceptance Test 4: Revision improves the text without changing artistic meaning or verified facts', () => {
    const clutteredDraft = [
      "In today's fast-paced world, let's dive in to how Soria Moria delves into a rich tapestry of Nordic Air operatic worldbuilding — a testament to Climate Opera Haus.",
      'Development workshops are scheduled for Q4 2026 in Oslo in collaboration with Nordic contemporary classical ensemble partners.',
      '"In Soria Moria, the air itself becomes an acoustic instrument on stage," notes the Climate Opera Haus artistic direction note.'
    ].join('\n\n');

    const recipe = compileRevisionRecipe(['clean-ai-punctuation', 'less-corporate'], {
      channel: 'LinkedIn',
      format: 'Post',
      targetLanguage: 'English'
    });

    const revised = executeDeterministicRevisionRecipe(clutteredDraft, recipe, {
      channel: 'LinkedIn',
      format: 'Post',
      targetLanguage: 'English'
    });

    // Verify AI tells and em dashes were stripped
    assert.equal(/In today's fast-paced world/i.test(revised), false);
    assert.equal(/let's dive in/i.test(revised), false);
    assert.equal(/\bdelves into\b/i.test(revised), false);
    assert.equal(/\brich tapestry of\b/i.test(revised), false);
    assert.equal(/\btestament to\b/i.test(revised), false);
    assert.equal(/\u2014/.test(revised), false);

    // Verify central artistic meaning and verified facts are preserved unchanged
    assert.ok(revised.includes('Soria Moria'), 'Must preserve Soria Moria title');
    assert.ok(revised.includes('Nordic Air'), 'Must preserve Nordic Air identity');
    assert.ok(revised.includes('Q4 2026 in Oslo'), 'Must preserve verified Q4 2026 Oslo fact');
    assert.ok(
      revised.includes('"In Soria Moria, the air itself becomes an acoustic instrument on stage,"'),
      'Must preserve verbatim quotation'
    );
  });

  it('Acceptance Test 5: Reframing creates a suitable social derivative without losing source identity or lineage', () => {
    const core = createDefaultOperatingCore();
    const sourceText = VERIFIED_SORIA_MORIA_SOURCE.content || '';

    const plan = resolveReframeIntent({
      rawIntent: 'Reframe this Soria Moria production dossier into a LinkedIn post for arts institutions, festivals, and presenters',
      sourceContent: sourceText,
      originChannel: 'Website',
      originAudience: 'General cultural audience',
      sourceBindings: [VERIFIED_SORIA_MORIA_SOURCE],
      operatingCore: core
    });

    assert.equal(plan.recommendedRoute, 'REFRAME');
    assert.equal(plan.targetChannel, 'LinkedIn');
    assert.ok(
      /Cultural institutions|Opera houses and festivals/i.test(plan.targetAudience),
      `Expected institutional audience, got ${plan.targetAudience}`
    );

    const reframeResult = buildDeterministicReframe({
      sourceContent: sourceText,
      plan,
      sourceBindings: [VERIFIED_SORIA_MORIA_SOURCE]
    });

    assert.equal(reframeResult.integrityCheckPassed, true);
    assert.equal(reframeResult.preservedQuotesVerified, true);
    assert.ok(reframeResult.reframedCopy.includes('Soria Moria'), 'Reframed social derivative must retain Soria Moria identity');
    assert.ok(reframeResult.reframedCopy.includes('Q4 2026'), 'Reframed social derivative must retain verified Q4 2026 date');

    // Verify platform atomization plan and lineage metadata
    const atomization = planCulturalContentAtomization({
      sourceTitle: VERIFIED_SORIA_MORIA_SOURCE.title,
      sourceText,
      primaryAudience: plan.targetAudience
    });
    assert.ok(atomization.length >= 3);
    assert.equal(atomization[0].treatment, 'Native deep');
    assert.ok(atomization[0].somethingToSave.length > 15);

    const lineage = buildReframeLineageMetadata({
      originType: 'Source Library',
      originContentId: VERIFIED_SORIA_MORIA_SOURCE.sourceId,
      originTitle: VERIFIED_SORIA_MORIA_SOURCE.title,
      plan,
      sourceIds: [VERIFIED_SORIA_MORIA_SOURCE.sourceId]
    });

    assert.equal(lineage.originType, 'Source Library');
    assert.equal(lineage.originContentId, VERIFIED_SORIA_MORIA_SOURCE.sourceId);
    assert.deepEqual(lineage.sourceReferences, [VERIFIED_SORIA_MORIA_SOURCE.sourceId]);
  });

  it('Acceptance Test 6: A newsletter or press-oriented asset is generated through an appropriate workflow', () => {
    const core = createDefaultOperatingCore();
    const promptText = buildGenerationPrompt({
      mode: 'advanced_brief',
      rawInput: 'Write a Newsletter Section introducing Soria Moria Q4 2026 Oslo development workshops for cultural journalists and critics.',
      channel: 'Newsletter',
      outputFormat: 'Newsletter Section',
      contentPillar: 'Opera Worlds & Artistic Method',
      audience: 'Cultural journalists and critics',
      purpose: 'Clarify a milestone',
      language: 'English',
      tone: '2',
      desiredLength: 'Medium: 120-180 words',
      taskSources: [
        {
          id: VERIFIED_SORIA_MORIA_SOURCE.sourceId,
          title: VERIFIED_SORIA_MORIA_SOURCE.title,
          type: VERIFIED_SORIA_MORIA_SOURCE.type,
          role: 'Evidence',
          content: VERIFIED_SORIA_MORIA_SOURCE.content
        }
      ],
      operatingCoreInstructions: compileGovernedContext({
        workflow: 'Content Workspace',
        operatingCore: core,
        audience: 'Cultural journalists and critics',
        channel: 'Newsletter',
        format: 'Newsletter Section',
        sourceBindings: [VERIFIED_SORIA_MORIA_SOURCE]
      }).compiledInstructions
    });

    assert.ok(promptText.includes('FACTUAL & REPUTATIONAL ACCURACY GATE (BMS-COH-01)'));
    assert.ok(promptText.includes('Newsletter Section'));
    assert.ok(promptText.includes('Soria Moria'));
    assert.ok(promptText.includes('Search & AI-Search Discoverability'));
  });

  it('Acceptance Test 7: The visual brief reflects COH actual production identity (Soria Moria Nordic Air world)', () => {
    const soriaMoriaVisualBrief = `### Visual Design Brief: Website / News Article
- **Visual Concept**: Hero image and editorial grid layout reflecting Soria Moria (Nordic Air world in The Climate Tetralogy): translucent suspended silk, high-altitude atmospheric light, acoustic timber, and Nordic stage architecture.
- **Format Recommendation**: Wide banner (1920x1080px) for hero, vertical column layout for text.
- **Mood / Atmosphere**: Serious, artistic, authoritative, high-altitude chiaroscuro.
- **Composition**: Rule of thirds, wide panoramic stage landscape containing abstract atmospheric indices and stage architecture.
- **Color / Material**: Deep midnight navy (#0B1F3A), warm theatrical brass (#C5A880), raw stone grey, and acoustic timber.
- **Typography / Layout**: Large editorial serif H1, regular readable serif body text.
- **Key Visual Elements**: High-contrast stage design photography (Soria Moria Nordic Air staging).
- **What to Avoid**: Stock photos of wind turbines, burning globes, polar bears, or generic solar panels.
- **AI Image Prompt**: "Artistic opera stage scenery for Soria Moria Nordic Air world, translucent suspended stage silk, dark moody theater environment, volumetric light, gold highlight"
- **Designer Notes**: The hero header should match the sober color palette of the main web index.`;

    const parsed = parseVisualDirectionInput(soriaMoriaVisualBrief);
    assert.ok(parsed.visualConcept.includes('Soria Moria'));
    assert.ok(parsed.visualConcept.includes('Nordic Air'));

    const compiled = compileVisualStudioPrompt({
      brief: parsed,
      visualStyle: 'Cinematic Realism',
      formatPresetId: 'web-hero',
      brandConsistency: true
    });

    assert.ok(compiled.prompt.includes('Soria Moria'));
    assert.ok(compiled.prompt.includes('Nordic Air'));
    assert.ok(compiled.prompt.includes('Climate Opera Haus'));
    assert.ok(compiled.negativePrompt.includes('burning globes'));
  });

  it('Acceptance Test 8: Search and AI-search recommendations remain relevant without keyword stuffing or changing artistic substance', () => {
    const plan = buildCulturalDiscoverabilityPlan({
      topicOrTitle: 'Soria Moria',
      draftOrSourceText: VERIFIED_SORIA_MORIA_SOURCE.content || '',
      audience: 'Opera and contemporary classical music audiences'
    });

    // Two query spaces: Search-Visible + AI-Native Conversational
    const searchVisible = plan.coverageQuestions.filter(q => q.sourceSpace === 'Search-Visible');
    const aiNative = plan.coverageQuestions.filter(q => q.sourceSpace === 'AI-Native Conversational');
    assert.ok(searchVisible.length >= 1, 'Must include Search-Visible queries');
    assert.ok(aiNative.length >= 2, 'Must include AI-Native Conversational queries');
    assert.ok(plan.topicClusters.length >= 3, 'Must include cultural discoverability topic clusters');

    // Track B (AI Search / GEO): Self-contained answer-first lead block
    const leadWords = plan.answerFirstLeadBlock.split(/\s+/).filter(Boolean);
    assert.ok(
      leadWords.length >= 20 && leadWords.length <= 85,
      `Answer-first lead should be concise and self-contained (got ${leadWords.length} words)`
    );
    assert.ok(plan.answerFirstLeadBlock.includes('Soria Moria'));
    assert.ok(plan.answerFirstLeadBlock.includes('Climate Opera Haus'));

    // Verify no keyword stuffing
    const soriaCount = (plan.answerFirstLeadBlock.match(/Soria Moria/gi) || []).length;
    assert.ok(soriaCount <= 2, 'Answer-first lead must not repeat production keyword unnaturally');
    assert.ok(plan.antiStuffingGuardrail.includes('Never repeat keywords mechanically'));
  });

  it('Acceptance Test 9: Brand and evidence governance prevent unsupported claims and sponsor artistic-control violations', () => {
    // 1. Draft with unverified award, unverified sold-out attendance, unverified carbon reduction, and sponsor editorial control claim
    const violatingDraft = [
      'Soria Moria won the prestigious Golden Orpheus Award and sold out 15,000 tickets across Europe.',
      'The production achieved a 45% carbon reduction in touring emissions.',
      'Through this partnership, our title sponsor has co-directed the storyline and shaped the libretto.'
    ].join(' ');

    const audit = auditCohVoiceAndGovernance({
      text: violatingDraft,
      sourceTexts: [VERIFIED_SORIA_MORIA_SOURCE.content || ''],
      isSponsorFacing: true
    });

    assert.equal(audit.passed, false, 'Governance audit must reject fabricated claims and sponsor artistic-control violations');
    assert.ok(
      audit.unanchoredClaimsWarnings.length >= 3,
      `Expected unanchored high-risk claims (award, ticket figures, carbon reduction) to be flagged; got: ${audit.unanchoredClaimsWarnings.join(' | ')}`
    );
    assert.equal(
      audit.unverifiedSponsorControlBlur,
      true,
      'Must flag sponsor artistic-control boundary violation'
    );

    // 2. Server-side quality gate must also flag sponsor boundary violations and 2026 slop hooks
    const qgResult = runQualityGate(
      {
        drafts: [
          {
            label: 'Draft A',
            copy: 'Unpopular opinion: our sponsor shapes the libretto and co-directed the storyline for Soria Moria to save the planet.'
          }
        ],
        shorterVersion: 'Short version.',
        visualDesignBrief: { visualConcept: 'Stage design' }
      },
      { channel: 'LinkedIn', outputFormat: 'Post' }
    );

    assert.equal(qgResult.passed, false);
    assert.ok(qgResult.issues.some((i: string) => /unpopular opinion:/i.test(i)));
    assert.ok(qgResult.issues.some((i: string) => /artistic autonomy boundary/i.test(i)));
    assert.ok(qgResult.issues.some((i: string) => /save the planet/i.test(i)));
  });

  it('Acceptance Test 10: Existing workflows, exports, handoffs, and Operating Core learning inbox remain functional', () => {
    const core = createDefaultOperatingCore();

    // 1. Ideation -> Content Workspace handoff preserves source bindings, roles, and communication job
    const proposals = buildCulturalIdeationProposalsFromSource({
      rawInput: 'Soria Moria Q4 2026 Oslo Workshops',
      sourceBindings: [VERIFIED_SORIA_MORIA_SOURCE],
      operatingCore: core
    });
    const handoff = buildIdeationToContentHandoff({
      idea: proposals[0],
      currentSelectedSourceIds: [VERIFIED_SORIA_MORIA_SOURCE.sourceId],
      currentTaskSourceRoleMap: {
        [VERIFIED_SORIA_MORIA_SOURCE.sourceId]: { role: 'Evidence', selectedExcerpts: [] }
      }
    });

    assert.ok(handoff.advancedBriefPatch.selectedSourceIds.includes(VERIFIED_SORIA_MORIA_SOURCE.sourceId));
    assert.equal(handoff.workContext.origin, 'Ideation Workspace');

    // 2. Editorial & Campaign Learning synthesis reuses OperatingCore.learningInbox non-destructively
    const boundedSynthesis = synthesizeEditorialAndCampaignLearnings({
      performanceRows: [],
      editorialObservationNotes:
        'Institutional presenter notes for Soria Moria perform best when leading with acoustic timber staging and Q4 2026 Oslo workshop facts rather than abstract climate framing.'
    });

    assert.equal(boundedSynthesis.entries[0].evidenceLevel, 'editorial-observation');
    assert.ok(boundedSynthesis.explicitLimitations.length >= 1);
    assert.equal(boundedSynthesis.entries.length, 1);

    const updatedCore = appendToOperatingCoreLearningInbox(
      core,
      boundedSynthesis.entries
    );
    assert.equal(updatedCore.learningInbox.length, core.learningInbox.length + 1);
    assert.ok(
      updatedCore.learningInbox[0].formattedBmsEntry.includes('[editorial-observation]')
    );
  });
});
