# PLACEHOLDER REGRESSION REPORT - COH-CS-07

## 1. Root Cause Audited
In earlier Calendar -> Content Workspace handoffs, `EditorialCalendarItem.proofNeeded` frequently held generic advisory notices generated during calendar planning, such as:
- `"Proof needed: specific production milestone, capture plan, partner confirmation, or approved document."`
- `"Pending confirmation"` / `"TBD"`

When `buildAdvancedBriefFromCalendarItem` copied `item.proofNeeded` unconditionally into `advancedBrief.mustInclude`, the Content Workspace treated that advisory notice as a mandatory literal inclusion or placeholder blocker.

## 2. Remediation Implemented (`src/utils/calendarHandoffUtils.ts`)
1. **`isAdvisoryProofNotice(proofText)`**:
   - Detects generic advisory notices (`/^proof needed:/i`, `specific production milestone, capture plan, partner confirmation`, `tbd`, `to be confirmed`, `pending confirmation`, `none required`, or strings containing `{...}` / `[...]` tokens).
2. **`sanitizePlaceholderTokens(text)`**:
   - Strips `{placeholder}` and `[placeholder]` bracketed tokens and replaces em dashes (`\u2014`) with ` - `.
3. **`buildAdvancedBriefFromCalendarItem(item)`**:
   - Populates `mustInclude` **only** when `proofNeeded` is a concrete, non-advisory factual item.
   - Routes advisory `proofNeeded` strings into `customDirection` under an `Evidence Advisory (Non-Blocking): ...` line so the writer sees the guidance without polluting `mustInclude`.

## 3. Ideation 2.0 & Smart Brief Alignment
- In `src/lib/ideationIntelligence.ts` (`buildIdeationToContentHandoff`), `mustInclude` is populated exclusively from `idea.availableEvidence`, while `idea.evidenceStillRequired` is routed as `Evidence Advisory` inside `customDirection`.
- In `src/lib/smartBriefAndRevision.ts` (`resolveSmartBrief`), unresolved assumptions are surfaced as non-blocking advisory badges unless a high-risk unsupported claim is explicitly requested.

## 4. Automated Test Verification
- Verified in `tests/workflowContinuity.test.ts` (`Calendar -> Content Handoff: prevents advisory proofNeeded notices from polluting mustInclude as placeholders`): **PASS**.
