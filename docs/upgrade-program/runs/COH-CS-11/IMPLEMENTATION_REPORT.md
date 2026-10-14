# COH-CS-11 Implementation Report

## 1. Summary of Changes

1. **Evidence Grounding Contract (`src/lib/sourceIntelligence.ts`)**:
   - Added `GroundedEvidenceClaim` (`{ text, evidenceExcerpt, sourceId }`) and extended `SourceIntelligenceAnalysis` with `groundedFacts` and `groundedClaims` while keeping `keyFacts` and `supportedClaims` synchronized for UI/backward compatibility.
   - Implemented `findGroundableSourceAnchor(source, candidateText, explicitEvidenceExcerpt)` to deterministically verify that every candidate fact or supported claim:
     - introduces no proper noun / entity / acronym absent from the raw source (`source.content` + `source.notes`),
     - anchors at least 60% of its substantive content words to a validated verbatim sentence (`evidenceExcerpt`) in the raw source.
   - Updated `enforceSourceIntelligenceClaimDiscipline` so any non-numeric or numeric unanchored claim (e.g., `"UNESCO has formally endorsed Climate Opera Haus."`) is rejected from `keyFacts` / `supportedClaims` and moved to `cautionsAndAmbiguities`.
   - Added `normalizeStoredSourceIntelligenceRecord` in `loadSourceIntelligenceStore` and `upsertSourceIntelligenceRecord` to safely normalize legacy stored records without fabricating fake anchors.

2. **Ideation Evidence Attribution (`src/lib/ideationIntelligence.ts`)**:
   - Updated `buildIdeationEvidenceProfile` so only factual roles (`Evidence`, `Must-use Material`, `Quote / Language Source`) can supply `availableEvidence`.
   - Every AI-returned `aiAvailableEvidence` item is verified via `findGroundableSourceAnchor` against attached factual sources and attributed as `[Source Title - Verified Source Anchor] ...`. Unanchored AI claims are moved to `unresolvedAssumptions`.

3. **Source Budget Hard Cap (`src/lib/sourceIntelligence.ts`)**:
   - Fixed `compileSourceGroundingContext` and `boundTextCleanly` so `formattedSection.length <= maxTotalChars` holds as a strict deterministic ceiling even when 15+ large sources are attached.
   - Capped single-source share at 65% of budget when multiple sources are attached, prioritized `Must-use Material` and `Evidence` first, and emitted explicit `truncationWarnings` when budget exhaustion omits or bounds lower-priority sources.

4. **Workflow-Aware Quality Gates (`server/ai/qualityGate.js`)**:
   - Removed the unconditional `if (input.mode === 'ideation' || input.mode === 'revision' || input.mode === 'reframe') return { passed: true, issues: [] }` bypass.
   - Implemented real structural, grounding, and language quality checks for `source_analysis` / `source-analysis`, `ideation`, `revision` (including Persian script and PT-EU translation checks), and `reframe`.
