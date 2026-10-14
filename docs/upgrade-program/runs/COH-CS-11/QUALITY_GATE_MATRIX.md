# COH-CS-11: Quality Gate Matrix (`server/ai/qualityGate.js`)

## 1. Removal of Unconditional Bypass

The previous bypass in `server/ai/qualityGate.js`:
```js
if (input.mode === 'ideation' || input.mode === 'revision' || input.mode === 'reframe') {
  return { passed: true, issues: [] };
}
```
has been removed and replaced with workflow-specific validation across all five AI generation modes.

---

## 2. Workflow Validation Matrix

| Workflow (`input.mode`) | Required Schema Checks | Grounding & Claim-Safety Checks | Language & Editorial Checks |
| :--- | :--- | :--- | :--- |
| **`source_analysis` / `source-analysis`** | `keyFacts`, `supportedClaims`, `cautionsAndAmbiguities`, and `usefulExcerpts` must all be arrays. | - Every `usefulExcerpts` item must be an exact substring of the raw source.<br>- Every `keyFacts` and `supportedClaims` item must pass `isClaimGroundedInSourceText` (numbers, proper nouns/entities, and >=60% content tokens in raw source).<br>- If `sourceType` is `Approved Example` or `Visual Reference`, `keyFacts` and `supportedClaims` must be empty. | Rejects em dash (`—`) punctuation. |
| **`ideation`** | Non-empty `ideaGroups` / `ideas`; each opportunity requires `title`, `communicationJob`, and `shortExplanation`/`explanation`. | - Rejects `[INSERT...]` and `[TBD...]` placeholder blockers.<br>- Any `availableEvidence` item (other than Protected COH Kernel positioning) must be grounded in attached source text when `sourceContent` is provided. | Rejects em dash (`—`) punctuation. |
| **`revision`** | Non-empty `revisedCopy` (`>= 10` chars). | Rejects fake offline translation fallback markers (`[Translated to ...]`, `[Localized to ...]`, `[Offline Fallback]`). | - Rejects em dash (`—`) punctuation.<br>- **Persian target**: requires Persian script (`[\u0600-\u06FF]`).<br>- **Portuguese (PT-EU) target**: rejects unchanged copy or predominantly English stopword density without Portuguese markers. |
| **`reframe`** | Non-empty `reframedCopy` (`>= 15` chars), non-empty `changedExplanation` array, non-empty `preservedExplanation` array. | - Rejects synthetic auto-appended quote wrappers (`"As noted directly in the source material:"`).<br>- Flags any numeric/date token in `reframedCopy` that is absent from `sourceContent` and `operatingCoreInstructions`. | Rejects em dash (`—`) punctuation. |
| **`draft` (Standard Content Creation)** | At least 2 drafts (`drafts.length >= 2`), each with non-empty `copy` (`>= 20` chars). | Rejects metadata markers inside copy (`Option A:`, `Option B:`, `[DRAFT]`). | Rejects raw-input opening repetition, em/en dashes, and AI clichés (`now more than ever`, `in a world where`, `at the intersection`, `dive into`). |
