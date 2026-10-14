# COH-CS-04: Reuse Awareness & Opportunity Diversity Test Matrix

## 1. Staged Reuse Awareness (`classifyReuseOpportunity`)
Implemented in `src/lib/ideationIntelligence.ts` without any database, vector store, or external embedding service:
1. **Stage 1 (Local Candidate Shortlist)**: Tokenizes normalized terms (`tokenizeForReuse`) across real `savedIdeas` (Idea Library) and `savedContent` (Content Library), computing combined Jaccard and containment similarity across title and body/explanation.
2. **Stage 2 (Conservative Classification)**:
   - `New Ground`: Similarity score `< 0.18` across both libraries.
   - `Extend Existing Idea`: Matches an item in `savedIdeas` (`>= 0.18`).
   - `Reframe Existing Content`: Matches an item in `savedContent` (`>= 0.18`) where target audience or channel differs from the existing piece.
   - `Reuse Existing Argument`: Matches an item in `savedContent` (`>= 0.35`) with the same target audience and channel.
3. **Stage 3 (Confidence & Direct Inspection)**:
   - Confidence is explicitly graded `High` (`>= 0.45`), `Medium` (`>= 0.28`), or `Low` (`0.18 - 0.27`). Low-confidence matches prefix rationale with `"Low confidence match (thematic overlap only): "`.
   - Matched items expose an `Inspect` button on the opportunity card that navigates directly to the corresponding library.

## 2. Automated Test Cases (`tests/ideationIntelligence.test.ts`)
| Test Case | Input Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **1. Diversity & Segment Protection** | 3 cosmetic duplicates with identical communication job + invalid `"Enterprise SaaS Buyers"` audience | Diversifies across 3 distinct COH communication jobs; sanitizes audience back to `"General Public"` | **PASS** |
| **2. Evidence Separation & Role Guard** | Attached `Must-use Material` dramaturgy note + `Approved Example` source + `[INSERT VENUE DATE]` raw AI blocker | Extracts traceable fact from `Must-use Material`; blocks factual claims from `Approved Example`; converts `[INSERT VENUE DATE]` to clean advisory text | **PASS** |
| **3A. Reuse: New Ground** | Candidate on bio-material stage textiles vs unrelated libraries | Classified as `New Ground` (`High` confidence) | **PASS** |
| **3B. Reuse: Extend Existing Idea** | Candidate on vocal vibration vs saved idea `idea-lib-1` | Classified as `Extend Existing Idea` referencing `idea-lib-1` | **PASS** |
| **3C. Reuse: Reframe Existing Content** | Candidate on Golden Fountain IP for `General Public` / `Newsletter` vs `content-lib-1` (`Sponsors & Patrons` / `LinkedIn`) | Classified as `Reframe Existing Content` referencing `content-lib-1` | **PASS** |
| **3D. Reuse: Reuse Existing Argument** | Candidate on Golden Fountain IP for `Sponsors & Patrons` / `LinkedIn` vs `content-lib-1` | Classified as `Reuse Existing Argument` referencing `content-lib-1` | **PASS** |
| **4. Ideation -> Content Handoff** | Promote source-grounded opportunity `idea-promote-1` | Carries forward title, communication job, audience, channel, format, pillar, source IDs, source roles, evidence, and `workContext` | **PASS** |
