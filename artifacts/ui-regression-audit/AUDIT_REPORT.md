# COH Content Studio — Product-Level UI/UX, Responsive, Navigation & Workflow Audit Report

## 1. Baseline Safety Check (Phase 1)

| Gate | Command | Baseline Status | Notes |
| --- | --- | --- | --- |
| Git Working Tree | `git status` | Clean | Branch `main`, HEAD `1864c88` (`Merge COH Hardening V5`) |
| Dependencies | `npm ci` | PASS | 164 packages installed cleanly |
| Linter | `npm run lint` | Pre-existing root file issue | `npx oxlint src/` passes with `0 warnings and 0 errors` across 76 source files. Root-level legacy script `patch_text.mjs:6:77` has a pre-existing syntax error (left untouched per instructions not to clean historical root files). |
| Test Suite | `npm run test` | PASS (`58/58`) | All 17 unit, integration, API, and workflow test suites pass |
| Production Build | `npm run build` | PASS | `tsc -b && vite build` succeeds with 0 TypeScript or bundler errors |
| Production Audit | `npm run audit:prod` | PASS (`0 vulnerabilities`) | Zero production dependency vulnerabilities |

---

## 2. Active Rendered Architecture Inventory (Phase 2)

| Layer | Active File / Selector | Implementation Details |
| --- | --- | --- |
| Entry & Router | `src/main.tsx` | Wraps `<App />` in `<BrowserRouter>`, `<ErrorBoundary>`, and `<ToastProvider>`. Reads `localStorage.getItem('coh-theme')` before first paint and sets `document.documentElement.setAttribute('data-theme', savedTheme)`. |
| Application Shell | `src/App.tsx`, `src/index.css` (`.app-shell`) | Flex row container (`min-h-screen bg-bg-canvas flex flex-col md:flex-row relative overflow-x-hidden`). |
| Sidebar Navigation | `src/App.tsx` (`aside`) | Fixed `248px` (`w-[248px]`) on `md+` desktop viewports; slide-over off-canvas drawer (`fixed inset-y-0 left-0 z-50 -translate-x-full md:translate-x-0`) on viewports `< 768px` with backdrop overlay (`z-40`). |
| Top Utility Bar | `src/components/TopBar.tsx` | Sticky `56px` (`h-[56px]`) header with dynamic route title (`header h2`), `Cmd+K` global search trigger (`CommandPaletteModal`), AI connection status pill, and Light/Dark theme segmented toggle. |
| Main Content Wrapper | `src/App.tsx`, `src/index.css` (`.app-main`, `main.page-content`, `.page-shell`) | Fluid flex child (`flex: 1 1 0%; min-width: 0; width: 100%; max-width: none`) with responsive padding (`16px` mobile, `20px 24px` tablet, `24px 32px` desktop). |
| Active Route Destinations | `src/App.tsx` + Dedicated Studio Components | **Rendered directly in `src/App.tsx`**: Command Center, Ideation Workspace, Content Workspace, Visual Studio, Idea Library, Content Library, Source Library, Settings.<br>**Rendered via dedicated components**: `EditorialCalendarStudio.tsx`, `RevisionStudio.tsx`, `ReframingStudio.tsx`, `CalendarLibrary.tsx`, `OperatingCoreAdmin.tsx`. |
| Shared UI Primitives | `src/components/ui/*` | `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Toast.tsx`. |

---

## 3. Confirmed Audit Findings & Root Causes (Phases 3–13)

### Finding 1 — P1 Functional Data-Loss Regression: Revision Studio `Save as New` Saved Incomplete Content Library Items
- **Component**: `src/components/RevisionStudio.tsx` (`handleSaveAsNew`)
- **Symptom**: Clicking `Save as New` in Revision Studio created a record in `coh_saved_content_v1` with `content: draftInput` instead of the canonical `SavedContent` schema (`text`, `finalCopy`, `channel`, `outputFormat`, `pillar`, `angle`, `audience`, `purpose`, `status`, `sourcesUsed`, `createdAt`, `lastEdited`). When viewing Content Library (`/content-library`), cards saved from Revision Studio rendered blank body text or crashed downstream operations expecting `item.text`.
- **Root Cause**: Schema mismatch between `RevisionStudio.tsx` local object creation and `SavedContent` interface in `App.tsx`.

