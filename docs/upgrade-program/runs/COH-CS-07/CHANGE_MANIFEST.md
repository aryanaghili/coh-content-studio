# CHANGE MANIFEST - COH-CS-07

## Created Files
- `src/lib/workflowContinuity.ts` — Pure cross-studio continuity snapshot builder (`buildWorkContextSnapshot`).
- `src/components/CurrentWorkContextBar.tsx` — Compact cross-studio continuity strip rendered across Content Workspace, Visual Studio, Revision Studio, and Reframing Studio.
- `tests/workflowContinuity.test.ts` — Automated tests for Calendar placeholder regression, continuity snapshot construction, and end-to-end cross-studio lineage.
- `docs/upgrade-program/runs/COH-CS-07/*` — Complete run evidence package (`PROMPT_SNAPSHOT.md`, `HANDOFF_MATRIX.md`, `GOVERNANCE_DUPLICATION_REPORT.md`, `PLACEHOLDER_REGRESSION_REPORT.md`, `VISUAL_HANDOFF_REGRESSION.md`, `IMPLEMENTATION_REPORT.md`, `CHANGE_MANIFEST.md`, `VALIDATION_REPORT.md`, `RUN_MANIFEST.json`).

## Modified Files
- `src/utils/calendarHandoffUtils.ts` — Added `isAdvisoryProofNotice` and `sanitizePlaceholderTokens` so advisory `proofNeeded` notices never pollute `mustInclude`.
- `src/components/SourceIntelligencePanel.tsx` — Added `onUseInReframing` action button (`Use in Reframing`) to Source Intelligence cards.
- `src/App.tsx` — Wired `handleUseSourceInReframing` and rendered `<CurrentWorkContextBar />` across Content Workspace, Visual Studio, Revision Studio, and Reframing Studio.
- `docs/upgrade-program/MASTER_REGISTER.md` — Recorded `COH-CS-07` completion status.
- `docs/upgrade-program/DRIVE_SYNC_MANIFEST.json` — Recorded `COH-CS-07` screenshot and artifact sync manifest.
