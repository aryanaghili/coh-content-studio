<USER_REQUEST>
# PROMPT COH-CS-00
## Program Bootstrap, Baseline, Evidence Governance and Safe Implementation Environment

You are working on the existing Climate Opera Haus Content Studio repository:

`aryanaghili/coh-content-studio`

Production application:
`https://coh-content-engine.vercel.app`

This is the bootstrap task for a controlled multi-stage upgrade program.

Do not implement product features in this task.

Your job is to establish a safe implementation environment, baseline the existing application, create the evidence protocol for all subsequent work, and prepare a dedicated branch on which all later COH-CS prompts will operate.

---

## 1. Non-negotiable operating principles

This program must improve the existing application without destabilizing it.

The following are global restrictions for COH-CS-00 and every subsequent COH-CS task:

- Do not modify the production database.
- Do not introduce a new database.
- Do not add a database schema migration.
- Do not change existing database tables or persistence architecture.
- Do not destructively migrate or rewrite localStorage data.
- Do not delete, rewrite or normalize existing user content merely to support new features.
- Do not mutate production data.
- Do not alter Vercel production environment variables.
- Do not deploy directly to production.
- Do not merge to `main`.
- Do not change the COH Protected Kernel.
- Do not weaken the existing claim-safety rules.
- Do not replace COH-specific audiences, channels, pillars or strategic logic with Turbocharger concepts.
- Do not add post-publication analytics, publication records, performance snapshots, adaptive publication intelligence, CRM logic or other Turbocharger post-publication architecture.
- Do not redesign unrelated screens.
- Do not perform broad cleanup or refactoring merely because code could be cleaner.
- Do not introduce a large dependency when an existing capability can solve the problem.
- Never expose API keys, environment secrets, credentials or tokens in evidence.
- No em dashes in user-facing product copy introduced by this program.

The governing principle is:

**Improve only what is necessary, preserve what already works, and make every material change independently auditable.**

---

## 2. Establish the implementation branch

Inspect the repository before changing anything.

Confirm:

- repository
- current default branch
- current HEAD commit
- working tree status
- Node/package manager setup
- existing test commands
- existing Vercel configuration
- current persistence mechanisms
- whether there are any uncommitted changes

Create or use this branch:

`feature/coh-content-intelligence-v2`

The branch must start from the current `main` HEAD unless it already exists and is demonstrably the correct branch for this program.

Do not overwrite or force-reset an existing branch without first proving it belongs to this exact program.

If the repository or branch state is ambiguous, STOP and report the problem.

---

## 3. Baseline the existing application

Before feature work starts, inspect the actual implementation and produce a concise architectural baseline.

At minimum inspect:

- `src/App.tsx`
- `src/components/EditorialCalendarStudio.tsx`
- `src/components/RevisionStudio.tsx`
- `src/components/OperatingCoreAdmin.tsx`
- `src/components/TopBar.tsx`
- `src/components/CalendarLibrary.tsx`
- `src/lib/operatingCore.ts`
- `src/lib/revisionActions.ts`
- `src/lib/storage.ts`
- `src/utils/calendarHandoffUtils.ts`
- `server/ai/providerManager.js`
- `server/ai/promptBuilder.js`
- `server/ai/qualityGate.js`
- all current AI provider adapters
- all existing tests that exercise Ideation, Content Workspace, Calendar, Revision, Visual Studio, Source Library and Operating Core

Do not assume the above list is exhaustive. Follow actual imports and execution paths.

Document:

1. current navigation/modules
2. current source storage and source-selection logic
3. current Work Item structure
4. current Operating Core compilation path
5. current AI generation path
6. current Revision path
7. current Visual Direction handoff
8. current Calendar handoff
9. current persistence boundaries
10. duplicated strategic/action definitions that may matter later
11. current model/provider architecture
12. current known implementation risks

Do not change behavior during this mapping.

---

## 4. Establish the upgrade evidence structure

Create a lightweight committed evidence structure under:

`docs/upgrade-program/`

Use this structure:

