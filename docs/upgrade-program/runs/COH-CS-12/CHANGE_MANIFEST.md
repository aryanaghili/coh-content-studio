# COH-CS-12 Change Manifest

| File | Change Type | Description |
| :--- | :--- | :--- |
| `src/lib/reframingEngine.ts` | Modified | Added `NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES`, `OPTIONAL_PRESERVATION_PREFERENCES`, `verifyReframedElementContinuity`; removed synthetic auto-appended quote wrapper; verified dates/numbers/names/quotes truthfully. |
| `src/components/ReframingStudio.tsx` | Modified | Enforced `REVISION` route by pausing normal Reframe generation unless `Override - continue as Reframe` is clicked; rendered locked non-negotiable integrity rules separately from optional preservation toggles. |
| `src/lib/revisionActions.ts` | Modified | Added `executionMode: 'deterministic-safe' | 'ai-required'` to `RevisionActionDef` and `isAiRequiredRevisionAction` helper. |
| `src/lib/smartBriefAndRevision.ts` | Modified | Added `requiresAiExecution` to `CompiledRevisionRecipe`, `validateRevisionTranslationOutput`, and blocked fake offline translation headers in `executeDeterministicRevisionRecipe`. |
| `src/components/RevisionStudio.tsx` | Modified | Validated AI translation output via `validateRevisionTranslationOutput` and blocked silent fallback to fake translation when AI is offline or fails. |
| `tests/reframingStudio.test.ts` | Modified | Updated Journey G test to assert no synthetic quote wrapper and truthful missing-quote flagging. |
| `tests/smartBriefAndRevision.test.ts` | Modified | Updated Part C & D test to assert `requiresAiExecution` on translation recipes and error on offline translation. |
| `tests/reframingAndTranslationSafety.test.ts` | Added | Added 11 tests covering all 13 COH-CS-12 verification scenarios. |
| `docs/upgrade-program/runs/COH-CS-12/*` | Added | Run evidence and documentation artifacts. |
