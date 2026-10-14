# COH-CS-11: Evidence Grounding Contract

## 1. Architectural Principle

Every factual output in Source Intelligence (`keyFacts`, `supportedClaims`) and Ideation (`availableEvidence`) must carry a verified verbatim evidence anchor (`evidenceExcerpt`) pointing back to an actual raw source segment (`sourceId`).

Prompt instruction alone is not treated as proof of grounding. Both numeric and non-numeric hallucinated factual claims (for example, `"UNESCO has formally endorsed Climate Opera Haus."`) are deterministically rejected unless their entities, numbers/dates, and factual content words anchor to a validated substring of the raw source.

---

## 2. Internal Grounded Claim Contract (`src/lib/sourceIntelligence.ts`)

```ts
export interface GroundedEvidenceClaim {
  text: string;
  evidenceExcerpt: string;
  sourceId: string;
}
```

`SourceIntelligenceAnalysis` persists:
- `keyFacts: string[]` (backward-compatible string array containing only verified grounded facts)
- `supportedClaims: string[]` (backward-compatible string array containing only verified grounded claims)
- `groundedFacts?: GroundedEvidenceClaim[]` (structured evidence anchor records for every verified fact)
- `groundedClaims?: GroundedEvidenceClaim[]` (structured evidence anchor records for every verified claim)

---

## 3. Deterministic Grounding Verification (`findGroundableSourceAnchor`)

For each candidate fact or claim:
1. **Numeric & Date Traceability**: Every numeric/date token (`\b\d+(?:[.,]\d+)?%?\b`) must exist in the raw source text (`source.content` + `source.notes`).
2. **Aspiration Separation**: Statements matching `ASPIRATION_PATTERNS` (`aims to`, `hopes to`, `plans to`, `projected to`, `proposed`, etc.) are moved to `cautionsAndAmbiguities`.
3. **Proper Noun / Entity Grounding**: Every non-meta capitalized proper noun or acronym (e.g., `UNESCO`, `Berlin`, `Philharmonic`) must exist in the raw source text. Any claim introducing an entity absent from the source is rejected.
4. **Verbatim Sentence Anchor (`evidenceExcerpt`)**: At least 60% of the candidate statement's substantive content tokens must anchor to a single verbatim sentence in the raw source text, which is verified via `validateExactSourceExcerpt`.
5. **Demotion on Failure**: Any unanchored statement is excluded from `keyFacts` / `supportedClaims` and recorded in `cautionsAndAmbiguities` (`"Unverified or unanchored claim moved to caution: ..."`).

---

## 4. Ideation Evidence Attribution (`buildIdeationEvidenceProfile`)

- Only sources attached with factual roles (`Evidence`, `Must-use Material`, `Quote / Language Source`) may supply factual items to `availableEvidence`.
- Sources attached as `Approved Example`, `Visual Reference`, or `Strategic Context` never produce factual `availableEvidence`.
- Any AI-returned `aiAvailableEvidence` item is validated via `findGroundableSourceAnchor` against the attached factual sources. If grounded, it is attributed as `[Source Title - Verified Source Anchor] ...`; if ungrounded, it is moved to `unresolvedAssumptions`.

---

## 5. Legacy Storage Normalization (`normalizeStoredSourceIntelligenceRecord`)

When loading older `SourceIntelligenceAnalysis` records from `localStorage` that lack `groundedFacts` or `groundedClaims`:
- `normalizeStoredSourceIntelligenceRecord` reconciles `keyFacts` and `supportedClaims` against the record's verified `usefulExcerpts` without fabricating fake anchors.
- Any legacy unanchored claim is stripped from `keyFacts` / `supportedClaims` upon normalization.
