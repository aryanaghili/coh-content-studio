# REVISION RECIPE MATRIX (COH-CS-06)

## 1. Canonical Action Authority

All revision actions are consolidated in `src/lib/revisionActions.ts` (`REVISION_ACTIONS`, `REVISION_GROUP_ORDER`) and imported by both `src/App.tsx` and `src/components/RevisionStudio.tsx`. Duplicate action arrays have been eliminated.

---

## 2. Governed 6-Stage Execution Ordering (`compileRevisionRecipe`)

When a user selects multiple compatible actions in Revision Studio, `compileRevisionRecipe` sorts them into a deterministic 6-stage pipeline regardless of click order:

| Stage | Stage Name | Representative Action IDs |
|---|---|---|
| **Stage 1** | Preserve Core Meaning & Facts | `preserve-meaning`, `preserve-meaning-flow`, `preserve-meaning-improve-flow` |
| **Stage 2** | Evidence & Claim Discipline | `remove-unsupported`, `flag-claims`, `more-careful`, `stronger-proof`, `less-exaggerated`, `simplify-claims` |
| **Stage 3** | Structural Transformation | `shorter`, `shorter-version`, `longer-version`, `remove-repetition`, `bullet-points`, `to-bullets`, `paragraph`, `openings`, `add-hook`, `ctas`, `add-cta`, `stronger-headline`, `extract-quotes` |
| **Stage 4** | Channel, Format & COH Strategic Fit | `coh-specific`, `institutional`, `sponsor-facing`, `audience-friendly`, `channel-ready`, `adapt-channel`, `culturally-grounded`, `strategic`, `less-generic`, `email`, `social-post`, `make-story` |
| **Stage 5** | Voice, Tone & Editorial Polish | `clean-ai-punctuation`, `improve-clarity`, `smoother`, `fix-grammar`, `remove-awkward`, `human`, `sharper`, `warmer`, `direct`, `less-corporate`, `less-ngo`, `less-poetic`, `premium`, `natural` |
| **Stage 6** | Translation & Localization | `translate`, `translate-selected`, `localize`, `localize-selected`, `adapt-channel-lang`, `persian-natural`, `english-polished` |

---

## 3. Conflict Detection Matrix (`detectRevisionConflicts`)

| Action A | Action B | Severity | Behavior |
|---|---|---|---|
| `shorter` / `shorter-version` | `longer-version` / `stronger-proof` | `blocking` | Blocks recipe execution and alerts user to resolve contradictory length instructions. |
| `bullet-points` / `to-bullets` | `paragraph` | `blocking` | Blocks recipe execution and alerts user to resolve contradictory structural formatting. |
| `persian-natural` | `english-polished` | `blocking` | Blocks recipe execution due to contradictory target languages. |
| `less-corporate` / `human` / `warmer` | `institutional` | `warning` | Advisory notice that formal institutional authority and warm/non-corporate voice will be balanced. |