```text
docs/upgrade-program/
  MASTER_PROTOCOL.md
  MASTER_REGISTER.md
  BASELINE_ARCHITECTURE.md
  BASELINE_VALIDATION.md
  runs/
    COH-CS-00/
      PROMPT_SNAPSHOT.md
      IMPLEMENTATION_REPORT.md
      CHANGE_MANIFEST.md
      VALIDATION_REPORT.md
      RUN_MANIFEST.json
```

Subsequent runs will create their own `COH-CS-XX` folders.

Do not commit large screenshot collections, raw logs, temporary JSON dumps or debugging artifacts into the application repository.

Create or use an ignored artifacts area:

`artifacts/coh-upgrade/`

Ensure it is excluded from Git if needed without disturbing existing legitimate artifacts.

This area may contain:

- screenshots
- Playwright traces
- raw logs
- browser captures
- temporary comparison output
- Drive-staging copies

Committed Markdown/JSON evidence should remain concise.

---

## 5. Define MASTER_PROTOCOL.md

`MASTER_PROTOCOL.md` must record the non-negotiable rules above and additionally define:

### Sequential execution
Prompts run in this order:

- COH-CS-00 Bootstrap
- COH-CS-01 Context Foundation
- COH-CS-02 AI Provider Modernization
- COH-CS-03 Source Intelligence
- COH-CS-04 Ideation 2.0
- COH-CS-05 Reframing Studio
- COH-CS-06 Creation + Revision Productivity
- COH-CS-07 Workflow Continuity + Governance Cleanup
- COH-CS-08 Integrated Validation

No later task may bypass or independently reimplement an architecture created by an earlier task.

### Preflight requirement
Every run must verify:

- correct repository
- correct feature branch
- previous task evidence exists
- application builds before the new change begins
- no unexpected working-tree changes
- no previous task has status FAIL or STOP

### Self-audit requirement
Every run must inspect its own diff before completion.

### Stop conditions
Stop rather than improvise if the requested change would require:

- a database migration
- destructive persistence changes
- rewriting production records
- a new architectural subsystem outside approved scope
- bypassing the Protected COH Kernel
- replacing the existing Operating Core
- changing production Vercel configuration
- breaking a predecessor capability to make a new capability work

---

## 6. Define the evidence contract

Every subsequent run must create:

### `PROMPT_SNAPSHOT.md`
Exact prompt/task instruction used for that run.

### `IMPLEMENTATION_REPORT.md`
Must include:
- objective
- architecture inspected
- implementation approach
- behavior changed
- behavior deliberately preserved
- files materially changed
- decisions made
- deviations, if any
- known limitations
- risks

### `CHANGE_MANIFEST.md`
Must explicitly state:
- files created
- files modified
- files deleted
- dependencies added/removed
- environment variables added/changed
- persistence changes
- database changes
- schema changes
- production-data changes

For this program, database/schema/production-data change should normally be:

`NONE`

### `VALIDATION_REPORT.md`
Must include:
- build result
- tests executed
- acceptance criteria
- regression journeys tested
- UI checks when applicable
- failures
- warnings
- unresolved issues

### `RUN_MANIFEST.json`
Use a stable machine-readable structure including:

```json
{
  "id": "COH-CS-XX",
  "title": "",
  "status": "PASS | PASS_WITH_WARNINGS | FAIL | STOP",
  "baseCommit": "",
  "implementationCommit": "",
  "branch": "feature/coh-content-intelligence-v2",
  "databaseChanged": false,
  "schemaChanged": false,
  "productionDataChanged": false,
  "dependenciesChanged": false,
  "filesCreated": [],
  "filesModified": [],
  "filesDeleted": [],
  "testsPassed": [],
  "testsFailed": [],
  "warnings": [],
  "knownIssues": []
}
```

If an implementation commit is created before evidence is finalized, it is acceptable to make a second small documentation-only evidence commit.

Do not falsify a commit SHA that cannot yet be known.

---

## 7. Google Drive archive protocol

The project audit archive should conceptually mirror:

```text
COH Content Studio - Upgrade Program/
  00 - Master Protocol/
  01 - Baseline/
  02 - Implementation Prompts/
  03 - Run Evidence/
      COH-CS-00/
      COH-CS-01/
      ...
  04 - Review Reports/
  05 - Corrective Actions/
  06 - Final Validation/
```