### Finding 2 — P1 Workflow Transparency Gap: Revision Studio Version Badge & History Inspector Not Exposed in UI
- **Component**: `src/components/RevisionStudio.tsx`
- **Symptom**: While `RevisionStudio` maintained `revisionHistory` state internally and showed an `Undo` button, users had no visible version indicator (`v1`, `v2`, etc.) and no way to inspect or compare the original draft (`v1`) against subsequent revisions or restore a specific intermediate revision.
- **Root Cause**: Missing version badge in the editor header and missing collapsible version history/original draft inspector below the draft editor.

### Finding 3 — P1 UX & Automation Defect: Browser-Native `window.prompt()` Used in Core Workflows
- **Components**:
  1. `src/components/EditorialCalendarStudio.tsx` (`handleGenerate` for `Regenerate Selected Week` and `Regenerate Selected Channel`)
  2. `src/App.tsx` (Active Work Item header `Rename` button in Content Workspace)
- **Symptom**: Triggering week/channel-specific calendar regeneration or renaming an active Work Item invoked blocking browser `window.prompt()` dialogs, breaking visual consistency, mobile usability, and headless automation.
- **Root Cause**: Legacy prototype `prompt()` calls had not been replaced with inline studio controls.

### Finding 4 — P2 Desktop Canvas Architecture: Proportional 12-Column Splits Caused Rail Bloating on 1440px–1920px Screens
- **Components**: `src/App.tsx`, `src/components/EditorialCalendarStudio.tsx`, `src/components/RevisionStudio.tsx`, `src/components/ReframingStudio.tsx`, `src/components/OperatingCoreAdmin.tsx`
- **Symptom**: Even with `.page-shell { width: 100%; max-width: none }`, several workspaces used proportional 12-column grids (`lg:grid-cols-12` with `col-span-4` or `col-span-5` rails). On `1920x1080` (`1608px` available canvas after sidebar and padding):
  - **Revision Studio** (`7/5` split): Right tool rail expanded to **`657px`** while the draft editor was constrained to `927px`.
  - **Editorial Calendar** (`8/4` split): Right review panel expanded to **`520px`**, compressing the primary monthly calendar grid to `1064px`.
  - **Reframing Studio** (`5/7` split): Left configuration rail expanded to **`657px`**.
  - **Source Library** (`5/7` split): Left upload form expanded to **`657px`**, squeezing the 2-column source repository cards.
  - **Command Center** (`8/4` split): Right status column expanded to **`520px`**.
  - **Operating Core** (`3/9` split): Left section navigation expanded to **`385px`**.
- **Root Cause**: Using fractional column spans (`col-span-4` / `col-span-5`) for control/status rails instead of bounded CSS Grid tracks (`minmax(0, 1fr)` for primary canvas + `340px–440px` bounded rail).

### Finding 5 — P2 Navigation & TopBar Title Mismatches on 3 Routes
- **Component**: `src/App.tsx` (`getPageTitle`)
- **Symptom**:
  - `/calendar-library` displayed TopBar title `"Climate Opera Haus Studio"` instead of `"Calendar Library"`.
  - `/operating-core` displayed `"Operating Core Admin"` while the sidebar item label was `"Operating Core"`.
  - `/settings` displayed `"AI Provider Settings"` while the sidebar item label was `"Settings"`.
- **Root Cause**: Incomplete `switch (activeTab)` cases in `getPageTitle()`.

### Finding 6 — P2 Accessibility, Keyboard & Light/Dark Theme Polish Defects
- **Components**: `src/App.tsx`, `src/components/RevisionStudio.tsx`, `src/components/EditorialCalendarStudio.tsx`, `src/components/CalendarLibrary.tsx`, `src/components/OperatingCoreAdmin.tsx`, `src/components/GuidedTour.tsx`, `src/index.css`
- **Symptoms**:
  - Icon-only buttons in Revision Studio (custom instruction submit button, recipe step toggle buttons), Editorial Calendar (List view, Calendar view, item inspect chevron, modal close), Calendar Library (delete calendar button), Operating Core (delete core document button), Guided Tour (close buttons), and App overwrite modal lacked `aria-label` attributes.
  - Pressing `Escape` when the mobile navigation drawer was open did not close the drawer, and the mobile menu button was `< 44x44px`.
  - `GuidedTour.tsx` used hardcoded `text-slate-300` on `bg-surface-primary`, causing unreadable low-contrast text in Light Mode.
  - `src/index.css` lacked a global `@media (prefers-reduced-motion: reduce)` rule.
