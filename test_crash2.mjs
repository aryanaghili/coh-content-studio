import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log("Navigating to app...");
  await page.goto('http://localhost:5174');
  
  // Wait for React to mount
  await page.waitForSelector('.animate-fadeIn', { timeout: 5000 }).catch(() => console.log("Timeout waiting for mount"));

  console.log("Clicking Content Workspace...");
  // Find the button with text "Content Workspace"
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Content Workspace')) {
      await btn.click();
      break;
    }
  }

  // Wait a bit to see if there's an error
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  process.exit(0);
})();