If Antigravity already has authenticated access to Google Drive, create or use that structure and mirror the evidence there after each run.

Important:

- Never request Drive credentials in chat.
- Never print tokens.
- Never place source-code secrets in Drive.
- Do not upload `.env` files.
- Do not upload API keys.
- Do not block implementation if Drive access is unavailable.

If authenticated Google Drive access is unavailable, create:

`docs/upgrade-program/DRIVE_SYNC_MANIFEST.json`

and:

`docs/upgrade-program/DRIVE_SYNC_REQUIRED.md`

The manifest must identify exactly what should later be mirrored to each Drive folder.

Also create:

`artifacts/coh-upgrade/drive-staging/`

for optional non-committed screenshots/logs that belong in the Drive audit archive.

The lack of direct Google Drive access is NOT a reason to fail the product work.

Git remains the technical source of truth.

---

## 8. Baseline validation

Run the safest currently available baseline tests.

At minimum verify, where technically possible:

- production build
- application startup
- Content Workspace loads
- Ideation Workspace loads
- Editorial Calendar loads
- Revision Studio loads
- Visual Studio loads
- Source Library loads
- Content Library loads
- Operating Core loads
- Settings loads
- light theme
- dark theme
- desktop viewport
- mobile viewport
- no obvious console-breaking errors

Do not manufacture test data in production.

Use local or preview-safe data only.

Record the baseline clearly so later regressions can be distinguished from pre-existing defects.

---

## 9. MASTER_REGISTER.md

Create a table containing all planned run IDs with fields:

- ID
- capability
- implementation status
- implementation commit
- validation status
- review status
- final status

Initialize COH-CS-01 through COH-CS-08 as `NOT STARTED`.

---

## 10. Completion

Commit only the bootstrap/evidence infrastructure and any strictly necessary test/documentation setup.

Do not implement Context Compiler, Source Intelligence, Reframing or provider changes yet.

Final response must state only:

- branch
- baseline status
- evidence location
- Drive-sync status
- implementation commit(s)
- whether COH-CS-01 is safe to run

If COH-CS-01 is not safe to run, clearly return:

`STOP CONDITION`

and explain the exact blocker.

---

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

# PROMPT COH-CS-02
## Modernize the OpenAI Provider for GPT-6 Luna and GPT-6.1 Sol Without Breaking Existing Providers

Continue on:

`feature/coh-content-intelligence-v2`

Preflight:

- read MASTER_PROTOCOL
- read COH-CS-00 and COH-CS-01 evidence
- verify branch
- verify clean/expected worktree
- build the app
- stop if predecessor status is FAIL or STOP

This task modernizes the OpenAI integration.

Do not modify unrelated product functionality.

---

## 1. Current problem

The existing OpenAI adapter was built around older GPT-4-era assumptions.

Known areas that require inspection include:

- `server/ai/providerManager.js`
- `server/ai/adapters/openaiAdapter.js`
- Settings model selection
- test-connection logic
- JSON/structured-output handling
- image-model handling

The existing implementation must be inspected rather than blindly replaced.

Current behavior includes legacy assumptions such as model-name-prefix checks and general request parameters.

Those assumptions must not simply be extended with another hardcoded prefix.

---

## 2. Required models

Add first-class support for the current OpenAI text models:

- `gpt-6-luna`
- `gpt-6.1-sol`

Use the exact current model IDs supported by the official OpenAI API at implementation time.

Before coding, verify relevant current OpenAI API documentation.

Do not infer API parameters from older GPT-4 behavior.

If official documentation has changed since this prompt was written, prefer the current official contract and document the deviation.

---

## 3. Intended product positioning

User-facing choices should remain simple.

At minimum expose:

### GPT-6 Luna
Label:
`Efficient`

Description concept:
Recommended for most routine Content Studio work and cost-efficient generation.

### GPT-6.1 Sol
Label:
`Advanced`

Description concept:
Stronger reasoning for difficult strategic or transformation work.

Do not add automatic model routing yet.

The user should choose deliberately.

Automatic routing may be evaluated later after actual COH benchmark evidence exists.

---

## 4. Default behavior

Do not silently override an explicitly configured model.

Rules:

