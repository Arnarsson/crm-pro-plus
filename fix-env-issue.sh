#!/bin/bash

echo "🔧 Fixing CRM Pro Plus Environment Issue"
echo "========================================"

# Kill any running Next.js processes
echo "1. Stopping any running Next.js processes..."
pkill -f "next dev" || true

# Remove Next.js cache
echo "2. Clearing Next.js cache..."
rm -rf .next

# Remove node_modules and reinstall (optional but sometimes helps)
echo "3. Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Remove the duplicate next.config.js (keep only next.config.ts)
echo "4. Removing duplicate next.config.js..."
rm -f next.config.js

# Double-check environment variables
echo "5. Verifying environment variables..."
if [ -f .env.local ]; then
    echo "✅ .env.local exists with:"
    grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | head -1
    grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | head -1
else
    echo "❌ .env.local not found!"
fi

echo ""
echo "6. Starting development server..."
echo "Run: npm run dev"
echo ""
echo "If the issue persists, try:"
echo "1. Close all terminal windows"
echo "2. Open a new terminal"
echo "3. Run: source ~/.zshrc (or ~/.bashrc)"
echo "4. Run: npm run dev"
