import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTEXTUAL_HELP_REGISTRY,
  getContextualHelpForRoute,
  type HelpRuntimeAppState
} from '../src/lib/contextualHelpRegistry.ts';

const EXPECTED_ROUTES = [
  'command-center',
  'ideation-workspace',
  'editorial-calendar',
  'content-workspace',
  'visual-studio',
  'revision-studio',
  'reframing-studio',
  'calendar-library',
  'idea-library',
  'content-library',
  'source-library',
  'operating-core',
  'settings'
];

describe('Contextual Help System Registry & Writing Standard', () => {
  it('1. Defines complete Contextual Help for all 13 studio destinations', () => {
    assert.equal(Object.keys(CONTEXTUAL_HELP_REGISTRY).length, 13);
    for (const route of EXPECTED_ROUTES) {
      const def = CONTEXTUAL_HELP_REGISTRY[route];
      assert.ok(def, `Missing help definition for route: ${route}`);
      assert.equal(def.route, route);
      assert.ok(def.title.length > 0, `Missing title for ${route}`);
      assert.ok(def.shortPurpose.length > 0, `Missing shortPurpose for ${route}`);
      assert.ok(def.purpose.length > 0, `Missing purpose for ${route}`);
      assert.ok(def.capabilities && def.capabilities.length >= 2, `Expected capabilities for ${route}`);
      assert.ok(def.gettingStarted && def.gettingStarted.length >= 1, `Expected gettingStarted for ${route}`);
      assert.ok(def.nextSteps && def.nextSteps.length >= 1, `Expected nextSteps for ${route}`);
      assert.ok(def.commonMistakes && def.commonMistakes.length >= 1, `Expected commonMistakes for ${route}`);
      assert.equal(def.guideId, route, `Expected guideId to link to ${route} Guided Tour`);
    }
  });

  it('2. Enforces plain-language writing standard (no forbidden backend/code jargon)', () => {
    const forbiddenJargon = /\b(instantiate|persist|orchestrate|downstream|microservice|schema|payload|endpoint|redux|zustand)\b/i;

    for (const route of EXPECTED_ROUTES) {
      const def = getContextualHelpForRoute(route);
      const allText = [
        def.shortPurpose,
        def.purpose,
        ...(def.capabilities || []).map(c => `${c.title} ${c.description || ''}`),
        ...(def.gettingStarted || []).map(s => `${s.title} ${s.description || ''}`),
        ...(def.beforeMovingForward || []),
        ...(def.nextSteps || []),
        ...(def.commonMistakes || []),
        def.example?.content || ''
      ].join(' ');

      assert.equal(
        forbiddenJargon.test(allText),
        false,
        `Route "${route}" help text contains forbidden technical jargon: ${allText.match(forbiddenJargon)?.[0]}`
      );
    }
  });

  it('3. Resolves deterministic "Right now" dynamic states accurately without AI calls', () => {
    const baseState: HelpRuntimeAppState = {
      activeRoute: 'visual-studio',
      aiStatus: 'not_connected',
      hasDraftInContentWorkspace: false,
      creationMode: 'simple',
      visualInputMode: 'Manual',
      hasImportedVisualDirection: false,
      hasVisualPromptInput: false,
      hasRevisionDraft: false,
      hasReframingSource: false,
      savedIdeasCount: 0,
      savedContentCount: 0,
      savedCalendarsCount: 0,
      sourcesCount: 5
    };

    // Visual Studio: no visual direction selected vs imported direction
    const vsHelp = getContextualHelpForRoute('visual-studio');
    const vsEmptyMsg = vsHelp.dynamicStateResolver!(baseState);
    assert.ok(vsEmptyMsg?.includes('Start with a manual prompt or import a visual direction'));

    const vsImportedMsg = vsHelp.dynamicStateResolver!({
      ...baseState,
      visualInputMode: 'Imported',
      hasImportedVisualDirection: true
    });
    assert.ok(vsImportedMsg?.includes('working from an imported visual direction'));

    // Content Workspace: AI offline vs connected
    const cwHelp = getContextualHelpForRoute('content-workspace');
    const cwOfflineMsg = cwHelp.dynamicStateResolver!(baseState);
    assert.ok(cwOfflineMsg?.includes('AI generation is not connected'));

    const cwConnectedMsg = cwHelp.dynamicStateResolver!({
      ...baseState,
      aiStatus: 'connected',
      creationMode: 'quick'
    });
    assert.ok(cwConnectedMsg?.includes('Quick Create mode'));

    // Revision Studio: empty vs loaded draft
    const revHelp = getContextualHelpForRoute('revision-studio');
    assert.equal(
      revHelp.dynamicStateResolver!(baseState),
      'Add or import content before using revision tools.'
    );
    assert.ok(
      revHelp.dynamicStateResolver!({ ...baseState, hasRevisionDraft: true })?.includes('draft is loaded')
    );

    // Settings: connected vs disconnected
    const settingsHelp = getContextualHelpForRoute('settings');
    assert.ok(
      settingsHelp.dynamicStateResolver!({
        ...baseState,
        aiStatus: 'connected',
        aiProvider: 'openai'
      })?.includes('AI is connected and ready')
    );
  });
});
