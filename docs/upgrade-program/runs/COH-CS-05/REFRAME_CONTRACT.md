# REFRAME CONTRACT (COH-CS-05)

## 1. Domain Model & Input Origins

`ReframingStudio` (`src/components/ReframingStudio.tsx`) and `reframingEngine` (`src/lib/reframingEngine.ts`) govern strategic content reframing across five supported origins (`ReframeOriginType`):

- `manual`: Pasted or typed directly in Reframing Studio
- `content-library`: Loaded from Content Library via the `Reframe` card action or studio selector
- `content-workspace`: Sent from Content Workspace draft output
- `revision-studio`: Sent from Revision Studio output
- `source-library`: Sent from Source Library contextual handoff

Source content is never overwritten automatically.

---

## 2. Intent Resolution (`ResolvedReframePlan`)

Before generating a reframe, `resolveReframeIntent(input, sources)` inspects the user's natural-language instruction (`"What should this become?"`) alongside origin metadata and attached sources to produce an editable plan:

| Field | Purpose |
|---|---|
| `recommendedRoute` | `'REFRAME'` or `'REVISION'` |
| `routeReason` | Explanation of why the request belongs in Reframing Studio or Revision Studio |
| `targetAudience` | Resolved COH audience (e.g. Cultural Institutions & Museums, Sponsors & CSR Partners, General Public & Communities, Educators & Schools, Media & Press) |
| `audienceFamiliarity` | `'low'` (needs foundational COH orientation), `'medium'`, or `'high'` |
| `communicationPurpose` | Why the reframed piece should exist |
| `targetChannel` | Target COH channel (LinkedIn, Instagram, Newsletter, Website / Blog, Press Release, Partner Brief) |
| `targetFormat` | Target structural format |
| `strategicFrame` | Strategic positioning angle |
| `contentPillarEmphasis` | Primary COH pillar emphasis |
| `narrativePerspective` | Institutional, public/invitational, curatorial, or educational voice |
| `evidenceEmphasis` | How available source evidence should be foregrounded |
| `desiredAudienceResponse` | Intended audience takeaway or action |
| `protectedElements` | Checked constraints (`Confirmed facts and figures`, `Names, titles, and institutions`, `Dates and milestones`, `Direct quotations (verbatim)`, `Approved COH terminology`, `Central artistic meaning`, `Source-backed claims only`) |
| `unresolvedItems` | Missing evidence or unverified claim warnings |

---

## 3. Protected Elements & Claim Discipline

1. **Protected COH Kernel**: Compiled via `compileContext({ studio: 'reframing', ... })` so all reframes obey COH identity, tone, and claim-safety rules.
2. **Verbatim Quotation Enforcement**: `extractExactQuotations` and `finalizeReframeResult` verify that any double-quoted text in the source remains verbatim when `Direct quotations (verbatim)` is enabled.
3. **No Fabricated Proof**: When the user asks for metrics, impact numbers, or confirmed partnerships not present in the source or attached Source Intelligence, `unresolvedItems` and `evidenceWarnings` flag the gap explicitly rather than inventing statistics.

---

## 4. Transformation Explanation & Lineage Metadata

Every generated `ReframeProposalResult` includes:
- `proposedContent`: The reframed text
- `changedExplanation`: Concrete list of material shifts (audience framing, familiarity scaffolding, channel/format structure, strategic emphasis)
- `preservedExplanation`: Concrete list of protected elements held constant (confirmed facts, verbatim quotes, COH kernel positioning)
- `evidenceWarnings`: Advisory alerts for any unsupported proof requests

When saved via **Save as New Version in Content Library**, `buildReframeLineageMetadata` attaches `metadata.reframeLineage` to the new `SavedContent` item without mutating the origin item.
