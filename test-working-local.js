const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing WORKING local server...');
  
  try {
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('✅ Page loaded successfully');
    console.log('Title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'working-local-test.png', fullPage: true });
    
    // Check for dark theme styling
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: styles.fontFamily
      };
    });
    
    console.log('Body styles:', bodyStyles);
    
    // Check for CRM Pro+ with styling
    const headingInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const styles = window.getComputedStyle(h1);
        return {
          text: h1.textContent,
          background: styles.background,
          backgroundImage: styles.backgroundImage,
          color: styles.color,
          fontSize: styles.fontSize
        };
      }
      return null;
    });
    
    console.log('Heading info:', headingInfo);
    
    // Check for styled buttons
    const buttonInfo = await page.evaluate(() => {
      const buttons = document.querySelectorAll('a, button');
      let styledCount = 0;
      let totalCount = buttons.length;
      
      buttons.forEach(btn => {
        const styles = window.getComputedStyle(btn);
        if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
            styles.border !== '0px none rgb(0, 0, 0)' ||
            btn.className.includes('bg-') ||
            btn.className.includes('btn-')) {
          styledCount++;
        }
      });
      
      return { styled: styledCount, total: totalCount };
    });
    
    console.log('Button styling:', buttonInfo);
    
    // Check if dark theme is working
    const isDarkTheme = bodyStyles.backgroundColor.includes('15, 23, 42') || 
                       bodyStyles.backgroundColor.includes('rgb(15, 23, 42)') ||
                       bodyStyles.backgroundColor === 'rgb(15, 23, 42)';
    
    console.log('Dark theme detected:', isDarkTheme);
    
    if (headingInfo?.text?.includes('CRM Pro+')) {
      console.log('✅ CRM Pro+ branding found');
    } else {
      console.log('❌ CRM Pro+ branding NOT found');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Error testing working local:', error.message);
    await page.screenshot({ path: 'working-local-error.png', fullPage: true });
  }
  
  await browser.close();
})();