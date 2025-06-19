const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing latest deployment...');
  
  try {
    await page.goto('https://crm-pro-plus-5eyr0sskt-arnarssons-projects.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('Page loaded successfully');
    console.log('Title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'deployment-test.png', fullPage: true });
    
    // Check for specific elements
    const heading = await page.textContent('h1');
    console.log('Main heading:', heading);
    
    // Check for errors in console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text());
      }
    });
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error testing deployment:', error.message);
    await page.screenshot({ path: 'deployment-error.png', fullPage: true });
  }
  
  await browser.close();
})();