#!/bin/bash

echo "🔍 Finding 'your_supabase_url_here' in the project..."
echo "===================================================="
echo ""

# Search in all files (excluding node_modules and .next)
echo "Searching in source files..."
grep -r "your_supabase_url_here" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git 2>/dev/null || echo "Not found in source files"

echo ""
echo "Searching in .next build folder..."
grep -r "your_supabase_url_here" .next 2>/dev/null | head -5 || echo "Not found in .next"

echo ""
echo "Checking all environment-related files..."
for file in $(find . -name "*.env*" -type f 2>/dev/null | grep -v node_modules); do
    echo "Checking: $file"
    grep -H "your_supabase_url_here\|SUPABASE_URL" "$file" 2>/dev/null || true
done

echo ""
echo "🎯 Quick Solution:"
echo "=================="
echo "1. Press Ctrl+C to stop the stuck npm install"
echo "2. Run: chmod +x QUICK_FIX.sh && ./QUICK_FIX.sh"
echo "3. Open a NEW terminal window"
echo "4. cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus"
echo "5. npx next dev --port 3001"
