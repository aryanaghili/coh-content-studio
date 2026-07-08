import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('PAGE ERROR:', msg.text());
    else console.log('PAGE LOG:', msg.text());
  });
  
  page.on('pageerror', err => {
    console.error('PAGE EXCEPTION:', err.message);
  });

  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Check Calendar tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const calTab = tabs.find(t => t.textContent.includes('Editorial Calendar'));
      if (calTab) calTab.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Generate Calendar
    await page.evaluate(() => {
      // Find button by text exactly, considering newlines
      const buttons = Array.from(document.querySelectorAll('button'));
      const genBtn = buttons.find(t => t.textContent.replace(/\s+/g, ' ').includes('Generate Monthly Calendar'));
      if (genBtn) {
        console.log('Found Generate button, clicking...');
        genBtn.click();
      } else {
        console.error('Generate button NOT FOUND');
      }
    });

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: '/Users/aryanaghili/Documents/coh-content-studio/screenshot-generated-real.png' });

    console.log('Screenshots saved.');
  } catch (err) {
    console.error('Error:', err);
  }
  
  await browser.close();
})();
