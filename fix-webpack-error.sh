#!/bin/bash

echo "🔧 CRM Pro Plus - Webpack Error Fix"
echo "===================================="
echo ""

cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus

# 1. Stop the server
echo "📌 Step 1: Stopping the server..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "next dev" || true
echo "✅ Server stopped"
echo ""

# 2. Clean everything
echo "📌 Step 2: Deep cleaning all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
echo "✅ Caches cleared"
echo ""

# 3. Fix package.json to use compatible versions
echo "📌 Step 3: Fixing package versions..."
cat > package.json << 'EOF'
{
  "name": "crm-pro-plus",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@headlessui/react": "^2.2.4",
    "@hello-pangea/dnd": "^18.0.1",
    "@heroicons/react": "^2.2.0",
    "@hookform/resolvers": "^5.1.1",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-toast": "^1.2.14",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.50.0",
    "@tanstack/react-query": "^5.80.7",
    "chart.js": "^4.5.0",
    "framer-motion": "^12.18.1",
    "lucide-react": "^0.518.0",
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.58.1",
    "zod": "^3.25.67",
    "zustand": "^5.0.5"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.21",
    "eslint": "^8",
    "eslint-config-next": "14.2.3",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.0",
    "typescript": "^5"
  }
}
EOF
echo "✅ Package versions fixed (using Next.js 14.2.3 and React 18)"
echo ""

# 4. Clean and reinstall
echo "📌 Step 4: Clean reinstall of dependencies..."
rm -rf node_modules package-lock.json
npm install
echo "✅ Dependencies reinstalled"
echo ""

# 5. Create a simpler test page first
echo "📌 Step 5: Creating test page..."
mkdir -p app/test
cat > app/test/page.tsx << 'EOF'
export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">CRM Pro Plus - Test Page</h1>
      <p className="text-slate-300">If you can see this, the app is working!</p>
      <div className="mt-8">
        <a href="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
EOF
echo "✅ Test page created"
echo ""

echo "🎉 Fix Complete!"
echo "==============="
echo ""
echo "Now run:"
echo "npm run dev -- --port 3001"
echo ""
echo "Then visit:"
echo "1. http://localhost:3001/test (to verify it's working)"
echo "2. http://localhost:3001/dashboard (your actual dashboard)"
