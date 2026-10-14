# PROMPT SNAPSHOT: COH-CS-05

## Build a Dedicated COH Reframing Studio

Branch: `feature/coh-content-intelligence-v2`

Objective:
Create a first-class Reframing Studio destination beside existing creation and revision capabilities without merging it into Revision Studio or copying business-specific segmentation. Encode the core distinction between Revision (improve substantially the same communication job) and Reframing (change what the content is trying to become while preserving factual integrity).

Key requirements:
1. First-class navigation item (`Reframing Studio`).
2. Support input origins: manual/pasted content, Content Library item, Content Workspace output, Revision Studio output, Source Library contextual handoff.
3. Natural-language primary question (`What should this become?`) resolved via the shared Context Compiler into an editable `ResolvedReframePlan`.
4. Route classification (`REFRAME` vs `REVISION`) with direct handoff to Revision Studio when the instruction is pure polishing/shortening/grammar/translation.
5. Protected elements enforcement (including verbatim quote preservation and non-negotiable Protected COH Kernel).
6. Evidence discipline: never invent missing proof or numbers; surface warnings clearly.
7. Explain transformation (`Changed` vs `Preserved`) and compare source and proposal side-by-side.
8. Save as New Version in Content Library with backward-compatible lineage metadata (`originType`, `originContentId`, `originTitle`, `transformationType: 'reframe'`, `reframeIntent`, `resolvedPlan`, `sourceReferences`) without overwriting source content.
