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

