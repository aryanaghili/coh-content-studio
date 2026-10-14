# FINAL OPEN ISSUES - COH-CS-08

## Critical
- **None.**

## High
- **None.**

## Medium
- **None.**

## Low / Operational Notes
1. **[LOW - External Environment] Live OpenAI API Smoke Test (`NOT TESTED`)**:
   - No `OPENAI_API_KEY` is present in the local execution environment. All adapter payload construction, `/v1/responses` -> `/v1/chat/completions` fallback logic, JSON repair, and temperature suppression for `gpt-6-luna` and `gpt-6.1-sol` are verified via `tests/openaiModernization.test.js` (5/5 PASS). A live smoke test should be run once credentials are supplied in staging/preview.
2. **[LOW - External Environment] Remote Vercel Preview Deployment (`NOT TESTED`)**:
   - Per branch safety rules, `feature/coh-content-intelligence-v2` was developed and verified locally without pushing or modifying remote deployment settings. Once the user pushes `feature/coh-content-intelligence-v2` to GitHub, Vercel's automatic branch preview URL can be inspected prior to merging to `main`.
3. **[LOW - Pre-Existing Build Notice] Vite Bundle Chunk Size Warning**:
   - Vite reports the pre-existing single-chunk bundle warning (`dist/assets/index-*.js` > 500 kB, 331 kB gzipped). This existed in the `main` baseline (`docs/upgrade-program/BASELINE_VALIDATION.md`) and does not affect runtime correctness.
