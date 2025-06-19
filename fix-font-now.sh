#!/bin/bash
cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus
pkill -f "next dev" 2>/dev/null || true
sed -i '' 's/Geist/Inter/g' app/layout.tsx
sed -i '' "s/from 'next\/font\/local'/from 'next\/font\/google'/g" app/layout.tsx
rm -rf .next/cache
echo "✅ Fixed! Using Inter font now"
npm run dev -- --port 3001
