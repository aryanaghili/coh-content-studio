# Implementation Report: `COH-CS-03`

## 1. Objective
Upgrade the Source Library into a governed Source Intelligence system with derived non-destructive analysis, task-level source roles (`Evidence`, `Strategic Context`, `Approved Example`, `Quote / Language Source`, `Visual Reference`, `Must-use Material`), verbatim excerpt selection, bounded role-prioritized context compilation, and direct studio handoffs (`Analyze Source`, `Add to Current Brief`, `Use in Ideation`, `Create Content`, `Use as Visual Reference`).

---

## 2. Architecture Inspected
- `src/App.tsx`: `SourceFile` interface, `coh_sources_v11` persistence, `selectableSources`, `buildContentWorkspaceContextPackage`, `compileStructuredPrompt`, `handleGenerateDrafts`, `handleGenerateIdeas`, Content Workspace `Selected Sources` UI, and Source Library UI (`activeTab === 'source-library'`).
- `src/lib/contextCompiler.ts`: `TaskSourceBinding`, `SourceTaskRole`, `compileGovernedContext`, and `ContextManifest`.
- `server.js`, `server/ai/promptBuilder.js`, `server/ai/qualityGate.js`: AI routes, prompt generation, and output validation.

---

## 3. Implementation Approach
1. **Derived Source Intelligence & Non-Destructive Versioned Persistence (`src/lib/sourceIntelligence.ts`)**:
   - Defined `SourceIntelligenceAnalysis` (`schemaVersion: '1.0'`) with mandatory disclaimer `"AI interpretation of the source, not the source itself."` and structured fields (`keyFacts`, `supportedClaims`, `strategicContext`, `cautionsAndAmbiguities`, `usefulExcerpts`, `relevantAudiences`, `relevantChannels`, `relevantPillars`, `contentOpportunityHints`).
   - Persisted derived analyses under a dedicated versioned `localStorage` key (`coh_source_intelligence_v1`) via `loadSourceIntelligenceStore`, `upsertSourceIntelligenceRecord`, and `removeSourceIntelligenceRecord`, leaving raw `SourceFile` records in `coh_sources_v11` completely untouched.
   - Built corruption recovery into `loadSourceIntelligenceStore` so malformed JSON or invalid records never prevent raw sources from loading.
2. **Claim Discipline & Verbatim Excerpt Validation (`src/lib/sourceIntelligence.ts`)**:
   - `enforceSourceIntelligenceClaimDiscipline` verifies numeric/date tokens in `keyFacts` and `supportedClaims` against the raw source text, moves untraceable figures or aspirational language (`aims to`, `plans to`, etc.) into `cautionsAndAmbiguities`, and forces `keyFacts` and `supportedClaims` to `[]` for `Approved Example` and `Visual Reference` sources.
   - `validateExactSourceExcerpt` guarantees that every AI-extracted or manually pinned excerpt is an exact verbatim substring of `source.content` or `source.notes`.
3. **Deterministic Role-Based Grounding & Bounded Context Allocation (`compileSourceGroundingContext` in `src/lib/sourceIntelligence.ts` & `src/lib/contextCompiler.ts`)**:
   - Prioritizes attached sources by role weight (`Must-use Material` > `Evidence` > `Quote / Language Source` > `Strategic Context` > `Approved Example` > `Visual Reference`) within a bounded total character budget (`8,000` chars default).
   - Enforces role-specific directives so `Approved Example` facts cannot leak as evidence and `Visual Reference` sources influence Visual Direction only, never factual copy.
   - Emits explicit truncation warnings in `ContextManifest.conflictWarnings` when an oversized source without selected excerpts is bounded.
4. **Backend Source Analysis Endpoint (`server.js`, `server/ai/promptBuilder.js`, `server/ai/qualityGate.js`)**:
   - Added `POST /api/ai/analyze-source` and `mode: 'source_analysis'` in `buildGenerationPrompt` and `runQualityGate`, with deterministic local fallback (`buildDeterministicSourceAnalysis`) when AI is offline or unconfigured.
5. **Source Library & Content Workspace UX (`src/components/SourceIntelligencePanel.tsx`, `src/App.tsx`)**:
   - Added `SourceIntelligenceCardAddon` to each Source Library card with direct actions (`Analyze Source` / `Regenerate Analysis`, `Add to Current Brief`, `Use in Ideation`, `Create Content`, `Use as Visual Reference`), task role selector, verbatim excerpt picker + manual excerpt pinning, and expandable `Source Intelligence` view (handling empty, loading, error, and populated states in light/dark themes and desktop/mobile layouts).
   - Added inline task role selectors and excerpt count indicators to the `Selected Sources` list in Content Workspace (`src/App.tsx`).
   - Prepared `prepareSourceForReframing` for `COH-CS-05` without rendering any dead Reframing links in the UI.

---

## 4. Behavior Changed vs. Deliberately Preserved
### Behavior Changed
- Users can now analyze any source into derived `Source Intelligence`, assign task-specific source roles, select or pin verbatim excerpts, and trigger direct actions (`Use in Ideation`, `Create Content`, `Add to Current Brief`, `Use as Visual Reference`).
- `compileGovernedContext` now compiles role-prioritized, bounded source grounding with truncation safeguards.

### Behavior Deliberately Preserved
- Raw `SourceFile` records in `coh_sources_v11`, all 12 source types, statuses, and upload/edit/delete flows remain intact.
- Protected COH Kernel and COH claim-safety rules remain the highest authority.
- Zero database or schema changes.

---

## 5. Files Materially Changed
- Created: `src/lib/sourceIntelligence.ts`, `src/components/SourceIntelligencePanel.tsx`, `tests/sourceIntelligence.test.ts`
- Modified: `src/lib/contextCompiler.ts`, `src/App.tsx`, `server.js`, `server/ai/promptBuilder.js`, `server/ai/qualityGate.js`

---

## 6. Known Limitations & Risks
- None blocking. `prepareSourceForReframing` is ready for `COH-CS-05` Reframing Studio integration.
