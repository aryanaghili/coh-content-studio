import test from 'node:test';
import assert from 'node:assert/strict';

import {
  enforceSourceIntelligenceClaimDiscipline,
  compileSourceGroundingContext,
  loadSourceIntelligenceStore,
  SOURCE_INTELLIGENCE_STORAGE_KEY,
  SOURCE_INTELLIGENCE_SCHEMA_VERSION,
  SOURCE_INTELLIGENCE_DISCLAIMER,
  type SourceRecordLike
} from '../src/lib/sourceIntelligence.ts';
import { buildIdeationEvidenceProfile } from '../src/lib/ideationIntelligence.ts';
import { runQualityGate } from '../server/ai/qualityGate.js';
import type { TaskSourceBinding } from '../src/lib/contextCompiler.ts';

const SAMPLE_SOURCE: SourceRecordLike = {
  id: 'src-soria-moria-1',
  title: 'Soria Moria Artistic Brief',
  type: 'Core Brief',
  content:
    'Climate Opera Haus develops original climate operas. Soria Moria is the first opera in the tetralogy, combining mythic storytelling with scientific planetary inquiry. The production team convenes artists and scientists in Lisbon for staging workshops.',
  notes: 'Approved artistic brief for institutional communications.'
};

test('COH-CS-11 (1): Supported claim with exact evidence excerpt passes and produces groundedClaims anchor', () => {
  const analysis = enforceSourceIntelligenceClaimDiscipline(
    {
      keyFacts: ['Soria Moria is the first opera in the tetralogy, combining mythic storytelling with scientific planetary inquiry.'],
      supportedClaims: ['The production team convenes artists and scientists in Lisbon for staging workshops.'],
      usefulExcerpts: ['Soria Moria is the first opera in the tetralogy, combining mythic storytelling with scientific planetary inquiry.'],
      cautionsAndAmbiguities: []
    },
    SAMPLE_SOURCE
  );

  assert.equal(analysis.keyFacts.length, 1);
  assert.equal(analysis.supportedClaims.length, 1);
  assert.ok(Array.isArray(analysis.groundedFacts) && analysis.groundedFacts.length === 1);
  assert.ok(Array.isArray(analysis.groundedClaims) && analysis.groundedClaims.length === 1);
  assert.equal(analysis.groundedClaims![0].sourceId, SAMPLE_SOURCE.id);
  assert.ok(SAMPLE_SOURCE.content.includes(analysis.groundedClaims![0].evidenceExcerpt));
});

test('COH-CS-11 (2): Non-numeric hallucinated factual claim (e.g., UNESCO endorsement) is rejected from keyFacts/supportedClaims and moved to cautions', () => {
  const hallucinatedClaim = 'UNESCO has formally endorsed Climate Opera Haus.';
  const hallucinatedFact = 'The Berlin Philharmonic signed an exclusive co-production treaty with Climate Opera Haus.';

  const analysis = enforceSourceIntelligenceClaimDiscipline(
    {
      keyFacts: [
        hallucinatedFact,
        'Climate Opera Haus develops original climate operas.'
      ],
      supportedClaims: [
        hallucinatedClaim,
        'Soria Moria is the first opera in the tetralogy.'
      ],
      usefulExcerpts: ['Climate Opera Haus develops original climate operas.'],
      cautionsAndAmbiguities: []
    },
    SAMPLE_SOURCE
  );

  assert.ok(!analysis.keyFacts.includes(hallucinatedFact), 'Hallucinated non-numeric fact must be rejected');
  assert.ok(!analysis.supportedClaims.includes(hallucinatedClaim), 'Hallucinated non-numeric claim must be rejected');
  assert.equal(analysis.keyFacts.length, 1);
  assert.equal(analysis.supportedClaims.length, 1);
  assert.ok(
    analysis.cautionsAndAmbiguities.some(c => c.includes(hallucinatedClaim)),
    'Hallucinated claim must be flagged in cautionsAndAmbiguities'
  );
  assert.ok(
    analysis.cautionsAndAmbiguities.some(c => c.includes(hallucinatedFact)),
    'Hallucinated fact must be flagged in cautionsAndAmbiguities'
  );
});

