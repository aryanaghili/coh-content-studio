# COH-CS-12 Implementation Report

## 1. Summary of Changes

1. **Reframing Protected-Element Integrity (`src/lib/reframingEngine.ts`)**:
   - Defined `NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES` (always enforced) and `OPTIONAL_PRESERVATION_PREFERENCES` (user-toggleable).
   - Upgraded `extractConfirmedSourceTokens` to extract numeric figures, full date phrases (`October 2026`), COH terminology, and proper names/entities (`Elena Rostova`, `Teatro Nacional de São Carlos`, `Lisbon`).
   - Added `verifyReframedElementContinuity` to classify each element as `retained unchanged`, `intentionally omitted`, `altered and blocked`, or `requires review`.
   - Removed the synthetic `"As noted directly in the source material: ..."` quote wrapper from `finalizeReframeResult` and updated `buildDeterministicReframe` to respect optional quote retention toggles cleanly.

2. **Reframing Route Enforcement (`src/components/ReframingStudio.tsx`)**:
   - Added `routeOverrideConfirmed` state. When `resolvedPlan.recommendedRoute === 'REVISION'`, the primary `Generate Proposed Reframe` button is disabled by default, the `Open in Revision Studio` CTA is highlighted, and a secondary `Override - continue as Reframe` button (`data-testid="override-continue-reframe-btn"`) allows explicit user override.
   - Rendered locked `Non-Negotiable Factual Integrity (Always Enforced)` rules separately from `Optional Preservation Preferences (Toggle Retention)`.

3. **Revision Translation Safety (`src/lib/revisionActions.ts`, `src/lib/smartBriefAndRevision.ts`, `src/components/RevisionStudio.tsx`)**:
   - Added `executionMode: 'deterministic-safe' | 'ai-required'` to `RevisionActionDef` and helper `isAiRequiredRevisionAction`.
   - Removed fake `[PT-EU | Português Europeu]` and `[FA | فارسی روان و طبیعی]` offline translation wrappers from `executeDeterministicRevisionRecipe`, throwing a clear `AI Connection Required` error instead.
   - Added `validateRevisionTranslationOutput` and wired `RevisionStudio.tsx` so failed or offline AI-required translation actions preserve the draft untouched, do not create fake version history entries, and surface a clear error message.
