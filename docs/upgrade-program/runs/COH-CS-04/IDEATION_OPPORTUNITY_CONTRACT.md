# COH-CS-04: Ideation Opportunity Contract

## 1. Mental Model
`Situation or Source -> Communication Opportunities -> Evidence Check -> Reuse Check -> Strong Idea -> Content Brief`

## 2. COH Communication Jobs (`COH_COMMUNICATION_JOBS`)
Every generated opportunity defines a COH-specific Communication Job answering *"Why should this content exist?"*:
- `Establish institutional credibility`
- `Explain artistic logic`
- `Create sponsor relevance`
- `Build climate literacy`
- `Invite public participation`
- `Clarify a milestone`
- `Deepen cultural meaning`

## 3. Opportunity Schema (`IdeationOpportunityProposal` / `SavedIdea`)
| Field | Visibility | Description |
| :--- | :--- | :--- |
| `title` | Primary Card | Distinct opportunity headline |
| `communicationJob` | Primary Card Badge | COH strategic purpose for the content |
| `explanation` | Primary Card | Core idea / concept summary |
| `whyItWorks` | Primary Card | Why it matters strategically for COH |
| `reuseOpportunity` | Primary Badge + Callout | Classification (`New Ground`, `Extend Existing Idea`, `Reframe Existing Content`, `Reuse Existing Argument`), confidence (`High`, `Medium`, `Low`), rationale, and direct `Inspect` link to matched library item |
| `suggestedChannel` / `suggestedFormat` / `suggestedAudience` / `suggestedPillar` | Primary Badges | Recommended COH routing metadata |
| `sourceIds` / `sourceRoles` | Primary Traceability Pills | Attached task sources and their roles |
| `strategicAngle` | Expandable Detail | Distinct framing lens |
| `coreTension` | Expandable Detail | Audience problem or cultural tension addressed |
| `desiredAudienceResponse` | Expandable Detail | Intended shift in audience perception or action |
| `availableEvidence` | Expandable Detail | Traceable facts from attached factual sources or Protected COH Kernel positioning (never from `Approved Example` or `Visual Reference` sources) |
| `evidenceStillRequired` | Expandable Detail | Advisory signal on what evidence would be needed before stronger claims could be made (never `[INSERT]` placeholder blockers) |
| `unresolvedAssumptions` | Expandable Detail | Assumptions to verify before publication |
| `possibleHook` / `possibleFirstPost` / `riskToAvoid` / `possibleNextStep` | Expandable Detail | Execution guidance |

## 4. Handoff Contract (`buildIdeationToContentHandoff`)
When promoted to Content Workspace (`Draft`), the opportunity populates `advancedBrief`, `simpleBrief`, `quickBrief`, `taskSourceRoleMap`, and `activeWorkItem.workContext` with:
- `topic`, `communicationJob` (`purpose`), `audience`, `channel`, `outputFormat`, `pillar`, `language`
- `selectedSourceIds` and restored `taskSourceRoleMap` bindings
- `availableEvidence` (into `mustInclude`) and `riskToAvoid` (into `mustAvoid`)
- `strategicAngle`, `coreTension`, `desiredAudienceResponse`, `evidenceStillRequired`, and `unresolvedAssumptions` in `customDirection` and `workContext`
