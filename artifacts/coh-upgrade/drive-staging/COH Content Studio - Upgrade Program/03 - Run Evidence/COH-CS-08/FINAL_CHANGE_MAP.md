# FINAL CHANGE MAP - COH-CS-08

Comparison between `main` (`867a7eb88efaec68610eaae0bd7d623eb0d13874`) and `feature/coh-content-intelligence-v2` (`910ab4e1e51d73e3bffcb5f41203f9b7260225da`).

## 1. Application & Server Code Changes

| File Path | Change Type | Classification | Purpose & Scope Audit Finding |
| :--- | :--- | :--- | :--- |
| `.gitignore` | Modified | **Required** | Ignores `artifacts/coh-upgrade/` so screenshots, traces, and Drive staging bundles are never committed to Git. |
| `src/lib/contextCompiler.ts` | Added | **Required** | Shared COH Context Compiler enforcing the 6-level authority hierarchy (`PROTECTED_COH_KERNEL` at Level 1), task-specific Operating Core slicing, provenance tracking, and Context Manifest generation (`COH-CS-01`). |
| `src/components/ContextManifestPanel.tsx` | Added | **Required** | Expandable UI panel inspecting active context layers, source bindings, and provenance (`COH-CS-01`). |
| `src/lib/operatingCore.ts` | Modified | **Required** | Delegates `compileOperatingCoreContext` to `compileGovernedContext` while preserving `PROTECTED_COH_KERNEL` untouched (`COH-CS-01`). |
| `server/ai/adapters/openaiAdapter.js` | Modified | **Required** | Adds `DEFAULT_OPENAI_TEXT_MODEL = 'gpt-6-luna'`, capability table for `gpt-6-luna` and `gpt-6.1-sol`, `/v1/responses` + `/v1/chat/completions` fallback, and suppresses unsupported `temperature` on reasoning models (`COH-CS-02`). |
| `server/ai/providerManager.js` | Modified | **Required** | Defaults OpenAI text model to `gpt-6-luna` when no explicit model is provided while respecting explicit model configurations (`COH-CS-02`). |
| `server/ai/adapters/anthropicAdapter.js` | Modified | **Reasonable supporting change** | Normalizes `config.textModel || config.model` in `testConnection` (`COH-CS-02`). |
| `server/ai/adapters/geminiAdapter.js` | Modified | **Reasonable supporting change** | Normalizes `config.textModel || config.model` in `testConnection` (`COH-CS-02`). |
| `server/ai/adapters/mistralAdapter.js` | Modified | **Reasonable supporting change** | Normalizes `config.textModel || config.model` in `testConnection` (`COH-CS-02`). |
| `server/ai/adapters/openrouterAdapter.js` | Modified | **Reasonable supporting change** | Normalizes `config.textModel || config.model` in `testConnection` (`COH-CS-02`). |
| `server/ai/promptBuilder.js` | Modified | **Required** | Adds structured prompt schemas for `source_analysis`, `reframe`, and `Ideation 2.0` (`COH-CS-03`, `COH-CS-04`, `COH-CS-05`). |
| `server/ai/qualityGate.js` | Modified | **Required** | Extends quality gate checks for `source_analysis`, `ideation`, `revision`, and `reframe` modes (`COH-CS-03`, `COH-CS-05`). |
| `server.js` | Modified | **Required** | Adds `/api/ai/analyze-source` and `/api/ai/reframe` endpoints behind `requireAuth` (`COH-CS-03`, `COH-CS-05`). |
| `src/lib/sourceIntelligence.ts` | Added | **Required** | Non-destructive versioned Source Intelligence store (`coh_source_intelligence_v1`), claim-discipline validator, verbatim excerpt validator, and task-level source role compiler (`COH-CS-03`). |
| `src/components/SourceIntelligencePanel.tsx` | Added | **Required** | Source Intelligence UI card displaying derived analysis, cautions, verbatim excerpt toggles, task role selector, and cross-studio handoff actions (`COH-CS-03`, `COH-CS-07`). |
| `src/lib/ideationIntelligence.ts` | Added | **Required** | Ideation 2.0 opportunity engine: COH communication jobs, evidence vs missing-evidence separation, local 2-stage reuse classifier, diversity enforcement, and Content Workspace handoff builder (`COH-CS-04`). |
| `src/components/IdeationOpportunityCard.tsx` | Added | **Required** | Digestible primary opportunity card with expandable secondary intelligence and reuse candidate inspection (`COH-CS-04`). |
| `src/lib/reframingEngine.ts` | Added | **Required** | Dedicated COH Reframing Intent Resolver (`REFRAME` vs `REVISION` routing), protected-element verifier, deterministic fallback reframer, and lineage builder (`COH-CS-05`). |
| `src/components/ReframingStudio.tsx` | Added | **Required** | First-class Reframing Studio UI supporting 5 origins, editable transformation plan, protected element toggles, side-by-side comparison, Changed/Preserved summary, and non-destructive save (`COH-CS-05`). |
| `src/lib/smartBriefAndRevision.ts` | Added | **Required** | Smart Brief resolver (`explicit | inherited | resolved | unresolved`), Fast vs Explore speed config, draft-dependent revision suggestions (`max 3`), 6-stage ordered Revision Recipe compiler, conflict detector, and `PT-EU`/Persian language governance (`COH-CS-06`). |
| `src/components/SmartBriefPanel.tsx` | Added | **Required** | Smart Brief UI panel with provenance badges, Suggested vs Selected sources, and Fast/Explore mode selector (`COH-CS-06`). |
| `src/lib/revisionActions.ts` | Modified | **Required** | Consolidates canonical `REVISION_ACTIONS` and `REVISION_GROUP_ORDER` in a single shared module (`COH-CS-06`). |
| `src/components/RevisionStudio.tsx` | Modified | **Required** | Integrates Suggested Next Improvements, ordered Revision Recipe preview, conflict warnings, and `PT-EU`/Persian governance (`COH-CS-06`). |
| `src/lib/workflowContinuity.ts` | Added | **Required** | Pure cross-studio continuity snapshot builder (`buildWorkContextSnapshot`) (`COH-CS-07`). |
| `src/components/CurrentWorkContextBar.tsx` | Added | **Required** | Compact 5-dimension continuity strip + transformation trail across Content, Visual, Revision, and Reframing studios (`COH-CS-07`). |
| `src/utils/calendarHandoffUtils.ts` | Modified | **Required** | Separates advisory `proofNeeded` notices from confirmed `mustInclude` items and sanitizes `{placeholder}` tokens (`COH-CS-07`). |
| `src/components/CommandPaletteModal.tsx` | Modified | **Reasonable supporting change** | Uses `import type` for TypeScript `verbatimModuleSyntax` compatibility (`COH-CS-01`). |
| `src/components/TopBar.tsx` | Modified | **Reasonable supporting change** | Uses `import type` for TypeScript `verbatimModuleSyntax` compatibility (`COH-CS-01`). |
| `src/App.tsx` | Modified | **Required** | Wires Context Compiler, GPT-6 Luna/Sol settings options, Source Intelligence, Ideation 2.0, Reframing Studio, Smart Brief, Fast/Explore mode, and `CurrentWorkContextBar` (`COH-CS-01`–`COH-CS-07`). |

## 2. Automated Test Files Added (`tests/`)
- `tests/contextCompiler.test.ts` (`COH-CS-01`)
- `tests/openaiModernization.test.js` (`COH-CS-02`)
- `tests/sourceIntelligence.test.ts` (`COH-CS-03`)
- `tests/ideationIntelligence.test.ts` (`COH-CS-04`)
- `tests/reframingStudio.test.ts` (`COH-CS-05`)
- `tests/smartBriefAndRevision.test.ts` (`COH-CS-06`)
- `tests/workflowContinuity.test.ts` (`COH-CS-07`)

## 3. Audit Findings on Unnecessary / Risky / Out-of-Scope Files
- **Unnecessary files committed**: `0`
- **Risky / out-of-scope changes**: `0`
- **Database / schema modifications**: `0`
- **Committed screenshots / binary artifacts**: `0` (all screenshots reside in git-ignored `artifacts/coh-upgrade/`)
