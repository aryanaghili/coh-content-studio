# Source Context Contract (`COH-CS-03`)

## 1. Architectural Separation: Raw Source vs. Task Context vs. Derived Intelligence

COH Content Studio enforces a strict three-way separation so that raw source documents are never mutated or conflated with AI interpretation or task-specific bindings:

1. **Raw Source Record (`SourceFile` in `coh_sources_v11`)**:
   - Immutable user-provided source text (`content`), `notes`, `url`, `title`, `type`, and `status`.
   - Never overwritten or rewritten by `Analyze Source`.
2. **Derived Source Intelligence (`SourceIntelligenceAnalysis` in `coh_source_intelligence_v1`)**:
   - Explicitly labeled with `disclaimer: "AI interpretation of the source, not the source itself."`
   - Stored in a separate versioned `localStorage` key (`coh_source_intelligence_v1`, `schemaVersion: "1.0"`).
3. **Task-Level Source Context (`TaskSourceBinding` in `taskSourceRoleMap` / `WorkContext.sourceBindings`)**:
   - Ephemeral to the active task/brief (`role: SourceTaskRole`, `selectedExcerpts: string[]`).
   - Allows the same source to serve different roles across different tasks.

---

## 2. Task-Level Source Roles & Governance Rules

When a source is attached to an active task, `compileSourceGroundingContext` in `src/lib/sourceIntelligence.ts` (invoked by `compileGovernedContext` in `src/lib/contextCompiler.ts`) compiles role-specific instructions at Authority Level 3:

| Task Role (`SourceTaskRole`) | Priority Weight | Sort Order | Compiled Governance Rule |
| :--- | :--- | :--- | :--- |
| `Must-use Material` | `1.50` | `1` | Key substance must be addressed in the output, while remaining strictly subordinate to the Protected COH Kernel and COH Claim Safety rules. |
| `Evidence` | `1.40` | `2` | May support factual statements strictly within the bounds of the verbatim source text and COH Claim Safety. Extrapolation beyond stated facts is prohibited. |
| `Quote / Language Source` | `1.25` | `3` | Preserves exact quoted wording verbatim and attributes internally to the source title. Never fabricates or alters quotes. |
| `Strategic Context` | `1.00` | `4` | Informs thematic framing and strategic reasoning. Unverified aspirations or strategic framing must not be converted into confirmed factual claims. |
| `Approved Example` | `0.80` | `5` | Guides tone, cadence, and structure ONLY (`[STYLE & STRUCTURE REFERENCE ONLY]`). Specific facts, dates, partner names, or numbers inside an example are blocked from leaking into new work as factual evidence. |
| `Visual Reference` | `0.75` | `6` | In text workflows (`Simple Mode`, `Quick Create`, `Advanced Brief`, `Content Workspace`, `Ideation Workspace`, `Revision Studio`), marked `[VISUAL DIRECTION ONLY - DO NOT USE AS FACTUAL COPY]` and scoped strictly to the Visual Design Brief. In `Visual Studio`, serves as primary atmospheric and compositional reference governed by COH Visual DNA. |

---

## 3. Verbatim Excerpt Selection & Bounded Context Limits

1. **Exact Verbatim Excerpt Selection**:
   - Users can select excerpts extracted by Source Intelligence or pin manual excerpts.
   - Every excerpt is validated via `validateExactSourceExcerpt(source, candidateExcerpt)` against `source.content` and `source.notes` to guarantee zero fabricated or paraphrased quotes.
   - When excerpts are selected for a source, `compileSourceGroundingContext` injects those exact verbatim excerpts under `SELECTED VERBATIM EXCERPTS (Exact source text, distinct from AI interpretation)`.
2. **Bounded Multi-Source Context Allocation**:
   - Default total source grounding budget: `8,000` characters (`DEFAULT_MAX_TOTAL_SOURCE_CHARS`), with a minimum per-source floor of `900` characters (`DEFAULT_MIN_PER_SOURCE_CHARS`).
   - Sources are sorted and weighted by role priority (`Must-use Material` -> `Evidence` -> `Quote / Language Source` -> `Strategic Context` -> `Approved Example` -> `Visual Reference`).
   - If a large source without selected excerpts exceeds its allocated character budget, `boundTextCleanly` truncates at a sentence boundary and appends a warning to `truncationWarnings` (surfaced in `ContextManifest.conflictWarnings` and `GOVERNANCE ENFORCEMENT NOTICE`), ensuring Protected COH Kernel, Operating Core rules, user instructions, and higher-priority evidence are never crowded out.
