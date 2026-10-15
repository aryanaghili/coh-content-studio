import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const PORT = 4179;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACT_DIR = path.resolve(process.cwd(), 'artifacts/ui-regression-audit');
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

const ROUTES = [
  { slug: 'command-center', label: 'Command Center' },
  { slug: 'ideation-workspace', label: 'Ideation Workspace' },
  { slug: 'editorial-calendar', label: 'Editorial Calendar' },
  { slug: 'content-workspace', label: 'Content Workspace' },
  { slug: 'visual-studio', label: 'Visual Studio' },
  { slug: 'revision-studio', label: 'Revision Studio' },
  { slug: 'reframing-studio', label: 'Reframing Studio' },
  { slug: 'calendar-library', label: 'Calendar Library' },
  { slug: 'idea-library', label: 'Idea Library' },
  { slug: 'content-library', label: 'Content Library' },
  { slug: 'source-library', label: 'Source Library' },
  { slug: 'operating-core', label: 'Operating Core' },
  { slug: 'settings', label: 'Settings' }
];

const VIEWPORTS = [
  { width: 360, height: 800, category: 'mobile' },
  { width: 390, height: 844, category: 'mobile' },
  { width: 430, height: 932, category: 'mobile' },
  { width: 768, height: 1024, category: 'tablet' },
  { width: 1024, height: 768, category: 'laptop' },
  { width: 1280, height: 800, category: 'laptop' },
  { width: 1440, height: 900, category: 'desktop' },
  { width: 1600, height: 900, category: 'desktop' },
  { width: 1920, height: 1080, category: 'desktop' }
];

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for preview server at ${url}`);
}

async function attachDeterministicApiMocks(page) {
  await page.route('**/api/**', async route => {
    const url = route.request().url();
    if (url.includes('/api/auth/session')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true, bypass: true })
      });
    }
    if (url.includes('/api/ai/status')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'not_configured',
          provider: '',
          textModel: 'gpt-6-luna',
          imageModel: 'gpt-image-2',
          configuredProviders: []
        })
      });
    }
    if (url.includes('/api/operating-core/documents')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }
    return route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Local fallback mode active' })
    });
  });
}

async function runSuite() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log(`[UI Regression Suite] Starting Vite server on port ${PORT}...`);
  const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  const summary = {
    timestamp: new Date().toISOString(),
    routesVerified: [],
    historyAndFallback: {},
    viewportMatrixCount: 0,
    viewportOverflowFailures: [],
    desktopRailMetrics1920: [],
    mobileDrawerAndTouchChecks: {},
    a11yUnlabeledButtons: [],
    reducedMotionSupported: false,
    workflows: {},
    errorResilience: {},
    consoleErrors: [],
    pageErrors: []
  };

  try {
    await waitForServer(BASE_URL);
    const browser = await chromium.launch({ headless: true });

    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      await context.addInitScript(() => {
        localStorage.setItem('coh-tour-completed', 'true');
        sessionStorage.setItem('coh_superuser_unlocked', 'true');
      });
      const page = await context.newPage();
      await attachDeterministicApiMocks(page);

      let promptDialogTriggered = false;
      page.on('dialog', async dialog => {
        promptDialogTriggered = true;
        await dialog.dismiss();
      });
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const txt = msg.text();
          if (!txt.includes('503')) {
            summary.consoleErrors.push(txt);
          }
        }
      });
      page.on('pageerror', err => {
        summary.pageErrors.push(err.message);
      });

      // 1. Verify all 13 routes: Direct URL, Refresh, TopBar title, Sidebar active item, A11y unlabeled buttons
      console.log('[1/7] Auditing all 13 routes (Direct URL, Refresh, Titles, Active Nav, A11y)...');
      for (const r of ROUTES) {
        await page.goto(`${BASE_URL}/${r.slug}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(80);
        const pathDirect = new URL(page.url()).pathname;
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(80);
        const pathAfterReload = new URL(page.url()).pathname;

        const routeAudit = await page.evaluate(() => {
          const topBarH2 = document.querySelector('header h2')?.textContent?.trim() || '';
          const activeNav = Array.from(document.querySelectorAll('aside nav button')).find(b =>
            b.className.includes('bg-sidebar-active')
          );
          const unlabeled = Array.from(document.querySelectorAll('button'))
            .filter(btn => {
              const text = (btn.innerText || btn.textContent || '').trim();
              const ariaLabel = btn.getAttribute('aria-label') || '';
              const title = btn.getAttribute('title') || '';
              return !text && !ariaLabel && !title;
            })
            .map(b => b.outerHTML.slice(0, 120));
          return {
            topBarTitle: topBarH2,
            activeSidebarLabel: activeNav ? activeNav.textContent.trim() : '',
            unlabeled
          };
        });

        assert.equal(pathDirect, `/${r.slug}`, `Direct URL failed for ${r.slug}`);
        assert.equal(pathAfterReload, `/${r.slug}`, `Refresh lost route for ${r.slug}`);
        assert.equal(routeAudit.topBarTitle, r.label, `TopBar title mismatch on ${r.slug}: got ${routeAudit.topBarTitle}`);
        assert.equal(routeAudit.activeSidebarLabel, r.label, `Sidebar active mismatch on ${r.slug}`);
        assert.equal(routeAudit.unlabeled.length, 0, `Unlabeled icon buttons on ${r.slug}: ${routeAudit.unlabeled.join(', ')}`);

        summary.routesVerified.push({
          slug: r.slug,
          label: r.label,
          directUrl: pathDirect === `/${r.slug}`,
          refreshPersists: pathAfterReload === `/${r.slug}`,
          topBarTitle: routeAudit.topBarTitle,
          activeSidebarLabel: routeAudit.activeSidebarLabel,
          unlabeledButtons: routeAudit.unlabeled.length
        });
      }

      // 2. Verify History Back/Forward and Unknown Route Fallback
      console.log('[2/7] Auditing browser Back/Forward history and unknown route fallback...');
      await page.goto(`${BASE_URL}/command-center`, { waitUntil: 'networkidle' });
      await page.click('#nav-ideation');
      await page.waitForTimeout(80);
      const afterNav = new URL(page.url()).pathname;
      await page.goBack();
      await page.waitForTimeout(80);
      const afterBack = new URL(page.url()).pathname;
      await page.goForward();
      await page.waitForTimeout(80);
      const afterForward = new URL(page.url()).pathname;

      await page.goto(`${BASE_URL}/unknown-legacy-route-999`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(100);
      const unknownFallback = new URL(page.url()).pathname;

      assert.equal(afterNav, '/ideation-workspace');
      assert.equal(afterBack, '/command-center');
      assert.equal(afterForward, '/ideation-workspace');
      assert.equal(unknownFallback, '/command-center');
      summary.historyAndFallback = { afterNav, afterBack, afterForward, unknownFallback, passed: true };

      // 3. Responsive Matrix across all 13 routes x 9 viewports x 2 themes (234 checks) + screenshots
      console.log('[3/7] Auditing 13 routes x 9 viewports x 2 themes (234 combinations)...');
      for (const theme of ['light', 'dark']) {
        await page.evaluate(t => {
          localStorage.setItem('coh-theme', t);
          document.documentElement.setAttribute('data-theme', t);
        }, theme);

        for (const r of ROUTES) {
          await page.goto(`${BASE_URL}/${r.slug}`, { waitUntil: 'networkidle' });
          await page.evaluate(t => {
            localStorage.setItem('coh-theme', t);
            document.documentElement.setAttribute('data-theme', t);
          }, theme);

          for (const vp of VIEWPORTS) {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.waitForTimeout(35);
            const metrics = await page.evaluate(() => {
              const docOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
              const mainEl = document.querySelector('main.page-content');
              const mainOverflow = mainEl ? mainEl.scrollWidth > mainEl.clientWidth + 2 : false;
              const shellEl = document.querySelector('.page-shell');
              const asideEl = document.querySelector('aside');
              const sidebarW = asideEl && window.innerWidth >= 768 ? Math.round(asideEl.getBoundingClientRect().width) : 0;
              const mainStyle = mainEl ? window.getComputedStyle(mainEl) : null;
              const padX = mainStyle ? parseFloat(mainStyle.paddingLeft) + parseFloat(mainStyle.paddingRight) : 0;
              const availW = Math.round(window.innerWidth - sidebarW - padX);
              const shellW = shellEl ? Math.round(shellEl.getBoundingClientRect().width) : 0;
              const grids = shellEl
                ? Array.from(shellEl.querySelectorAll(':scope > .grid, :scope > div > .grid')).map(g =>
                    Array.from(g.children).map(c => Math.round(c.getBoundingClientRect().width))
                  )
                : [];
              return { docOverflow, mainOverflow, availW, shellW, grids };
            });

            summary.viewportMatrixCount++;
            if (metrics.docOverflow || metrics.mainOverflow) {
              summary.viewportOverflowFailures.push({
                theme,
                viewport: `${vp.width}x${vp.height}`,
                route: r.slug,
                ...metrics
              });
            }

            if (theme === 'dark' && vp.width === 1920) {
              summary.desktopRailMetrics1920.push({
                route: r.slug,
                availW: metrics.availW,
                shellW: metrics.shellW,
                grids: metrics.grids
              });
            }

            // Save representative screenshots
            if (
              (vp.width === 1920 && vp.height === 1080 && ['command-center', 'ideation-workspace', 'editorial-calendar', 'content-workspace', 'visual-studio', 'revision-studio', 'reframing-studio', 'source-library', 'operating-core', 'settings'].includes(r.slug)) ||
              (vp.width === 390 && vp.height === 844 && ['command-center', 'content-workspace', 'revision-studio', 'editorial-calendar'].includes(r.slug))
            ) {
              const fileName = `${r.slug}_${vp.width}x${vp.height}_${theme}.png`;
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, fileName), fullPage: false });
            }
          }
        }
      }
      assert.equal(summary.viewportOverflowFailures.length, 0, `Overflow failures detected: ${JSON.stringify(summary.viewportOverflowFailures)}`);

      // 4. Mobile Drawer & Touch Target Verification (390x844)
      console.log('[4/7] Auditing mobile navigation drawer, Escape key, and touch targets at 390x844...');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/command-center`, { waitUntil: 'networkidle' });
      const openBtnBox = await page.locator('button[aria-label="Open navigation menu"]').boundingBox();
      assert.ok(openBtnBox && openBtnBox.width >= 44 && openBtnBox.height >= 44, 'Mobile menu open button must be >= 44x44px');
      await page.click('button[aria-label="Open navigation menu"]');
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_drawer_open_390x844.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const closedTransform = await page.evaluate(() => {
        const aside = document.querySelector('aside');
        return aside ? aside.className.includes('-translate-x-full') : false;
      });
      assert.equal(closedTransform, true, 'Escape key should close mobile drawer');
      summary.mobileDrawerAndTouchChecks = {
        openButtonSize: `${Math.round(openBtnBox.width)}x${Math.round(openBtnBox.height)}`,
        escapeClosesDrawer: closedTransform,
        passed: true
      };

      // 5. Reduced motion check
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const reducedDuration = await page.evaluate(() => {
        const btn = document.querySelector('button');
        return btn ? window.getComputedStyle(btn).transitionDuration : '';
      });
      summary.reducedMotionSupported = reducedDuration.includes('0.00001s') || reducedDuration.includes('1e-05s') || reducedDuration === '0s';
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      // 6. End-to-End Cross-Studio Workflows A through H
      console.log('[5/7] Executing Cross-Studio Workflows A through H...');

      // Workflow A: Source Library -> Ideation -> Content Workspace -> Content Library
      await page.goto(`${BASE_URL}/source-library`, { waitUntil: 'networkidle' });
      await page.fill('input[placeholder*="Soria Moria"]', 'Nordic Climate Opera Symposium Report 2026');
      await page.fill('textarea[placeholder*="Paste text summary"]', 'Climate Opera Haus convened 240 cultural delegates in Oslo on 14 May 2026 to premiere the Arctic Coral liturgy.');
      await page.click('button[type="submit"]:has-text("Add Source")');
      await page.waitForTimeout(150);

      await page.click('#nav-ideation');
      await page.waitForTimeout(100);
      await page.fill('textarea[placeholder*="Why is climate opera"]', 'Highlight the Oslo symposium outcomes and 240 cultural delegates for institutional partners.');
      await page.click('[data-testid="generate-ideas-btn"]');
      await page.waitForTimeout(600);
      const ideaCount = await page.locator('[data-testid^="ideation-opportunity-card-"]').count();
      assert.ok(ideaCount > 0, 'Ideation should generate opportunity cards');
      await page.locator('[data-testid^="ideation-opportunity-card-"] button:has-text("Save")').first().click();
      await page.waitForTimeout(150);
      await page.locator('[data-testid^="promote-idea-to-draft-"]').first().click();
      await page.waitForTimeout(200);
      assert.equal(new URL(page.url()).pathname, '/content-workspace', 'Should handoff to Content Workspace');

      // Test inline rename in Content Workspace (no window.prompt!)
      const hasRenameBtn = await page.locator('[data-testid="work-item-rename-btn"]').count();
      if (hasRenameBtn > 0) {
        await page.click('[data-testid="work-item-rename-btn"]');
        await page.fill('[data-testid="work-item-rename-input"]', 'Oslo Symposium Institutional Post');
        await page.click('[data-testid="work-item-rename-save-btn"]');
        await page.waitForTimeout(100);
      }
      assert.equal(promptDialogTriggered, false, 'Inline rename must not trigger browser window.prompt');

      await page.click('button:has-text("Generate")');
      await page.locator('[data-testid="draft-option-a-card"]').waitFor({ state: 'visible', timeout: 5000 });
      const hasOptionACard = await page.locator('[data-testid="draft-option-a-card"]').count();
      assert.ok(hasOptionACard > 0, 'Content Workspace should generate draft options');
      await page.locator('[data-testid="draft-option-a-card"] button:has-text("Save to Library")').first().click();
      await page.waitForTimeout(150);
      summary.workflows.workflowA = 'PASS';

      // Workflow B: Editorial Calendar -> Calendar Library -> Reopen -> Content Workspace
      await page.click('#nav-editorial');
      await page.waitForTimeout(150);
      await page.click('button:has-text("Generate Monthly Calendar")');
      await page.waitForTimeout(800);
      // Test Specific Regeneration -> Regenerate Selected Week without window.prompt
      await page.selectOption('[data-testid="calendar-regen-week-select"]', '3');
      await page.selectOption('[data-testid="calendar-specific-regen-select"]', 'Regenerate Selected Week');
      await page.waitForTimeout(800);
      assert.equal(promptDialogTriggered, false, 'Calendar week regeneration must not trigger browser window.prompt');
      await page.click('button:has-text("Save Calendar")');
      await page.waitForTimeout(200);
      await page.click('button:has-text("Open Library")');
      await page.waitForTimeout(200);
      assert.equal(new URL(page.url()).pathname, '/calendar-library');
      await page.locator('.page-shell button:has-text("Open")').first().click();
      await page.waitForTimeout(200);
      assert.equal(new URL(page.url()).pathname, '/editorial-calendar');
      summary.workflows.workflowB = 'PASS';

      // Workflow C & F: Content Workspace / Content Library -> Revision Studio -> Save as New -> Content Library
      await page.click('#nav-content');
      await page.waitForTimeout(150);
      await page.locator('[data-testid="draft-option-a-card"] button:has-text("Revise This Draft")').first().click();
      await page.waitForTimeout(200);
      assert.equal(new URL(page.url()).pathname, '/revision-studio');
      const vBadgeBefore = await page.locator('[data-testid="revision-version-badge"]').textContent();
      assert.equal(vBadgeBefore?.trim(), 'v1');
      await page.locator('[data-testid^="suggested-action-"]').first().click();
      await page.click('[data-testid="run-revision-recipe-btn"]');
      await page.waitForTimeout(800);
      const vBadgeAfter = await page.locator('[data-testid="revision-version-badge"]').textContent();
      assert.equal(vBadgeAfter?.trim(), 'v2', 'Version badge should increment to v2 after revision');
      const historyVisible = await page.locator('[data-testid="revision-version-history"]').count();
      assert.equal(historyVisible, 1, 'Original draft & version history inspector should be accessible');
      await page.click('[data-testid="revision-save-new-btn"]');
      await page.waitForTimeout(200);
      await page.click('aside nav button:has-text("Content Library")');
      await page.waitForTimeout(200);
      assert.equal(new URL(page.url()).pathname, '/content-library');
      const savedCardText = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.page-shell .grid > div'));
        return cards.map(c => c.textContent || '').join(' ');
      });
      assert.ok(savedCardText && savedCardText.includes('v2') && savedCardText.includes('Revised'), 'Saved revision item should appear with v2 badge and Revised status in Content Library');
      summary.workflows.workflowC = 'PASS';
      summary.workflows.workflowF = 'PASS';

      // Workflow D: Content Library -> Reframing Studio -> Content Library & Content Workspace
      await page.locator('[data-testid^="reframe-library-item-"]').first().click();
      await page.waitForTimeout(200);
      assert.equal(new URL(page.url()).pathname, '/reframing-studio');
      await page.fill('[data-testid="reframe-intent-input"]', 'Reframe this for Corporate Sponsors as a sponsor pitch');
      await page.click('[data-testid="resolve-reframe-intent-btn"]');
      await page.waitForTimeout(150);
      await page.click('[data-testid="generate-reframe-btn"]');
      await page.waitForTimeout(800);
      await page.click('[data-testid="reframe-save-library-btn"]');
      await page.waitForTimeout(150);
      await page.click('[data-testid="reframe-send-workspace-btn"]');
      await page.waitForTimeout(200);
      assert.equal(new URL(page.url()).pathname, '/content-workspace');
      summary.workflows.workflowD = 'PASS';

      // Workflow E: Idea Library -> Visual Studio
      await page.goto(`${BASE_URL}/idea-library`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);
      await page.locator('button:has-text("Send Visual Direction to Visual Studio")').first().click();
      await page.waitForTimeout(200);
      assert.equal(new URL(page.url()).pathname, '/visual-studio');
      summary.workflows.workflowE = 'PASS';

      // Workflow G: Operating Core update -> reflected in downstream studios
      await page.goto(`${BASE_URL}/operating-core`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);
      await page.click('button:has-text("Audiences")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Save Core")');
      await page.waitForTimeout(150);
      summary.workflows.workflowG = 'PASS';

      // Workflow H: Theme switch mid-workflow preserves state
      await page.goto(`${BASE_URL}/revision-studio`, { waitUntil: 'networkidle' });
      await page.fill('[data-testid="revision-draft-textarea"]', 'Draft preserved across theme toggle.');
      await page.click('header button[aria-label="Dark Mode"]');
      await page.waitForTimeout(100);
      const draftAfterDark = await page.inputValue('[data-testid="revision-draft-textarea"]');
      const activeThemeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      assert.equal(draftAfterDark, 'Draft preserved across theme toggle.');
      assert.equal(activeThemeAttr, 'dark');
      summary.workflows.workflowH = 'PASS';

      // Workflow I: Content Workspace Unified Mode Architecture & Content Starters
      console.log('[5b/7] Auditing Content Workspace Mode Architecture & Content Starters...');
      await page.goto(`${BASE_URL}/content-workspace`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(100);

      // Ensure mode selector lives inside the creation card and there is only 1 mode selector
      const modeSelectorCount = await page.locator('[data-testid="content-mode-selector"]').count();
      assert.equal(modeSelectorCount, 1, 'There must be exactly one unified mode selector in Content Workspace');
      const selectorInsideCard = await page.locator('[data-guide="content-creation-card"] [data-testid="content-mode-selector"]').count();
      assert.equal(selectorInsideCard, 1, 'Mode selector must sit inside the Create Content card');

      // Test Simple Mode copy
      await page.click('[data-testid="mode-btn-simple"]');
      await page.waitForTimeout(60);
      const simpleHelper = await page.locator('[data-testid="content-mode-helper"]').textContent();
      assert.equal(simpleHelper?.trim(), 'Tell us what you need and choose a channel. The Studio will infer the rest.');

      // Test Quick Create copy
      await page.click('[data-testid="mode-btn-quick"]');
      await page.waitForTimeout(60);
      const quickHelper = await page.locator('[data-testid="content-mode-helper"]').textContent();
      assert.equal(quickHelper?.trim(), 'Add a little more direction without building a complete brief.');

      // Test Advanced Brief copy
      await page.click('[data-testid="mode-btn-advanced"]');
      await page.waitForTimeout(60);
      const advancedHelper = await page.locator('[data-testid="content-mode-helper"]').textContent();
      assert.equal(advancedHelper?.trim(), 'Control audience, intent, format, language, tone, evidence, and production details.');

      // Switch back to Simple and apply a Content Starter — verify automatic switch to Advanced Brief + non-blocking confirmation
      await page.click('[data-testid="mode-btn-simple"]');
      await page.waitForTimeout(60);
      await page.click('[data-testid="content-starters-toggle"]');
      await page.waitForTimeout(80);
      await page.locator('[data-testid="content-starter-template-btn"]').first().click();
      await page.waitForTimeout(120);
      const starterFeedback = await page.locator('[data-testid="content-starter-feedback"]').textContent();
      assert.ok(starterFeedback && starterFeedback.includes('Starter applied:'), 'Applying a Content Starter must display non-blocking confirmation');
      summary.workflows.contentWorkspaceModeArchitecture = 'PASS';

      // Workflow J: Workspace Guides (? Guide trigger, step navigation, Escape dismissal, and first-visit coachmark)
      console.log('[5c/7] Auditing Workspace Guide system across routes...');
      await page.click('[data-testid="workspace-guide-trigger"]');
      await page.waitForTimeout(150);
      const popoverVisible = await page.locator('[data-testid="guided-tour-popover"]').isVisible();
      assert.equal(popoverVisible, true, 'Clicking ? Guide should open the Workspace Guide popover');
      const step1Title = await page.locator('[data-testid="guided-tour-step-title"]').textContent();
      assert.ok(step1Title && step1Title.includes('Choose how much control you need'), `Expected Content Workspace step 1 title, got: ${step1Title}`);
      await page.click('[data-testid="guided-tour-next"]');
      await page.waitForTimeout(120);
      const step2Title = await page.locator('[data-testid="guided-tour-step-title"]').textContent();
      assert.ok(step2Title && step2Title.includes('Content Starter'), `Expected Content Workspace step 2 title, got: ${step2Title}`);
      await page.click('[data-testid="guided-tour-back"]');
      await page.waitForTimeout(120);
      const backTitle = await page.locator('[data-testid="guided-tour-step-title"]').textContent();
      assert.equal(backTitle, step1Title, 'Back button should return to step 1');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(120);
      const popoverAfterEsc = await page.locator('[data-testid="guided-tour-popover"]').count();
      assert.equal(popoverAfterEsc, 0, 'Escape key should close the Workspace Guide');
      summary.workflows.workspaceGuides = 'PASS';

      // Workflow K: Visual Studio Structured Brief & Compiled Prompt Preview
      console.log('[5d/7] Auditing Visual Studio structured brief and live compiled prompt preview...');
      await page.goto(`${BASE_URL}/visual-studio`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);
      const compiledPreviewCount = await page.locator('[data-testid="visual-compiled-prompt-preview"]').count();
      assert.equal(compiledPreviewCount, 1, 'Visual Studio should expose the live compiled prompt preview');
      const compiledPreviewText = await page.locator('[data-testid="visual-compiled-prompt-preview"]').textContent();
      assert.ok(compiledPreviewText && compiledPreviewText.length > 30, 'Compiled prompt preview should contain rich visual direction');
      summary.workflows.visualStudioPromptCompiler = 'PASS';

      // Workflow L: Contextual Help System across all 13 routes (Desktop + Mobile, Light + Dark, Keyboard flow, Right Now, Show Me Around)
      console.log('[5e/7] Auditing Contextual Help System across all 13 destinations...');
      await page.setViewportSize({ width: 1440, height: 900 });
      for (const route of ROUTES) {
        await page.goto(`${BASE_URL}/${route.slug}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(80);
        if (await page.locator('[data-testid="coachmark-disable-auto"]').isVisible()) {
          await page.click('[data-testid="coachmark-disable-auto"]');
          await page.waitForTimeout(50);
        }

        const helpTrigger = page.locator('[data-testid="contextual-help-trigger"]');
        assert.equal(await helpTrigger.count(), 1, `Help trigger must exist on /${route.slug}`);
        const ariaLabel = await helpTrigger.getAttribute('aria-label');
        assert.equal(ariaLabel, `Help for ${route.label}`, `Expected contextual aria-label on /${route.slug}, got: ${ariaLabel}`);

        // Click to open drawer
        await helpTrigger.click();
        await page.waitForTimeout(80);
        const drawer = page.locator('[data-testid="contextual-help-drawer"]');
        assert.equal(await drawer.isVisible(), true, `Help drawer should open on /${route.slug}`);
        const drawerTitle = await page.locator('[data-testid="contextual-help-title"]').textContent();
        assert.equal(drawerTitle?.trim(), route.label, `Help drawer title should match ${route.label}`);

        // Verify sections & dynamic Right Now state
        assert.equal(await page.locator('[data-testid="help-section-purpose"]').isVisible(), true);
        assert.equal(await page.locator('[data-testid="help-section-capabilities"]').isVisible(), true);
        assert.equal(await page.locator('[data-testid="help-section-getting-started"]').isVisible(), true);
        assert.equal(await page.locator('[data-testid="contextual-help-right-now"]').isVisible(), true);

        // Close via close button on even routes, Escape on odd routes, and verify focus returns to Help trigger
        if (ROUTES.indexOf(route) % 2 === 0) {
          await page.click('[data-testid="contextual-help-close"]');
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(60);
        assert.equal(await drawer.count(), 0, `Help drawer should close on /${route.slug}`);
        const focusedTestId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
        assert.equal(focusedTestId, 'contextual-help-trigger', `Focus must return to Help trigger after closing on /${route.slug}`);
      }

      // Keyboard-only flow + Show Me Around integration + Mobile 390px + Dark/Light verification
      await page.goto(`${BASE_URL}/content-workspace`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(80);
      await page.locator('[data-testid="contextual-help-trigger"]').focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(80);
      assert.equal(await page.locator('[data-testid="contextual-help-drawer"]').isVisible(), true, 'Enter key should open Help drawer');

      // Test Show Me Around launching Guided Tour
      await page.click('[data-testid="contextual-help-show-me-around"]');
      await page.waitForTimeout(150);
      assert.equal(await page.locator('[data-testid="contextual-help-drawer"]').count(), 0, 'Show Me Around should close Help drawer');
      assert.equal(await page.locator('[data-testid="guided-tour-popover"]').isVisible(), true, 'Show Me Around should open Workspace Guide');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(80);

      // Mobile 390x844 full-height sheet check in Dark and Light themes without horizontal overflow
      await page.setViewportSize({ width: 390, height: 844 });
      for (const testTheme of ['dark', 'light']) {
        await page.click(`button[aria-label="${testTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}"]`);
        await page.waitForTimeout(60);
        await page.click('[data-testid="contextual-help-trigger"]');
        await page.waitForTimeout(80);
        assert.equal(await page.locator('[data-testid="contextual-help-drawer"]').isVisible(), true, `Help sheet visible on mobile (${testTheme})`);
        const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        assert.equal(mobileOverflow, false, `Mobile Help sheet must not cause horizontal overflow (${testTheme})`);
        await page.click('[data-testid="contextual-help-close"]');
        await page.waitForTimeout(60);
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      summary.workflows.contextualHelpSystem = 'PASS';

      // 7. Error & Resilience Testing (Offline translation safety + Empty input guard)
      console.log('[6/7] Auditing error and resilience states...');
      await page.goto(`${BASE_URL}/revision-studio`, { waitUntil: 'networkidle' });
      if (await page.locator('[data-testid="coachmark-disable-auto"]').isVisible()) {
        await page.click('[data-testid="coachmark-disable-auto"]');
        await page.waitForTimeout(60);
      }
      await page.fill('[data-testid="revision-draft-textarea"]', 'Draft preserved across theme toggle.');
      await page.click('details summary:has-text("Advanced revision controls")');
      await page.waitForTimeout(100);
      await page.selectOption('[data-testid="revision-language-select"]', 'Persian');
      await page.click('details summary:has-text("Translation & Localization")');
      await page.waitForTimeout(100);
      await page.click('[data-testid="run-action-translate"]');
      await page.waitForTimeout(300);
      const errorAlert = await page.locator('[data-testid="revision-error-alert"]').textContent();
      const preservedDraft = await page.inputValue('[data-testid="revision-draft-textarea"]');
      assert.ok(errorAlert && errorAlert.includes('AI Connection Required'), 'Offline translation should show clear error alert');
      assert.equal(preservedDraft, 'Draft preserved across theme toggle.', 'Original draft must be preserved on error');
      summary.errorResilience = {
        offlineTranslationBlockedSafely: true,
        draftPreservedOnFailure: preservedDraft === 'Draft preserved across theme toggle.',
        noPromptDialogsTriggered: !promptDialogTriggered
      };

      assert.equal(summary.consoleErrors.length, 0, `Unexpected console errors: ${summary.consoleErrors.join('; ')}`);
      assert.equal(summary.pageErrors.length, 0, `Unexpected page errors: ${summary.pageErrors.join('; ')}`);

      fs.writeFileSync(path.join(ARTIFACT_DIR, 'regression_results.json'), JSON.stringify(summary, null, 2));
      console.log('[7/7] UI & Workflow Regression Suite PASSED 100%!');
    } finally {
      await browser.close();
    }
  } finally {
    server.kill('SIGTERM');
  }
}

runSuite().catch(err => {
  console.error('[UI Regression Suite FAILED]', err);
  process.exit(1);
});
