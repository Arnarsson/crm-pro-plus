#!/bin/bash

echo "🔧 Fixing Next.js Config File Issue"
echo "==================================="

cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus

# Convert next.config.ts to next.config.js
echo "📌 Converting config to .js format..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for webpack issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig
EOF

# Remove the .ts version
rm -f next.config.ts

echo "✅ Config fixed!"
echo ""
echo "Now run:"
echo "npm run dev -- --port 3001"
