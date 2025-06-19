#!/bin/bash

echo "🔧 FIXING CRM PRO PLUS - COMPLETE SOLUTION"
echo "========================================="

# Navigate to project directory
cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus

# Kill any existing process on port 3001
echo "🛑 Stopping any existing servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Clean Next.js cache completely
echo "🧹 Cleaning Next.js cache and build files..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel

# Fix PostCSS configuration
echo "📝 Fixing PostCSS configuration..."
cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

cat > postcss.config.mjs << 'EOL'
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
EOL

# Remove the incorrect config if it exists
rm -f postcss.config 2>/dev/null

# Ensure all dependencies are installed
echo "📦 Installing dependencies..."
npm install tailwindcss autoprefixer postcss --save-dev
npm install

# Clear npm cache just in case
echo "🧹 Clearing npm cache..."
npm cache clean --force

echo "✅ All fixes applied!"
echo ""
echo "========================================="
echo "  Starting CRM Pro Plus on port 3001"
echo "  http://localhost:3001"
echo "========================================="
echo ""

# Start the dev server
npm run dev -- --port 3001
