import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveReframeIntent,
  finalizeReframeResult,
  buildDeterministicReframe,
  verifyReframedElementContinuity,
  NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES
} from '../src/lib/reframingEngine.ts';
import {
  compileRevisionRecipe,
  executeDeterministicRevisionRecipe,
  validateRevisionTranslationOutput
} from '../src/lib/smartBriefAndRevision.ts';
import { isAiRequiredRevisionAction } from '../src/lib/revisionActions.ts';

const SOURCE_WITH_DATES_NAMES_QUOTES =
  'In October 2026, Climate Opera Haus convenes 45 artists and scientists at Teatro Nacional de São Carlos in Lisbon with Artistic Director Elena Rostova. "The opera creates the world, and the world outlives the stage."';

test('COH-CS-12 (1): Reframe preserves source dates/numbers and truthfully reports retained unchanged', () => {
  const plan = resolveReframeIntent({
    rawIntent: 'Reframe this for cultural institutions on LinkedIn.',
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES
  });

  const result = finalizeReframeResult({
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES,
    rawReframedCopy:
      'In October 2026, Climate Opera Haus convenes 45 artists and scientists at Teatro Nacional de São Carlos in Lisbon with Artistic Director Elena Rostova. "The opera creates the world, and the world outlives the stage."',
    plan
  });

  assert.equal(result.integrityCheckPassed, true);
  assert.ok(
    result.preservedExplanation.some(
      line => line.includes('Confirmed Facts & Dates (retained unchanged)') && line.includes('October 2026') && line.includes('45')
    )
  );
});

test('COH-CS-12 (2): Reframe that alters or invents a date/number is flagged as altered and blocked', () => {
  const plan = resolveReframeIntent({
    rawIntent: 'Reframe this for cultural institutions on LinkedIn.',
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES
  });

  const result = finalizeReframeResult({
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES,
    rawReframedCopy:
      'In November 2028, Climate Opera Haus convenes 120 artists at Teatro Nacional de São Carlos with Elena Rostova. "The opera creates the world, and the world outlives the stage."',
    plan
  });

  assert.equal(result.integrityCheckPassed, false);
  assert.ok(result.evidenceWarnings.some(w => w.includes('2028') || w.includes('120')));
  assert.ok(
    result.elementVerification.some(r => r.status === 'altered and blocked' && (r.token === '2028' || r.token === '120'))
  );
  assert.ok(
    !result.preservedExplanation.some(line => line.includes('Confirmed Facts & Dates (retained unchanged)')),
    'Must not falsely claim dates/numbers were preserved when they were altered'
  );
});

test('COH-CS-12 (3): Reframe that drops a protected proper name/entity does not claim it was preserved and flags review', () => {
  const plan = resolveReframeIntent({
    rawIntent: 'Reframe this for cultural institutions on LinkedIn.',
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES
  });

  // Drop "Elena Rostova" while "Names & proper titles" is in protectedElements
  const result = finalizeReframeResult({
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES,
    rawReframedCopy:
      'In October 2026, Climate Opera Haus convenes 45 artists in Lisbon. "The opera creates the world, and the world outlives the stage."',
    plan
  });

  const elenaRecord = result.elementVerification.find(
    r => r.category === 'Proper Name / Title' && r.token.includes('Elena Rostova')
  );
  assert.ok(elenaRecord, 'Should track proper name Elena Rostova');
  assert.equal(elenaRecord!.status, 'requires review');
  assert.ok(
    result.evidenceWarnings.some(w => w.includes('Elena Rostova')),
    'Must warn that protected name Elena Rostova was omitted'
  );
});

test('COH-CS-12 (4): Required protected quote remains verbatim when enabled', () => {
  const plan = resolveReframeIntent({
    rawIntent: 'Reframe this for strategic partners on LinkedIn.',
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES
  });

  const detResult = buildDeterministicReframe({
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES,
    plan
  });

  assert.equal(detResult.preservedQuotesVerified, true);
  assert.ok(detResult.reframedCopy.includes('"The opera creates the world, and the world outlives the stage."'));
});