test('COH-CS-11 (3): Numeric/date hallucinated claim fails and moves to cautionsAndAmbiguities', () => {
  const numericHallucination = 'The production secured 14.5 million EUR for 2028 staging workshops.';
  const analysis = enforceSourceIntelligenceClaimDiscipline(
    {
      keyFacts: [numericHallucination],
      supportedClaims: [numericHallucination],
      usefulExcerpts: [],
      cautionsAndAmbiguities: []
    },
    SAMPLE_SOURCE
  );

  assert.equal(analysis.keyFacts.length, 0);
  assert.equal(analysis.supportedClaims.length, 0);
  assert.ok(analysis.cautionsAndAmbiguities.some(c => c.includes('14.5')));
});

test('COH-CS-11 (4): Aspiration statement is kept out of supportedClaims and keyFacts', () => {
  const aspirationStatement = 'The production team aims to convene artists in Lisbon for future staging workshops.';
  const analysis = enforceSourceIntelligenceClaimDiscipline(
    {
      keyFacts: [aspirationStatement],
      supportedClaims: [aspirationStatement],
      usefulExcerpts: [],
      cautionsAndAmbiguities: []
    },
    SAMPLE_SOURCE
  );

  assert.equal(analysis.keyFacts.length, 0);
  assert.equal(analysis.supportedClaims.length, 0);
  assert.ok(analysis.cautionsAndAmbiguities.some(c => c.includes('Aspiration')));
});

test('COH-CS-11 (5): Approved Example and Visual Reference cannot supply factual evidence in Source Intelligence or Ideation', () => {
  const approvedExampleSource: SourceRecordLike = {
    ...SAMPLE_SOURCE,
    id: 'src-approved-ex',
    type: 'Approved Example'
  };
  const visualReferenceSource: SourceRecordLike = {
    ...SAMPLE_SOURCE,
    id: 'src-visual-ref',
    type: 'Visual Reference'
  };

  const exAnalysis = enforceSourceIntelligenceClaimDiscipline(
    {
      keyFacts: ['Climate Opera Haus develops original climate operas.'],
      supportedClaims: ['Soria Moria is the first opera in the tetralogy.']
    },
    approvedExampleSource
  );
  const visAnalysis = enforceSourceIntelligenceClaimDiscipline(
    {
      keyFacts: ['Climate Opera Haus develops original climate operas.'],
      supportedClaims: ['Soria Moria is the first opera in the tetralogy.']
    },
    visualReferenceSource
  );

  assert.equal(exAnalysis.keyFacts.length, 0);
  assert.equal(exAnalysis.supportedClaims.length, 0);
  assert.equal(visAnalysis.keyFacts.length, 0);
  assert.equal(visAnalysis.supportedClaims.length, 0);

  // Ideation evidence check with Approved Example, Visual Reference, and Strategic Context
  const profile = buildIdeationEvidenceProfile({
    rawInput: 'Announce Soria Moria',
    communicationJob: 'Establish institutional credibility',
    sourceBindings: [
      {
        sourceId: 'src-approved-ex',
        title: 'Example Post',
        type: 'Approved Example',
        role: 'Approved Example',
        content: SAMPLE_SOURCE.content
      },
      {
        sourceId: 'src-visual-ref',
        title: 'Moodboard',
        type: 'Visual Reference',
        role: 'Visual Reference',
        content: SAMPLE_SOURCE.content
      },
      {
        sourceId: 'src-strat',
        title: 'Strategy Memo',
        type: 'Strategy Note',
        role: 'Strategic Context',
        content: SAMPLE_SOURCE.content
      }
    ],
    aiAvailableEvidence: ['UNESCO has formally endorsed Climate Opera Haus.']
  });

  assert.equal(profile.availableEvidence.length, 1);
  assert.ok(profile.availableEvidence[0].includes('Protected COH Kernel positioning'));
  assert.ok(
    !profile.availableEvidence.some(e => e.includes('UNESCO')),
    'Unanchored AI evidence must never enter availableEvidence'
  );
  assert.ok(
    profile.unresolvedAssumptions.some(a => a.includes('UNESCO')),
    'Unanchored AI evidence must be routed to unresolvedAssumptions'
  );
});

