# COH-CS-11: Source Budget Hard-Cap Stress Test

## 1. Defect Identified in Independent Review

Previously, `compileSourceGroundingContext` in `src/lib/sourceIntelligence.ts` computed per-source budget using:
```ts
const allocatedBudget = Math.max(minPerSourceChars, Math.min(remainingBudget, proportionalShare));
remainingBudget = Math.max(minPerSourceChars, remainingBudget - bodyBlock.length);
```
Because `Math.max(minPerSourceChars, ...)` prevented `remainingBudget` from ever dropping below `900` characters, attaching 15 large sources caused the total compiled output (`formattedSection.length`) to exceed `DEFAULT_MAX_TOTAL_SOURCE_CHARS` (`8000` chars).

---

## 2. Hard-Cap Remediation

`compileSourceGroundingContext` now enforces a strict invariant:
```ts
formattedSection.length <= maxTotalChars
```
1. **Header & Separator Accounting**: Reserves space for `GOVERNED SOURCE & EVIDENCE CONTEXT:\n`, per-source headers (`[SOURCE: ... | Type: ... | Active Task Role: ...]`), role directives, body labels, and `SOURCE CAUTIONS`.
2. **Anti-Starvation Cap**: When multiple sources are attached, no single source may consume more than `65%` of the total budget (`maxSingleSourceShare`), ensuring one massive source cannot starve subsequent high-priority sources.
3. **Role Priority Ordering**: Sources are sorted deterministically (`Must-use Material` > `Evidence` > `Quote / Language Source` > `Strategic Context` > `Approved Example` > `Visual Reference`).
4. **Monotonic Budget Exhaustion & Omission Warnings**: `remainingBudget` decreases monotonically toward `0`. When remaining budget is insufficient for trailing lower-priority sources, they are omitted and recorded in `truncationWarnings` (`"Source budget cap (8000 chars) reached; omitted remaining source ..."`).
5. **Bounded Notice Accounting**: `boundTextCleanly` subtracts the length of `\n[...Bounded to preserve context budget...]` before slicing so bounded text never overflows `maxChars`.

---

## 3. Stress Test Verification (`tests/evidenceIntegrityAndQualityGate.test.ts`)

- **Scenario**: 15 large sources (`Large Source Document 1` through `Large Source Document 15`), each ~3,000+ characters (~45,000 characters total input), with mixed roles (`Must-use Material`, `Evidence`, `Strategic Context`) and `maxTotalChars = 8000`.
- **Result**:
  - `compiled.formattedSection.length <= 8000` (**PASS**)
  - Highest-priority `Must-use Material` and `Evidence` sources are preserved first (**PASS**)
  - `compiled.truncationWarnings.length > 0` surfaces explicit bounding/omission notices (**PASS**)