test('COH-CS-12 (5): Quote protection disabled allows quote omission without re-injecting it', () => {
  const plan = resolveReframeIntent({
    rawIntent: 'Reframe this for strategic partners on LinkedIn.',
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES
  });
  plan.protectedElements = plan.protectedElements.filter(e => e !== 'Direct quotations (verbatim)');

  const detResult = buildDeterministicReframe({
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES,
    plan
  });

  assert.ok(
    !detResult.reframedCopy.includes('"The opera creates the world, and the world outlives the stage."'),
    'Deterministic reframe must omit the quote when Direct quotations (verbatim) is disabled'
  );
  assert.equal(detResult.preservedQuotesVerified, true);
  assert.ok(
    detResult.elementVerification.some(
      r => r.category === 'Direct Quotation' && r.status === 'intentionally omitted'
    )
  );
});

test('COH-CS-12 (6): No synthetic "As noted directly in the source material:" wrapper is ever appended', () => {
  const plan = resolveReframeIntent({
    rawIntent: 'Reframe this for strategic partners on LinkedIn.',
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES
  });

  // Pass raw AI copy that omitted the quote; finalizeReframeResult must flag it, NOT append fake quote text
  const finalized = finalizeReframeResult({
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES,
    rawReframedCopy:
      'In October 2026, Climate Opera Haus convenes 45 artists in Lisbon with Elena Rostova.',
    plan
  });

  assert.ok(!finalized.reframedCopy.includes('As noted directly in the source material:'));
  assert.equal(finalized.preservedQuotesVerified, false);
  assert.equal(finalized.integrityCheckPassed, false);
  assert.ok(finalized.evidenceWarnings.some(w => w.includes('Protected Quotation Missing')));
});

test('COH-CS-12 (7): Non-negotiable factual integrity remains active even if all optional preservation preferences are unchecked', () => {
  const plan = resolveReframeIntent({
    rawIntent: 'Reframe this for general public.',
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES
  });
  // Uncheck all optional preservation preferences
  plan.protectedElements = [];

  assert.equal(plan.nonNegotiableIntegrityRules?.length, NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES.length);

  // Attempt to pass an AI draft with an invented number (999) or mutated direct quote
  const verify = verifyReframedElementContinuity({
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES,
    reframedCopy: 'Climate Opera Haus convenes 999 scientists. "A mutated fake quote that was never said."',
    protectedElements: []
  });

  assert.equal(verify.integrityCheckPassed, false);
  assert.ok(verify.integrityWarnings.some(w => w.includes('999')));
  assert.ok(verify.integrityWarnings.some(w => w.includes('mutated or fabricated direct quote')));
});

test('COH-CS-12 (8): Revision-recommended request ("Make this 25% shorter and smoother") classifies as REVISION route', () => {
  const plan = resolveReframeIntent({
    rawIntent: 'Make this 25% shorter and smoother',
    sourceContent: SOURCE_WITH_DATES_NAMES_QUOTES
  });

  assert.equal(plan.recommendedRoute, 'REVISION');
  assert.equal(plan.suggestedRevisionActionId, 'shorter');
});

