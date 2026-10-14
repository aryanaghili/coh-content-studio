# COH-CS-11 Validation Report

## 1. Automated Test Suite

Command:
```bash
node --test tests/*.test.ts tests/*.test.js
```

Result:
- **Total Suites**: 8
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0

### COH-CS-11 Adversarial Scenarios Verified (`tests/evidenceIntegrityAndQualityGate.test.ts`):
1. Supported claim with exact evidence excerpt passes and produces `groundedClaims` anchor: **PASS**
2. Non-numeric hallucinated factual claim (`"UNESCO has formally endorsed Climate Opera Haus."`) fails grounding and moves to `cautionsAndAmbiguities`: **PASS**
3. Numeric/date hallucinated claim fails grounding and moves to `cautionsAndAmbiguities`: **PASS**
4. Aspiration statement is kept out of `supportedClaims` and `keyFacts`: **PASS**
5. `Approved Example`, `Visual Reference`, and `Strategic Context` cannot supply factual evidence: **PASS**
6. Ideation AI evidence without source attribution/anchor is rejected while grounded AI evidence is attributed: **PASS**
7. 15 large sources respect hard character budget cap (`formattedSection.length <= 8000`): **PASS**
8. Legacy stored Source Intelligence records normalize safely without fabricating anchors: **PASS**
9. Quality gate catches malformed/ungrounded outputs for `source_analysis`, `ideation`, `revision`, and `reframe`: **PASS**

---

## 2. Production Build

Command:
```bash
npm run build
```

Result:
- `tsc -b && vite build` succeeded with 0 TypeScript or bundler errors (**PASS**).
