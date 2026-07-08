import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('PAGE ERROR:', msg.text());
    else console.log('PAGE LOG:', msg.text());
  });
  
  page.on('pageerror', err => {
    console.error('PAGE EXCEPTION:', err.message);
  });

  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 10000 });
    
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const calTab = tabs.find(t => t.textContent.includes('Editorial Calendar'));
      if (calTab) calTab.click();
    });
    
    // Wait for render
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const genBtn = buttons.find(t => t.textContent.includes('Generate Calendar'));
      if (genBtn) genBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    // Try Export
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      const expSelect = selects.find(s => s.textContent.includes('Export Planning CSV'));
      if (expSelect) {
        expSelect.value = 'planning-csv';
        expSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await new Promise(r => setTimeout(r, 1000));
    console.log('Script completed.');
  } catch (err) {
    console.error('Error loading page:', err);
  }
  
  await browser.close();
})();
