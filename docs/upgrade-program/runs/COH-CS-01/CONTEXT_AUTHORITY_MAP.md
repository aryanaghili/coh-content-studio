# COH-CS-01 Context Authority Map

## 1. Authority Hierarchy (Immutable Order)

All AI compilation paths in `src/lib/contextCompiler.ts` (`compileGovernedContext`) enforce the following strict 5-level hierarchy:

| Priority | Layer | Authority Source | Enforcement Behavior |
| :--- | :--- | :--- | :--- |
| **1 (Highest)** | **Protected COH Kernel** | `PROTECTED_COH_KERNEL` (`src/lib/operatingCore.ts`) | Always injected first. Cannot be disabled, weakened, or overridden by Operating Core edits, sources, or user instructions. |
| **2** | **Applicable Operating Core Rules** | `OperatingCore` (`src/lib/operatingCore.ts`) + active `CoreDocument[]` (`src/lib/coreDocumentsStorage.ts`) | Selective compilation of Identity/Strategy Kernel, matched Audience Profile, matched Channel Rule, Claims & Proof Boundaries, Voice & Language Rules, Revision Standards, or Visual DNA depending on active studio workflow. |
| **3** | **Applicable Source & Evidence Context** | `TaskSourceBinding[]` (`src/lib/contextCompiler.ts`) | Role-governed source grounding (`Evidence`, `Strategic Context`, `Approved Example`, `Quote / Language Source`, `Visual Reference`, `Must-use Material`). Subject to Claim Safety. |
| **4** | **Inherited Work Context** | `WorkContext` / `WorkItem` (`extractWorkContextFromWorkItem`) | Continuity metadata (`origin`, `originatingItemId`, inherited `audience`, `channel`, `format`, `pillar`, `language`, `communicationJob`, `transformationMetadata`). |
| **5 (Lowest)** | **Explicit User / Task Instruction** | Studio brief / custom instruction | Governs task execution within the boundaries of Levels 1-3. Conflict detection flags any instruction attempting to bypass kernel or claim-safety rules. |

---

## 2. Current Consumers & Compiler Relationship

| Consumer | File | Previous Behavior | New Compiler Relationship (`COH-CS-01`) |
| :--- | :--- | :--- | :--- |
| **Content Workspace (Draft Generation)** | `src/App.tsx` (`handleGenerateDrafts`, `compileStructuredPrompt`, `buildContentWorkspaceContextPackage`) | Called `compileOperatingCoreContext` with exact-match-only audience lookup and no provenance or `ContextManifest`. | Uses `compileGovernedContext` directly via `buildContentWorkspaceContextPackage()` and renders `<ContextManifestPanel />`. |
| **Revision Studio** | `src/components/RevisionStudio.tsx` (`runRevision`, `activeContextPackage`) | Passed raw `JSON.stringify(operatingCore)` on line 213, dumping the entire Operating Core object unselectively. | Uses `compileGovernedContext({ workflow: 'Revision Studio', ... })` for smallest sufficient governed context and renders `<ContextManifestPanel />`. |
| **Inline Revision / Ideation / Visual Studio** | `src/App.tsx`, `src/lib/operatingCore.ts` (`compileOperatingCoreContext`) | Maintained a separate manual string builder in `src/lib/operatingCore.ts`. | `compileOperatingCoreContext` now delegates directly to `compileGovernedContext`, eliminating duplicate compiler logic while preserving signature compatibility. |

---

## 3. Duplicated Logic Deliberately Left for COH-CS-07

Per `COH-CS-01` Section 9 ("Do not over-clean Calendar yet"):

1. **Editorial Calendar Static Lists (`src/components/EditorialCalendarStudio.tsx`):**
   - `EditorialCalendarStudio.tsx` maintains planning/cadence-specific channel, audience, and pillar constants (`CALENDAR_CHANNELS`, `CALENDAR_AUDIENCES`, `CALENDAR_PILLARS`).
   - Left untouched in `COH-CS-01` so calendar planning/cadence logic is not disrupted; full cross-studio continuity and governance deduplication are scheduled for `COH-CS-07`.
2. **Duplicated `REVISION_ACTIONS` Arrays (`src/App.tsx`, `src/components/RevisionStudio.tsx`, `src/lib/revisionActions.ts`):**
   - Documented for consolidation during `COH-CS-06` / `COH-CS-07`.
3. **Duplicated `PROTECTED_COH_KERNEL` Constant (`src/App.tsx` vs `src/lib/operatingCore.ts`):**
   - `src/lib/operatingCore.ts` is the authoritative export used by `contextCompiler.ts`; `src/App.tsx` copy is scheduled for cleanup in `COH-CS-07`.
