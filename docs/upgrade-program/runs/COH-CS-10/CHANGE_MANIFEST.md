# COH-CS-10 Change Manifest

| File | Change Type | Purpose |
| :--- | :--- | :--- |
| `src/lib/operatingCore.ts` | Modified | Added `CANONICAL_COH_PILLARS`, `normalizeCohPillar`, `inferPillarFromText`, `getAuthoritativeAudiences`, `normalizeOperatingCoreAudience`, `resolveOperatingCoreAudience`, and `inferAudienceFromText` |
| `src/lib/contextCompiler.ts` | Modified | Integrated `normalizeOperatingCoreAudience` into `matchAudienceProfile` |
| `src/lib/sourceIntelligence.ts` | Modified | Replaced fallback parallel audience and pillar names with `resolveOperatingCoreAudience` and `CANONICAL_COH_PILLARS` |
| `src/lib/ideationIntelligence.ts` | Modified | Derived `COH_VALID_AUDIENCES` and `COH_CONTENT_PILLARS` from `operatingCore.ts`; normalized opportunity audiences and pillars against `OperatingCore` and `CANONICAL_COH_PILLARS` |
| `src/lib/smartBriefAndRevision.ts` | Modified | Enforced `Explicit -> Inherited -> Heuristic -> Default` precedence in `resolveSmartBrief` and resolved audiences/pillars from `OperatingCore` and `CANONICAL_COH_PILLARS` |
| `src/lib/reframingEngine.ts` | Modified | Added `getReframingAudienceOptions` and `getReframingPillarOptions`; updated `resolveReframeIntent` and `buildDeterministicReframe` to use `OperatingCore` audiences and `CANONICAL_COH_PILLARS` |
| `src/components/ReframingStudio.tsx` | Modified | Connected Target Audience and Content-Pillar Emphasis dropdowns and `resolveReframeIntent` calls to active `operatingCore` and `CANONICAL_COH_PILLARS` |
| `src/App.tsx` | Modified | Replaced duplicate `PROTECTED_COH_KERNEL` literal with import/re-export from `operatingCore.ts`; connected Ideation and Smart Brief to `operatingCore` |
| `tests/strategicAuthorityRemediation.test.ts` | Added | Added 8 regression tests verifying Operating Core authority, alias normalization, canonical pillars, explicit precedence, legacy compatibility, and single `PROTECTED_COH_KERNEL` |
| `tests/ideationIntelligence.test.ts` | Modified | Updated handoff expectation to canonical Operating Core audience and COH pillar |
| `tests/smartBriefAndRevision.test.ts` | Modified | Updated Part A expectation to canonical Operating Core audience and COH pillar |
| `tests/reframingStudio.test.ts` | Modified | Updated Journey A/B/C/D expectations to canonical Operating Core audience and COH pillar |
