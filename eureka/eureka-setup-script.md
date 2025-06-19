#!/bin/bash
# EUREKA CRM Complete Setup Script

echo "🚀 Setting up EUREKA CRM with Bright Data MCP..."

# 1. Navigate to project directory
cd /Users/sven/Desktop/MCP/CUSTOM_CRM/crm-pro-plus

# 2. Rename project to EUREKA CRM
echo "📝 Rebranding to EUREKA CRM..."

# Update package.json
sed -i '' 's/"name": "crm-pro-plus"/"name": "eureka-crm"/' package.json

# 3. Install Bright Data MCP dependencies
echo "📦 Installing dependencies..."
npm install @brightdata/mcp d3 @types/d3 openai

# 4. Set up environment variables
echo "🔐 Setting up environment variables..."
cat >> .env.local << EOL

# Bright Data MCP
BRIGHTDATA_API_TOKEN="your-api-token"
BROWSER_ZONE="mcp_browser"

# OpenAI for EUREKA AI Assistant
OPENAI_API_KEY="your-openai-key"

# EUREKA Settings
NEXT_PUBLIC_APP_NAME="EUREKA CRM"
NEXT_PUBLIC_APP_TAGLINE="Your Intelligent Business Assistant"
EOL

# 5. Create new directories
echo "📁 Creating directory structure..."
mkdir -p app/api/relationships
mkdir -p app/api/ai
mkdir -p components/relationships
mkdir -p components/ai
mkdir -p services
mkdir -p lib/ai

# 6. Update database schema
echo "🗄️ Preparing database migration..."
cat > supabase/migrations/eureka_enhancement.sql << 'EOL'
-- EUREKA CRM Enhancement Migration

-- Enhance contacts table for LinkedIn data
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS influence_score INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS connection_count INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Enhance relationships table
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS degree TEXT; -- '1st', '2nd', '3rd'
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS mutual_connections INTEGER DEFAULT 0;

-- Warm paths table for introduction routes
CREATE TABLE IF NOT EXISTS warm_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  to_contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  path_contacts UUID[] NOT NULL,
  path_strength INTEGER CHECK (path_strength BETWEEN 1 AND 10),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, from_contact_id, to_contact_id)
);

-- AI Assistant conversations
CREATE TABLE IF NOT EXISTS eureka_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id TEXT,
  messages JSONB[] DEFAULT '{}',
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT,
  provider TEXT,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  attendees JSONB,
  related_contact_id UUID REFERENCES contacts(id),
  related_deal_id UUID REFERENCES deals(id),
  sync_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  description TEXT,
  data JSONB,
  priority INTEGER,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_influence ON contacts(influence_score DESC);
CREATE INDEX IF NOT EXISTS idx_warm_paths_user ON warm_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_warm_paths_contacts ON warm_paths(from_contact_id, to_contact_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_priority ON insights(user_id, priority DESC);

-- Network statistics function
CREATE OR REPLACE FUNCTION get_network_stats(user_id UUID)
RETURNS TABLE (
  total_contacts INTEGER,
  total_relationships INTEGER,
  avg_influence_score NUMERIC,
  max_influence_score INTEGER,
  total_companies INTEGER,
  degree_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::INTEGER as total_contacts,
    COUNT(DISTINCT r.id)::INTEGER as total_relationships,
    AVG(c.influence_score)::NUMERIC as avg_influence_score,
    MAX(c.influence_score)::INTEGER as max_influence_score,
    COUNT(DISTINCT c.company->>'name')::INTEGER as total_companies,
    jsonb_object_agg(degree_counts.degree, degree_counts.count) as degree_distribution
  FROM contacts c
  LEFT JOIN relationships r ON c.id IN (r.contact_a_id, r.contact_b_id)
  LEFT JOIN LATERAL (
    SELECT r2.degree, COUNT(*) as count
    FROM relationships r2
    WHERE r2.contact_a_id = c.id OR r2.contact_b_id = c.id
    GROUP BY r2.degree
  ) degree_counts ON true
  WHERE c.user_id = get_network_stats.user_id
  GROUP BY degree_counts.degree, degree_counts.count;
END;
$$ LANGUAGE plpgsql;
EOL

echo "✅ Setup complete! Next steps:"
echo "1. Add your Bright Data API token and OpenAI key to .env.local"
echo "2. Run the database migration in Supabase"
echo "3. Continue with the implementation files"
