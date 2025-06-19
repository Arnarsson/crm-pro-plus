'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Network, 
  Filter, 
  Search,
  Users,
  Building,
  Target,
  Sparkles,
  Download,
  Maximize2
} from 'lucide-react';

// Mock data for demonstration
const generateMockNetwork = () => {
  const nodes = [
    { id: '1', name: 'You', position: [0, 0, 0] as [number, number, number], influence: 100, type: 'self' as const, connectionCount: 150 },
    { id: '2', name: 'Sarah Chen', position: [3, 2, 1] as [number, number, number], influence: 85, type: 'contact' as const, connectionCount: 120 },
    { id: '3', name: 'Michael Johnson', position: [-2, 1, 2] as [number, number, number], influence: 75, type: 'contact' as const, connectionCount: 98 },
    { id: '4', name: 'TechCorp Inc', position: [1, -3, 0] as [number, number, number], influence: 90, type: 'company' as const, connectionCount: 0 },
    { id: '5', name: 'Emma Wilson', position: [-3, -1, 1] as [number, number, number], influence: 60, type: 'contact' as const, connectionCount: 76 },
    { id: '6', name: 'Deal: Enterprise SaaS', position: [2, 2, -2] as [number, number, number], influence: 70, type: 'opportunity' as const, connectionCount: 0 },
    { id: '7', name: 'David Park', position: [0, 3, 2] as [number, number, number], influence: 65, type: 'contact' as const, connectionCount: 89 },
    { id: '8', name: 'Innovation Labs', position: [-2, -2, -1] as [number, number, number], influence: 80, type: 'company' as const, connectionCount: 0 },
  ];

  const edges = [
    { source: '1', target: '2', strength: 0.9, type: 'direct' as const },
    { source: '1', target: '3', strength: 0.8, type: 'direct' as const },
    { source: '1', target: '5', strength: 0.7, type: 'direct' as const },
    { source: '2', target: '4', strength: 0.6, type: 'mutual' as const },
    { source: '2', target: '6', strength: 0.8, type: 'direct' as const },
    { source: '3', target: '7', strength: 0.5, type: 'mutual' as const },
    { source: '5', target: '8', strength: 0.7, type: 'direct' as const },
    { source: '7', target: '4', strength: 0.4, type: 'weak' as const },
  ];

  return { nodes, edges };
};

const NetworkGraph = dynamic(() => import('@/components/relationships/NetworkGraph'), { ssr: false });

export default function NetworkVisualizationPage() {
  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'contacts' | 'companies' | 'opportunities'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // In production, fetch real data from API
    const data = generateMockNetwork();
    setNetworkData(data);
  }, []);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node.id);
    // You can add more actions here like showing details panel
  };

  const stats = {
    totalContacts: networkData.nodes.filter(n => n.type === 'contact').length,
    totalCompanies: networkData.nodes.filter(n => n.type === 'company').length,
    totalConnections: networkData.edges.length,
    avgInfluence: Math.round(networkData.nodes.reduce((acc, n) => acc + n.influence, 0) / networkData.nodes.length)
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Network Visualization
            </h1>
            <p className="text-gray-400">
              Explore your professional network in 3D space
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 glass-premium rounded-lg hover:bg-white/10 transition-colors"
            >
              <Maximize2 className="h-5 w-5 text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 glass-premium rounded-lg hover:bg-white/10 transition-colors"
            >
              <Download className="h-5 w-5 text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="glass-premium rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalContacts}</p>
              <p className="text-sm text-gray-400">Contacts</p>
            </div>
            <Users className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        <div className="glass-premium rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalCompanies}</p>
              <p className="text-sm text-gray-400">Companies</p>
            </div>
            <Building className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <div className="glass-premium rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalConnections}</p>
              <p className="text-sm text-gray-400">Connections</p>
            </div>
            <Network className="h-8 w-8 text-cyan-400" />
          </div>
        </div>
        <div className="glass-premium rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgInfluence}%</p>
              <p className="text-sm text-gray-400">Avg Influence</p>
            </div>
            <Sparkles className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts, companies, or opportunities..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="contacts">Contacts Only</option>
            <option value="companies">Companies Only</option>
            <option value="opportunities">Opportunities Only</option>
          </select>
        </div>
      </motion.div>

      {/* 3D Network Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "glass-premium rounded-2xl overflow-hidden",
          isFullscreen ? "fixed inset-4 z-50" : "h-[500px]"
        )}
      >
        <NetworkGraph
          nodes={networkData.nodes}
          edges={networkData.edges}
          selectedNodeId={selectedNode}
          onNodeClick={handleNodeClick}
        />
      </motion.div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 glass-premium rounded-xl p-6"
      >
        <div className="flex items-center mb-4">
          <Sparkles className="h-5 w-5 text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">AI Network Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
            <h4 className="font-medium text-white mb-1">Key Connector</h4>
            <p className="text-sm text-gray-300">
              Sarah Chen connects you to 45% of your network. Consider strengthening this relationship.
            </p>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
            <h4 className="font-medium text-white mb-1">Hidden Opportunity</h4>
            <p className="text-sm text-gray-300">
              Michael Johnson has connections at 3 companies on your target list.
            </p>
          </div>
          <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
            <h4 className="font-medium text-white mb-1">Network Health</h4>
            <p className="text-sm text-gray-300">
              Your network diversity score is 82/100. Well balanced across industries.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Add missing cn import
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}