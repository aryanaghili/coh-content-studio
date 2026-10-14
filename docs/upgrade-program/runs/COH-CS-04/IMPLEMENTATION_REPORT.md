# COH-CS-04 Implementation Report: Ideation 2.0

## 1. Objective
Upgrade the existing Ideation Workspace to operate on the COH Opportunity-Led Ideation 2.0 model:
`Situation or Source -> Communication Opportunities -> Evidence Check -> Reuse Check -> Strong Idea -> Content Brief`
Generate fewer, more useful, better-grounded opportunities while preserving existing COH strategy, audiences, channels, pillars, quality filters, depth levels, Protected COH Kernel, and claim discipline.

## 2. Architecture Inspected
- `src/App.tsx`: `SavedIdea`, `SavedContent`, `handleGenerateIdeas`, `executeCopyIdeaToWorkspace`, `ideation-workspace` UI, `idea-library` UI, `content-library` UI
- `src/lib/contextCompiler.ts`: `compileGovernedContext`, `WorkContext`, `TaskSourceBinding`
- `src/lib/sourceIntelligence.ts`: `SourceIntelligenceAnalysis`, `compileSourceGroundingContext`
- `server/ai/promptBuilder.js`: `isIdeation` prompt construction

## 3. Implementation Approach
1. **Core Ideation 2.0 Module (`src/lib/ideationIntelligence.ts`)**:
   - Defined `COH_COMMUNICATION_JOBS` derived from COH strategic context (`Establish institutional credibility`, `Explain artistic logic`, `Create sponsor relevance`, `Build climate literacy`, `Invite public participation`, `Clarify a milestone`, `Deepen cultural meaning`).
   - Built `classifyReuseOpportunity` using a lightweight staged local shortlist (`tokenizeForReuse` + Jaccard/containment scoring) across real `savedIdeas` (Idea Library) and `savedContent` (Content Library) without adding any database, vector database, or embedding service. Classifies into `New Ground`, `Extend Existing Idea`, `Reframe Existing Content`, or `Reuse Existing Argument` with conservative `High | Medium | Low` confidence.
   - Built `buildIdeationEvidenceProfile` separating `availableEvidence` (traceable facts from attached factual sources or Protected Kernel) from `evidenceStillRequired` (advisory guidance, never raw `[INSERT]` placeholder blockers) and `unresolvedAssumptions`. Explicitly blocks `Approved Example` and `Visual Reference` sources from contributing factual claims.
   - Built `evaluateOpportunityDiversity` and `enforceOpportunityDiversity` to guarantee diversity across communication job, strategic angle, pillar, and narrative perspective while preventing non-COH segment leakage.
   - Built `buildIdeationToContentHandoff` to carry forward idea ID/title, communication job, audience, channel, format, pillar, selected sources/roles, available evidence, advisory evidence required, strategic angle, and unresolved assumptions into Content Workspace.
2. **Digestible Primary Card + Expandable Intelligence (`src/components/IdeationOpportunityCard.tsx`)**:
   - Primary card displays communication job badge, reuse classification badge, title, core concept, why it matters, attached source role badges, reuse inspection link, and recommended channel/format/audience/pillar.
   - Secondary intelligence (`strategicAngle`, `coreTension`, `desiredAudienceResponse`, `availableEvidence`, `evidenceStillRequired`, `unresolvedAssumptions`, `reuseOpportunity` rationale, hook, first post, risk to avoid, next step) lives in an expandable panel.
3. **Ideation Workspace Integration (`src/App.tsx` & `server/ai/promptBuilder.js`)**:
   - Integrated `ContextManifestPanel`, `ideation-attached-sources-panel` (with inline task role selector and source attachment/detachment), `ideation-diversity-summary`, and `IdeationOpportunityCard`.

## 4. Behavior Preserved
- Retained all existing Ideation controls (quality filters, depth level, target channel, language, target audience, Promising, Not Useful, Variations, Save, Draft, Idea Library).
- Existing `coh_saved_ideas_v1` records remain 100% compatible without migration.

## 5. Known Limitations & Risks
- None. All unit tests, Playwright browser checks, and production build checks pass.
