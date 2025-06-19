#!/bin/bash

echo "🚀 CRM Pro Plus - Quick Fix (No Reinstall)"
echo "=========================================="
echo ""

# 1. Stop all Next.js processes
echo "📌 Stopping any running processes..."
pkill -f "next" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
echo "✅ Done"

# 2. Clean Next.js cache only
echo "📌 Cleaning Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"

# 3. Remove duplicate config
echo "📌 Fixing config..."
rm -f next.config.js
echo "✅ Config fixed"

# 4. Ensure .env.local is correct
echo "📌 Checking environment..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | head -1
else
    echo "❌ Creating .env.local..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://wvfscwjzvmdzddomlwvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTg2MjYsImV4cCI6MjA2NTg5NDYyNn0.32CbrHENvYCApu3wZ0rxCtrA0M1vQ3JQiUc87nXlrQE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMxODYyNiwiZXhwIjoyMDY1ODk0NjI2fQ.b6tem9Vj7sD8Gm3k18c29EgzUbSrypr__tfUkaAjrQk
EOF
fi

echo ""
echo "✅ Quick fix complete!"
echo ""
echo "Now try:"
echo "1. Open a NEW terminal window"
echo "2. cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus"
echo "3. npm run dev"
echo ""
echo "If npm run dev fails, try:"
echo "npm run dev -- --port 3001"
