#!/bin/bash

echo "🔧 Fixing CRM Pro Plus dependency issue..."

cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus

# Install missing dependency
echo "📦 Installing @tailwindcss/postcss..."
npm install @tailwindcss/postcss --save-dev

# Install any other missing dependencies
echo "📦 Installing all dependencies..."
npm install

# Kill any existing Node processes on port 3001
echo "🛑 Stopping any existing servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start the server
echo "🚀 Starting CRM Pro Plus..."
npm run dev -- --port 3001
