# COH-CS-10 Prompt Snapshot
## Restore Operating Core as the Single Strategic Authority Across Ideation, Smart Brief and Reframing

- **Repository**: `aryanaghili/coh-content-studio`
- **Branch**: `feature/coh-content-intelligence-v2`
- **Predecessor HEAD**: `c5735c45c50fc6e500b5fb79d4b6edc9a948ef87`
- **Objective**:
  1. Restore `Operating Core` (`src/lib/operatingCore.ts`) and the canonical COH content-pillar taxonomy (`CANONICAL_COH_PILLARS`) as the single strategic authority across Ideation 2.0, Smart Brief, Reframing Studio, and Source Intelligence.
  2. Eliminate parallel hardcoded audience and content-pillar taxonomies while preserving non-destructive alias normalization for natural-language inference and legacy saved items.
  3. Enforce strict explicit-value precedence in `resolveSmartBrief` (`General Public`, `English`, channel, format, pillar, audience, purpose).
  4. Deduplicate `PROTECTED_COH_KERNEL` so `src/lib/operatingCore.ts` is the sole literal definition and `src/App.tsx` re-exports it cleanly.
  5. Preserve Editorial Calendar planning logic (`ADOPTION_TRACKS`, `UNIT_TYPES`, `FOCUS_MAP`).
