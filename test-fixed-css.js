const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 TESTING FIXED CSS...');
  
  try {
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    console.log('✅ Page loaded');
    
    // Wait for CSS to fully load
    await page.waitForTimeout(3000);
    
    // Check CSS content again
    const cssCheck = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let tailwindFound = false;
      let totalRules = 0;
      let sampleRules = [];
      
      for (let sheet of sheets) {
        try {
          if (sheet.cssRules) {
            totalRules += sheet.cssRules.length;
            for (let i = 0; i < Math.min(10, sheet.cssRules.length); i++) {
              const rule = sheet.cssRules[i];
              if (rule.selectorText) {
                sampleRules.push(rule.selectorText);
                if (rule.selectorText.includes('.bg-') || 
                    rule.selectorText.includes('.text-') ||
                    rule.selectorText.includes('.card') ||
                    rule.selectorText.includes('slate')) {
                  tailwindFound = true;
                }
              }
            }
          }
        } catch (e) {
          console.log('Sheet error:', e.message);
        }
      }
      
      return { tailwindFound, totalRules, sampleRules };
    });
    
    console.log('🎨 CSS Analysis:', cssCheck);
    
    // Check actual styling
    const styleCheck = await page.evaluate(() => {
      const body = document.body;
      const h1 = document.querySelector('h1');
      
      return {
        bodyBg: getComputedStyle(body).backgroundColor,
        bodyColor: getComputedStyle(body).color,
        h1Background: h1 ? getComputedStyle(h1).background : null,
        h1Classes: h1 ? h1.className : null
      };
    });
    
    console.log('🎨 Element Styling:', styleCheck);
    
    // Check if dark theme is now working
    const isDark = styleCheck.bodyBg.includes('15, 23, 42') || 
                   styleCheck.bodyBg.includes('rgb(15, 23, 42)') ||
                   styleCheck.bodyColor.includes('248, 250, 252');
    
    console.log('🌙 Dark theme working:', isDark);
    
    // Take screenshot
    await page.screenshot({ path: 'fixed-css-test.png', fullPage: true });
    
    if (cssCheck.tailwindFound && cssCheck.totalRules > 100) {
      console.log('🎉 SUCCESS: Tailwind CSS is now working!');
    } else {
      console.log('❌ STILL BROKEN: Tailwind CSS not loading properly');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'fixed-css-error.png', fullPage: true });
  }
  
  await browser.close();
})();