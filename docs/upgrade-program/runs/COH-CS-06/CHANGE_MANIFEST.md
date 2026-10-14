# CHANGE MANIFEST: COH-CS-06

## Files Added
- `src/lib/smartBriefAndRevision.ts`
- `src/components/SmartBriefPanel.tsx`
- `tests/smartBriefAndRevision.test.ts`
- `docs/upgrade-program/runs/COH-CS-06/PROMPT_SNAPSHOT.md`
- `docs/upgrade-program/runs/COH-CS-06/SMART_BRIEF_CONTRACT.md`
- `docs/upgrade-program/runs/COH-CS-06/REVISION_RECIPE_MATRIX.md`
- `docs/upgrade-program/runs/COH-CS-06/REVISION_STATE_REGRESSION.md`
- `docs/upgrade-program/runs/COH-CS-06/IMPLEMENTATION_REPORT.md`
- `docs/upgrade-program/runs/COH-CS-06/CHANGE_MANIFEST.md`
- `docs/upgrade-program/runs/COH-CS-06/VALIDATION_REPORT.md`
- `docs/upgrade-program/runs/COH-CS-06/RUN_MANIFEST.json`

## Files Modified
- `src/lib/revisionActions.ts`: Consolidated canonical `REVISION_ACTIONS` and `REVISION_GROUP_ORDER` with stage metadata.
- `src/components/RevisionStudio.tsx`: Imported canonical actions, added draft-dependent `Suggested for This Draft` recommendations, multi-action `Revision Recipe` builder, conflict detection alerts, and PT-EU / Persian governance.
- `src/App.tsx`: Imported canonical `REVISION_ACTIONS`, integrated `<SmartBriefPanel />`, and wired `generationSpeedMode` (`'fast' | 'explore'`).
- `docs/upgrade-program/MASTER_REGISTER.md`: Recorded `COH-CS-06` completion.
- `docs/upgrade-program/DRIVE_SYNC_MANIFEST.json`: Added `COH-CS-06` evidence paths.
