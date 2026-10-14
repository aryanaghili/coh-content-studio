# COH-CS-12: Reframing Protected-Element Integrity Report

## 1. Separation of Non-Negotiable Factual Integrity vs. Optional Preservation Preferences

Previously, Reframing Studio presented a single list of toggleable "Protected Elements (Hard Constraints)", making it appear as though claim safety or factual integrity could be toggled off, while simultaneously claiming generic "Preserved" statements without deterministic proof.

In `src/lib/reframingEngine.ts` and `src/components/ReframingStudio.tsx`:
- **`NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES` (Always Locked, Non-Disableable)**:
  1. Do not invent facts, numbers, dates, or funding milestones
  2. Do not escalate a fact into an unsupported stronger claim
  3. Do not fabricate partner or institution commitments
  4. Do not mutate a direct quotation and present it as verbatim
  5. Preserve Protected COH Kernel positioning
- **`OPTIONAL_PRESERVATION_PREFERENCES` (User-Toggleable Retention Preferences)**:
  - `Direct quotations (verbatim)`
  - `Names & proper titles`
  - `Dates & timelines`
  - `Confirmed facts & numbers`
  - `Approved COH terminology`
  - `Central artistic meaning`
  - `Source-backed claims`

Even if all optional preservation preferences are unchecked, `verifyReframedElementContinuity` enforces non-negotiable factual integrity (blocking invented numbers/dates and mutated direct quotations).

---

## 2. Truthful Verification of Dates, Numbers, and Names (`verifyReframedElementContinuity`)

`extractConfirmedSourceTokens` extracts:
- `numbersAndDates`: numeric figures, percentages, quarters (`Q1 2027`), years (`2026`), and full date phrases (`October 2026`, `14 October 2026`).
- `properNamesAndEntities`: multi-word proper names/institutions (`Teatro Nacional de São Carlos`, `Elena Rostova`) and mid-sentence capitalized proper nouns (`Lisbon`).
- `properTerms`: canonical COH terminology (`Climate Opera Haus`, `Soria Moria`, `The Golden Fountain`, `The Climate Tetralogy`, `Resonance 2027`).

Each extracted element is verified against `reframedCopy` and classified into one of four truthful states:
- `retained unchanged`
- `intentionally omitted`
- `altered and blocked`
- `requires review`

User-facing `preservedExplanation` only reports `Confirmed Facts & Dates (retained unchanged)` or `Names & Proper Titles (retained unchanged)` for tokens that were actually verified in `reframedCopy`.

---

## 3. Protected Quotation Governance (No Synthetic Auto-Appended Quotes)

- Removed the synthetic auto-appended quote wrapper (`As noted directly in the source material: "..."`) from `finalizeReframeResult`.
- When `Direct quotations (verbatim)` is enabled:
  - `buildDeterministicReframe` retains the exact quotation naturally inside the reframed copy.
  - `finalizeReframeResult` verifies that every required source quote appears verbatim in `reframedCopy`. If an AI output omits or mutates a required quote, `preservedQuotesVerified` and `integrityCheckPassed` are set to `false` and a blocking warning (`Protected Quotation Missing (Blocked)`) is surfaced in `evidenceWarnings`.
- When `Direct quotations (verbatim)` is disabled:
  - Quotes may be omitted (`intentionally omitted`), and `buildDeterministicReframe` omits the quote rather than re-injecting it.
  - However, if a direct quotation IS included in `reframedCopy`, non-negotiable integrity still verifies that it was not mutated from the source.

---

## 4. REVISION Route Enforcement in `ReframingStudio.tsx`

When `resolvedPlan.recommendedRoute === 'REVISION'` (e.g., `"Make this 25% shorter and smoother"`):
- Normal `Generate Proposed Reframe` execution is paused/disabled by default (`disabled={resolvedPlan.recommendedRoute === 'REVISION' && !routeOverrideConfirmed}`).
- A prominent `Open in Revision Studio` primary button hands the source content, title, suggested revision action (`shorter`), and instruction directly to Revision Studio.
- A secondary explicit override control (`Override - continue as Reframe`, `data-testid="override-continue-reframe-btn"`) allows the user to intentionally unlock Reframe generation if they wish to override the recommendation.
