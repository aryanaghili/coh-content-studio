# REFRAME ACCEPTANCE TESTS (COH-CS-05)

Executed via `node --test tests/reframingStudio.test.ts` and Playwright E2E script `artifacts/coh-upgrade/verify_cs05.mjs`.

| Journey | Scenario | Verification Method | Result |
|---|---|---|---|
| **Journey A** | Institutional reframe: convert general COH description into cultural-institution programming argument | `tests/reframingStudio.test.ts` + `verify_cs05.mjs` | **PASS** (`targetAudience: 'Cultural Institutions & Museums'`, programming relevance frame applied) |
| **Journey B** | Low-familiarity audience: adapt internal COH text for an audience unfamiliar with COH | `tests/reframingStudio.test.ts` + `verify_cs05.mjs` | **PASS** (`audienceFamiliarity: 'low'`, foundational COH orientation included without insider jargon) |
| **Journey C** | Channel/format adaptation: turn long narrative into a LinkedIn post | `tests/reframingStudio.test.ts` + `verify_cs05.mjs` | **PASS** (`targetChannel: 'LinkedIn'`, `targetFormat: 'LinkedIn Post'`, structured hook/body/takeaway) |
| **Journey D** | Strategic shift: move from sponsorship relevance to public climate-literacy framing | `tests/reframingStudio.test.ts` | **PASS** (Editable plan updates `contentPillarEmphasis` and `targetAudience`, reflected in generated output) |
| **Journey E** | Revision detection: ask `"Make this 25% shorter and smoother"` | `tests/reframingStudio.test.ts` + `verify_cs05.mjs` | **PASS** (`recommendedRoute === 'REVISION'`, UI renders `[data-testid="reframe-revision-redirect-alert"]` with direct Revision Studio handoff) |
| **Journey F** | Evidence protection: ask for stronger proof than the source supports | `tests/reframingStudio.test.ts` | **PASS** (Flags unsupported proof in `unresolvedItems` and `evidenceWarnings`; zero fabricated statistics in output) |
| **Journey G** | Protected quote/fact: include an exact quote and verify it remains intact when protected | `tests/reframingStudio.test.ts` + `verify_cs05.mjs` | **PASS** (Exact double-quoted statement `"Culture is the emotional infrastructure that makes climate resilience legible to communities."` preserved verbatim) |
| **Journey H** | Lineage: save reframed output as a new version and verify original item is unchanged | `tests/reframingStudio.test.ts` + `verify_cs05.mjs` | **PASS** (`buildReframeLineageMetadata` creates new `SavedContent` version with `transformationType: 'reframe'` and `originContentId` while leaving source item untouched) |
