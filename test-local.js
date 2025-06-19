const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing local development server...');
  
  try {
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('Local page loaded successfully');
    console.log('Title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'local-test.png', fullPage: true });
    
    // Check for specific elements
    const heading = await page.textContent('h1');
    console.log('Main heading:', heading);
    
    // Check for CRM Pro+ branding
    const content = await page.content();
    if (content.includes('CRM Pro+')) {
      console.log('✅ CRM Pro+ branding found');
    } else {
      console.log('❌ CRM Pro+ branding NOT found');
    }
    
    // Check for errors in console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('Error testing local:', error.message);
    await page.screenshot({ path: 'local-error.png', fullPage: true });
  }
  
  await browser.close();
})();