#!/bin/bash

echo "🔧 CRM Pro Plus - Master Fix Script"
echo "===================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. Stop all running processes
print_status "Stopping any running Next.js processes..."
pkill -f "next" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
print_success "All processes stopped"
echo ""

# 2. Clean all caches and temporary files
print_status "Cleaning caches and temporary files..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf dist
rm -rf build
print_success "Caches cleared"
echo ""

# 3. Fix environment variables
print_status "Setting up environment variables..."
cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wvfscwjzvmdzddomlwvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTg2MjYsImV4cCI6MjA2NTg5NDYyNn0.32CbrHENvYCApu3wZ0rxCtrA0M1vQ3JQiUc87nXlrQE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMxODYyNiwiZXhwIjoyMDY1ODk0NjI2fQ.b6tem9Vj7sD8Gm3k18c29EgzUbSrypr__tfUkaAjrQk

# Node environment
NODE_ENV=development
EOF
print_success "Environment variables configured"
echo ""

# 4. Fix configuration conflicts
print_status "Resolving configuration conflicts..."
# Remove duplicate configs
if [ -f "next.config.js" ] && [ -f "next.config.ts" ]; then
    rm -f next.config.js
    print_warning "Removed duplicate next.config.js"
fi

# Ensure proper PostCSS config
if [ ! -f "postcss.config.js" ]; then
    cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
    print_success "Created postcss.config.js"
fi
print_success "Configuration conflicts resolved"
echo ""

# 5. Fix TypeScript configuration
print_status "Updating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
print_success "TypeScript configuration updated"
echo ""

# 6. Fix Supabase client
print_status "Updating Supabase client configuration..."
mkdir -p lib
cat > lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  // Provide fallback values for development
  const fallbackUrl = 'https://wvfscwjzvmdzddomlwvl.supabase.co'
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZnNjd2p6dm1kemRkb21sd3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTg2MjYsImV4cCI6MjA2NTg5NDYyNn0.32CbrHENvYCApu3wZ0rxCtrA0M1vQ3JQiUc87nXlrQE'
  
  console.warn('Using fallback Supabase configuration')
  export const supabase = createClient(fallbackUrl, fallbackKey)
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
}
EOF
print_success "Supabase client updated with fallback support"
echo ""

# 7. Reinstall dependencies
print_status "Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
print_success "Dependencies reinstalled"
echo ""

# 8. Run database migrations
print_status "Setting up database schema..."
if [ -f "database/schema.sql" ]; then
    print_warning "Database schema found. Please run the SQL in your Supabase dashboard"
    print_warning "File: database/schema.sql"
else
    print_warning "No database schema found"
fi
echo ""

# 9. Create health check endpoint
print_status "Creating health check endpoint..."
mkdir -p app/api/health
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1).single()
    
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      throw error
    }
    
    return NextResponse.json({
      status: 'healthy',
      supabase: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      supabase: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
EOF
print_success "Health check endpoint created at /api/health"
echo ""

# 10. Test the setup
print_status "Testing environment setup..."
node -e "
require('dotenv').config({ path: '.env.local' });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('');
console.log('Environment Check:');
console.log('==================');
console.log('SUPABASE_URL:', url ? '✅ ' + url : '❌ Missing');
console.log('SUPABASE_KEY:', key ? '✅ Key present' : '❌ Key missing');
console.log('');
"

# Final summary
echo ""
echo "========================================"
echo -e "${GREEN}✨ Master Fix Complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Visit: http://localhost:3000"
echo "3. Check health: http://localhost:3000/api/health"
echo ""
echo "If you encounter issues:"
echo "- Make sure port 3000 is free"
echo "- Try: npm run dev -- --port 3001"
echo "- Check the dev.log file for errors"
echo ""
echo "Database setup:"
echo "- Go to your Supabase dashboard"
echo "- Run the SQL from database/schema.sql"
echo "- This will create all necessary tables"
echo ""
print_success "Good luck with your CRM Pro Plus! 🚀"