test('COH-CS-11 (6): Ideation AI evidence without source attribution/anchor is rejected while grounded AI evidence is attributed', () => {
  const factualBinding: TaskSourceBinding = {
    sourceId: SAMPLE_SOURCE.id,
    title: SAMPLE_SOURCE.title,
    type: SAMPLE_SOURCE.type,
    role: 'Evidence',
    content: SAMPLE_SOURCE.content
  };

  const profile = buildIdeationEvidenceProfile({
    rawInput: 'Soria Moria workshops',
    communicationJob: 'Explain artistic logic',
    sourceBindings: [factualBinding],
    aiAvailableEvidence: [
      'The production team convenes artists and scientists in Lisbon for staging workshops.',
      'UNESCO has formally endorsed Climate Opera Haus as an official cultural envoy.'
    ]
  });

  assert.ok(
    profile.availableEvidence.some(
      e => e.includes(SAMPLE_SOURCE.title) && e.includes('The production team convenes artists and scientists in Lisbon')
    ),
    'Grounded AI evidence must be accepted and attributed to its source'
  );
  assert.ok(
    !profile.availableEvidence.some(e => e.includes('UNESCO')),
    'Ungrounded AI evidence must be rejected from availableEvidence'
  );
  assert.ok(
    profile.unresolvedAssumptions.some(a => a.includes('UNESCO')),
    'Ungrounded AI evidence must be moved to unresolvedAssumptions'
  );
});

test('COH-CS-11 (7): 15 large sources respect hard character budget cap (<= maxTotalChars)', () => {
  const maxTotalChars = 8000;
  const largeBindings: TaskSourceBinding[] = Array.from({ length: 15 }, (_, idx) => ({
    sourceId: `src-stress-${idx + 1}`,
    title: `Large Source Document ${idx + 1}`,
    type: 'Research / Reference',
    role: idx === 0 ? 'Must-use Material' : idx < 5 ? 'Evidence' : 'Strategic Context',
    content: `Paragraph ${idx + 1}: `.concat(
      'Climate Opera Haus combines operatic stagecraft, scientific dialogue, and institutional partnerships across international venues. '.repeat(25)
    )
  }));

  const compiled = compileSourceGroundingContext(largeBindings, 'Content Workspace', {
    maxTotalChars,
    minPerSourceChars: 900
  });

  assert.ok(
    compiled.formattedSection.length <= maxTotalChars,
    `Expected formattedSection.length (${compiled.formattedSection.length}) <= ${maxTotalChars}`
  );
  assert.ok(
    compiled.truncationWarnings.length > 0,
    'Expected truncation/omission warnings when 15 large sources exceed the 8000-char budget'
  );
  assert.ok(
    compiled.formattedSection.includes('Large Source Document 1'),
    'Highest-priority Must-use Material source must be included'
  );
});

test('COH-CS-11 (8): Legacy stored Source Intelligence records normalize safely without fabricating anchors', () => {
  const legacyPayload = {
    schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    records: {
      'src-legacy-1': {
        sourceId: 'src-legacy-1',
        sourceTitle: 'Legacy Brief',
        sourceType: 'Core Brief',
        schemaVersion: SOURCE_INTELLIGENCE_SCHEMA_VERSION,
        analyzedAt: new Date().toISOString(),
        analysisMode: 'ai',
        disclaimer: SOURCE_INTELLIGENCE_DISCLAIMER,
        keyFacts: [
          'Soria Moria is the first opera in the tetralogy.',
          'UNESCO has formally endorsed Climate Opera Haus.'
        ],
        supportedClaims: [
          'Soria Moria is the first opera in the tetralogy.',
          'European Central Bank funded the production.'
        ],
        strategicContext: 'Legacy context',
        cautionsAndAmbiguities: [],
        usefulExcerpts: ['Soria Moria is the first opera in the tetralogy.'],
        relevantAudiences: ['General Public'],
        relevantChannels: ['LinkedIn'],
        relevantPillars: ['Climate Tetralogy & Canon'],
        contentOpportunityHints: []
      }
    }
  };

  const mockStorage = {
    getItem(key: string) {
      return key === SOURCE_INTELLIGENCE_STORAGE_KEY ? JSON.stringify(legacyPayload) : null;
    }
  };

  const loaded = loadSourceIntelligenceStore(mockStorage);
  const rec = loaded['src-legacy-1'];
  assert.ok(rec, 'Legacy record should load safely');
  assert.deepEqual(rec.keyFacts, ['Soria Moria is the first opera in the tetralogy.']);
  assert.deepEqual(rec.supportedClaims, ['Soria Moria is the first opera in the tetralogy.']);
  assert.equal(rec.groundedFacts?.length, 1);
  assert.equal(rec.groundedClaims?.length, 1);
});

