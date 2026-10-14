# SMART BRIEF CONTRACT (COH-CS-06)

## 1. Resolution Architecture (`resolveSmartBrief`)

`resolveSmartBrief` (`src/lib/smartBriefAndRevision.ts`) and `SmartBriefPanel` (`src/components/SmartBriefPanel.tsx`) resolve natural-language creation requests into governed COH brief dimensions:

| Field | Resolution Priority | Provenance Badges |
|---|---|---|
| `topic` | User natural-language goal -> Inherited `originTitle` | `Explicit`, `Inherited`, `Unresolved` |
| `audience` | Natural-language intent match -> Explicit dropdown -> Inherited `audience` -> COH default | `Explicit`, `Inherited`, `Resolved` |
| `purpose` | Natural-language communication job match -> Explicit dropdown -> Inherited `communicationJob` | `Explicit`, `Inherited`, `Resolved` |
| `channel` | Natural-language channel match -> Explicit dropdown -> Inherited `channel` | `Explicit`, `Inherited`, `Resolved` |
| `outputFormat` | Natural-language format match -> Explicit dropdown -> Inherited `format` -> Channel default | `Explicit`, `Inherited`, `Resolved` |
| `pillar` | Natural-language pillar/canon match -> Explicit dropdown -> Inherited `pillar` | `Explicit`, `Inherited`, `Resolved` |
| `language` | Natural-language language match -> Explicit dropdown | `Explicit`, `Resolved` |
| `desiredLength` | Format/intent length heuristic -> Explicit dropdown | `Explicit`, `Resolved` |

---

## 2. Suggested vs Selected Source Separation

- **Selected Sources (`status: 'selected'`)**: Sources explicitly checked by the user or inherited from a source-grounded upstream handoff. Included in generation context.
- **Suggested Sources (`status: 'suggested'`)**: Sources in Source Library whose title/content/notes match keywords in the user's request. Displayed with a `Suggested` badge and a `+ Select` action button. Suggested sources are **never** silently injected into generation until selected by the user.

---

## 3. Fast vs Explore Generation Speed Mode (`GenerationSpeedMode`)

- **`fast` (`Fast (1 Draft)`)**: Displays 1 focused primary draft (`Focused Primary Draft (Fast Mode)`), `Visual Direction`, and `Strategy Fit Check`, suppressing secondary Option B and Shorter Version cards for rapid iteration.
- **`explore` (`Explore (Multi-Option)`)**: Displays `Option A — Direct / Institutional`, `Option B — Human / Narrative`, `Shorter Version`, `Visual Direction`, `Strategy Fit Check`, and `Recommended Approaches`.
