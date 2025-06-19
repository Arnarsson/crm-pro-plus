#!/bin/bash

echo "🔧 Fixing CRM Pro Plus Next.js Setup..."

# Navigate to project directory
cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus

# Clean any cache issues
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Ensure node_modules are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Verify next.config.js exists (it already does)
if [ ! -f "next.config.js" ]; then
    echo "❌ Error: next.config.js not found!"
    exit 1
fi

# Create a proper .env.local if missing
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOL'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOL
    echo "⚠️  Please update .env.local with your Supabase credentials!"
fi

echo "✅ Configuration verified!"
echo "🚀 Starting development server on port 3001..."
echo ""
echo "========================================="
echo "  CRM Pro Plus starting on port 3001"
echo "  http://localhost:3001"
echo "========================================="
echo ""

# Start the dev server on port 3001
npm run dev -- --port 3001
