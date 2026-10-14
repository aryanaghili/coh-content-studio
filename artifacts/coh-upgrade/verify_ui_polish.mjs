import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('artifacts/coh-upgrade/screenshots/ui-polish');
fs.mkdirSync(OUT_DIR, { recursive: true });

const URL = 'http://localhost:5173';

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.localStorage.setItem('coh-tour-completed', 'true');
  });

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Helper to switch theme
  const setTheme = async (mode) => {
    const label = mode === 'light' ? 'Light theme' : 'Dark theme';
    const btn = page.locator(`button[title="${label}"]`);
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(200);
    }
  };

  // Helper to navigate sidebar
  const navTo = async (labelRegex) => {
    const btn = page.locator('aside nav button').filter({ hasText: labelRegex }).first();
    await btn.click();
    await page.waitForTimeout(200);
  };

  // Helper to check horizontal overflow
  const assertNoOverflow = async (label) => {
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    if (overflow > 4) {
      throw new Error(`Horizontal overflow detected on ${label}: +${overflow}px`);
    }
  };

  // 1. Light Theme Desktop Screenshots (1440x900)
  await setTheme('light');

  await navTo(/Command Center/i);
  await assertNoOverflow('Command Center Light 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '01-command-center-light-1440.png'), fullPage: false });

  await navTo(/Ideation Workspace/i);
  await assertNoOverflow('Ideation Workspace Light 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '02-ideation-workspace-light-1440.png'), fullPage: false });

  await navTo(/Content Workspace/i);
  await assertNoOverflow('Content Workspace Light 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '03-content-workspace-light-1440.png'), fullPage: false });

  await navTo(/Editorial Calendar/i);
  await assertNoOverflow('Editorial Calendar Light 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '04-editorial-calendar-light-1440.png'), fullPage: false });

  await navTo(/Revision Studio/i);
  await assertNoOverflow('Revision Studio Light 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '05-revision-studio-light-1440.png'), fullPage: false });

  await navTo(/Reframing Studio/i);
  await assertNoOverflow('Reframing Studio Light 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '06-reframing-studio-light-1440.png'), fullPage: false });

  await navTo(/Source Library/i);
  await assertNoOverflow('Source Library Light 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '07-source-library-light-1440.png'), fullPage: false });

  await navTo(/Content Library/i);
  await assertNoOverflow('Content Library Light 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '08-content-library-light-1440.png'), fullPage: false });

  // 2. Dark Theme Desktop Screenshots (1440x900)
  await setTheme('dark');

  await navTo(/Command Center/i);
  await assertNoOverflow('Command Center Dark 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '09-command-center-dark-1440.png'), fullPage: false });

  await navTo(/Content Workspace/i);
  await assertNoOverflow('Content Workspace Dark 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '10-content-workspace-dark-1440.png'), fullPage: false });

  await navTo(/Reframing Studio/i);
  await assertNoOverflow('Reframing Studio Dark 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '11-reframing-studio-dark-1440.png'), fullPage: false });

  await navTo(/Revision Studio/i);
  await assertNoOverflow('Revision Studio Dark 1440');
  await page.screenshot({ path: path.join(OUT_DIR, '12-revision-studio-dark-1440.png'), fullPage: false });

  // 3. Responsive Viewport Audits (1280px, 768px, 390px)
  await setTheme('light');
  await navTo(/Content Workspace/i);

  for (const vp of [
    { width: 1280, height: 800, tag: '1280' },
    { width: 768, height: 1024, tag: '768' },
    { width: 390, height: 844, tag: '390' }
  ]) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(200);
    await assertNoOverflow(`Content Workspace ${vp.tag}`);
    await page.screenshot({ path: path.join(OUT_DIR, `13-responsive-workspace-${vp.tag}.png`), fullPage: false });
  }

  console.log('UI/UX Polish Playwright Verification & Screenshot Capture: PASS');
} finally {
  await browser.close();
}
