import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveReframeIntent,
  buildDeterministicReframe,
  finalizeReframeResult,
  buildReframeLineageMetadata
} from '../src/lib/reframingEngine.ts';

describe('COH-CS-05 Dedicated COH Reframing Studio (Journeys A through H)', () => {
  const samplePublicSource =
    'Soria Moria is the foundational first work in The Climate Tetralogy by Climate Opera Haus. "The opera creates the world, and the world outlives the stage." Performed first in 2026.';

  it('Journey A & B: Institutional reframe + Low-familiarity audience resolution and execution', () => {
    const plan = resolveReframeIntent({
      rawIntent:
        'Make this useful to a cultural institution that knows little about COH and needs to understand why this belongs in its programming strategy.',
      sourceContent: samplePublicSource,
      originChannel: 'Website',
      originAudience: 'General Public'
    });

    assert.equal(plan.recommendedRoute, 'REFRAME');
    assert.equal(plan.targetAudience, 'Cultural institutions');
    assert.equal(plan.audienceFamiliarity, 'Low Familiarity (Needs foundational COH context)');
    assert.equal(plan.communicationPurpose, 'Establish institutional credibility');

    const result = buildDeterministicReframe({
      sourceContent: samplePublicSource,
      plan
    });

    assert.ok(
      result.reframedCopy.includes('Cultural institutions') ||
        result.reframedCopy.includes('Institutional Programming Perspective'),
      'Output must reflect institutional programming framing'
    );
    assert.ok(
      result.reframedCopy.includes('encountering Climate Opera Haus for the first time'),
      'Output must include low-familiarity foundational COH introduction'
    );
    assert.ok(result.changedExplanation.length >= 2);
    assert.ok(result.preservedExplanation.length >= 2);
  });

  it('Journey C & D: Channel/format adaptation (LinkedIn post) and Strategic shift (Sponsorship -> Climate Literacy)', () => {
    const plan = resolveReframeIntent({
      rawIntent:
        'Shift this from a sponsorship pitch into a climate literacy LinkedIn post for the general public.',
      sourceContent: samplePublicSource,
      originChannel: 'Email / Direct Outreach',
      originAudience: 'Sponsors & Patrons'
    });

    assert.equal(plan.recommendedRoute, 'REFRAME');
    assert.equal(plan.targetChannel, 'LinkedIn');
    assert.equal(plan.targetFormat, 'Post');
    assert.equal(plan.communicationPurpose, 'Build climate literacy');
    assert.equal(plan.contentPillarEmphasis, 'Education, Community & Climate Literacy');

    const result = buildDeterministicReframe({
      sourceContent: samplePublicSource,
      plan
    });

    assert.ok(result.reframedCopy.includes('Climate Literacy & Human Meaning'));
    assert.ok(result.reframedCopy.includes('LinkedIn - Post'));
  });

  it('Journey E: Revision detection routes pure shortening/smoothing requests to Revision Studio', () => {
    const plan = resolveReframeIntent({
      rawIntent: 'Make this 25% shorter and smoother',
      sourceContent: samplePublicSource
    });

    assert.equal(plan.recommendedRoute, 'REVISION');
    assert.equal(plan.suggestedRevisionActionId, 'shorter');
    assert.ok(plan.routeRationale.includes('Revision Studio'));
  });

  it('Journey F: Evidence protection blocks fabricated proof when user requests unsupported claims', () => {
    const bareSource =
      'Climate Opera Haus develops original operatic works exploring planetary thresholds.';
    const plan = resolveReframeIntent({
      rawIntent:
        'Reframe for sponsors and prove that we already have 10 million euros in confirmed funding and sold out venues.',
      sourceContent: bareSource,
      sourceBindings: []
    });

    assert.ok(
      plan.unresolvedItems.some(w => w.includes('Evidence Protection Warning')),
      'Must flag evidence protection warning when unverified quantitative proof is requested'
    );

    const result = buildDeterministicReframe({
      sourceContent: bareSource,
      plan
    });

    assert.ok(
      !result.reframedCopy.includes('10 million'),
      'Must never fabricate unverified numbers requested in the prompt'
    );
    assert.ok(result.evidenceWarnings.length > 0);
  });

  it('Journey G & H: Protected quote remains verbatim in deterministic reframe, missing AI quote is flagged without fake wrapper, and saved lineage preserves origin without overwriting', () => {
    const plan = resolveReframeIntent({
      rawIntent: 'Reframe this for strategic partners on LinkedIn.',
      sourceContent: samplePublicSource
    });

    // Deterministic reframe retains required quote verbatim without synthetic wrapper
    const detResult = buildDeterministicReframe({
      sourceContent: samplePublicSource,
      plan
    });
    assert.equal(detResult.preservedQuotesVerified, true);
    assert.ok(
      detResult.reframedCopy.includes('"The opera creates the world, and the world outlives the stage."'),
      'Exact double-quoted text must remain verbatim when Direct quotations is protected'
    );
    assert.ok(
      !detResult.reframedCopy.includes('As noted directly in the source material:'),
      'Must not append synthetic quote wrapper'
    );

    // If raw AI copy omitted the required quote, finalizeReframeResult flags it truthfully rather than appending a fake wrapper
    const finalizedMissingQuote = finalizeReframeResult({
      sourceContent: samplePublicSource,
      rawReframedCopy: 'Strategic framing for partners around Soria Moria in 2026.',
      plan
    });
    assert.equal(finalizedMissingQuote.preservedQuotesVerified, false);
    assert.ok(
      !finalizedMissingQuote.reframedCopy.includes('As noted directly in the source material:')
    );

    const lineage = buildReframeLineageMetadata({
      originType: 'Content Library',
      originContentId: 'saved-lib-101',
      originTitle: 'Original Soria Moria Overview',
      plan,
      sourceIds: ['src-1']
    });

    assert.equal(lineage.originContentId, 'saved-lib-101');
    assert.equal(lineage.transformationType, 'reframe');
    assert.deepEqual(lineage.sourceReferences, ['src-1']);
  });
});
