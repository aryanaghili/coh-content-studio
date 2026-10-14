# COH-CS-11 Prompt Snapshot

Task: **Evidence Integrity, Source Grounding and Quality-Gate Hardening**
Repository: `aryanaghili/coh-content-studio`
Branch: `feature/coh-content-intelligence-v2`
Predecessor Commit: `1a6a25ded0f945fdc2f2894fd6ba807e2c7f76a3` (`COH-CS-10`)

Scope:
1. Ground every supported fact/claim in Source Intelligence with a verified verbatim source evidence anchor (`GroundedEvidenceClaim`).
2. Reject non-numeric hallucinated factual claims (e.g., `"UNESCO has formally endorsed Climate Opera Haus."`) from `keyFacts` and `supportedClaims` and move them to `cautionsAndAmbiguities`.
3. Enforce source attribution and grounding on Ideation `availableEvidence`; block `Approved Example`, `Visual Reference`, and `Strategic Context` from supplying factual evidence.
4. Fix the source budget hard cap in `compileSourceGroundingContext` so 15+ large sources never exceed `maxTotalChars`.
5. Replace the unconditional quality gate bypass in `server/ai/qualityGate.js` with real workflow-aware validation for `source_analysis`, `ideation`, `revision`, and `reframe`.
6. Normalize legacy stored Source Intelligence records safely without fabricating fake anchors.
