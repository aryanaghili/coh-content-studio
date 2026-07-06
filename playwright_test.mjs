import { chromium } from 'playwright';

(async () => {
  console.log("Launching playwright...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => {
    console.log('--- BROWSER ERROR CAUGHT ---');
    console.log(error.message);
    console.log(error.stack);
  });

  console.log("Navigating to app...");
  await page.goto('http://localhost:5173');
  
  try {
    await page.waitForSelector('.animate-fadeIn', { timeout: 5000 });
  } catch(e) {
    console.log("Timeout waiting for mount");
  }

  console.log("Clicking Content Workspace...");
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Content Workspace')) {
      await btn.click();
      console.log("Clicked!");
      break;
    }
  }

  // Wait a bit to see if there's an error
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  process.exit(0);
})();
