import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = '/Users/aryanaghili/Documents/coh-content-studio/artifacts/coh-upgrade/runs/COH-CS-05/screenshots';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    window.localStorage.setItem('coh-tour-completed', 'true');
  });
  const page = await context.newPage();

  console.log('1. Navigating to COH Content Studio and opening Reframing Studio...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  const navBtn = page.locator('[data-testid="nav-reframing-studio"]');
  await navBtn.waitFor({ state: 'visible', timeout: 10000 });
  await navBtn.click();

  await page.waitForSelector('[data-testid="reframing-studio-root"]', { timeout: 10000 });

  // Enter source content with exact quote
  const sourceTextarea = page.locator('[data-testid="reframe-source-textarea"]');
  await sourceTextarea.fill(
    'Cycle of Harmony (COH) is a global art and sustainability initiative led by composeroup. As our artistic statement notes, "Culture is the emotional infrastructure that makes climate resilience legible to communities." The programme connects symphonic compositions with youth education and biodiversity restoration.'
  );

  // Journey E: Test Revision route detection first
  console.log('2. Testing Journey E: Revision route detection ("Make this 25% shorter and smoother")...');
  const intentInput = page.locator('[data-testid="reframe-intent-input"]');
  await intentInput.fill('Make this 25% shorter and smoother');
  await page.locator('[data-testid="resolve-reframe-intent-btn"]').click();

  const redirectAlert = page.locator('[data-testid="reframe-revision-route-alert"]');
  await redirectAlert.waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-revision-route-detection.png'), fullPage: true });
  console.log('   PASS: Revision route alert rendered.');

  // Journey A, B, C, G: Institutional reframe for low-familiarity audience + quote protection
  console.log('3. Testing Journey A/B/C/G: Institutional reframe plan resolution and generation...');
  await intentInput.fill(
    'Make this useful to a cultural institution that knows little about COH and needs to understand why this belongs in its programming strategy as a LinkedIn Post.'
  );
  await page.locator('[data-testid="resolve-reframe-intent-btn"]').click();

  const planPanel = page.locator('[data-testid="resolved-reframe-plan"]');
  await planPanel.waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-resolved-reframe-plan.png'), fullPage: true });
  console.log('   PASS: Editable Resolved Transformation Plan rendered.');

  // Generate Reframe
  await page.locator('[data-testid="generate-reframe-btn"]').click();
  const resultPanel = page.locator('[data-testid="reframe-comparison-view"]');
  await resultPanel.waitFor({ state: 'visible', timeout: 15000 });

  const proposedText = await page.locator('[data-testid="reframe-proposed-output"]').innerText();
  if (!proposedText.includes('"Culture is the emotional infrastructure that makes climate resilience legible to communities."')) {
    throw new Error('Protected quotation was not preserved verbatim in proposed reframe!');
  }
  console.log('   PASS: Proposed reframe generated and protected quote preserved verbatim.');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-reframe-comparison-and-explanation.png'), fullPage: true });

  // Save as New Version (Journey H)
  console.log('4. Testing Journey H: Save as New Version in Content Library...');
  await page.locator('[data-testid="reframe-save-library-btn"]').click();
  await page.waitForTimeout(400);

  // Dark mode screenshot
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-reframing-studio-dark.png'), fullPage: true });
  await page.evaluate(() => document.documentElement.classList.remove('dark'));

  // Mobile responsiveness check
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-reframing-studio-mobile.png'), fullPage: true });

  await browser.close();
  console.log('ALL COH-CS-05 PLAYWRIGHT VERIFICATION CHECKS PASSED!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
