# PROMPT COH-CS-03
## Upgrade Source Library into Source Intelligence and Build a Task-Level Source Context System

Continue on:

`feature/coh-content-intelligence-v2`

Preflight using MASTER_PROTOCOL and all predecessor evidence.

Do not proceed if the baseline build is broken or a predecessor has FAIL/STOP status.

This task upgrades how existing sources are understood and used.

It must NOT create a database, vector database, embedding store, chunk table or new persistence service.

---

## 1. Product objective

Today the Source Library can store useful project material and selected sources can inform content work.

The upgrade should close the gap between:

`This document exists`

and:

`This is exactly how this source should be used for this particular piece of work.`

We need:

1. source-level intelligence
2. task-level source roles
3. optional excerpt selection
4. direct source-to-studio actions
5. better grounding in Ideation and Creation
6. strict evidence/interpretation boundaries

Raw source content must remain untouched.

---

## 2. Preserve existing source architecture

Inspect the current Source Library implementation and SourceFile model before changing it.

Preserve existing source types such as:

- Event Notes
- Partner Profile
- Sponsor Notes
- Meeting Notes
- Campaign Notes
- Article / Media Coverage
- Website Reference
- Visual Reference
- Approved Example
- Pasted Notes
- Link / URL
- Other

Preserve existing source statuses and selection behavior unless a precise change is necessary.

Do not silently convert existing source records.

---

## 3. Add Source Intelligence as derived data

Add an explicit action:

`Analyze Source`

Analysis must create a derived AI interpretation, never rewrite the source.

Use the shared Context Compiler where applicable.

A useful analysis contract should contain only meaningful fields such as:

- Key Facts
- Supported Claims
- Strategic Context
- Cautions / Ambiguities
- Useful Excerpts
- Relevant COH Audiences
- Relevant Channels
- Relevant Content Pillars
- Content Opportunity Hints

Do not add twenty unnecessary taxonomy fields.

The analysis must visibly state that it is:

`AI interpretation of the source, not the source itself.`

---

## 4. Persistence without database changes

Do not modify a database schema.

Prefer a separate backward-compatible namespaced persistence layer for derived analyses, for example a new versioned localStorage key or the closest existing non-database storage mechanism.

Do not mutate raw source content to store analysis.

Requirements:

- old sources continue loading
- source deletion safely removes or orphans derived analysis without breaking the app
- corrupted derived analysis must not prevent the raw source from opening
- derived analysis can be regenerated
- version the local storage key/shape

Document the exact persistence decision.

---

## 5. Task-level source roles

When a source is attached to an active task/brief, allow it to have a role:

- Evidence
- Strategic Context
- Approved Example
- Quote / Language Source
- Visual Reference
- Must-use Material

These roles belong to the active task context.

They are not permanent universal truths about the source.

A source can serve different roles in different tasks.

Use the Context Compiler and Work Context foundation created in COH-CS-01.

---

## 6. Optional excerpt selection

Allow a user to use specific excerpts from a source rather than always passing the full source.

Requirements:

- show useful excerpts when Source Intelligence has identified them
- allow manual selection if technically reasonable
- preserve exact excerpt text
- maintain source association
- clearly distinguish source text from AI interpretation
- do not fabricate quotes

If no excerpt is selected, use bounded source grounding according to safe context limits.

Inspect existing prompt/context limits first.

Do not arbitrarily truncate crucial evidence without warning.

---

## 7. Source grounding rules

Build a deterministic source-context builder.

It should compile source material according to source role.

Examples:

### Evidence
May support factual statements, subject to claim rules.

### Strategic Context
May inform reasoning but should not automatically become a factual claim.

### Approved Example
May guide tone/structure but facts from the example must not leak into new work unless separately grounded.

### Quote / Language Source
Exact quoted language should be preserved and attributed internally to the source.

### Visual Reference
Should influence Visual Direction, not factual copy.

### Must-use Material
Must be considered in the task, but still cannot override claim safety or Protected Kernel rules.

Do not allow source roles to bypass COH governance.

---

## 8. Direct source actions

Improve productivity from the Source Library.

Where logically available, support actions such as:

- Use in Ideation
- Create Content
- Add to Current Brief
- Analyze Source
- Use as Visual Reference

Prepare the architecture for:

- Use in Reframing

but do not create a dead/broken link before COH-CS-05 implements Reframing.

After COH-CS-05 exists, COH-CS-07 may finalize all direct handoffs.

---

## 9. Source detail UX

Do not redesign the entire Source Library.

Add a clear intelligence/context layer while preserving the current visual design system.

Source detail should make it easy to understand:

- raw/source content
- source metadata
- derived intelligence
- how the source can be used
- whether it is selected in current work

Requirements:

- light theme
- dark theme
- desktop
- mobile
- useful empty state
- useful analysis-loading state
- safe AI-error state
- regenerate-analysis action
- raw content remains accessible

---

## 10. Claim discipline

Source Intelligence must never convert ambiguity into confirmed fact.

For analysis:

- unsupported inference must be flagged as interpretation
- missing evidence remains missing
- aspiration remains aspiration
- names/dates/numbers must be traceable to source text before being treated as factual evidence
- approved examples do not automatically become factual sources

Integrate with existing claims/proof safeguards.

---

## 11. Context limits

Inspect actual model/context flow.

Implement clear bounded source grounding so that one very large source cannot silently crowd out:

- Protected Kernel
- Operating Core
- user instruction
- other selected evidence

Prefer explicit prioritization by role and selected excerpt.

Document the final strategy.

Do not introduce embeddings/vector search in this task.

---

## 12. Acceptance criteria

PASS only if:

- existing sources load unchanged
- source analysis is derived, not destructive
- analysis can fail without breaking source access
- source roles are task-specific
- source roles influence compiled context correctly
- exact excerpts remain exact
- Approved Example facts do not leak as evidence
- Visual Reference does not become factual copy
- Evidence sources remain subject to claim safety
- direct Source → Ideation works
- direct Source → Content works
- Content Workspace can see attached source roles
- no database/schema changes
- no production-data changes
- no dead Reframing links
- build/tests pass
- UI works in both themes and responsive layouts

---

## 13. Evidence

Create:

`docs/upgrade-program/runs/COH-CS-03/`

Include standard evidence plus:

- `SOURCE_CONTEXT_CONTRACT.md`
- `SOURCE_INTELLIGENCE_SCHEMA.md`
- `SOURCE_GROUNDING_TEST_MATRIX.md`

Update MASTER_REGISTER and Drive archive/sync material.

Do not merge to main.
