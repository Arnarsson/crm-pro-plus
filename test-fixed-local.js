const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing fixed local server...');
  
  try {
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('Local page loaded successfully');
    console.log('Title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'fixed-local-test.png', fullPage: true });
    
    // Check for specific elements
    const heading = await page.textContent('h1');
    console.log('Main heading:', heading);
    
    // Check for styling
    const headingStyles = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const styles = window.getComputedStyle(h1);
        return {
          color: styles.color,
          background: styles.background,
          fontSize: styles.fontSize
        };
      }
      return null;
    });
    
    console.log('Heading styles:', headingStyles);
    
    // Check for CRM Pro+ branding
    const content = await page.content();
    if (content.includes('CRM Pro+')) {
      console.log('✅ CRM Pro+ branding found');
    } else {
      console.log('❌ CRM Pro+ branding NOT found');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('Error testing fixed local:', error.message);
    await page.screenshot({ path: 'fixed-local-error.png', fullPage: true });
  }
  
  await browser.close();
})();