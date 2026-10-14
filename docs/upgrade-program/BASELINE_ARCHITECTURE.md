# Climate Opera Haus Content Studio: Baseline Architecture

**Inspected Branch:** `feature/coh-content-intelligence-v2` (from `main` `867a7eb88efaec68610eaae0bd7d623eb0d13874`)

---

## 1. Current Navigation & Modules

Navigation is managed in `src/App.tsx` using `react-router-dom` (`useLocation`, `useNavigate`) mapped to `activeTab`:

- **Command Center** (`/command-center` or `/`) - Overview dashboard, quick workflow launchers, active session summary, and recent content/ideas.
- **Ideation Workspace** (`/ideation-workspace`) - Brainstorming studio for generating strategic campaign concepts, hooks, and content directions (`SavedIdea`).
- **Editorial Calendar** (`/editorial-calendar`, `src/components/EditorialCalendarStudio.tsx`) - Multi-week cadence and campaign planner with balance diagnostics, slot editing, and handoffs to Creation, Visual, and Revision studios.
- **Calendar Library** (`/calendar-library`, `src/components/CalendarLibrary.tsx`) - Saved multi-week editorial calendars (`SavedCalendar`).
- **Content Workspace** (`/content-workspace`) - Core content briefing, source attachment, template/preset application, AI draft generation, quality audit, and inline refinement.
- **Visual Studio** (`/visual-studio`) - Visual direction briefing, prompt compilation (`/api/ai/compile-image-prompt`), and AI image generation (`/api/ai/generate-image`) governed by COH Visual DNA.
- **Revision Studio** (`/revision-studio`, `src/components/RevisionStudio.tsx`) - Dedicated editorial transformation workspace with grouped revision presets (`Precision & Polish`, `Tone & Institutional Fit`, `Structural Reframing`, `Audience & Localization`), side-by-side comparison, and version history.
- **Idea Library** (`/idea-library`) - Persistent repository of saved ideation concepts (`SavedIdea`).
- **Content Library** (`/content-library`) - Persistent repository of saved drafts and approved assets (`SavedContent`).
- **Source Library** (`/source-library`) - Repository of uploaded documents, notes, links, and reference materials (`SourceFile`).
- **Operating Core** (`/operating-core`, `src/components/OperatingCoreAdmin.tsx`) - Strategic governance editor for Strategy Kernel, Audience Profiles, Channel Rules, Claims & Proof, Voice & Language, Visual DNA, Revision Standards, and Core Evidence documents.
- **Settings** (`/settings`) - AI provider status, text/image model selection, and connection testing (`/api/ai/test`).

---

## 2. Current Source Storage & Source-Selection Logic

- **Model (`SourceFile` in `src/App.tsx`):** Contains `id`, `name`, `type` (`Event Notes`, `Partner Profile`, `Sponsor Notes`, `Meeting Notes`, `Campaign Notes`, `Article / Media Coverage`, `Website Reference`, `Visual Reference`, `Approved Example`, `Pasted Notes`, `Link / URL`, `Other`), `size`, `date`, `status` (`Indexed`, `Processing`), `selected` (`boolean`), `tags`, `content`, `summary`, `url`, `usageNotes`.
- **Storage:** Persisted client-side in `localStorage` under `coh_sources_v11` via `src/utils/storage.ts`.
- **Selection Logic:**
  - Global `selected` boolean flag on each `SourceFile` toggles inclusion in general workspace context.
  - Task-specific `selectedSourceIds: string[]` in Content Workspace (`src/App.tsx`) and `WorkItem.sourceIds` track attached sources for a specific brief.
  - Currently lacks derived Source Intelligence (`Analyze Source`), task-specific source roles (`Evidence`, `Strategic Context`, `Approved Example`, etc.), and exact excerpt selection.

---

## 3. Current Work Item Structure

