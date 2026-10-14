# PROMPT SNAPSHOT: COH-CS-06

## Content Workspace Smart Brief, Fast vs Explore Generation Efficiency & Revision Productivity

Branch: `feature/coh-content-intelligence-v2`

Objectives:
1. **Part A: Smart Brief Resolution**:
   - Resolve natural-language requests in Content Workspace into structured COH fields (`topic`, `audience`, `purpose`, `channel`, `outputFormat`, `pillar`, `directionAngle`, `language`, `desiredLength`).
   - Differentiate `Explicit`, `Inherited`, `Resolved`, and `Unresolved` provenance.
   - Separate `Suggested` sources from `Selected` sources so suggested sources are never silently attached without user confirmation.
2. **Part B: Fast vs Explore Generation Efficiency**:
   - Provide `Fast (1 Draft)` vs `Explore (Multi-Option)` mode in Content Workspace.
3. **Part C & D: Revision Productivity & Canonical Action Authority**:
   - Consolidate `REVISION_ACTIONS` into a single canonical authority (`src/lib/revisionActions.ts`).
   - Provide draft-dependent `Suggested Revision Actions` (max 3) with specific reasons based on draft traits.
   - Support multi-action `Revision Recipes` ordered deterministically across 6 governed stages (`1: Preserve Meaning`, `2: Claim Discipline`, `3: Structural Transformation`, `4: Channel & COH Strategic Fit`, `5: Voice/Tone & Polish`, `6: Translation & Localization`).
   - Detect contradictory action combinations (`shorter` + `longer-version`, `bullet-points` + `paragraph`, etc.).
   - Protect `PT-EU` (European Portuguese, never Brazilian Portuguese) and spoken-friendly Persian localization rules.
