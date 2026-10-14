# PROMPT COH-CS-13 — Post-Remediation Integrated Re-Audit

- **Task ID**: `COH-CS-13`
- **Repository**: `aryanaghili/coh-content-studio`
- **Branch**: `feature/coh-content-intelligence-v2`
- **Scope**:
  1. Verify sequential remediation commits (`COH-CS-10`, `COH-CS-11`, `COH-CS-12`).
  2. Re-run complete production build, unit/integration suite, remediation suites, and Playwright journeys.
  3. Explicitly re-audit all independent-review failure domains:
     - Strategic authority
     - Evidence integrity
     - Quality gates
     - Reframing integrity
     - Translation safety
  4. Produce `POST_REMEDIATION_AUDIT_REPORT.md`, `POST_REMEDIATION_REGRESSION_MATRIX.md`, and standard run files in `docs/upgrade-program/runs/COH-CS-13/`.
  5. Update `docs/upgrade-program/MASTER_REGISTER.md` and push `feature/coh-content-intelligence-v2` to `origin`.
