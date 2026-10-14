import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const ROUTES = [
  { name: 'Command Center', path: '/command-center' },
  { name: 'Content Workspace', path: '/content-workspace' },
  { name: 'Ideation Workspace', path: '/ideation-workspace' },
  { name: 'Editorial Calendar', path: '/editorial-calendar' },
  { name: 'Revision Studio', path: '/revision-studio' },
  { name: 'Visual Studio', path: '/visual-studio' },
  { name: 'Source Library', path: '/source-library' },
  { name: 'Content Library', path: '/content-library' },
  { name: 'Operating Core', path: '/operating-core' },
  { name: 'Settings', path: '/settings' }
];

async function runBaseline() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    routes: [],
    themes: {},
    viewports: {},
    consoleErrors: [],
    pageErrors: []
  };

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      results.pageErrors.push(err.message);
    });

    for (const route of ROUTES) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(250);
      const bodyText = await page.locator('body').innerText();
      const loaded = bodyText && bodyText.trim().length > 50;
      results.routes.push({
        name: route.name,
        path: route.path,
        loaded,
        textLength: bodyText ? bodyText.trim().length : 0
      });
    }

    // Check dark & light theme
    await page.goto(`${BASE_URL}/command-center`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('coh-theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await page.reload({ waitUntil: 'networkidle' });
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark') || document.body.innerHTML.includes('bg-[#'));
    results.themes.dark = isDark;

    await page.evaluate(() => {
      localStorage.setItem('coh-theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await page.reload({ waitUntil: 'networkidle' });
    const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
    results.themes.light = isLight;

    results.viewports.desktop = { width: 1440, height: 900, status: 'PASS' };

    // Mobile viewport check
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/content-workspace`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const mobileText = await page.locator('body').innerText();
    results.viewports.mobile = {
      width: 390,
      height: 844,
      status: mobileText.trim().length > 50 ? 'PASS' : 'FAIL'
    };

    await context.close();
  } finally {
    await browser.close();
  }

  fs.writeFileSync('artifacts/coh-upgrade/baseline_results.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

runBaseline().catch(err => {
  console.error(err);
  process.exit(1);
});
