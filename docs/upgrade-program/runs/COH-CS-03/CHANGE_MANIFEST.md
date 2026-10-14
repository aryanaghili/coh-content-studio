# Change Manifest: `COH-CS-03`

## Files Created
- `src/lib/sourceIntelligence.ts`
- `src/components/SourceIntelligencePanel.tsx`
- `tests/sourceIntelligence.test.ts`
- `docs/upgrade-program/runs/COH-CS-03/PROMPT_SNAPSHOT.md`
- `docs/upgrade-program/runs/COH-CS-03/SOURCE_CONTEXT_CONTRACT.md`
- `docs/upgrade-program/runs/COH-CS-03/SOURCE_INTELLIGENCE_SCHEMA.md`
- `docs/upgrade-program/runs/COH-CS-03/SOURCE_GROUNDING_TEST_MATRIX.md`
- `docs/upgrade-program/runs/COH-CS-03/IMPLEMENTATION_REPORT.md`
- `docs/upgrade-program/runs/COH-CS-03/CHANGE_MANIFEST.md`
- `docs/upgrade-program/runs/COH-CS-03/VALIDATION_REPORT.md`
- `docs/upgrade-program/runs/COH-CS-03/RUN_MANIFEST.json`

## Files Modified
- `src/lib/contextCompiler.ts`
- `src/App.tsx`
- `server.js`
- `server/ai/promptBuilder.js`
- `server/ai/qualityGate.js`
- `docs/upgrade-program/MASTER_REGISTER.md`
- `docs/upgrade-program/DRIVE_SYNC_MANIFEST.json`

## Files Deleted
- `NONE`

## Dependencies Added / Removed
- `NONE`

## Environment Variables Added / Changed
- `NONE`

## Persistence Changes
- Added separate versioned derived-analysis key `coh_source_intelligence_v1` in `localStorage` (`schemaVersion: "1.0"`). Raw `SourceFile` records in `coh_sources_v11` are untouched and backward-compatible.

## Database Changes
- `NONE`

## Schema Changes
- `NONE`

## Production-Data Changes
- `NONE`
