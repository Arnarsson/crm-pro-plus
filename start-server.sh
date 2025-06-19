#!/bin/bash

echo "🚀 Starting CRM Pro Plus Development Server"
echo "=========================================="
echo ""

cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus

# First, make sure we have the right environment
echo "📌 Setting up environment..."
cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wvfscwjzvmdzddomlwvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTg2MjYsImV4cCI6MjA2NTg5NDYyNn0.32CbrHENvYCApu3wZ0rxCtrA0M1vQ3JQiUc87nXlrQE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMxODYyNiwiZXhwIjoyMDY1ODk0NjI2fQ.b6tem9Vj7sD8Gm3k18c29EgzUbSrypr__tfUkaAjrQk
EOF

# Clear Next.js cache
echo "📌 Clearing cache..."
rm -rf .next

# Remove duplicate config
rm -f next.config.js

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📌 Installing dependencies (this may take a few minutes)..."
    npm install
fi

echo ""
echo "📌 Starting development server on port 3001..."
echo ""
echo "Server will start at: http://localhost:3001"
echo "Dashboard will be at: http://localhost:3001/dashboard"
echo ""

# Start the server on port 3001
npm run dev -- --port 3001
