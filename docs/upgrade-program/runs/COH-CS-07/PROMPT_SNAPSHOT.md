# PROMPT SNAPSHOT - COH-CS-07

## Run Metadata
- **Run ID**: `COH-CS-07`
- **Title**: Cross-Studio Continuity, Handoff Hardening, Regression Verification & Final Release Readiness
- **Branch**: `feature/coh-content-intelligence-v2`
- **Predecessor Commit**: `8a4e861c83c2e69414cce009b91187f24763fe9d` (`COH-CS-06`)

## Core Objectives
1. Complete cross-studio continuity across Source Library, Ideation 2.0, Editorial Calendar, Content Workspace, Visual Studio, Revision Studio, Reframing Studio, Idea Library, and Content Library.
2. Introduce a compact Current Work Context Strip (`CurrentWorkContextBar.tsx` + `src/lib/workflowContinuity.ts`) displaying Origin, Target Audience, Channel & Format, Attached Sources + Roles, and Transformation Trail.
3. Add direct `Use in Reframing` action on Source Library intelligence cards.
4. Harden Editorial Calendar -> Content Workspace handoffs so advisory `proofNeeded` notices (`"Proof needed: ..."`) are never injected into `mustInclude` as literal placeholder blockers, while sanitizing `{placeholder}` and `[placeholder]` tokens.
5. Verify Content Workspace -> Visual Studio handoff continuity and zero regression.
6. Audit and report governance deduplication across prompt assembly paths.
7. Execute full unit test suite (26 tests across 6 suites) and Playwright E2E regression across light/dark and desktop/mobile viewports without deploying to production or merging to `main`.
