'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Linkedin, 
  Upload, 
  Loader2, 
  Users, 
  Network,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function LinkedInImportPage() {
  const [profileUrl, setProfileUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState<any>(null);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!profileUrl.trim()) {
      setError('Please enter a valid LinkedIn profile URL');
      return;
    }

    setIsImporting(true);
    setError('');
    setImportProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const response = await fetch('/api/relationships/deep-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileUrl,
          depth: 2 // Import up to 2nd degree connections
        })
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const data = await response.json();
      setImportStats(data.stats);
    } catch (err) {
      setError('Failed to import LinkedIn network. Please try again.');
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          LinkedIn Network Import
        </h1>
        <p className="text-gray-400">
          Import your professional network and unlock powerful insights with AI
        </p>
      </motion.div>

      {/* Import Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-premium rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mr-4">
            <Linkedin className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Deep Network Scan</h2>
            <p className="text-sm text-gray-400">Import up to 3 degrees of connections</p>
          </div>
        </div>

        {!importStats ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  disabled={isImporting}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 text-red-400 text-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Importing your network...</span>
                    <span className="text-white">{importProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${importProgress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    />
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                disabled={isImporting}
                className="w-full btn-eureka flex items-center justify-center space-x-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Start Import</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="glass-premium rounded-xl p-4">
                <Users className="h-8 w-8 text-indigo-400 mb-2" />
                <h3 className="font-medium text-white mb-1">Contact Enrichment</h3>
                <p className="text-xs text-gray-400">
                  Automatically extract names, titles, companies, and skills
                </p>
              </div>
              <div className="glass-premium rounded-xl p-4">
                <Network className="h-8 w-8 text-purple-400 mb-2" />
                <h3 className="font-medium text-white mb-1">Relationship Mapping</h3>
                <p className="text-xs text-gray-400">
                  Discover warm paths and mutual connections
                </p>
              </div>
              <div className="glass-premium rounded-xl p-4">
                <Sparkles className="h-8 w-8 text-pink-400 mb-2" />
                <h3 className="font-medium text-white mb-1">AI Insights</h3>
                <p className="text-xs text-gray-400">
                  Get personality profiles and conversation starters
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Import Complete!</h3>
            <p className="text-gray-400 mb-8">
              Your LinkedIn network has been successfully imported
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-premium rounded-lg p-4">
                <p className="text-3xl font-bold text-white">{importStats.total_contacts || 0}</p>
                <p className="text-sm text-gray-400">Contacts</p>
              </div>
              <div className="glass-premium rounded-lg p-4">
                <p className="text-3xl font-bold text-white">{importStats.total_companies || 0}</p>
                <p className="text-sm text-gray-400">Companies</p>
              </div>
              <div className="glass-premium rounded-lg p-4">
                <p className="text-3xl font-bold text-white">{importStats.total_relationships || 0}</p>
                <p className="text-sm text-gray-400">Connections</p>
              </div>
              <div className="glass-premium rounded-lg p-4">
                <p className="text-3xl font-bold text-white">{importStats.avg_influence_score || 0}</p>
                <p className="text-sm text-gray-400">Avg Influence</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/relationships/network'}
                className="btn-eureka flex items-center justify-center space-x-2"
              >
                <Network className="h-5 w-5" />
                <span>View Network Map</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setImportStats(null);
                  setProfileUrl('');
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors"
              >
                Import Another Profile
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-premium rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-3">How it works</h3>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs text-indigo-400 mr-3">1</span>
            <span>Enter your LinkedIn profile URL to start the import process</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs text-indigo-400 mr-3">2</span>
            <span>EUREKA scans your network up to 3 degrees of separation</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs text-indigo-400 mr-3">3</span>
            <span>AI analyzes relationships and calculates influence scores</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs text-indigo-400 mr-3">4</span>
            <span>Explore your network visualization and discover warm paths</span>
          </li>
        </ol>
      </motion.div>
    </div>
  );
}