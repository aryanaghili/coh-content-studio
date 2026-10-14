# Climate Opera Haus Content Studio: Upgrade Program Master Protocol

**Repository:** `aryanaghili/coh-content-studio`
**Production Application:** `https://coh-content-engine.vercel.app`
**Implementation Branch:** `feature/coh-content-intelligence-v2`
**Governing Principle:** Improve only what is necessary, preserve what already works, and make every material change independently auditable.

---

## 1. Non-Negotiable Operating Principles

The following global restrictions apply to `COH-CS-00` and every subsequent `COH-CS` task:

- **Database & Persistence Integrity:**
  - Do not modify the production database.
  - Do not introduce a new database.
  - Do not add a database schema migration.
  - Do not change existing database tables or persistence architecture.
  - Do not destructively migrate or rewrite `localStorage` data.
  - Do not delete, rewrite, or normalize existing user content merely to support new features.
  - Do not mutate production data.
- **Deployment & Branch Safety:**
  - Do not alter Vercel production environment variables.
  - Do not deploy directly to production.
  - Do not merge to `main`.
- **Strategic & Product Governance:**
  - Do not change the COH Protected Kernel (`PROTECTED_COH_KERNEL`).
  - Do not weaken the existing claim-safety rules.
  - Do not replace COH-specific audiences, channels, pillars, or strategic logic with Turbocharger concepts.
  - Do not add post-publication analytics, publication records, performance snapshots, adaptive publication intelligence, CRM logic, or other Turbocharger post-publication architecture.
- **Scope & Code Discipline:**
  - Do not redesign unrelated screens.
  - Do not perform broad cleanup or refactoring merely because code could be cleaner.
  - Do not introduce a large dependency when an existing capability can solve the problem.
  - Never expose API keys, environment secrets, credentials, or tokens in evidence or logs.
  - Do not use em dashes in user-facing product copy introduced by this program.

---

## 2. Sequential Execution Order

All tasks in the upgrade program execute in strict sequential order on `feature/coh-content-intelligence-v2`:

1. `COH-CS-00` - Bootstrap, Baseline, Evidence Governance, and Safe Implementation Environment
2. `COH-CS-01` - Context Foundation (Shared COH Context Compiler, Context Manifest, and Strategic Authority Foundation)
3. `COH-CS-02` - AI Provider Modernization (OpenAI GPT-6 Luna and GPT-6.1 Sol Capability Layer)
4. `COH-CS-03` - Source Intelligence and Task-Level Source Context System
5. `COH-CS-04` - Ideation 2.0
6. `COH-CS-05` - Reframing Studio
7. `COH-CS-06` - Creation + Revision Productivity
8. `COH-CS-07` - Workflow Continuity + Governance Cleanup
9. `COH-CS-08` - Integrated Validation

No later task may bypass or independently reimplement an architecture created by an earlier task.

---

## 3. Preflight Requirement

Before starting any `COH-CS-XX` run, the execution environment must verify:

1. **Correct Repository:** `aryanaghili/coh-content-studio`
2. **Correct Feature Branch:** `feature/coh-content-intelligence-v2`
3. **Previous Task Evidence Exists:** All required files in `docs/upgrade-program/runs/COH-CS-<prev>/` exist and are complete.
4. **Application Builds:** `npm run build` (`tsc -b && vite build`) passes cleanly before the new change begins.
5. **Working Tree Verification:** No unexpected or conflicting working-tree changes exist.
6. **Predecessor Status Check:** No previous task has status `FAIL` or `STOP` in `MASTER_REGISTER.md` or its `RUN_MANIFEST.json`.

---

## 4. Self-Audit Requirement

Every run must inspect its own git diff (`git status`, `git diff`) and verify all acceptance criteria before recording completion and committing.

---

## 5. Stop Conditions

Execution must immediately **STOP** rather than improvise if a requested change would require:

- A database migration
- Destructive persistence changes
- Rewriting production records
- A new architectural subsystem outside approved scope
- Bypassing the Protected COH Kernel
- Replacing the existing Operating Core
- Changing production Vercel configuration
- Breaking a predecessor capability to make a new capability work

---

## 6. Evidence Contract

Every run `COH-CS-XX` must produce a committed evidence package under `docs/upgrade-program/runs/COH-CS-XX/` containing:

1. `PROMPT_SNAPSHOT.md` - Exact prompt/task instruction used for that run.
2. `IMPLEMENTATION_REPORT.md` - Objective, architecture inspected, implementation approach, behavior changed, behavior deliberately preserved, files materially changed, decisions made, deviations (if any), known limitations, and risks.
3. `CHANGE_MANIFEST.md` - Explicit record of files created, modified, deleted, dependencies added/removed, environment variables added/changed, persistence changes, database changes (`NONE`), schema changes (`NONE`), and production-data changes (`NONE`).
4. `VALIDATION_REPORT.md` - Build result, tests executed, acceptance criteria verification, regression journeys tested, UI checks (light/dark, desktop/mobile), failures, warnings, and unresolved issues.
5. `RUN_MANIFEST.json` - Machine-readable manifest recording run status, base commit, implementation commit, changed files, test results, warnings, and safety flags.

Non-committed raw logs, screenshots, traces, and staging bundles belong exclusively in the git-ignored `artifacts/coh-upgrade/` directory.
