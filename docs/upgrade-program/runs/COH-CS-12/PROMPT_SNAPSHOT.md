# COH-CS-12 Prompt Snapshot

Task: **Reframing Protected-Element Integrity, Revision Translation Safety and Route Enforcement**
Repository: `aryanaghili/coh-content-studio`
Branch: `feature/coh-content-intelligence-v2`
Predecessor Commit: `b2ee2c16d29734b707b93a3755136c479994a225` (`COH-CS-11`)

Scope:
1. Separate non-negotiable factual integrity rules (always locked) from optional preservation preferences in Reframing Studio.
2. Truthfully verify dates, numbers, and proper names/entities against `reframedCopy` (`retained unchanged`, `intentionally omitted`, `altered and blocked`, `requires review`).
3. Remove synthetic auto-appended quote wrappers (`"As noted directly in the source material: ..."`), verify required quotes verbatim, and allow quote omission when quote retention is disabled.
4. Enforce `REVISION` route in `ReframingStudio.tsx` by pausing normal Reframe generation when `recommendedRoute === 'REVISION'` unless explicitly overridden via secondary action.
5. Classify revision actions as `deterministic-safe` vs `ai-required`, block fake offline translation fallback in `smartBriefAndRevision.ts` and `RevisionStudio.tsx`, and validate AI translation output for Persian script and PT-EU target language integrity.
