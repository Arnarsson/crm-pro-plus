#!/bin/bash

echo "🔍 CRM Pro Plus - Diagnostic Check"
echo "=================================="
echo ""

# 1. Check if node_modules exists
echo "📌 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    echo "   Total packages: $(ls node_modules | wc -l)"
else
    echo "❌ node_modules missing"
fi
echo ""

# 2. Check environment file
echo "📌 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    # Check if the file contains the placeholder
    if grep -q "your_supabase_url_here" .env.local; then
        echo "❌ ERROR: .env.local contains placeholder values!"
    else
        echo "✅ .env.local has real values"
    fi
else
    echo "❌ .env.local missing"
fi
echo ""

# 3. Check for any .env files
echo "📌 Checking all env files..."
for file in .env .env.local .env.development .env.production; do
    if [ -f "$file" ]; then
        echo "Found: $file"
        grep -E "SUPABASE_URL|your_supabase" "$file" 2>/dev/null || true
    fi
done
echo ""

# 4. Quick test without npm install
echo "📌 Testing current setup..."
echo "Try running the app with existing dependencies:"
echo ""
echo "Option 1: npm run dev"
echo "Option 2: npx next dev"
echo "Option 3: node_modules/.bin/next dev"
echo ""

# 5. If npm is stuck, try yarn
echo "📌 Alternative: Try Yarn instead of NPM"
echo "1. Kill the stuck npm process (Ctrl+C)"
echo "2. Run: npm cache clean --force"
echo "3. Run: npx yarn install"
echo "4. Run: npx yarn dev"
