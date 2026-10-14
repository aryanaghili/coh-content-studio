import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveSmartBrief,
  resolveGenerationSpeedConfig,
  suggestRevisionActions,
  detectRevisionConflicts,
  compileRevisionRecipe,
  executeDeterministicRevisionRecipe
} from '../src/lib/smartBriefAndRevision.ts';
import { REVISION_ACTIONS } from '../src/lib/revisionActions.ts';

describe('COH-CS-06 Smart Brief, Fast/Explore Mode, and Revision Productivity', () => {
  it('Part A: resolveSmartBrief resolves natural-language requests, tracks provenance, and separates Suggested vs Selected sources', () => {
    const availableSources = [
      {
        id: 'src-nordic',
        title: 'Nordic Air Curatorial Dossier',
        type: 'Core Fact',
        content: 'Nordic Air explores atmospheric tipping points through operatic worldbuilding for seasonal programming.',
        selectable: true
      },
      {
        id: 'src-sponsor',
        title: 'Sponsor Partnership Deck',
        type: 'Approved Example',
        content: 'CSR alignment and brand visibility.',
        selectable: true
      }
    ];

    const resolved = resolveSmartBrief({
      rawRequest:
        'Create a LinkedIn post for cultural institutions explaining why COH Nordic Air belongs in their seasonal programming.',
      selectedSourceIds: [],
      availableSources
    });

    assert.equal(resolved.channel.value, 'LinkedIn');
    assert.equal(resolved.channel.provenance, 'resolved');
    assert.equal(resolved.audience.value, 'Cultural Institutions');
    assert.equal(resolved.pillar.value, 'The Tetralogy & Operatic Worldbuilding');
    assert.equal(resolved.purpose.value, 'Establish institutional credibility and curatorial relevance');

    // Suggested source matched by keywords ('nordic', 'programming'), NOT silently marked 'selected'
    assert.equal(resolved.selectedSourceIds.length, 0);
    const nordicMatch = resolved.suggestedSources.find(s => s.sourceId === 'src-nordic');
    assert.ok(nordicMatch, 'Expected Nordic Air source to be suggested');
    assert.equal(nordicMatch.status, 'suggested');
  });

  it('Part B: resolveGenerationSpeedConfig differentiates Fast (1 focused draft) vs Explore (multi-option)', () => {
    const fast = resolveGenerationSpeedConfig('fast');
    const explore = resolveGenerationSpeedConfig('explore');

    assert.equal(fast.draftCount, 1);
    assert.equal(fast.includeAlternativeOptionB, false);
    assert.equal(fast.includeShorterVersionCard, false);
    assert.equal(fast.includeVisualDirection, true);

    assert.equal(explore.draftCount, 3);
    assert.equal(explore.includeAlternativeOptionB, true);
    assert.equal(explore.includeShorterVersionCard, true);
    assert.equal(explore.includeVisualDirection, true);
  });

  it('Part C: suggestRevisionActions returns draft-dependent recommendations (max 3)', () => {
    const dirtyDraft =
      'Here is: Climate Opera Haus — the undisputed 100% largest in history — creates **operatic worlds** that are guaranteed to transform everything.';
    const suggestionsA = suggestRevisionActions(dirtyDraft, { hasAttachedSources: false });

    assert.ok(suggestionsA.length > 0 && suggestionsA.length <= 3);
    assert.equal(suggestionsA[0].actionId, 'clean-ai-punctuation');
    assert.ok(suggestionsA.some(s => s.actionId === 'more-careful'));

    const genericNgoDraft =
      'We must save the planet from urgent crisis and catastrophe by leveraging stakeholder synergy across global networks.';
    const suggestionsB = suggestRevisionActions(genericNgoDraft, { hasAttachedSources: true });
    assert.ok(suggestionsB.some(s => s.actionId === 'less-ngo' || s.actionId === 'coh-specific'));
    assert.notDeepEqual(
      suggestionsA.map(s => s.actionId),
      suggestionsB.map(s => s.actionId),
      'Suggestions must vary based on draft characteristics'
    );
  });

  it('Part C & D: compileRevisionRecipe orders stages 1->6, detects conflicts, and enforces PT-EU and Persian governance', () => {
    // 1. Out-of-order compatible actions -> sorted 1 -> 2 -> 3 -> 4 -> 5 -> 6
    const recipe = compileRevisionRecipe(
      ['translate-selected', 'clean-ai-punctuation', 'institutional', 'shorter', 'more-careful', 'preserve-meaning'],
      { targetLanguage: 'Portuguese (European)', channel: 'LinkedIn' }
    );

    assert.equal(recipe.hasBlockingConflict, false);
    const stageSequence = recipe.orderedSteps.map(s => s.stage);
    assert.deepEqual(stageSequence, [1, 2, 3, 4, 5, 6]);
    assert.ok(
      recipe.languageGovernanceNote?.includes('PT-EU') &&
        recipe.languageGovernanceNote?.includes('Never use Brazilian Portuguese'),
      'Expected strict PT-EU governance note'
    );

    // Execute deterministically and verify no em dashes and PT-EU marker
    const output = executeDeterministicRevisionRecipe(
      'Climate Opera Haus — guaranteed 100% impact. Climate Opera Haus is an operatic venture.',
      recipe,
      { targetLanguage: 'Portuguese (European)', channel: 'LinkedIn' }
    );
    assert.ok(!output.includes('\u2014'), 'Output must not contain em dashes');
    assert.ok(output.includes('PT-EU'), 'Output must reflect PT-EU localization');

    // 2. Persian governance check
    const persianRecipe = compileRevisionRecipe(['persian-natural'], { targetLanguage: 'Persian (Farsi)' });
    assert.ok(persianRecipe.languageGovernanceNote?.includes('spoken-friendly Persian'));

    // 3. Conflict detection for contradictory actions
    const conflicts = detectRevisionConflicts(['shorter', 'longer-version']);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].severity, 'blocking');

    // 4. Canonical authority check
    assert.ok(REVISION_ACTIONS.length >= 40, 'Canonical REVISION_ACTIONS list should contain all unified actions');
  });
});
