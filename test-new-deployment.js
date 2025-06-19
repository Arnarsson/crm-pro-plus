const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing new public deployment...');
  
  try {
    await page.goto('https://crm-pro-plus-gvnkrdnwz-arnarssons-projects.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('Page loaded successfully');
    console.log('Title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'new-deployment-test.png', fullPage: true });
    
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
    
    // Check for login buttons
    const signupButton = await page.locator('text=Create Account').count();
    const loginButton = await page.locator('text=Sign In').count();
    
    console.log('Signup button found:', signupButton > 0);
    console.log('Login button found:', loginButton > 0);
    
    // Check for errors in console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text());
      }
    });
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error testing new deployment:', error.message);
    await page.screenshot({ path: 'new-deployment-error.png', fullPage: true });
  }
  
  await browser.close();
})();