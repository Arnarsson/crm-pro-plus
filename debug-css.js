const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 DEBUGGING CSS LOADING ISSUES...');
  
  try {
    // Navigate to local app
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('✅ Page loaded');
    
    // Check what CSS files are actually loaded
    const cssFiles = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.map(link => ({
        href: link.href,
        loaded: !link.sheet || link.sheet.cssRules.length > 0
      }));
    });
    
    console.log('📄 CSS files loaded:', cssFiles);
    
    // Check if Tailwind classes exist in any stylesheet
    const tailwindCheck = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let foundTailwind = false;
      let ruleCount = 0;
      
      try {
        for (let sheet of sheets) {
          if (sheet.cssRules) {
            ruleCount += sheet.cssRules.length;
            for (let rule of sheet.cssRules) {
              if (rule.selectorText && (
                rule.selectorText.includes('.bg-slate') ||
                rule.selectorText.includes('.text-slate') ||
                rule.selectorText.includes('.card') ||
                rule.selectorText.includes('text-gradient')
              )) {
                foundTailwind = true;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.log('Error reading stylesheets:', e.message);
      }
      
      return { foundTailwind, totalRules: ruleCount, totalSheets: sheets.length };
    });
    
    console.log('🎨 Tailwind check:', tailwindCheck);
    
    // Check specific elements that should be styled
    const elementCheck = await page.evaluate(() => {
      const body = document.body;
      const h1 = document.querySelector('h1');
      const buttons = document.querySelectorAll('a, button');
      
      return {
        body: {
          classes: body.className,
          computedBg: getComputedStyle(body).backgroundColor,
          computedColor: getComputedStyle(body).color
        },
        h1: h1 ? {
          classes: h1.className,
          computedBg: getComputedStyle(h1).background,
          text: h1.textContent
        } : null,
        buttonCount: buttons.length,
        firstButtonClasses: buttons[0] ? buttons[0].className : null
      };
    });
    
    console.log('🔍 Element styling:', elementCheck);
    
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Check network requests for CSS
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('.css') || request.url().includes('tailwind')) {
        networkRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('.css')) {
        console.log(`📡 CSS Response: ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    // Wait a bit more and recheck
    await page.waitForTimeout(3000);
    
    console.log('🚨 Console errors:', consoleErrors);
    console.log('🌐 CSS network requests:', networkRequests);
    
    // Take screenshot for visual debugging
    await page.screenshot({ path: 'css-debug.png', fullPage: true });
    
    // Check the actual HTML source
    const htmlSource = await page.content();
    const hasStyleTags = htmlSource.includes('<style') || htmlSource.includes('tailwind');
    const hasCardClass = htmlSource.includes('class="card"');
    const hasBgClasses = htmlSource.includes('bg-slate') || htmlSource.includes('bg-indigo');
    
    console.log('📝 HTML source check:', {
      hasStyleTags,
      hasCardClass,
      hasBgClasses,
      sourceLength: htmlSource.length
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
  
  await browser.close();
})();