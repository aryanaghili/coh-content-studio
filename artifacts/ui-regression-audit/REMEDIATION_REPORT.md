# COH Content Studio — Remediation Report

## Overview

All remediations in this cycle followed an **audit-first, minimal-surface** discipline:
- Zero changes to COH visual identity, brand colours, or established Light/Dark CSS custom property palettes.
- Zero changes to business logic except where a confirmed functional regression (`RevisionStudio` saving incomplete records to `coh_saved_content_v1`) required a targeted fix.
- Zero full-file rewrites or speculative refactors.

---

## Remediated Issues & Modified Files

### 1. Revision Studio `Save as New` Schema & Version History Inspector (P1)
- **File**: `src/components/RevisionStudio.tsx`
- **Issue**:
  1. `handleSaveAsNew` wrote `{ id, title, content: draftInput, type: 'Revision', date }` to `coh_saved_content_v1`, omitting `text`, `finalCopy`, `channel`, `outputFormat`, `pillar`, `angle`, `audience`, `purpose`, `status`, `sourcesUsed`, `createdAt`, `lastEdited`, and `version`. Saved items rendered blank in Content Library.
  2. Revision Studio did not expose a visible version badge (`v1`, `v2`, ...) or an inspector to view and restore previous versions/original draft.
- **Fix**:
  1. Updated `handleSaveAsNew` to construct a complete `SavedContent`-compatible entry (`text: draftInput`, `finalCopy: draftInput`, `status: 'Revised'`, `version: currentVersionNumber`, `createdAt`, `lastEdited`, `sourcesUsed: []`, etc.) and added inline `Saved to Library` confirmation state (`saveSuccess`).
  2. Added `data-testid="revision-version-badge"` (`v{currentVersionNumber}`) in the editor header and a collapsible `Original Draft & Version History ({revisionHistory.length})` panel (`data-testid="revision-version-history"`) displaying `v1 — Original Draft` and each subsequent revision step with a `Restore v{idx}` action.

### 2. Elimination of Browser-Native `window.prompt()` Dialogs (P1)
- **Files**:
  - `src/components/EditorialCalendarStudio.tsx`
  - `src/App.tsx`
- **Issue**:
  - `EditorialCalendarStudio.tsx` used `window.prompt("Enter Week Number to regenerate (1-5):", "1")` and `window.prompt("Enter Channel to regenerate...", "LinkedIn")` when selecting `Regenerate Selected Week` or `Regenerate Selected Channel`.
  - `src/App.tsx` used `window.prompt("Rename Work Item:", activeWorkItem.title)` on the Content Workspace Active Work Item header.
- **Fix**:
  - In `EditorialCalendarStudio.tsx`, added `selectedRegenWeek` (`Week 1`–`Week 5`, `data-testid="calendar-regen-week-select"`) and `selectedRegenChannel` (`data-testid="calendar-regen-channel-select"`) inline dropdown selectors next to the `Specific Regeneration...` control (`data-testid="calendar-specific-regen-select"`).
  - In `src/App.tsx`, replaced `window.prompt("Rename Work Item:")` with an inline rename input (`isRenamingWorkItem`, `workItemRenameInput`, `data-testid="work-item-rename-input"`, `data-testid="work-item-rename-save-btn"`).

### 3. Desktop Canvas & Controlled Rail Architecture on Wide Screens (`1440px–1920px`) (P2)
- **Files**:
  - `src/index.css`
  - `src/App.tsx`
  - `src/components/EditorialCalendarStudio.tsx`
  - `src/components/RevisionStudio.tsx`
  - `src/components/ReframingStudio.tsx`
  - `src/components/OperatingCoreAdmin.tsx`
- **Issue**:
  - Proportional 12-column grids (`col-span-4` / `col-span-5`) caused secondary control/status rails to bloat to `520px–657px` on `1920x1080` screens while compressing primary working canvases.
- **Fix**:
  - Standardized `.app-shell`, `.app-main`, `.page-content`, and `.page-shell` in `src/index.css` (`width: 100%; max-width: none; margin-left: 0; margin-right: 0; box-sizing: border-box;`).
  - Converted proportional studio splits to bounded CSS Grid templates so primary workspaces expand fluidly (`minmax(0, 1fr)`) while control/status rails remain within ergonomic bounds:
    - **Command Center**: `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]` (`1224px` main / `360px` status rail at `1920px`)
    - **Ideation Workspace**: `grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]` (`400px` input rail / `1176px` results canvas at `1920px`)
    - **Editorial Calendar**: `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]` (`1228px` calendar canvas / `360px` review rail at `1920px`)
    - **Content Workspace**: `grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]` (`440px` brief rail / `1136px` draft output canvas at `1920px`)
    - **Visual Studio**: `grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]` (`420px` prompt rail / `1164px` visual preview canvas at `1920px`)
    - **Revision Studio**: `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]` (`1184px` editor canvas / `400px` tool rail at `1920px`)
    - **Reframing Studio**: `grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]` (`440px` controls rail / `1144px` reframed output canvas at `1920px`)
    - **Source Library**: `grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]` (`400px` upload rail / `1184px` repository grid at `1920px`)
    - **Operating Core**: `grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]` (`280px` nav rail / `1304px` editor canvas at `1920px`)

### 4. Navigation TopBar Titles & Mobile Drawer Escape Key (P2)
- **File**: `src/App.tsx`
- **Issue**:
  - `getPageTitle()` returned `'Climate Opera Haus Studio'` on `/calendar-library`, `'Operating Core Admin'` on `/operating-core`, and `'AI Provider Settings'` on `/settings`.
  - Mobile navigation drawer did not close on `Escape` key press.
- **Fix**:
  - Updated `getPageTitle()` to return `'Calendar Library'`, `'Operating Core'`, and `'Settings'`, matching the canonical sidebar labels 1:1 across all 13 routes.
  - Added a `keydown` listener for `Escape` when `isMobileMenuOpen` is active, and ensured mobile menu open/close buttons have `min-w-[44px] min-h-[44px]` touch targets and `aria-label`s.

### 5. Accessibility Labels, Reduced Motion & Light Mode Contrast (P2)
- **Files**:
  - `src/components/RevisionStudio.tsx`
  - `src/components/EditorialCalendarStudio.tsx`
  - `src/components/CalendarLibrary.tsx`
  - `src/components/OperatingCoreAdmin.tsx`
  - `src/components/GuidedTour.tsx`
  - `src/index.css`
- **Fix**:
  - Added explicit `aria-label` attributes to all icon-only buttons across all 13 routes (`0` unlabeled buttons remaining).
  - Replaced hardcoded `text-slate-300` with semantic `text-text-secondary` in `GuidedTour.tsx` so Light Mode text is high-contrast.
  - Added `@media (prefers-reduced-motion: reduce)` support in `src/index.css`.
