# COH Content Studio — Route, Responsive, Desktop Rail & Workflow Regression Matrix

## 1. Canonical Route & Navigation Matrix (13 Active Destinations)

| # | Destination | Canonical URL | Direct URL | Refresh Persists | Back / Forward | TopBar Title | Active Sidebar Item | Unknown URL Fallback | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Command Center | `/command-center` | PASS | PASS | PASS | `Command Center` | `Command Center` | Redirects to `/command-center` | **PASS** |
| 2 | Ideation Workspace | `/ideation-workspace` | PASS | PASS | PASS | `Ideation Workspace` | `Ideation Workspace` | — | **PASS** |
| 3 | Editorial Calendar | `/editorial-calendar` | PASS | PASS | PASS | `Editorial Calendar` | `Editorial Calendar` | — | **PASS** |
| 4 | Content Workspace | `/content-workspace` | PASS | PASS | PASS | `Content Workspace` | `Content Workspace` | — | **PASS** |
| 5 | Visual Studio | `/visual-studio` | PASS | PASS | PASS | `Visual Studio` | `Visual Studio` | — | **PASS** |
| 6 | Revision Studio | `/revision-studio` | PASS | PASS | PASS | `Revision Studio` | `Revision Studio` | — | **PASS** |
| 7 | Reframing Studio | `/reframing-studio` | PASS | PASS | PASS | `Reframing Studio` | `Reframing Studio` | — | **PASS** |
| 8 | Calendar Library | `/calendar-library` | PASS | PASS | PASS | `Calendar Library` | `Calendar Library` | — | **PASS** |
| 9 | Idea Library | `/idea-library` | PASS | PASS | PASS | `Idea Library` | `Idea Library` | — | **PASS** |
| 10 | Content Library | `/content-library` | PASS | PASS | PASS | `Content Library` | `Content Library` | — | **PASS** |
| 11 | Source Library | `/source-library` | PASS | PASS | PASS | `Source Library` | `Source Library` | — | **PASS** |
| 12 | Operating Core | `/operating-core` | PASS | PASS | PASS | `Operating Core` | `Operating Core` | — | **PASS** |
| 13 | Settings | `/settings` | PASS | PASS | PASS | `Settings` | `Settings` | — | **PASS** |

---

## 2. Responsive Viewport & Theme Matrix (13 Routes × 9 Viewports × 2 Themes = 234 Checks)

| Viewport | Category | Sidebar State | Horizontal Overflow (`> 1px`) | Light Theme | Dark Theme | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `360 x 800` | Mobile | Off-canvas drawer (`-translate-x-full`, `44x44px` trigger, `Escape` closes) | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |
| `390 x 844` | Mobile | Off-canvas drawer (`-translate-x-full`, `44x44px` trigger, `Escape` closes) | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |
| `430 x 932` | Mobile | Off-canvas drawer (`-translate-x-full`, `44x44px` trigger, `Escape` closes) | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |
| `768 x 1024` | Tablet | Fixed `248px` left rail; single-column content stack (`< 1024px`) | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |
| `1024 x 768` | Laptop | Fixed `248px` left rail; `lg:` two-column studio layout | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |
| `1280 x 800` | Laptop | Fixed `248px` left rail; `xl:` studio proportions | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |
| `1440 x 900` | Desktop | Fixed `248px` left rail; full fluid `.page-shell` (`1128px` canvas) | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |
| `1600 x 900` | Desktop | Fixed `248px` left rail; full fluid `.page-shell` (`1288px` canvas) | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |
| `1920 x 1080` | Wide Desktop | Fixed `248px` left rail; full fluid `.page-shell` (`1608px` canvas) | `0 / 13 routes` | PASS (13/13) | PASS (13/13) | **PASS** |

---

## 3. Desktop Canvas & Rail Proportions at `1920 x 1080` (`1608px` Usable Canvas)

