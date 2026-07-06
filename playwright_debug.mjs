import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  
  const buttons = await page.$$('button');
  console.log("Buttons found:", buttons.length);
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    console.log("BTN TEXT:", JSON.stringify(text));
  }
  
  await browser.close();
  process.exit(0);
})();
