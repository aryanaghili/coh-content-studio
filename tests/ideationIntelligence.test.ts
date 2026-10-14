import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COH_COMMUNICATION_JOBS,
  COH_VALID_AUDIENCES,
  classifyReuseOpportunity,
  buildIdeationEvidenceProfile,
  evaluateOpportunityDiversity,
  enforceOpportunityDiversity,
  enrichAndDiversifyOpportunities,
  buildIdeationToContentHandoff
} from '../src/lib/ideationIntelligence.ts';
import { buildDeterministicSourceAnalysis } from '../src/lib/sourceIntelligence.ts';

describe('COH-CS-04 Ideation 2.0 - Opportunity-Led, Evidence-Aware and Reuse-Aware Ideation', () => {
  it('1. Enforces COH communication jobs, strategic diversity, and prevents non-COH segment leakage', () => {
    const rawCosmeticDuplicates = [
      {
        id: 'opp-1',
        title: 'The Golden Fountain and Acoustic Architecture',
        explanation: 'How the opera uses acoustic space.',
        communicationJob: 'Establish institutional credibility',
        strategicAngle: 'Same Angle',
        suggestedAudience: 'Enterprise SaaS Buyers' // Invalid Turbocharger-style segment
      },
      {
        id: 'opp-2',
        title: 'Acoustic Architecture in The Golden Fountain',
        explanation: 'Why the opera uses acoustic space.',
        communicationJob: 'Establish institutional credibility',
        strategicAngle: 'Same Angle',
        suggestedAudience: 'Sponsors & Patrons'
      },
      {
        id: 'opp-3',
        title: 'Staging Planetary Thresholds in Opera',
        explanation: 'Connecting science and dramatic tension.',
        communicationJob: 'Establish institutional credibility',
        strategicAngle: 'Same Angle',
        suggestedAudience: 'General Public'
      }
    ];

    const enriched = enrichAndDiversifyOpportunities({
      rawProposals: rawCosmeticDuplicates,
      rawInput: 'The Golden Fountain acoustic architecture',
      defaultAudience: 'General Public',
      defaultChannel: 'LinkedIn',
      defaultLanguage: 'English',
      sourceBindings: [],
      savedIdeas: [],
      savedContents: []
    });

    const diversity = evaluateOpportunityDiversity(enriched);
    assert.equal(diversity.uniqueCommunicationJobs, 3, 'Should diversify duplicate communication jobs');
    assert.ok(diversity.isDiverse, 'Enriched opportunity set should pass diversity check');

    // Verify invalid Enterprise SaaS Buyers segment was sanitized back to COH audience
    assert.equal(enriched[0].suggestedAudience, 'General Public');
    for (const item of enriched) {
      assert.ok(item.communicationJob.length > 0);
      assert.ok(!item.title.includes('\u2014'), 'No em dashes allowed');
    }
  });

  it('2. Separates Available Evidence from Advisory Evidence Still Required and blocks Approved Example / Visual Reference claims', () => {
    const factualSourceAnalysis = buildDeterministicSourceAnalysis({
      id: 'src-fact-1',
      title: 'Act II Dramaturgy Notes',
      type: 'Opera / Dramaturgy Note',
      content: 'The Golden Fountain Act II features a 24-voice chorus representing glacial meltwater thresholds.'
    });

    const approvedExampleAnalysis = buildDeterministicSourceAnalysis({
      id: 'src-ex-1',
      title: 'Past Institutional LinkedIn Post',
      type: 'Approved Example',
      content: ' Over 500 partners joined our 2024 symposium in Vienna.'
    });

    // Case A: Factual source attached as Must-use Material + Approved Example
    const profileWithFact = buildIdeationEvidenceProfile({
      rawInput: 'Choral architecture of Act II',
      communicationJob: 'Explain artistic logic',
      sourceBindings: [
        {
          sourceId: 'src-fact-1',
          title: 'Act II Dramaturgy Notes',
          type: 'Opera / Dramaturgy Note',
          role: 'Must-use Material',
          content: 'The Golden Fountain Act II features a 24-voice chorus representing glacial meltwater thresholds.'
        },
        {
          sourceId: 'src-ex-1',
          title: 'Past Institutional LinkedIn Post',
          type: 'Approved Example',
          role: 'Approved Example',
          content: 'Over 500 partners joined our 2024 symposium in Vienna.'
        }
      ],
      derivedSourceAnalyses: {
        'src-fact-1': factualSourceAnalysis,
        'src-ex-1': approvedExampleAnalysis
      },
      aiEvidenceStillRequired: ['Verify [INSERT VENUE DATE] before announcing premiere']
    });

    assert.ok(
      profileWithFact.availableEvidence.some(e => e.includes('24-voice chorus')),
      'Should include traceable fact from Must-use Material source'
    );
    assert.ok(
      !profileWithFact.availableEvidence.some(e => e.includes('500 partners')),
      'Must NEVER include factual claims from Approved Example source'
    );
    assert.ok(
      profileWithFact.evidenceStillRequired.every(r => !r.includes('[INSERT')),
      'Missing evidence must be sanitized into advisory text without raw placeholder blockers'
    );
  });

  it('3. Classifies Reuse Opportunities across Idea Library and Content Library without embeddings or DB', () => {
    const savedIdeas = [
      {
        id: 'idea-lib-1',
        title: 'Somatic resonance vs climate policy reports',
        explanation: 'Exploring how live operatic vocal vibration bypasses intellectual fatigue around climate data.',
        suggestedChannel: 'LinkedIn',
        suggestedAudience: 'General Public'
      }
    ];

    const savedContents = [
      {
        id: 'content-lib-1',
        title: 'The Golden Fountain as Long-Horizon Cultural IP',
        text: 'Live opera is the origin asset that anchors multi-horizon cultural IP and institutional prestige for partners.',
        channel: 'LinkedIn',
        audience: 'Sponsors & Patrons',
        pillar: 'Institutional & Sponsor Value'
      }
    ];

    // A: New Ground
    const newGround = classifyReuseOpportunity({
      candidateTitle: 'Costume textile fabrication from bio-materials',
      candidateConcept: 'Behind the scenes of artisanal stage costume design and biodegradable textiles.',
      candidateAudience: 'General Public',
      candidateChannel: 'Instagram',
      savedIdeas,
      savedContents
    });
    assert.equal(newGround.classification, 'New Ground');

    // B: Extend Existing Idea
    const extendIdea = classifyReuseOpportunity({
      candidateTitle: 'Why vocal vibration and somatic resonance outperform policy reports',
      candidateConcept: 'Live operatic vocal vibration bypasses intellectual fatigue around climate data.',
      candidateAudience: 'General Public',
      candidateChannel: 'LinkedIn',
      savedIdeas,
      savedContents
    });
    assert.equal(extendIdea.classification, 'Extend Existing Idea');
    assert.equal(extendIdea.matchedItemId, 'idea-lib-1');
    assert.equal(extendIdea.matchedItemType, 'idea');

    // C: Reframe Existing Content (same core subject as content-lib-1, different audience/channel)
    const reframeContent = classifyReuseOpportunity({
      candidateTitle: 'The Golden Fountain as Long-Horizon Cultural IP for Public Audiences',
      candidateConcept: 'How live opera acts as the origin asset anchoring multi-horizon cultural IP.',
      candidateAudience: 'General Public',
      candidateChannel: 'Newsletter',
      savedIdeas,
      savedContents
    });
    assert.equal(reframeContent.classification, 'Reframe Existing Content');
    assert.equal(reframeContent.matchedItemId, 'content-lib-1');
    assert.equal(reframeContent.matchedItemType, 'content');

    // D: Reuse Existing Argument (same core subject, same audience & channel)
    const reuseArg = classifyReuseOpportunity({
      candidateTitle: 'The Golden Fountain as Long-Horizon Cultural IP and Institutional Prestige',
      candidateConcept: 'Live opera is the origin asset anchoring multi-horizon cultural IP and institutional prestige for partners.',
      candidateAudience: 'Sponsors & Patrons',
      candidateChannel: 'LinkedIn',
      savedIdeas,
      savedContents
    });
    assert.equal(reuseArg.classification, 'Reuse Existing Argument');
    assert.equal(reuseArg.matchedItemId, 'content-lib-1');
  });

  it('4. Carries full context forward when promoting an Idea to Content Workspace', () => {
    const enriched = enrichAndDiversifyOpportunities({
      rawProposals: [
        {
          id: 'idea-promote-1',
          title: 'Institutional Value of The Golden Fountain',
          explanation: 'Positioning the opera as a flagship cultural anchor for European venues.',
          communicationJob: 'Establish institutional credibility',
          whyItWorks: 'Demonstrates long-term repertoire value.',
          coreTension: 'Venues need contemporary repertoire that attracts new audiences.',
          desiredAudienceResponse: 'Request institutional partnership dossier.',
          suggestedAudience: 'Strategic Partners',
          suggestedChannel: 'LinkedIn',
          suggestedFormat: 'Thought Piece',
          suggestedPillar: 'Institutional & Sponsor Value',
          strategicAngle: 'Repertoire Longevity'
        }
      ],
      rawInput: 'Institutional value of The Golden Fountain',
      defaultAudience: 'Strategic Partners',
      defaultChannel: 'LinkedIn',
      defaultLanguage: 'English',
      sourceBindings: [
        {
          sourceId: 'src-milestone-99',
          title: '2026 Production Dossier',
          type: 'Milestone / Announcement',
          role: 'Must-use Material',
          content: 'Confirmed workshop presentation scheduled for Autumn 2026.'
        }
      ],
      savedIdeas: [],
      savedContents: []
    });

    const promotedIdea = enriched[0];
    const handoff = buildIdeationToContentHandoff({
      idea: promotedIdea,
      currentSelectedSourceIds: ['src-milestone-99'],
      currentTaskSourceRoleMap: {
        'src-milestone-99': { role: 'Must-use Material', selectedExcerpts: [] }
      }
    });

    assert.equal(handoff.advancedBriefPatch.topic, 'Institutional Value of The Golden Fountain');
    assert.equal(handoff.advancedBriefPatch.purpose, 'Establish institutional credibility');
    assert.equal(handoff.advancedBriefPatch.audience, 'Strategic Partners');
    assert.equal(handoff.advancedBriefPatch.channel, 'LinkedIn');
    assert.equal(handoff.advancedBriefPatch.outputFormat, 'Thought Piece');
    assert.equal(handoff.advancedBriefPatch.pillar, 'Institutional & Sponsor Value');
    assert.deepEqual(handoff.advancedBriefPatch.selectedSourceIds, ['src-milestone-99']);
    assert.equal(handoff.restoredRoleMap['src-milestone-99'].role, 'Must-use Material');
    assert.equal(handoff.workContext.origin, 'Ideation Workspace');
    assert.equal(handoff.workContext.originId, 'idea-promote-1');
    assert.equal(handoff.workContext.communicationJob, 'Establish institutional credibility');
    assert.equal(handoff.workContext.strategicAngle, 'Repertoire Longevity');
  });
});