Defined in `src/App.tsx` (`export interface WorkItem`):
- Identification & Origin: `id`, `title`, `originModule` (`'ideation' | 'calendar' | 'content' | 'visual' | 'revision' | 'library'`), `currentStage` (`'idea' | 'planned' | 'drafting' | 'visual' | 'revising' | 'ready' | 'archived'`).
- Strategic Metadata: `channel`, `audience`, `pillar`, `format`, `language`, `tone`, `cta`, `campaign`, `publishDate`, `summary`, `objective`, `angle`, `keyNotes`, `status`.
- Payload & History: `draftContent`, `revisedContent`, `visualBrief`, `visualPrompt`, `imageUrl`, `sourceIds`, `revisionHistory`, `linkedIdeaId`, `linkedCalendarItemId`, `linkedSavedContentId`, `updatedAt`.
- Persisted in `localStorage` under `coh_active_work_item_v1`.

---

## 4. Current Operating Core Compilation Path

- Defined in `src/lib/operatingCore.ts`:
  - `PROTECTED_COH_KERNEL`: Immutable top-level identity, institutional voice, and claim-safety rules.
  - `OperatingCore` interface & `DEFAULT_OPERATING_CORE`: Contains `strategyKernel`, `audienceProfiles`, `channelRules`, `claimsRules`, `voiceRules`, `visualDna`, `revisionStandards`, and `coreDocuments`.
  - `compileOperatingCoreContext(core, params)`: Compiles a markdown string combining `PROTECTED_COH_KERNEL`, `strategyKernel`, matched `audience` profile, matched `channel` rule, `claimsRules`, `voiceRules`, optional `visualDna` (`isVisual`), optional `revisionStandards` (`isRevision`), and active `coreDocuments` matching `useInGeneration` / `useInRevision` / `useInVisuals`.

---

## 5. Current AI Generation Path

1. **Client (`src/App.tsx`):**
   - `compileStructuredPrompt()` assembles a text prompt block and combines it with `compileOperatingCoreContext()`.
   - Calls `POST /api/ai/generate-drafts` (or `/api/ai/generate-ideas`, `/api/ai/generate-calendar`) with `{ prompt, channel, audience, pillar, format, language, tone, sources, operatingCoreInstructions, model }`.
2. **Server (`server.js` -> `server/ai/promptBuilder.js` -> `server/ai/providerManager.js` -> `server/ai/qualityGate.js`):**
   - `buildDraftGenerationPrompt` constructs `systemPrompt` and `userPrompt` (requesting JSON with `drafts` array).
   - `providerManager.generateDrafts()` resolves the provider/model, invokes the provider adapter (`jsonMode: true`), parses/repairs JSON, and runs `validateDrafts()` in `server/ai/qualityGate.js`.
   - If the AI backend is offline or unconfigured, client falls back safely to deterministic local prototype generation when Prototype Mode is enabled.

---

## 6. Current Revision Path

- **Inline Content Workspace Revision (`src/App.tsx`):** Calls `POST /api/ai/revise` with `compileOperatingCoreContext(..., { isRevision: true })`.
- **Dedicated Revision Studio (`src/components/RevisionStudio.tsx`):**
  - Supports preset selection (`REVISION_ACTIONS`) + custom instruction.
  - Calls `POST /api/ai/revise`, **but** on line 213 currently passes `operatingCoreInstructions: JSON.stringify(operatingCore)` instead of a governed, task-specific compiled context.

---

## 7. Current Visual Direction Handoff

- Content Workspace and Editorial Calendar can hand off items to Visual Studio via `activeWorkItem` (`visualBrief`, `channel`, `audience`, `pillar`, `draftContent`) or `handleCalendarCreateVisual` (`src/utils/calendarHandoffUtils.ts`).
- Visual Studio compiles prompts via `POST /api/ai/compile-image-prompt` and generates visuals via `POST /api/ai/generate-image`.

---

## 8. Current Calendar Handoff

- Centralized in `src/utils/calendarHandoffUtils.ts` (`CalendarItemHandoffPayload`) and wired in `src/App.tsx`:
  - `handleCalendarOpenInIdeation` -> populates Ideation Workspace and navigates to `/ideation-workspace`.
  - `handleCalendarCreateDraft` -> populates Content Workspace brief and `activeWorkItem` and navigates to `/content-workspace`.
  - `handleCalendarCreateVisual` -> populates Visual Studio brief and navigates to `/visual-studio`.
  - `handleCalendarSendToRevision` -> populates `activeWorkItem` and navigates to `/revision-studio`.

