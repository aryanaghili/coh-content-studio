import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    consoleErrors: [],
    pageErrors: []
  };

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      localStorage.setItem('coh-tour-completed', 'true');
    });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') results.consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => {
      results.pageErrors.push(err.message);
    });

    // 1. Navigate to Source Library
    await page.goto(`${BASE_URL}/source-library`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    // Add a new source to test full Source Intelligence flow
    await page.fill('input[placeholder*="Soria Moria"]', 'Soria Moria Acoustic Memo');
    await page.fill('textarea[placeholder*="Reference details"]', 'Bergen acoustic workshop summary');
    await page.fill(
      'textarea[placeholder*="Paste text summary"]',
      'Soria Moria is the foundational first work in The Climate Tetralogy. Acoustic testing in Bergen achieved 94% reverberation clarity. The team aims to expand to 8 additional venues.'
    );
    await page.click('button[type="submit"]:has-text("Add Source")');
    await page.waitForTimeout(300);

    // Locate the newly added source card's Analyze Source button
    const analyzeBtn = page.locator('[data-testid^="analyze-source-btn-"]').first();
    await analyzeBtn.waitFor({ state: 'visible', timeout: 5000 });
    const testIdAttr = await analyzeBtn.getAttribute('data-testid');
    const sourceId = testIdAttr.replace('analyze-source-btn-', '');

    // 2. Click Analyze Source
    await analyzeBtn.click();
    await page.waitForTimeout(400);

    const disclaimerEl = page.locator(`[data-testid="source-intelligence-disclaimer-${sourceId}"]`);
    const disclaimerText = await disclaimerEl.innerText();
    const panelEl = page.locator(`[data-testid="source-intelligence-panel-${sourceId}"]`);
    const panelText = await panelEl.innerText();
    const hasEmDashInPanel = panelText.includes('—');
    const hasDeadReframingLink = panelText.toLowerCase().includes('use in reframing');

    results.checks.push({
      step: 'Analyze Source & Derived Intelligence Display',
      sourceId,
      disclaimerVisible: disclaimerText === 'AI interpretation of the source, not the source itself.',
      hasKeyFacts: panelText.includes('Key Facts'),
      hasCautions: panelText.includes('Cautions and Ambiguities'),
      hasEmDashInPanel,
      hasDeadReframingLink,
      status:
        disclaimerText === 'AI interpretation of the source, not the source itself.' &&
        !hasEmDashInPanel &&
        !hasDeadReframingLink
          ? 'PASS'
          : 'FAIL'
    });

    // 3. Select a task role and pin an excerpt
    const roleSelect = page.locator(`[data-testid="source-role-select-${sourceId}"]`);
    await roleSelect.selectOption('Must-use Material');
    await page.click(`[data-testid="toggle-excerpt-picker-${sourceId}"]`);
    await page.waitForTimeout(200);

    const excerptCheckbox = page.locator(`[data-testid="excerpt-picker-panel-${sourceId}"] input[type="checkbox"]`).first();
    if (await excerptCheckbox.count() > 0) {
      await excerptCheckbox.click();
    }

    // 4. Direct Action: Use in Ideation
    await page.click(`[data-testid="use-in-ideation-btn-${sourceId}"]`);
    await page.waitForTimeout(300);
    const onIdeation = page.url().includes('/ideation-workspace');
    results.checks.push({
      step: 'Direct Source -> Ideation Handoff',
      url: page.url(),
      status: onIdeation ? 'PASS' : 'FAIL'
    });

    // 5. Return to Source Library via sidebar (preserving in-memory task state) & Direct Action: Create Content
    await page.click('aside button:has-text("Source Library")');
    await page.waitForTimeout(300);
    await page.click(`[data-testid="create-content-btn-${sourceId}"]`);
    await page.waitForTimeout(400);

    const onContent = page.url().includes('/content-workspace');
    const wsRoleSelect = page.locator(`[data-testid="workspace-source-role-select-${sourceId}"]`);
    const wsRoleVisible = await wsRoleSelect.isVisible();
    const wsRoleValue = wsRoleVisible ? await wsRoleSelect.inputValue() : null;

    // Also expand Active Context manifest in Content Workspace to verify source role appears in manifest
    const manifestPanel = page.locator('[data-testid="context-manifest-panel"]');
    await manifestPanel.locator('button').first().click();
    await page.waitForTimeout(200);
    const manifestBodyText = await manifestPanel.innerText();

    results.checks.push({
      step: 'Direct Source -> Content Workspace & Role Visibility',
      url: page.url(),
      wsRoleVisible,
      wsRoleValue,
      manifestShowsSourceAndRole:
        manifestBodyText.includes('Soria Moria Acoustic Memo') &&
        manifestBodyText.includes('Must-use Material'),
      status:
        onContent &&
        wsRoleVisible &&
        wsRoleValue === 'Must-use Material' &&
        manifestBodyText.includes('Soria Moria Acoustic Memo')
          ? 'PASS'
          : 'FAIL'
    });

    // 6. Responsive & Theme Check on Source Library (Desktop + Mobile, Light + Dark)
    await page.goto(`${BASE_URL}/source-library`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    // Toggle theme
    const themeBtn = page.locator('header button[title*="Switch to"], header button[aria-label*="theme" i]').first();
    if (await themeBtn.count() > 0) {
      await themeBtn.click();
      await page.waitForTimeout(200);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const mobileOverflow = await page.evaluate(() => {
      return Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
    });

    results.checks.push({
      step: 'Source Library Responsive Mobile & Theme Check',
      mobileOverflowPx: mobileOverflow,
      status: mobileOverflow === 0 ? 'PASS' : 'FAIL'
    });

    await context.close();
  } finally {
    await browser.close();
  }

  fs.writeFileSync('artifacts/coh-upgrade/cs03_verification.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));

  const anyFailed = results.checks.some(c => c.status !== 'PASS') || results.pageErrors.length > 0;
  if (anyFailed) process.exit(1);
}

run();