test('COH-CS-11 (9 & 10): Quality Gate catches malformed and ungrounded outputs across source_analysis, ideation, revision, and reframe', () => {
  // 1. Source analysis with hallucinated claim or non-verbatim excerpt fails quality gate
  const badSourceGate = runQualityGate(
    {
      keyFacts: ['UNESCO has formally endorsed Climate Opera Haus.'],
      supportedClaims: ['Soria Moria is the first opera in the tetralogy.'],
      cautionsAndAmbiguities: [],
      usefulExcerpts: ['Fabricated quote not in source.']
    },
    {
      mode: 'source_analysis',
      rawInput: SAMPLE_SOURCE.content
    }
  );
  assert.equal(badSourceGate.passed, false);
  assert.ok(badSourceGate.issues.some((i: string) => i.includes('Excerpt is not an exact substring')));
  assert.ok(badSourceGate.issues.some((i: string) => i.includes('UNESCO')));

  // Valid source analysis passes quality gate
  const goodSourceGate = runQualityGate(
    {
      keyFacts: ['Climate Opera Haus develops original climate operas.'],
      supportedClaims: ['Soria Moria is the first opera in the tetralogy.'],
      cautionsAndAmbiguities: ['No venue date confirmed yet.'],
      usefulExcerpts: ['Climate Opera Haus develops original climate operas.']
    },
    {
      mode: 'source_analysis',
      rawInput: SAMPLE_SOURCE.content
    }
  );
  assert.equal(goodSourceGate.passed, true, `Expected pass, got: ${goodSourceGate.issues.join('; ')}`);

  // 2. Ideation with missing fields or [INSERT] placeholder or ungrounded evidence fails quality gate
  const badIdeationGate = runQualityGate(
    {
      ideaGroups: [
        {
          groupTitle: 'Strongest Directions',
          ideas: [
            {
              title: 'UNESCO Endorsement Angle',
              communicationJob: 'Establish institutional credibility',
              shortExplanation: 'Announce [INSERT PARTNER NAME] endorsement.',
              availableEvidence: ['UNESCO has formally endorsed Climate Opera Haus.']
            }
          ]
        }
      ]
    },
    {
      mode: 'ideation',
      sourceContent: SAMPLE_SOURCE.content
    }
  );
  assert.equal(badIdeationGate.passed, false);
  assert.ok(badIdeationGate.issues.some((i: string) => i.includes('placeholder')));
  assert.ok(badIdeationGate.issues.some((i: string) => i.includes('UNESCO')));

  // 3. Revision with English output when Persian translation was requested fails quality gate
  const badPersianRevisionGate = runQualityGate(
    {
      revisedCopy: '[Translated to Persian] Climate Opera Haus develops original climate operas in Lisbon.'
    },
    {
      mode: 'revision',
      language: 'Persian',
      previousDraft: 'Climate Opera Haus develops original climate operas in Lisbon.'
    }
  );
  assert.equal(badPersianRevisionGate.passed, false);
  assert.ok(badPersianRevisionGate.issues.some((i: string) => i.includes('Persian script')));

  // Valid Persian revision passes quality gate
  const goodPersianRevisionGate = runQualityGate(
    {
      revisedCopy: 'خانه اپرای اقلیمی اپراهای اصیل اقلیمی را در لیسبون توسعه می‌دهد.'
    },
    {
      mode: 'revision',
      language: 'Persian',
      previousDraft: 'Climate Opera Haus develops original climate operas in Lisbon.'
    }
  );
  assert.equal(goodPersianRevisionGate.passed, true);

  // 4. Reframe with missing explanations or invented numbers fails quality gate
  const badReframeGate = runQualityGate(
    {
      reframedCopy: 'Climate Opera Haus convenes 450 scientists in Lisbon for 2029 workshops.',
      changedExplanation: [],
      preservedExplanation: []
    },
    {
      mode: 'reframe',
      sourceContent: SAMPLE_SOURCE.content
    }
  );
  assert.equal(badReframeGate.passed, false);
  assert.ok(badReframeGate.issues.some((i: string) => i.includes('changedExplanation')));
  assert.ok(badReframeGate.issues.some((i: string) => i.includes('450')));
});
