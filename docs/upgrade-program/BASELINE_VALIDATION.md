# Climate Opera Haus Content Studio: Baseline Validation Report

**Date:** 2026-10-14
**Branch:** `feature/coh-content-intelligence-v2`
**Base Commit (`main`):** `867a7eb88efaec68610eaae0bd7d623eb0d13874`

---

## 1. Build & Startup Verification

| Check | Command / Target | Result | Notes |
| :--- | :--- | :--- | :--- |
| TypeScript & Production Build | `npm run build` (`tsc -b && vite build`) | **PASS** | Built cleanly in 1.24s after resolving pre-existing type-only import flags (`import type { SavedContent, SavedIdea, SourceFile }`) in `TopBar.tsx` and `CommandPaletteModal.tsx`. |
| Frontend Dev Server | `npm run dev` (`http://localhost:5173`) | **PASS** | Starts cleanly on port 5173. |
| Express API Server | `npm run dev:server` (`http://localhost:3001`) | **PASS** | Starts cleanly on port 3001. |

---

## 2. Module & Route Smoke Verification (Playwright Headless)

All routes were verified via headless Chromium (`artifacts/coh-upgrade/baseline_check.mjs`):

| Module | Route | Status | Rendered Text Length | Page Errors |
| :--- | :--- | :--- | :--- | :--- |
| Command Center | `/command-center` | **PASS** | 1,133 chars | 0 |
| Content Workspace | `/content-workspace` | **PASS** | 1,425 chars | 0 |
| Ideation Workspace | `/ideation-workspace` | **PASS** | 1,321 chars | 0 |
| Editorial Calendar | `/editorial-calendar` | **PASS** | 1,957 chars | 0 |
| Revision Studio | `/revision-studio` | **PASS** | 1,550 chars | 0 |
| Visual Studio | `/visual-studio` | **PASS** | 2,106 chars | 0 |
| Source Library | `/source-library` | **PASS** | 1,157 chars | 0 |
| Content Library | `/content-library` | **PASS** | 1,408 chars | 0 |
| Operating Core | `/operating-core` | **PASS** | 583 chars | 0 |
| Settings | `/settings` | **PASS** | 2,143 chars | 0 |

---

## 3. Theme & Viewport Checks

| Check | Configuration | Status | Notes |
| :--- | :--- | :--- | :--- |
| Light Theme | `coh-theme = 'light'` | **PASS** | Default warm ivory surface (`bg-[#F7F4EE]`) renders cleanly. |
| Dark Theme | `coh-theme = 'dark'` | **PASS** | Dark obsidian surface (`bg-[#0B0F17]`) renders cleanly via `TopBar` theme toggle. |
| Desktop Viewport | `1440 x 900` | **PASS** | Full sidebar and workspace panels visible. |
| Mobile Viewport | `390 x 844` | **PASS** | Responsive header and mobile drawer toggle operational. |

---

## 4. Console & Pre-Existing Observations

- **Zero uncaught page/runtime exceptions (`pageErrors: []`).**
- **Expected local `503 Service Unavailable` on `/api/operating-core`:** When `POSTGRES_URL` is not configured in local `.env`, `server/operatingCore.js` returns HTTP 503 by design, triggering `src/lib/storage.ts` to use `localStorage` fallback (`coh_operating_core_v1` and `coh_backend-mock-core-documents`). No database or production data was touched.
