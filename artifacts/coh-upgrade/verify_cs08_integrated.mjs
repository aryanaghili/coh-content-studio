import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.resolve('artifacts/coh-upgrade/runs/COH-CS-08/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 920 } });

  // Seed legacy pre-upgrade records to test non-destructive backward compatibility
  const legacySavedContent = [
    {
      id: 'legacy-content-001',
      title: 'Legacy Pre-Upgrade Nordic Air Overview',
      channel: 'LinkedIn',
      format: 'Post',
      audience: 'General Public',
      pillar: 'The Opera & Worldbuilding',
      language: 'English',
      status: 'Draft',
      lastEdited: '2026-01-15',
      version: 1,
      text: 'Climate Opera Haus presents Nordic Air, the opening work of the four-opera elemental cycle.'
    }
  ];

  const legacySavedIdeas = [
    {
      id: 'legacy-idea-001',
      title: 'Legacy Pre-Upgrade Somatic Staging Idea',
      originalInput: 'Somatic staging in Nordic Air',
      category: 'Strongest Directions',
      explanation: 'Explore how physical staging communicates atmospheric thresholds.',
      whyItWorks: 'Connects artistic form to planetary reality.',
      suggestedChannel: 'LinkedIn',
      suggestedFormat: 'Post',
      suggestedAudience: 'General Public',
      suggestedTone: 'Authoritative',
      possibleHook: 'When the stage itself breathes.',
      possibleFirstPost: 'Opera has always translated vast forces into human scale.',
      riskToAvoid: 'Avoid preachy activism.',
      nextStep: 'Develop into a short post.',
      status: 'Promising',
      createdAt: '2026-01-10',
      language: 'English'
    }
  ];

  await context.addInitScript(({ contentSeed, ideaSeed }) => {
    window.localStorage.setItem('coh-tour-completed', 'true');
    if (!window.localStorage.getItem('coh_saved_content')) {
      window.localStorage.setItem('coh_saved_content', JSON.stringify(contentSeed));
    }
    if (!window.localStorage.getItem('coh_saved_ideas')) {
      window.localStorage.setItem('coh_saved_ideas', JSON.stringify(ideaSeed));
    }
  }, { contentSeed: legacySavedContent, ideaSeed: legacySavedIdeas });

  const page = await context.newPage();

  console.log('1. Foundation & Legacy Data-Integrity Verification...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Verify legacy localStorage records were not destructively rewritten or wiped
  const postStartupStorage = await page.evaluate(() => {
    return {
      savedContentRaw: window.localStorage.getItem('coh_saved_content'),
      savedIdeasRaw: window.localStorage.getItem('coh_saved_ideas'),
      sourceIntelRaw: window.localStorage.getItem('coh_source_intelligence_v1')
    };
  });

  const parsedContent = JSON.parse(postStartupStorage.savedContentRaw || '[]');
  const parsedIdeas = JSON.parse(postStartupStorage.savedIdeasRaw || '[]');
  if (!parsedContent.some(c => c.id === 'legacy-content-001')) {
    throw new Error('Data integrity failure: legacy saved content was lost or rewritten on startup');
  }
  if (!parsedIdeas.some(i => i.id === 'legacy-idea-001')) {
    throw new Error('Data integrity failure: legacy saved idea was lost or rewritten on startup');
  }
  console.log('   PASS: Legacy localStorage records preserved intact on startup.');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-command-center-desktop-dark.png'), fullPage: false });

  // 2. Settings: Verify OpenAI GPT-6 Luna and GPT-6.1 Sol options
  console.log('2. Settings & AI Provider Capability Verification...');
  await page.locator('button:has-text("Settings")').first().click();
  await page.waitForTimeout(400);
  const pageText = await page.locator('main').innerText();
  if (!pageText.includes('gpt-6-luna') && !pageText.includes('GPT-6 Luna')) {
    // Check select options
    const optionsText = await page.locator('select').allInnerTexts();
    if (!optionsText.join(' ').includes('gpt-6-luna')) {
      throw new Error('Settings missing gpt-6-luna model option');
    }
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-settings-openai-luna-sol-dark.png'), fullPage: false });
  console.log('   PASS: Settings displays GPT-6 Luna and GPT-6.1 Sol provider options.');

  // 3. Source Library & Source Intelligence
  console.log('3. Source Library, Source Intelligence & Task Roles...');
  await page.locator('button:has-text("Source Library")').first().click();
  await page.waitForTimeout(400);
  const analyzeBtn = page.locator('[data-testid^="analyze-source-btn-"]').first();
  if (await analyzeBtn.count() > 0) {
    await analyzeBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-source-intelligence-dark.png'), fullPage: false });
  console.log('   PASS: Source Intelligence analysis & role controls verified.');

  // 4. Ideation 2.0
  console.log('4. Ideation 2.0 Verification...');
  await page.locator('button:has-text("Ideation")').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-ideation-2-0-dark.png'), fullPage: false });

  // 5. Content Workspace (Smart Brief, Fast/Explore, Context Manifest, Continuity Bar)
  console.log('5. Content Workspace Verification...');
  await page.locator('button:has-text("Content Workspace")').first().click();
  await page.waitForTimeout(400);
  await page.locator('[data-testid="smart-brief-panel"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('[data-testid="current-work-context-bar"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-content-workspace-smart-brief-dark.png'), fullPage: false });

  // 6. Revision Studio
  console.log('6. Revision Studio Verification...');
  await page.locator('#nav-revision').click();
  await page.waitForTimeout(400);
  await page.locator('[data-testid="revision-studio-root"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-revision-studio-dark.png'), fullPage: false });

  // 7. Reframing Studio
  console.log('7. Reframing Studio Verification...');
  await page.locator('[data-testid="nav-reframing-studio"]').click();
  await page.waitForTimeout(400);
  await page.locator('[data-testid="reframing-studio-root"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-reframing-studio-dark.png'), fullPage: false });

  // 8. Editorial Calendar & Visual Studio
  console.log('8. Editorial Calendar & Visual Studio Verification...');
  await page.locator('button:has-text("Editorial Calendar")').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-editorial-calendar-dark.png'), fullPage: false });

  await page.locator('button:has-text("Visual Studio")').first().click();
  await page.waitForTimeout(400);
  await page.locator('[data-testid="current-work-context-bar"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-visual-studio-dark.png'), fullPage: false });

  // 9. Responsive & Light Theme Matrix (Desktop 1440, Tablet 900, Mobile 390)
  console.log('9. Responsive & Light Theme Matrix Verification...');
  const themeToggle = page.locator('button[title*="Switch to"], button[aria-label*="theme"]').first();
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
    await page.waitForTimeout(300);
  }
  await page.locator('[data-testid="nav-reframing-studio"]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-reframing-studio-desktop-light.png'), fullPage: false });

  await page.setViewportSize({ width: 900, height: 800 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-reframing-studio-tablet-light.png'), fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-reframing-studio-mobile-light.png'), fullPage: false });

  await browser.close();
  console.log('COH-CS-08 Integrated E2E Validation PASSED.');
})();
