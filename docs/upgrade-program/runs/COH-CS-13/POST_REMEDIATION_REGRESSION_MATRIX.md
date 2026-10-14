# COH-CS-13: Post-Remediation Regression Matrix

| Suite / Area | Test File | Tests | Verdict |
| :--- | :--- | :--- | :--- |
| **Shared Context Compiler** | `tests/contextCompiler.test.ts` | 4 | **PASS** |
| **OpenAI GPT-6 & Multi-Provider** | `tests/openaiModernization.test.js` | 5 | **PASS** |
| **Source Intelligence & Role Boundaries** | `tests/sourceIntelligence.test.ts` | 5 | **PASS** |
| **Ideation 2.0 & Reuse Awareness** | `tests/ideationIntelligence.test.ts` | 4 | **PASS** |
| **Reframing Studio Journeys A-H** | `tests/reframingStudio.test.ts` | 5 | **PASS** |
| **Smart Brief, Fast/Explore & Revision** | `tests/smartBriefAndRevision.test.ts` | 4 | **PASS** |
| **Cross-Studio Continuity & Handoff** | `tests/workflowContinuity.test.ts` | 3 | **PASS** |
| **Strategic Authority (`COH-CS-10`)** | `tests/strategicAuthorityRemediation.test.ts` | 6 | **PASS** |
| **Evidence Grounding & Quality Gates (`COH-CS-11`)** | `tests/evidenceIntegrityAndQualityGate.test.ts` | 9 | **PASS** |
| **Reframing Integrity & Translation Safety (`COH-CS-12`)** | `tests/reframingAndTranslationSafety.test.ts` | 11 | **PASS** |
| **Total Automated Unit/Integration Tests** | **10 Test Files** | **57 / 57** | **PASS** |
| **Production TypeScript + Vite Build** | `npm run build` | `tsc -b && vite build` | **PASS** |
