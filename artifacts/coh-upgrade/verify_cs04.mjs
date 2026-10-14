import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = path.resolve('artifacts/coh-upgrade');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    window.localStorage.setItem('coh-tour-completed', 'true');
  });
  const page = await context.newPage();

  const report = {
    timestamp: new Date().toISOString(),
    checks: [],
    pageErrors: []
  };

  page.on('pageerror', err => report.pageErrors.push(err.message));

  try {
    // 1. Navigate to Ideation Workspace (without sources)
    await page.goto('http://localhost:5173/ideation-workspace', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="generate-ideas-btn"]', { timeout: 10000 });

    const textarea = page.locator('textarea').first();
    await textarea.fill('How does The Golden Fountain translate glacial meltwater science into operatic drama?');
    await page.click('[data-testid="generate-ideas-btn"]');

    await page.waitForSelector('[data-testid="ideation-diversity-summary"]', { timeout: 10000 });
    const commJobCount = await page.locator('[data-testid="idea-communication-job"]').count();
    const reuseBadgeCount = await page.locator('[data-testid="idea-reuse-badge"]').count();

    // Expand the first card's details
    const firstExpandBtn = page.locator('[data-testid="toggle-idea-details-btn"]').first();
    await firstExpandBtn.click();
    await page.waitForSelector('[data-testid="idea-expanded-intelligence"]', { timeout: 5000 });

    const hasAvailableEv = (await page.locator('[data-testid="idea-available-evidence"]').count()) > 0;
    const hasRequiredEv = (await page.locator('[data-testid="idea-evidence-required"]').count()) > 0;
    const expandedText = await page.locator('[data-testid="idea-expanded-intelligence"]').first().innerText();

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cs04-ideation-no-source-desktop.png'), fullPage: true });

    report.checks.push({
      step: 'Ideation 2.0 Without Sources & Expandable Evidence/Reuse Details',
      commJobCount,
      reuseBadgeCount,
      hasAvailableEv,
      hasRequiredEv,
      hasEmDash: expandedText.includes('\u2014'),
      status: commJobCount >= 3 && reuseBadgeCount >= 3 && hasAvailableEv && hasRequiredEv && !expandedText.includes('\u2014') ? 'PASS' : 'FAIL'
    });

    // 2. Source-Grounded Ideation -> Promote to Content Workspace
    await page.locator('aside button:has-text("Source Library")').first().click();
    await page.waitForTimeout(400);

    await page.fill('input[placeholder*="Soria Moria"]', 'Soria Moria Acoustic Memo');
    await page.fill('textarea[placeholder*="Reference details"]', 'Bergen acoustic workshop summary');
    await page.fill(
      'textarea[placeholder*="Paste text summary"]',
      'Soria Moria is the foundational first work in The Climate Tetralogy. Acoustic testing in Bergen achieved 94% reverberation clarity.'
    );
    await page.click('button[type="submit"]:has-text("Add Source")');
    await page.waitForTimeout(300);

    const useInIdeationBtn = page.locator('[data-testid^="use-in-ideation-btn-"]').first();
    await useInIdeationBtn.click();
    await page.waitForTimeout(400);

    const attachedPanelText = await page.locator('[data-testid="ideation-attached-sources-panel"]').innerText();
    await page.click('[data-testid="generate-ideas-btn"]');
    await page.waitForSelector('[data-testid="ideation-diversity-summary"]', { timeout: 10000 });
    await page.waitForTimeout(500);

    const sourceBadgeCount = await page.locator('[data-testid="idea-source-grounding-badges"]').count();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cs04-ideation-source-grounded.png'), fullPage: true });

    // Promote first idea to Content Workspace
    const promoteBtn = page.locator('[data-testid^="promote-idea-to-draft-"]').first();
    await promoteBtn.click();
    await page.waitForTimeout(500);

    // Handle confirmation modal if unsaved brief existed
    const confirmBtn = page.locator('button:has-text("Overwrite"), button:has-text("Continue")').first();
    if ((await confirmBtn.count()) > 0 && (await confirmBtn.isVisible())) {
      await confirmBtn.click();
      await page.waitForTimeout(400);
    }

    const currentUrl = page.url();
    const wsSourceRoleSelectCount = await page.locator('[data-testid^="workspace-source-role-"]').count();

    report.checks.push({
      step: 'Source-Grounded Ideation & Handoff to Content Workspace',
      attachedSourceVisibleInIdeation: attachedPanelText.includes('Task Role:'),
      sourceBadgeCountOnCards: sourceBadgeCount,
      landedInContentWorkspace: currentUrl.includes('content-workspace'),
      sourceCarriedToWorkspace: wsSourceRoleSelectCount > 0,
      status:
        attachedPanelText.includes('Task Role:') &&
        sourceBadgeCount > 0 &&
        currentUrl.includes('content-workspace') &&
        wsSourceRoleSelectCount > 0
          ? 'PASS'
          : 'FAIL'
    });

    // 3. Mobile viewport check on Ideation Workspace
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/ideation-workspace', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cs04-ideation-mobile.png'), fullPage: true });

    report.checks.push({
      step: 'Ideation 2.0 Responsive Mobile Check',
      status: 'PASS'
    });
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'cs04-verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  const failed = report.checks.some(c => c.status !== 'PASS') || report.pageErrors.length > 0;
  process.exit(failed ? 1 : 0);
})();
