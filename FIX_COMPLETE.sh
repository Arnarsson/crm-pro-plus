#!/bin/bash

echo "🚀 CRM Pro Plus - Complete Environment Fix"
echo "=========================================="
echo ""

# 1. Stop all Next.js processes
echo "📌 Step 1: Stopping any running Next.js processes..."
pkill -f "next" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
echo "✅ All processes stopped"
echo ""

# 2. Clean all caches
echo "📌 Step 2: Cleaning all caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Caches cleared"
echo ""

# 3. Fix configuration conflicts
echo "📌 Step 3: Fixing configuration conflicts..."
# Remove duplicate next.config.js (keep only next.config.ts)
if [ -f "next.config.js" ] && [ -f "next.config.ts" ]; then
    echo "Found duplicate Next.js configs. Removing next.config.js..."
    rm -f next.config.js
fi
echo "✅ Configuration conflicts resolved"
echo ""

# 4. Create a fresh .env.local file with correct values
echo "📌 Step 4: Ensuring correct environment variables..."
cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wvfscwjzvmdzddomlwvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTg2MjYsImV4cCI6MjA2NTg5NDYyNn0.32CbrHENvYCApu3wZ0rxCtrA0M1vQ3JQiUc87nXlrQE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMxODYyNiwiZXhwIjoyMDY1ODk0NjI2fQ.b6tem9Vj7sD8Gm3k18c29EgzUbSrypr__tfUkaAjrQk
EOF
echo "✅ Environment variables set correctly"
echo ""

# 5. Reinstall dependencies
echo "📌 Step 5: Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install
echo "✅ Dependencies reinstalled"
echo ""

# 6. Test environment variables
echo "📌 Step 6: Testing environment variables..."
node -e "
require('dotenv').config({ path: '.env.local' });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('SUPABASE_URL:', url);
console.log('SUPABASE_KEY:', key ? '✅ Key exists' : '❌ Key missing');
console.log('URL Valid:', url && url.startsWith('https://') ? '✅ Valid URL' : '❌ Invalid URL');
"
echo ""

# 7. Create a test page to verify Supabase connection
echo "📌 Step 7: Creating test page..."
mkdir -p app/test
cat > app/test/page.tsx << 'EOF'
"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [status, setStatus] = useState<string>('Checking...')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function checkSupabase() {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        
        if (error) {
          // If table doesn't exist, that's OK - connection still works
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            setStatus('✅ Supabase connected! (Tables not yet created)')
          } else {
            setStatus('❌ Connection error')
            setError(error.message)
          }
        } else {
          setStatus('✅ Supabase fully connected!')
        }
      } catch (err: any) {
        setStatus('❌ Connection failed')
        setError(err.message || 'Unknown error')
      }
    }

    checkSupabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {status}
        </div>
        {error && (
          <div className="text-red-500">
            <strong>Error:</strong> {error}
          </div>
        )}
        <div className="mt-8 p-4 bg-gray-800 rounded">
          <p className="text-sm text-gray-400">Environment Variables:</p>
          <p className="text-xs">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p className="text-xs">Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  )
}
EOF
echo "✅ Test page created at /test"
echo ""

echo "🎉 Fix Complete!"
echo "==============="
echo ""
echo "📝 Next steps:"
echo "1. Run: npm run dev"
echo "2. Visit: http://localhost:3000/test"
echo "3. You should see '✅ Supabase connected!'"
echo ""
echo "If you still see errors:"
echo "1. Make sure you're in a new terminal window"
echo "2. Run: source ~/.zshrc (or ~/.bashrc)"
echo "3. Try: npm run dev -- --port 3001"
echo ""
echo "The test page will show you exactly what's happening with the connection."
