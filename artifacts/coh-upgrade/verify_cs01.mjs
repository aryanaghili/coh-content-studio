import { chromium } from 'playwright';

async function verifyCS01() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      localStorage.setItem('coh-tour-completed', 'true');
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    for (const route of ['/content-workspace', '/revision-studio']) {
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
      const panel = page.getByTestId('context-manifest-panel');
      const visible = await panel.isVisible();
      if (!visible) throw new Error(`ContextManifestPanel not visible on ${route}`);

      // Expand panel
      await panel.locator('button').first().click();
      const text = (await panel.textContent()) || '';
      if (!text.includes('COH Guidance') || !text.includes('Audience') || !text.includes('Explicit')) {
        throw new Error(`Expanded ContextManifestPanel missing expected sections on ${route}: ${text}`);
      }
    }

    // Mobile check
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/content-workspace', { waitUntil: 'networkidle' });
    const mobileVisible = await page.getByTestId('context-manifest-panel').isVisible();
    if (!mobileVisible) throw new Error('ContextManifestPanel not visible on mobile');

    if (pageErrors.length > 0) throw new Error(`Page errors: ${pageErrors.join('; ')}`);
    console.log('COH-CS-01 UI verification PASS');
  } finally {
    await browser.close();
  }
}

verifyCS01();
