# REVISION STATE & LOCALIZATION REGRESSION REPORT (COH-CS-06)

## 1. Revision State Continuity Verification

Verified via `tests/smartBriefAndRevision.test.ts` and `artifacts/coh-upgrade/verify_cs06.mjs`:

1. **Settings Changed After Revision (`settingsChangedAfterRevision`)**:
   - Changing `Channel`, `Format`, `Language`, or `Tone` after generating a revised output triggers `[data-testid="revision-settings-changed-banner"]`.
2. **Revise From Selector (`Original text` vs `Current version`)**:
   - `[data-testid="revision-source-selector"]` preserves both `state.originalDraft` and `state.currentDraft`, allowing the user to re-run a single action or multi-action Revision Recipe from either the untouched original draft or the latest revised draft.
3. **Use as Draft & Version History**:
   - Clicking `Use as Draft` (`[data-testid="revision-use-as-draft-btn"]`) promotes `revisedOutput` to `currentDraft` while keeping `originalDraft` intact and appending to `versionHistory`.

---

## 2. PT-EU & Persian Localization Regression Protection

1. **European Portuguese (`PT-EU`)**:
   - Whenever `Portuguese (European)` is selected in Revision Studio or Content Workspace, `compileRevisionRecipe` injects explicit `PT-EU` governance prohibiting Brazilian Portuguese constructions (`"a criar"`, `"equipa"`, `"económico"`, `"contacto"`, never `"criando"`, `"equipe"`).
2. **Spoken-Friendly Natural Persian (`Persian (Farsi)`)**:
   - Whenever `Persian (Farsi)` or `persian-natural` is selected, `compileRevisionRecipe` enforces natural, readable, spoken-friendly Persian rather than stiff literal machine translation, and `getLanguageDirection` applies `rtl` directionality cleanly.