test('COH-CS-12 (9, 10, 11): Offline translation to PT-EU or Persian does not produce fake translated output and preserves draft', () => {
  const originalDraft =
    'Climate Opera Haus develops original operatic worlds anchored by live performance.';

  // PT-EU translation recipe
  const ptRecipe = compileRevisionRecipe(['translate-selected'], {
    targetLanguage: 'Portuguese (European)'
  });
  assert.equal(ptRecipe.requiresAiExecution, true);
  assert.equal(
    isAiRequiredRevisionAction(['translate-selected'], { targetLanguage: 'Portuguese (European)' }),
    true
  );

  assert.throws(
    () =>
      executeDeterministicRevisionRecipe(originalDraft, ptRecipe, {
        targetLanguage: 'Portuguese (European)'
      }),
    /AI Connection Required/,
    'Offline PT-EU translation must throw rather than prepending a fake [PT-EU] header to English text'
  );

  // Persian translation recipe
  const faRecipe = compileRevisionRecipe(['persian-natural'], {
    targetLanguage: 'Persian (Farsi)'
  });
  assert.equal(faRecipe.requiresAiExecution, true);

  assert.throws(
    () =>
      executeDeterministicRevisionRecipe(originalDraft, faRecipe, {
        targetLanguage: 'Persian (Farsi)'
      }),
    /AI Connection Required/,
    'Offline Persian translation must throw rather than prepending a fake [FA] header to English text'
  );
});

test('COH-CS-12 (12): Deterministic-safe cleanup actions still work offline without AI', () => {
  const dirtyDraft =
    'Here is: Climate Opera Haus — guaranteed 100% impact — develops **original operatic worlds**. Climate Opera Haus develops original operatic worlds.';
  const cleanRecipe = compileRevisionRecipe(
    ['clean-ai-punctuation', 'remove-repetition', 'more-careful'],
    { targetLanguage: 'English' }
  );

  assert.equal(cleanRecipe.requiresAiExecution, false);
  const cleaned = executeDeterministicRevisionRecipe(dirtyDraft, cleanRecipe, {
    targetLanguage: 'English'
  });

  assert.ok(!cleaned.includes('—'), 'Must strip em dashes');
  assert.ok(!cleaned.includes('**'), 'Must strip markdown bold artifacts');
  assert.ok(!cleaned.includes('100%'), 'Must soften unsupported 100% claim');
});

test('COH-CS-12 (13): AI translation output validator checks Persian script and PT-EU target language integrity', () => {
  const englishDraft =
    'The production team convenes artists and scientists in Lisbon with their institutional partners through this season.';

  // Persian check: fails if English text or fake header is returned, passes with real Persian script
  const badPersian = validateRevisionTranslationOutput({
    revisedCopy: englishDraft,
    previousDraft: englishDraft,
    targetLanguage: 'Persian (Farsi)',
    actionIds: ['persian-natural']
  });
  assert.equal(badPersian.valid, false);

  const goodPersian = validateRevisionTranslationOutput({
    revisedCopy: 'گروه تولید در لیسبون هنرمندان و دانشمندان را گرد هم می‌آورد.',
    previousDraft: englishDraft,
    targetLanguage: 'Persian (Farsi)',
    actionIds: ['persian-natural']
  });
  assert.equal(goodPersian.valid, true);

  // PT-EU check: fails if unchanged English or fake [PT-EU] prefix is returned, passes with real PT-EU text
  const badPtUnchanged = validateRevisionTranslationOutput({
    revisedCopy: englishDraft,
    previousDraft: englishDraft,
    targetLanguage: 'Portuguese (European)',
    actionIds: ['translate-selected']
  });
  assert.equal(badPtUnchanged.valid, false);

  const badPtFakeHeader = validateRevisionTranslationOutput({
    revisedCopy: `[PT-EU | Português Europeu] Na Climate Opera Haus...\n\n${englishDraft}`,
    previousDraft: englishDraft,
    targetLanguage: 'Portuguese (European)',
    actionIds: ['translate-selected']
  });
  assert.equal(badPtFakeHeader.valid, false);

  const goodPt = validateRevisionTranslationOutput({
    revisedCopy:
      'A equipa de produção reúne artistas e cientistas em Lisboa com os seus parceiros institucionais ao longo desta temporada.',
    previousDraft: englishDraft,
    targetLanguage: 'Portuguese (European)',
    actionIds: ['translate-selected']
  });
  assert.equal(goodPt.valid, true);
});
