# FINAL REGRESSION & CONTINUITY MATRIX - COH-CS-08

## Part 1: Functional End-to-End Matrix (52 Audited Items)

| # | Area | Workflow / Capability | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Foundation** | App startup & legacy `localStorage` preservation | Playwright E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 2 | **Foundation** | Command Center rendering & quick actions | Playwright E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 3 | **Foundation** | Global search (`CommandPaletteModal`) | TypeScript build + UI check | **PASS** |
| 4 | **Foundation** | Settings (`gpt-6-luna` & `gpt-6.1-sol` configuration) | Playwright E2E (`verify_cs08_integrated.mjs`) + unit test | **PASS** |
| 5 | **Foundation** | Operating Core (`PROTECTED_COH_KERNEL` authority) | Unit test (`contextCompiler.test.ts`) + E2E | **PASS** |
| 6 | **Source** | Open existing source in Source Library | Playwright E2E (`verify_cs03.mjs`, `verify_cs08_integrated.mjs`) | **PASS** |
| 7 | **Source** | Analyze source (`SourceIntelligencePanel`) | Playwright E2E + unit test (`sourceIntelligence.test.ts`) | **PASS** |
| 8 | **Source** | Source analysis failure / corruption recovery | Unit test (`sourceIntelligence.test.ts` test #1) | **PASS** |
| 9 | **Source** | `Evidence` task role governance | Unit test (`sourceIntelligence.test.ts` test #4) | **PASS** |
| 10 | **Source** | `Context` (Strategic Context) task role governance | Unit test (`sourceIntelligence.test.ts` test #4) | **PASS** |
| 11 | **Source** | `Approved Example` role (blocks factual claims) | Unit test (`sourceIntelligence.test.ts` test #2 & #4) | **PASS** |
| 12 | **Source** | `Voice` (Quote / Language) role + verbatim excerpt check | Unit test (`sourceIntelligence.test.ts` test #3 & #4) | **PASS** |
| 13 | **Source** | `Visual Reference` role (blocks factual claims) | Unit test (`sourceIntelligence.test.ts` test #2 & #4) | **PASS** |
| 14 | **Source** | Excerpt selection & bounded context limits | Unit test (`sourceIntelligence.test.ts` test #3 & #5) + E2E | **PASS** |
| 15 | **Ideation** | Topic-only ideation (without attached sources) | Unit test (`ideationIntelligence.test.ts`) + E2E (`verify_cs04.mjs`) | **PASS** |
| 16 | **Ideation** | Source-grounded ideation (with attached source & role) | Unit test (`ideationIntelligence.test.ts`) + E2E (`verify_cs04.mjs`) | **PASS** |
| 17 | **Ideation** | COH Communication Job assignment & diversity check | Unit test (`ideationIntelligence.test.ts` test #1) | **PASS** |
| 18 | **Ideation** | Available Evidence vs Advisory Evidence Required | Unit test (`ideationIntelligence.test.ts` test #2) | **PASS** |
| 19 | **Ideation** | Reuse detection across Idea & Content Libraries | Unit test (`ideationIntelligence.test.ts` test #3) + E2E modal check | **PASS** |
| 20 | **Ideation** | Promote opportunity to Content Workspace | Unit test (`ideationIntelligence.test.ts` test #4) + E2E (`verify_cs04.mjs`) | **PASS** |
| 21 | **Content** | Simple Mode & Quick Create | Playwright E2E (`verify_cs06.mjs`, `verify_cs08_integrated.mjs`) | **PASS** |
| 22 | **Content** | Advanced Brief | Playwright E2E (`verify_cs04.mjs`, `verify_cs06.mjs`) | **PASS** |
| 23 | **Content** | Smart Brief (`resolveSmartBrief` + provenance badges) | Unit test (`smartBriefAndRevision.test.ts`) + E2E (`verify_cs06.mjs`) | **PASS** |
| 24 | **Content** | `Fast (1 Draft)` vs `Explore (Multi-Option)` mode toggle | Unit test (`smartBriefAndRevision.test.ts`) + E2E (`verify_cs06.mjs`) | **PASS** |
| 25 | **Content** | Suggested vs Selected sources separation | Unit test (`smartBriefAndRevision.test.ts` test #1) + E2E | **PASS** |
| 26 | **Content** | Context Manifest Panel inspection | Unit test (`contextCompiler.test.ts`) + E2E | **PASS** |
| 27 | **Revision** | Manual / Content Workspace / Content Library inputs | Playwright E2E (`verify_cs06.mjs`, `verify_cs08_integrated.mjs`) | **PASS** |
| 28 | **Revision** | Draft-dependent Suggested Next Improvements (`max 3`) | Unit test (`smartBriefAndRevision.test.ts` test #3) + E2E | **PASS** |
| 29 | **Revision** | Single action & multi-action 6-stage ordered recipe | Unit test (`smartBriefAndRevision.test.ts` test #4) + E2E | **PASS** |
| 30 | **Revision** | Conflicting recipe detection (`Make It Shorter` + `Expand With Depth`) | Unit test (`smartBriefAndRevision.test.ts` test #4) + E2E (`verify_cs06.mjs`) | **PASS** |
| 31 | **Revision** | Translation & strict European Portuguese (`PT-EU`) governance | Unit test (`smartBriefAndRevision.test.ts` test #4) + E2E (`verify_cs06.mjs`) | **PASS** |
| 32 | **Revision** | Reset & Start New Revision state isolation | Documented & verified in `COH-CS-06` + E2E | **PASS** |
| 33 | **Reframing** | Manual / Content Library / Content Workspace / Source origins | Unit test (`reframingStudio.test.ts`) + E2E (`verify_cs05.mjs`, `verify_cs07.mjs`) | **PASS** |
| 34 | **Reframing** | Strategic, Audience (low-familiarity), and Channel reframes | Unit test (`reframingStudio.test.ts` Journeys A–D) + E2E (`verify_cs05.mjs`) | **PASS** |
| 35 | **Reframing** | Revision-like instruction detection & handoff to Revision Studio | Unit test (`reframingStudio.test.ts` Journey E) + E2E (`verify_cs05.mjs`) | **PASS** |
| 36 | **Reframing** | Changed vs Preserved explanation & verbatim quote protection | Unit test (`reframingStudio.test.ts` Journeys F–G) + E2E (`verify_cs05.mjs`) | **PASS** |
| 37 | **Reframing** | Non-destructive Save as New Version with `reframeLineage` | Unit test (`reframingStudio.test.ts` Journey H) + E2E (`verify_cs05.mjs`) | **PASS** |
| 38 | **Calendar** | Create/generate calendar, edit item, regenerate logic | Existing calendar component + E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 39 | **Calendar** | Genuine vs false-placeholder (`proofNeeded` advisory) negative test | Unit test (`workflowContinuity.test.ts` test #1) | **PASS** |
| 40 | **Calendar** | Calendar -> Content Workspace handoff | Unit test (`workflowContinuity.test.ts` test #1) | **PASS** |
| 41 | **Visual** | Content -> Visual Studio handoff & continuity bar | Playwright E2E (`verify_cs07.mjs`, `verify_cs08_integrated.mjs`) | **PASS** |
| 42 | **Visual** | Structured field parsing, exact text & AI prompt separation | Verified in `VisualStudio` & `VISUAL_HANDOFF_REGRESSION.md` | **PASS** |
| 43 | **Libraries** | Existing Idea Library items (backward compatibility) | Playwright E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 44 | **Libraries** | Existing Content Library items (backward compatibility) | Playwright E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 45 | **Libraries** | Existing Source Library items | Playwright E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 46 | **Libraries** | Calendar Library | Playwright E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 47 | **Continuity** | Source -> Ideation -> Content -> Reframe chain | Unit test (`workflowContinuity.test.ts` test #3) + E2E | **PASS** |
| 48 | **Continuity** | `CurrentWorkContextBar` across Content, Visual, Revision, Reframing | Playwright E2E (`verify_cs07.mjs`, `verify_cs08_integrated.mjs`) | **PASS** |
| 49 | **UI/Theme** | Desktop (`1440px`), Tablet (`900px`), Mobile (`390px`) Dark Theme | Playwright E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 50 | **UI/Theme** | Desktop (`1440px`), Tablet (`900px`), Mobile (`390px`) Light Theme | Playwright E2E (`verify_cs08_integrated.mjs`) | **PASS** |
| 51 | **Live AI** | Live OpenAI network smoke test (`gpt-6-luna` / `gpt-6.1-sol`) | No API key present in environment (`hasOpenAI: false`) | **NOT TESTED** |
| 52 | **Preview** | Remote Vercel Preview URL validation | Local feature branch not yet pushed to remote | **NOT TESTED** |

---

## Part 2: Cross-Studio Context Continuity Matrix

| Handoff Path | Origin Recorded | Audience & Channel Carried | Format & Pillar Carried | Source Bindings & Roles Carried | Evidence Advisory Separated | Stale State Overwrite Prevented | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Source -> Ideation** | `Source Library` | Yes (from Source Intelligence hints or user filter) | Yes | Yes (`selectedSourceIds` + `taskSourceRoleMap`) | Yes | Explicit user filter overrides hint | **PASS** |
| **Source -> Content** | `Source Library` | Yes | Yes | Yes (`advancedBrief.selectedSourceIds`) | Yes | Explicit brief edits preserved | **PASS** |
| **Source -> Reframe** | `Source Library` | Yes | Yes | Yes (`reframingInitialOrigin` + `selectedSourceIds`) | Yes | User plan edits override defaults | **PASS** |
| **Idea -> Content** | `Ideation Workspace` | Yes (`suggestedAudience`, `suggestedChannel`) | Yes (`suggestedFormat`, `suggestedPillar`) | Yes (`buildIdeationToContentHandoff`) | Yes (`availableEvidence` in `mustInclude`, `evidenceStillRequired` in advisory) | Overwrite confirmation modal protects unsaved brief | **PASS** |
| **Calendar -> Content** | `Editorial Calendar` | Yes | Yes | Active workspace sources preserved | Yes (`isAdvisoryProofNotice` prevents `mustInclude` pollution) | Explicit edits in Advanced Brief respected | **PASS** |
| **Content -> Revision** | `Content Workspace` | Yes | Yes | Yes (`CurrentWorkContextBar`) | Yes | Explicit Revision Studio actions take precedence | **PASS** |
| **Content -> Reframe** | `Content Workspace` | Yes | Yes | Yes (`reframingInitialOrigin`) | Yes | Explicit transformation plan overrides | **PASS** |
| **Revision -> Reframe** | `Revision Studio` | Yes | Yes | Yes | Yes | Explicit transformation plan overrides | **PASS** |
| **Content -> Visual** | `Content Workspace` | Yes | Yes | Yes (`CurrentWorkContextBar`) | Yes | Visual Studio fields remain editable | **PASS** |
| **Reframe -> Visual** | `Reframing Studio` | Yes | Yes | Yes (`continuity-jump-visual-studio`) | Yes | Visual Studio fields remain editable | **PASS** |
