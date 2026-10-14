# CHANGE MANIFEST: COH-CS-05

## Files Added
- `src/lib/reframingEngine.ts`
- `src/components/ReframingStudio.tsx`
- `tests/reframingStudio.test.ts`
- `docs/upgrade-program/runs/COH-CS-05/PROMPT_SNAPSHOT.md`
- `docs/upgrade-program/runs/COH-CS-05/REFRAME_CONTRACT.md`
- `docs/upgrade-program/runs/COH-CS-05/REFRAME_VS_REVISION_MATRIX.md`
- `docs/upgrade-program/runs/COH-CS-05/REFRAME_ACCEPTANCE_TESTS.md`
- `docs/upgrade-program/runs/COH-CS-05/IMPLEMENTATION_REPORT.md`
- `docs/upgrade-program/runs/COH-CS-05/CHANGE_MANIFEST.md`
- `docs/upgrade-program/runs/COH-CS-05/VALIDATION_REPORT.md`
- `docs/upgrade-program/runs/COH-CS-05/RUN_MANIFEST.json`

## Files Modified
- `src/App.tsx`: Added `'reframing-studio'` tab, sidebar entry, Content Library `Reframe` action, Content Workspace `Reframe` handoff, and `<ReframingStudio />` view integration.
- `server/ai/promptBuilder.js`: Added `mode === 'reframe'` prompt and JSON schema contract.
- `server/ai/qualityGate.js`: Added `reframe` mode validation.
- `server.js`: Added `/api/ai/reframe` route handler.
- `docs/upgrade-program/MASTER_REGISTER.md`: Recorded `COH-CS-05` run status.
- `docs/upgrade-program/DRIVE_SYNC_MANIFEST.json`: Recorded `COH-CS-05` artifact sync manifest.
