# GOVERNANCE & DUPLICATION REPORT - COH-CS-07

## 1. Authority Hierarchy Verification
All studios (`Ideation Workspace`, `Content Workspace`, `Reframing Studio`, `Revision Studio`, `Visual Studio`, `Editorial Calendar`) compile context through the shared `compileStudioContext()` compiler in `src/lib/contextCompiler.ts`.

The non-negotiable 6-level authority hierarchy remains intact:
1. **Level 1**: `PROTECTED_COH_KERNEL` (`src/data/operatingCoreSeed.ts`) — Always active, immutable, highest authority.
2. **Level 2**: Claim Safety & Evidence Discipline (`compileTaskSourceGovernanceBlock` in `src/lib/sourceIntelligence.ts`) — Separates `Confirmed Fact`, `Supported Direction`, `Aspiration / Future Plan`, and `Unverified / Missing Proof`. Blocks `Approved Example` and `Visual Reference` sources from being cited as factual evidence.
3. **Level 3**: Task-Relevant Operating Core Slice — Selects only relevant audience, channel, pillar, and strategic focus slices rather than dumping the entire Operating Core JSON.
4. **Level 4**: Attached Source Bindings & Exact Excerpts — Bounded to `MAX_TOTAL_SOURCE_CONTEXT_CHARS` (7,500 chars) and `MAX_SINGLE_SOURCE_CHARS` (2,400 chars).
5. **Level 5**: Cross-Studio WorkContext & Provenance (`explicit | inherited | resolved | unresolved`).
6. **Level 6**: Immediate User Instruction & Language/Format Modifiers (`PT-EU` European Portuguese governance and natural spoken Persian governance).

## 2. Deduplication Summary
| Duplication Area Audited | Prior State | Post-Upgrade State (`COH-CS-01` .. `COH-CS-07`) |
|---|---|---|
| **Revision Actions & Group Order** | Duplicated across `src/App.tsx` and `src/components/RevisionStudio.tsx` | Single canonical source in `src/lib/revisionActions.ts` (`REVISION_ACTIONS`, `REVISION_GROUP_ORDER`) |
| **Operating Core Prompt Injection** | Raw `JSON.stringify(operatingCore)` dumped in multiple prompt builders | Centralized in `compileStudioContext()` (`src/lib/contextCompiler.ts`) with task-specific slicing |
| **Language Governance (`PT-EU` & Persian)** | Scattered ad-hoc rules in individual handlers | Centralized in `buildLanguageGovernanceDirective()` (`src/lib/smartBriefAndRevision.ts`) and `contextCompiler.ts` |
| **Source Role Enforcement** | Ad-hoc string concatenation in workspace prompt | Centralized in `compileTaskSourceGovernanceBlock()` (`src/lib/sourceIntelligence.ts`) |
| **Em-Dash Sanitization** | Inconsistent across studios | Enforced across `ideationIntelligence.ts`, `reframingEngine.ts`, `smartBriefAndRevision.ts`, and `calendarHandoffUtils.ts` |