---

## 9. Current Persistence Boundaries

- **Server / Database (`server/operatingCore.js`):**
  - Optional `@vercel/postgres` connection (`POSTGRES_URL`) using two tables: `operating_core (id, config, updated_at)` and `core_documents (id, data, updated_at)`.
  - When `POSTGRES_URL` is absent, `/api/operating-core` returns HTTP `503`, and `src/lib/storage.ts` transparently falls back to `localStorage` (`coh_operating_core_v1` and `coh_backend-mock-core-documents`).
- **Client `localStorage` Keys:**
  - `coh_sources_v11` - `SourceFile[]`
  - `coh_saved_content_v11` - `SavedContent[]`
  - `coh_saved_ideas_v1` - `SavedIdea[]`
  - `coh_active_work_item_v1` - `WorkItem | null`
  - `coh_saved_calendars_v1` - `SavedCalendar[]`
  - `coh_operating_core_v1` - `OperatingCore`
  - `coh_backend-mock-core-documents` - `CoreDocument[]`
  - `coh-theme` - `'light' | 'dark'`
  - `coh_settings_text_model` / `coh_settings_image_model` - selected model overrides

---

## 10. Duplicated Strategic / Action Definitions

1. **`PROTECTED_COH_KERNEL`:** Duplicated in `src/lib/operatingCore.ts` (lines 3-57) and `src/App.tsx` (lines 218-272).
2. **`REVISION_ACTIONS` & `REVISION_GROUP_ORDER`:** Triplicated across `src/lib/revisionActions.ts` (lines 16-76), `src/App.tsx` (lines 151-216), and `src/components/RevisionStudio.tsx` (lines 15-64).
3. **Channels, Audiences, Pillars:** Separate static arrays exist in `src/App.tsx` (`CHANNELS`, `AUDIENCES`, `PILLARS`), `src/lib/operatingCore.ts` (`DEFAULT_OPERATING_CORE`), and `src/components/EditorialCalendarStudio.tsx` (`CALENDAR_CHANNELS`, `CALENDAR_AUDIENCES`, `CALENDAR_PILLARS`).

---

## 11. Current Model / Provider Architecture

- **Orchestrator (`server/ai/providerManager.js`):**
  - Supports 5 providers: `openai`, `gemini`, `anthropic`, `mistral`, `openrouter`.
  - Default models in `providerManager.js`: `OPENAI_MODEL || 'gpt-4o'`, `OPENAI_IMAGE_MODEL || 'gpt-image-1'`.
- **OpenAI Adapter (`server/ai/adapters/openaiAdapter.js`):**
  - Hardcodes `/v1/chat/completions`, `temperature: 0.8`, and legacy prefix check `if (jsonMode && (model.startsWith('gpt-4') || model.startsWith('gpt-3.5'))) payload.response_format = { type: 'json_object' }`.
- **Frontend Model Registry (`src/App.tsx` lines 427-455):**
  - Lists `gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-4o`, `gemini-3.1-pro`, `gemini-2.5-pro`, `claude-4.6-sonnet`, `mistral-large-3`.

---

## 12. Current Known Implementation Risks

1. **Unbounded Operating Core Injection in Revision Studio:** `RevisionStudio.tsx` serializes the entire `operatingCore` object via `JSON.stringify(operatingCore)` rather than compiling task-specific governed context.
2. **Legacy OpenAI Adapter Assumptions:** `openaiAdapter.js` relies on `model.startsWith('gpt-4')` for `response_format` and unconditionally passes `temperature: 0.8`, which breaks or degrades newer reasoning/GPT-6 models.
3. **Unbounded Source Context Injection:** Selected sources are concatenated directly without role-based grounding rules or token/character budgets, risking context crowd-out when large documents are attached.
4. **Implicit vs. Explicit Context Ambiguity:** No formal provenance tracking distinguishes whether an audience, channel, or pillar was explicitly selected by the user, inherited from a work item, resolved from defaults, or left unresolved.
