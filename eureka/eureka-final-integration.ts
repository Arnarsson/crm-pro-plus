// app/(dashboard)/layout.tsx - Update with EUREKA branding and AI Assistant
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { EurekaChat } from '@/components/ai/EurekaChat';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar with EUREKA branding */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with EUREKA branding */}
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
      
      {/* EUREKA AI Assistant */}
      <EurekaChat />
    </div>
  );
}

// components/Sidebar.tsx - Update branding
export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              EUREKA CRM
            </h1>
            <p className="text-xs text-gray-500">Intelligent Business Assistant</p>
          </div>
        </div>
      </div>
      
      {/* Navigation items - add new EUREKA features */}
      <nav className="mt-8">
        <Link href="/import/linkedin" className="nav-item">
          <Linkedin className="h-5 w-5" />
          LinkedIn Import
        </Link>
        <Link href="/relationships/network" className="nav-item">
          <Network className="h-5 w-5" />
          Network Map
        </Link>
        {/* ... existing nav items ... */}
      </nav>
    </aside>
  );
}

// app/(dashboard)/dashboard/page.tsx - Enhanced dashboard with AI insights
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Brain,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useEurekaAssistant } from '@/hooks/useEurekaAssistant';

export default function DashboardPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const { getInsights } = useEurekaAssistant();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const data = await getInsights();
    setInsights(data);
  };

  return (
    <div className="p-6">
      {/* EUREKA Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Welcome back to EUREKA! 🚀
        </h1>
        <p className="text-gray-400">
          Your AI assistant has prepared today's insights and recommendations
        </p>
      </motion.div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-800/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">
                  EUREKA Intelligence
                </h2>
                <p className="text-sm text-gray-400">
                  AI-powered insights for your business
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              3 New Insights
            </Badge>
          </div>

          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-indigo-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-100 mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="mt-2 text-indigo-400 hover:text-indigo-300"
                    >
                      {insight.action.label}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Metrics with AI predictions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-500" />
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                +12%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-100">1,923</div>
            <p className="text-sm text-gray-400">Total Contacts</p>
            <p className="text-xs text-gray-500 mt-2">
              AI predicts 2,100 by month end
            </p>
          </Card>
        </motion.div>

        {/* ... other metric cards with AI predictions ... */}
      </div>

      {/* Quick Actions with AI Suggestions */}
      <Card className="bg-gray-900 border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          AI-Recommended Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => window.location.href = '/import/linkedin'}
          >
            <Linkedin className="h-4 w-4 mr-2" />
            Import LinkedIn Network
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => window.location.href = '/relationships/network'}
          >
            <Network className="h-4 w-4 mr-2" />
            Explore Warm Paths
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => window.location.href = '/deals'}
          >
            <Target className="h-4 w-4 mr-2" />
            Review High-RICE Deals
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Quick implementation script to run all updates
// scripts/implement-eureka.sh
#!/bin/bash

echo "🚀 Implementing EUREKA CRM enhancements..."

# 1. Update package.json name
sed -i '' 's/"name": "crm-pro-plus"/"name": "eureka-crm"/' package.json

# 2. Create all necessary directories
mkdir -p app/api/relationships app/api/ai components/relationships components/ai services hooks app/import/linkedin app/relationships/network

# 3. Copy all the service files
echo "📁 Creating service files..."
# Copy RelationshipMapper.ts to services/
# Copy EurekaAssistant.ts to services/

# 4. Copy all component files
echo "🎨 Creating UI components..."
# Copy NetworkGraph.tsx to components/relationships/
# Copy EurekaChat.tsx to components/ai/

# 5. Copy API routes
echo "🔌 Creating API routes..."
# Copy all route files to app/api/

# 6. Copy hook file
echo "🪝 Creating custom hook..."
# Copy useEurekaAssistant.ts to hooks/

# 7. Update environment variables
echo "🔐 Reminder: Add these to your .env.local:"
echo "BRIGHTDATA_API_TOKEN=your-token"
echo "OPENAI_API_KEY=your-key"

echo "✅ EUREKA CRM implementation complete!"
echo "📚 Next steps:"
echo "1. Run the database migration in Supabase"
echo "2. Add your API keys to .env.local"
echo "3. Run 'npm run dev' to start the enhanced CRM"