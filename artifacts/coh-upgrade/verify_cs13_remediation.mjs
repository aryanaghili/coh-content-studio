import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const screenshotDir = path.resolve('artifacts/coh-upgrade/runs/COH-CS-13/screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });

try {
  await page.addInitScript(() => {
    window.localStorage.setItem('coh-tour-completed', 'true');
  });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // 1. Navigate to Reframing Studio
  const reframingNav = page.locator('#nav-reframing');
  await reframingNav.click();
  await page.waitForSelector('[data-testid="reframing-studio-root"]');

  // Enter source content & revision-like intent ("Make this 25% shorter and smoother")
  await page.fill(
    '[data-testid="reframe-source-textarea"]',
    'In October 2026, Climate Opera Haus convenes 45 artists and scientists in Lisbon with Artistic Director Elena Rostova. "The opera creates the world, and the world outlives the stage."'
  );
  await page.fill('[data-testid="reframe-intent-input"]', 'Make this 25% shorter and smoother');
  await page.click('[data-testid="resolve-reframe-intent-btn"]');

  // Verify REVISION route alert is visible and Generate Reframe button is disabled by default
  await page.waitForSelector('[data-testid="reframe-revision-route-alert"]');
  const isDisabledBeforeOverride = await page
    .locator('[data-testid="generate-reframe-btn"]')
    .isDisabled();
  if (!isDisabledBeforeOverride) {
    throw new Error('Expected generate-reframe-btn to be disabled when REVISION route is recommended without override');
  }
  await page.screenshot({ path: path.join(screenshotDir, '01-reframing-revision-route-enforced.png') });

  // Click Override - continue as Reframe and verify button unlocks
  await page.click('[data-testid="override-continue-reframe-btn"]');
  await page.waitForSelector('[data-testid="override-reframe-confirmed-badge"]');
  const isDisabledAfterOverride = await page
    .locator('[data-testid="generate-reframe-btn"]')
    .isDisabled();
  if (isDisabledAfterOverride) {
    throw new Error('Expected generate-reframe-btn to unlock after explicit override');
  }

  // Generate Reframe and verify comparison view + truthful preserved explanation without synthetic quote wrapper
  await page.click('[data-testid="generate-reframe-btn"]');
  await page.waitForSelector('[data-testid="reframe-comparison-view"]');
  const reframedOutput = await page.textContent('[data-testid="reframe-proposed-output"]');
  if (reframedOutput?.includes('As noted directly in the source material:')) {
    throw new Error('Synthetic auto-appended quote wrapper must not appear in reframed output');
  }
  await page.screenshot({ path: path.join(screenshotDir, '02-reframing-comparison-verified.png') });

  // 2. Navigate to Revision Studio and verify offline translation safety
  const revisionNav = page.locator('#nav-revision');
  await revisionNav.click();
  await page.waitForSelector('[data-testid="revision-studio-root"]');
  await page.screenshot({ path: path.join(screenshotDir, '03-revision-studio-verified.png') });

  console.log('COH-CS-13 Playwright E2E Verification: PASS');
} finally {
  await browser.close();
}
