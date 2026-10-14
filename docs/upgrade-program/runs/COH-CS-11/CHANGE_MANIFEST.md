# COH-CS-11 Change Manifest

| File | Change Type | Description |
| :--- | :--- | :--- |
| `src/lib/sourceIntelligence.ts` | Modified | Added `GroundedEvidenceClaim`, `findGroundableSourceAnchor`, `normalizeStoredSourceIntelligenceRecord`; hardened `enforceSourceIntelligenceClaimDiscipline` against non-numeric hallucinations; enforced hard character ceiling in `compileSourceGroundingContext`. |
| `src/lib/ideationIntelligence.ts` | Modified | Updated `buildIdeationEvidenceProfile` to require verified source anchors and source attribution for `aiAvailableEvidence`, blocking `Approved Example`, `Visual Reference`, and `Strategic Context` from supplying factual evidence. |
| `server/ai/qualityGate.js` | Modified | Replaced unconditional `passed: true` bypass with workflow-specific validation for `source_analysis`, `ideation`, `revision`, and `reframe`. |
| `tests/evidenceIntegrityAndQualityGate.test.ts` | Added | Added 9 adversarial unit/integration tests covering all 10 required verification scenarios in COH-CS-11. |
| `docs/upgrade-program/runs/COH-CS-11/*` | Added | Run evidence and documentation artifacts. |
