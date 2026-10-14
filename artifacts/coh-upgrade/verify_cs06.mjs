import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = '/Users/aryanaghili/Documents/coh-content-studio/artifacts/coh-upgrade/runs/COH-CS-06/screenshots';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    window.localStorage.setItem('coh-tour-completed', 'true');
  });
  const page = await context.newPage();

  console.log('1. Opening Content Workspace and testing Smart Brief & Fast/Explore toggle...');
  await page.goto('http://localhost:5173/content-workspace', { waitUntil: 'networkidle' });

  await page.waitForSelector('[data-testid="smart-brief-panel"]', { timeout: 10000 });

  const goalTextarea = page.locator('textarea[placeholder*="Draft a partner update"]').first();
  await goalTextarea.fill(
    'Create a LinkedIn post for cultural institutions explaining why COH Nordic Air belongs in their seasonal programming.'
  );

  // Verify Smart Brief resolves Cultural Institutions and LinkedIn
  const gridText = await page.locator('[data-testid="smart-brief-fields-grid"]').innerText();
  if (!gridText.includes('Cultural Institutions') || !gridText.includes('LinkedIn')) {
    throw new Error(`Smart Brief did not resolve expected fields. Got: ${gridText}`);
  }

  await page.locator('[data-testid="resolve-smart-brief-btn"]').click();
  await page.locator('[data-testid="speed-mode-fast"]').click();
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-smart-brief-and-fast-mode.png'), fullPage: true });
  console.log('   PASS: Smart Brief resolution and Fast Mode toggle verified.');

  // 2. Navigate to Revision Studio and test Suggested Actions, Recipes, Conflicts, and PT-EU Governance
  console.log('2. Navigating to Revision Studio...');
  await page.locator('#nav-revision').click();
  await page.waitForSelector('[data-testid="revision-studio-root"]', { timeout: 10000 });

  const draftInput = page.locator('[data-testid="revision-draft-textarea"]');
  await draftInput.fill(
    'Here is: Climate Opera Haus — the undisputed 100% largest in history — creates **operatic worlds** that connect symphonic composition with ecological storytelling.'
  );

  // Verify draft-dependent suggested actions appear
  const suggestedBox = page.locator('[data-testid="suggested-revision-actions"]');
  await suggestedBox.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForSelector('[data-testid="suggested-action-clean-ai-punctuation"]', { timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-suggested-revision-actions.png'), fullPage: true });
  console.log('   PASS: Draft-dependent Suggested Revision Actions verified.');

  // Test Conflict Detection: shorter + longer-version
  console.log('3. Testing Revision Recipe conflict detection...');
  // Open Structure & Alternatives group if closed
  const structSummary = page.locator('summary', { hasText: 'Structure & Alternatives' });
  if (await structSummary.isVisible()) {
    await structSummary.click();
  }
  await page.locator('[data-testid="recipe-toggle-shorter"]').click();
  await page.locator('[data-testid="recipe-toggle-longer-version"]').click();

  const conflictAlert = page.locator('[data-testid="revision-conflict-alert"]');
  await conflictAlert.waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-revision-conflict-detection.png'), fullPage: true });
  console.log('   PASS: Contradictory action conflict alert verified.');

  // Untoggle longer-version, add more-careful & clean-ai-punctuation, select PT-EU language
  console.log('4. Testing Multi-Action Revision Recipe execution + PT-EU Governance + State Regression...');
  await page.locator('[data-testid="recipe-toggle-longer-version"]').click();
  await page.locator('[data-testid="recipe-toggle-clean-ai-punctuation"]').click();
  await page.locator('[data-testid="recipe-toggle-more-careful"]').click();
  await page.locator('[data-testid="recipe-toggle-translate-selected"]').click();

  const langSelect = page.locator('[data-testid="revision-language-select"]');
  const langOptions = await langSelect.locator('option').allInnerTexts();
  const ptOption = langOptions.find(o => o.toLowerCase().includes('portuguese')) || langOptions[0];
  await langSelect.selectOption({ label: ptOption });

  await page.locator('[data-testid="run-revision-recipe-btn"]').click();
  await page.waitForSelector('[data-testid="revision-output-panel"]', { timeout: 10000 });

  const revisedText = await page.locator('[data-testid="revision-output-text"]').innerText();
  if (revisedText.includes('\u2014')) {
    throw new Error('Revised output still contained an em dash!');
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-revision-recipe-executed.png'), fullPage: true });
  console.log('   PASS: Multi-Action Revision Recipe executed cleanly.');

  // Change Channel setting after revision to verify Settings Changed Banner & Original vs Current selector
  await page.locator('[data-testid="revision-channel-select"]').selectOption('LinkedIn');
  await page.waitForSelector('[data-testid="revision-settings-changed-banner"]', { timeout: 5000 });
  await page.waitForSelector('[data-testid="revision-source-selector"]', { timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-revision-state-regression-check.png'), fullPage: true });
  console.log('   PASS: Settings-changed banner and Original vs Current selector verified.');

  await browser.close();
  console.log('ALL COH-CS-06 PLAYWRIGHT VERIFICATION CHECKS PASSED!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
