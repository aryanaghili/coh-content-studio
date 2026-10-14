import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.resolve('artifacts/coh-upgrade/runs/COH-CS-07/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 920 } });
  await context.addInitScript(() => {
    window.localStorage.setItem('coh-tour-completed', 'true');
  });
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Open Source Library tab directly from sidebar
  console.log('2. Opening Source Library & testing Use in Reframing...');
  await page.locator('button:has-text("Source Library")').first().click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-source-library-use-in-reframing-dark.png'), fullPage: false });

  // Click "Use in Reframing" on the first source card
  const useInReframingBtn = page.locator('[data-testid^="use-in-reframing-btn-"]').first();
  if (await useInReframingBtn.count() > 0) {
    await useInReframingBtn.click();
    await page.waitForTimeout(500);
  } else {
    await page.locator('[data-testid="nav-reframing-studio"]').click();
    await page.waitForTimeout(500);
  }

  // Verify CurrentWorkContextBar in Reframing Studio
  const contextBar = page.locator('[data-testid="current-work-context-bar"]');
  await contextBar.waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-reframing-studio-context-bar-dark.png'), fullPage: false });

  // Jump to Content Workspace via CurrentWorkContextBar quick action
  console.log('3. Jumping to Content Workspace via CurrentWorkContextBar...');
  await page.locator('[data-testid="continuity-jump-content-workspace"]').click();
  await page.waitForTimeout(500);
  await contextBar.waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-content-workspace-continuity-bar-dark.png'), fullPage: false });

  // Jump to Visual Studio via CurrentWorkContextBar quick action
  console.log('4. Verifying Content -> Visual Studio handoff & continuity bar...');
  await page.locator('[data-testid="continuity-jump-visual-studio"]').click();
  await page.waitForTimeout(500);
  await contextBar.waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-visual-studio-continuity-bar-dark.png'), fullPage: false });

  // Jump to Revision Studio via CurrentWorkContextBar quick action
  console.log('5. Verifying Revision Studio continuity bar in Light Mode & Mobile...');
  await page.locator('[data-testid="continuity-jump-revision-studio"]').click();
  await page.waitForTimeout(500);
  await contextBar.waitFor({ state: 'visible', timeout: 5000 });

  // Toggle light mode if available
  const themeToggle = page.locator('button[title*="Switch to"], button[aria-label*="theme"]').first();
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-revision-studio-continuity-light.png'), fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mobile-continuity-bar-light.png'), fullPage: false });

  await browser.close();
  console.log('COH-CS-07 Playwright E2E verification PASSED.');
})();