| Destination | Before Remediation (`1920x1080`) | After Remediation (`1920x1080`) | Target Architecture Rule | Status |
| --- | --- | --- | --- | --- |
| **Command Center** | `1064px` main / `520px` right status rail | **`1224px`** main / **`360px`** right status rail | Primary canvas fluid (`1fr`), status rail `320–360px` | **PASS** |
| **Ideation Workspace** | `520px` input / `1064px` results | **`400px`** input rail / **`1176px`** results canvas | Input panel `360–420px`, results canvas `minmax(0, 1fr)` | **PASS** |
| **Editorial Calendar** | `1064px` calendar / `520px` right review rail | **`1228px`** calendar canvas / **`360px`** review rail | Widest canvas in app (`1fr`), review rail `340–360px` | **PASS** |
| **Content Workspace** | `515px` brief / `1061px` output | **`440px`** brief rail / **`1136px`** draft & comparison canvas | Brief panel `380–440px`, draft output `minmax(0, 1fr)` | **PASS** |
| **Visual Studio** | `520px` prompt controls / `1064px` preview | **`420px`** prompt rail / **`1164px`** visual preview canvas | Controls `380–440px`, preview `minmax(0, 1fr)` | **PASS** |
| **Revision Studio** | `927px` editor / `657px` right tool rail | **`1184px`** editor canvas / **`400px`** right tool rail | Editor `minmax(0, 1fr)` (`68–80ch` text), tool rail `340–420px` | **PASS** |
| **Reframing Studio** | `657px` controls / `927px` reframed output | **`440px`** controls rail / **`1144px`** reframed output canvas | Source & target rail `380–440px`, output `minmax(0, 1fr)` | **PASS** |
| **Calendar Library** | 3-column responsive grid (`520px × 3`) | 3-column responsive grid (`520px × 3`) | Full-width filter bar + responsive card grid | **PASS** |
| **Idea Library** | 3-column responsive grid (`520px × 3`) | 3-column responsive grid (`520px × 3`) | Full-width filter bar + responsive card grid | **PASS** |
| **Content Library** | 3-column responsive grid (`520px × 3`) | 3-column responsive grid (`520px × 3`) | Full-width filter bar + responsive card grid | **PASS** |
| **Source Library** | `657px` upload rail / `927px` repository | **`400px`** upload rail / **`1184px`** repository grid | Upload rail `360–400px`, repository `minmax(0, 1fr)` | **PASS** |
| **Operating Core** | `385px` nav rail / `1199px` editor | **`280px`** nav rail / **`1304px`** governance editor | Nav rail `260–280px`, editor `minmax(0, 1fr)` | **PASS** |
| **Settings** | `1064px` config / `520px` diagnostics | **`1064px`** config / **`520px`** diagnostics & guide | Balanced two-column configuration & status | **PASS** |

---

## 4. End-to-End Cross-Studio Workflow Matrix (Phase 9)

| Workflow ID | Path | Verified Behavior | Status |
| --- | --- | --- | --- |
| **Workflow A** | Source Library → Ideation Workspace → Content Workspace → Content Library | Added source in Source Library; generated multi-option proposals in Ideation Workspace; saved to Idea Library; sent via `Develop in Content Workspace` preserving brief, audience, pillar, and source context; tested inline Work Item rename (no `window.prompt`); generated drafts and saved to Content Library. | **PASS** |
| **Workflow B** | Editorial Calendar → Calendar Library → Reopen → Content Workspace | Generated monthly calendar; tested inline week selector (`Week 3`) + `Regenerate Selected Week` without `window.prompt`; saved calendar to Calendar Library; reopened saved calendar from Calendar Library into Editorial Calendar. | **PASS** |
| **Workflow C** | Content Workspace → Revision Studio → Save as New → Content Library | Sent draft from Content Workspace to Revision Studio; verified `v1` badge; executed revision recipe; verified `v2` badge and collapsible `Original Draft & Version History` inspector; clicked `Save as New`; verified saved `(v2)` item appears with full text in Content Library. | **PASS** |
| **Workflow D** | Content Library → Reframing Studio → Save / Send to Content Workspace | Sent saved Content Library item to Reframing Studio; applied reframing direction; generated reframed output; saved to Content Library and sent to Content Workspace. | **PASS** |
| **Workflow E** | Idea Library → Visual Studio | Opened Idea Library and sent visual direction to Visual Studio; verified prompt controls and aspect ratio workspace populated cleanly. | **PASS** |
| **Workflow F** | Content Library → Revision Studio | Sent saved item from Content Library directly into Revision Studio and verified revision controls and version tracking. | **PASS** |
| **Workflow G** | Operating Core → Downstream Studios | Updated and saved Operating Core configuration and verified persistence across downstream studios. | **PASS** |
| **Workflow H** | Theme Switch Mid-Workflow | Edited draft in Revision Studio, toggled Light/Dark theme via TopBar, and verified `data-theme` attribute, `localStorage` persistence, and zero loss of draft state. | **PASS** |
