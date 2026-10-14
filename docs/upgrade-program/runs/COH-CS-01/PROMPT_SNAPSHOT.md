# PROMPT COH-CS-01
## Shared COH Context Compiler, Context Manifest and Strategic Authority Foundation

Continue on:

`feature/coh-content-intelligence-v2`

Repository:

`aryanaghili/coh-content-studio`

Before doing anything:

1. Read `docs/upgrade-program/MASTER_PROTOCOL.md`.
2. Read COH-CS-00 evidence.
3. Verify the branch.
4. Verify the working tree.
5. Verify the application builds.
6. Confirm COH-CS-00 did not end with FAIL or STOP.

If any preflight requirement fails, STOP.

This task creates the shared context foundation for later upgrades.

It must not become a broad rewrite.

---

## 1. Problem to solve

The application already contains sophisticated COH-specific strategic intelligence:

- Protected COH Kernel
- Operating Core
- Strategy Kernel
- audience profiles
- channel rules
- claims/proof boundaries
- voice/language rules
- Visual DNA
- revision standards
- Core Evidence

However, relevant context is currently compiled and repeated through more than one application path.

Different modules can maintain overlapping definitions of:

- audiences
- channels
- revision actions
- strategic context
- task context

This creates a risk of parallel truths and makes cross-studio handoffs less reliable.

We need a single reusable context-resolution layer.

We are NOT replacing Operating Core.

Operating Core remains authoritative.

---

## 2. Authority hierarchy

Preserve the existing Protected COH Kernel.

The compiler must respect this hierarchy:

1. Protected COH Kernel
2. applicable active Operating Core rules
3. applicable source/evidence context
4. inherited Work Context
5. explicit user/task instruction

If a lower-level instruction conflicts with the Protected COH Kernel, the Protected COH Kernel wins.

Do not weaken this rule.

---

## 3. Build a shared Context Compiler

Inspect existing architecture before choosing filenames or locations.

Prefer a minimal shared implementation such as:

`src/lib/contextCompiler.ts`

but follow the actual project architecture rather than blindly creating duplicate infrastructure.

The compiler should accept context such as:

- workflow/studio
- action
- audience
- channel
- format
- pillar
- language
- source bindings
- user instruction
- inherited work context
- transformation intent

It should return a purpose-built context package containing only context relevant to the active task.

Do NOT indiscriminately inject the entire Operating Core into every AI request.

The compiler must be capable of selecting applicable:

- COH Kernel
- strategic positioning
- audience guidance
- channel guidance
- claims/proof rules
- voice/language rules
- revision standards
- relevant source context
- relevant work context

The goal is:

**smallest sufficient governed context**

rather than:

**maximum possible prompt size**

---

## 4. Context provenance

Introduce a simple provenance model that distinguishes:

- `EXPLICIT`
- `INHERITED`
- `RESOLVED`
- `UNRESOLVED`

Do not introduce a database for this.

This may live in typed runtime/work-item structures and existing persistence mechanisms.

Fields should not be falsely marked resolved.

Unknown context stays unresolved.

---

## 5. Context Manifest

Create a reusable context manifest object suitable for both AI compilation and user inspection.

It should be able to summarize, when applicable:

- workflow
- active COH Kernel
- audience
- channel
- format
- pillar
- language
- sources selected
- evidence sources
- style/reference sources
- explicit inputs
- inherited inputs
- resolved inputs
- unresolved inputs
- applicable claims restrictions

Do not expose internal prompt secrets or API credentials.

---

## 6. Context Manifest UI

Create one compact, reusable, collapsible component for relevant studios.

It may be named something like:

`ContextManifestPanel`

It should fit the existing visual language.

Requirements:

- not visually dominant
- collapsed by default where appropriate
- clear hierarchy
- light/dark theme compliant
- mobile responsive
- no unnecessary animation
- no developer jargon in primary user-facing labels

Suggested user-facing framing:

`Active Context`

Possible sections:

- COH Guidance
- Audience
- Channel
- Sources
- Evidence
- Language
- Explicit
- Inherited
- Resolved
- Missing

Do not surface dozens of technical fields.

---

## 7. Wire the foundation safely

Inspect current prompt-generation paths.

Wire the shared compiler into existing AI workflows only where doing so can be done without changing their intended behavior.

Priority paths:

- Content Workspace
- Revision Studio

Ideation may adopt the compiler if the existing architecture makes that low risk.

Do not perform the full Ideation 2.0 change here.

Do not rewrite Calendar logic here.

Do not build Reframing here.

New later capabilities must use this compiler rather than creating parallel strategic prompt logic.

---

## 8. Work Context foundation

Define a lightweight reusable `WorkContext` or equivalent type capable of carrying:

- origin
- originating item ID/type
- audience
- channel
- format
- pillar
- language
- communication job
- source bindings
- evidence requirements
- transformation metadata

Do not yet redesign all handoffs.

COH-CS-07 will finish continuity.

This task should only create the stable shared representation needed by later work.

Backward compatibility is mandatory.

Existing Work Items without these fields must continue loading.

---

## 9. Do not over-clean Calendar yet

Editorial Calendar contains planning-specific logic and some duplicated channel/audience concepts.

Do NOT broadly refactor it in this task.

Document overlaps that should be reconsidered in COH-CS-07.

The distinction must remain:

- Operating Core = strategic authority
- Calendar = planning/cadence/composition logic

---

## 10. Acceptance criteria

PASS only if:

- application builds
- no database/schema changes
- existing Operating Core remains intact
- Protected Kernel remains intact
- compiler can resolve task-relevant context
- unknown values remain unresolved
- user instruction cannot override protected rules
- existing Content Workspace still generates through its intended workflow
- existing Revision workflow still operates
- existing stored items load
- Context Manifest renders without breaking UI
- light/dark work
- mobile/desktop work
- no dead/duplicate alternative context compiler has been introduced
- no production deployment occurred

Add focused unit tests for context selection, precedence and provenance.

---

## 11. Evidence

Create:

`docs/upgrade-program/runs/COH-CS-01/`

with the full evidence contract from MASTER_PROTOCOL.

Also create:

`CONTEXT_AUTHORITY_MAP.md`

showing:

- authority source
- current consumers
- new compiler relationship
- duplicated logic deliberately left for COH-CS-07

Update `MASTER_REGISTER.md`.

Mirror evidence to Drive if authenticated access exists; otherwise update Drive sync manifests.

Do not merge to main.

---
