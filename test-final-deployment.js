const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing final deployment with CSS fixes...');
  
  try {
    await page.goto('https://crm-pro-plus-79k647acz-arnarssons-projects.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('Page loaded successfully');
    console.log('Title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'final-deployment-test.png', fullPage: true });
    
    // Check for specific elements
    const heading = await page.textContent('h1');
    console.log('Main heading:', heading);
    
    // Check for dark styling
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    console.log('Body styles:', bodyStyles);
    
    // Check for styling
    const headingStyles = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const styles = window.getComputedStyle(h1);
        return {
          background: styles.background,
          backgroundImage: styles.backgroundImage
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
    
    // Check for buttons with styling
    const buttonCount = await page.locator('button, .btn, a[class*="bg-"]').count();
    console.log('Styled buttons/links found:', buttonCount);
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error testing final deployment:', error.message);
    await page.screenshot({ path: 'final-deployment-error.png', fullPage: true });
  }
  
  await browser.close();
})();