- if `OPENAI_MODEL` is explicitly configured, preserve it
- if a saved/session model exists, preserve it
- if no OpenAI text model has been configured, prefer `gpt-6-luna` as the default OpenAI text model

Existing legacy models may remain available where technically supported.

Do not delete working legacy support merely to simplify the UI.

---

## 5. Capability-based OpenAI adapter

Refactor only as much as needed to stop relying on fragile model-name-era assumptions.

Build a small capability-based request layer.

It must safely handle differences such as:

- endpoint/request style
- structured output
- reasoning parameters
- temperature or other sampling controls
- token/output limits
- returned text extraction
- errors
- retries

Use official current OpenAI API behavior.

For direct OpenAI GPT-6 models, use the current recommended API path where appropriate.

If current OpenAI guidance recommends Responses API for these models, implement that cleanly.

Preserve a safe legacy path where needed for models/providers that still use Chat Completions.

Do not force OpenRouter or other OpenAI-compatible providers through an OpenAI-specific request contract they do not support.

---

## 6. Structured output

Content Studio depends on reliable structured JSON for several generation paths.

The upgraded adapter must:

- request structured output using supported current mechanisms
- parse returned content correctly
- retain existing repair/fallback protections where useful
- not rely on `model.startsWith("gpt-4")`
- produce meaningful provider errors
- fail safely rather than returning corrupted content

Do not weaken quality gates.

---

## 7. Reasoning/sampling compatibility

Do not blindly send `temperature: 0.8` or other parameters to every modern model.

Use a capability-aware request builder.

Only send parameters supported by the selected model/API path.

Do not invent model-specific restrictions.

Ground them in current official documentation or actual provider response behavior.

---

## 8. Preserve every other provider

Regression-test:

- OpenAI
- Gemini
- Anthropic
- Mistral
- OpenRouter/OpenAI-compatible

Do not make OpenAI modernization break existing adapters.

Provider configuration and API keys must remain:

- masked
- never persisted insecurely
- never printed in logs
- never written into evidence

---

## 9. Preserve image generation

Do not broadly redesign Visual Studio or image generation in this task.

Confirm existing image models continue functioning through their current paths.

Text-model modernization must not break:

- image prompt compilation
- existing GPT Image behavior
- existing DALL-E fallback behavior where still supported

Only change image code when technically required for compatibility.

---

## 10. Settings UX

Improve model selection only enough to make choices understandable.

Settings should clearly distinguish:

- provider
- text model
- image model

For OpenAI text models show Luna and Sol in a clean hierarchy.

Do not turn Settings into a model engineering dashboard.

Preserve Test Connection.

Test Connection must report:

- provider
- selected model
- connection success/failure
- latency if already supported

No secrets.

---

## 11. COH benchmark smoke test

Create a small reusable test fixture representing several COH tasks without production data:

- routine source summarization
- short LinkedIn draft
- institutional content draft
- translation/localization request
- structured brief resolution
- difficult reframing-like instruction

Do not build Reframing Studio yet.

Where API credentials are available safely, run the smallest practical live verification for Luna and Sol.

Avoid unnecessary token spend.

Where credentials are unavailable, use contract/mocked tests and mark live verification as NOT RUN rather than PASS.

---

## 12. Acceptance criteria

PASS only if:

- build passes
- `gpt-6-luna` is selectable
- `gpt-6.1-sol` is selectable
- existing explicit model config is preserved
- Luna becomes the fallback only when no explicit OpenAI text model exists
- structured output works through the current architecture
- unsupported parameters are not blindly sent
- provider failures are user-understandable
- API keys remain protected
- other providers are not broken
- image generation path remains intact
- no database/schema changes
- no production Vercel changes
- no production deployment

---

## 13. Evidence

Create:

`docs/upgrade-program/runs/COH-CS-02/`

Include standard evidence plus:

`OPENAI_CAPABILITY_MATRIX.md`

Document:

- each supported OpenAI text model
- endpoint/path used
- structured-output mechanism
- optional parameters
- fallback behavior
- live-test status

Do not include secrets.

Update MASTER_REGISTER and Drive archive/sync manifests.

Do not merge to main.

---

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
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-14T11:46:07+01:00.
</ADDITIONAL_METADATA>
