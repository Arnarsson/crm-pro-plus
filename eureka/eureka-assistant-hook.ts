// hooks/useEurekaAssistant.ts
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface AssistantResponse {
  message: string;
  suggestions?: string[];
  actions?: any[];
  data?: any;
}

export function useEurekaAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const sendMessage = useCallback(async (prompt: string): Promise<AssistantResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: {
            currentPage: pathname,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  const getInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/insights', {
        headers: {
          'x-current-page': pathname
        }
      });
      
      if (!response.ok) throw new Error('Failed to get insights');
      
      const data = await response.json();
      return data.insights;
    } catch (err) {
      console.error('Failed to get insights:', err);
      return [];
    }
  }, [pathname]);

  const getSuggestions = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/suggestions', {
        headers: {
          'x-current-page': pathname
        }
      });
      
      if (!response.ok) throw new Error('Failed to get suggestions');
      
      const data = await response.json();
      return data.suggestions;
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      return [];
    }
  }, [pathname]);

  return {
    sendMessage,
    getInsights,
    getSuggestions,
    isLoading,
    error
  };
}

// app/(dashboard)/import/linkedin/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Linkedin, 
  Upload, 
  Search, 
  Users, 
  Network, 
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { NetworkGraph } from '@/components/relationships/NetworkGraph';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function LinkedInImportPage() {
  const [profileUrl, setProfileUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanDepth, setScanDepth] = useState(2);
  const [contacts, setContacts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleDeepScan = async () => {
    if (!profileUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a LinkedIn profile URL',
        variant: 'destructive'
      });
      return;
    }

    setIsScanning(true);
    
    try {
      const response = await fetch('/api/relationships/deep-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileUrl,
          depth: scanDepth
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scan profile');
      }

      const data = await response.json();
      setScanResults(data);
      
      // Fetch updated contacts and relationships
      await fetchNetworkData();
      
      toast({
        title: 'Success!',
        description: `Imported ${data.stats?.total_contacts || 0} contacts and mapped ${data.stats?.total_relationships || 0} relationships`,
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: 'Error',
        description: 'Failed to scan LinkedIn profile. Please check the URL and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const fetchNetworkData = async () => {
    try {
      // Fetch contacts
      const contactsRes = await fetch('/api/contacts');
      const contactsData = await contactsRes.json();
      setContacts(contactsData.contacts || []);

      // Fetch relationships
      const relationshipsRes = await fetch('/api/relationships');
      const relationshipsData = await relationshipsRes.json();
      setRelationships(relationshipsData.relationships || []);
    } catch (error) {
      console.error('Failed to fetch network data:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Linkedin className="h-6 w-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100">
              LinkedIn Network Import
            </h1>
          </div>
          <p className="text-gray-400">
            Import your LinkedIn connections and map your professional network with AI-powered insights
          </p>
        </div>

        {/* Import Card */}
        <Card className="bg-gray-900 border-gray-800 p-6 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn Profile URL
              </label>
              <div className="flex gap-3">
                <Input
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="flex-1 bg-gray-800 border-gray-700 text-gray-100"
                />
                <Button
                  onClick={handleDeepScan}
                  disabled={isScanning || !profileUrl}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Deep Scan
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter your LinkedIn profile URL to start mapping your network
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scan Depth
              </label>
              <div className="flex items-center gap-4">
                <select
                  value={scanDepth}
                  onChange={(e) => setScanDepth(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-gray-100 rounded-lg px-3 py-2"
                >
                  <option value={1}>1st degree connections only</option>
                  <option value={2}>Up to 2nd degree (recommended)</option>
                  <option value={3}>Up to 3rd degree (comprehensive)</option>
                </select>
                <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-400">
                  <Network className="h-3 w-3 mr-1" />
                  Maps up to {scanDepth === 1 ? '~500' : scanDepth === 2 ? '~5,000' : '~50,000'} connections
                </Badge>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-100 mb-1">Smart Import</h3>
                <p className="text-sm text-gray-400">
                  AI extracts contact details, companies, and skills automatically
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold text-gray-100 mb-1">Influence Scoring</h3>
                <p className="text-sm text-gray-400">
                  PageRank algorithm identifies your most influential connections
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <Sparkles className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-100 mb-1">Warm Paths</h3>
                <p className="text-sm text-gray-400">
                  Discover introduction routes to reach anyone in your network
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Scan Results */}
        {scanResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Alert className="bg-green-900/20 border-green-800">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertDescription className="text-green-100">
                Successfully imported {scanResults.stats?.total_contacts || 0} contacts and 
                mapped {scanResults.stats?.total_relationships || 0} relationships!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gray-900 border-gray-800 p-4">
                <div className="text-3xl font-bold text-gray-100">
                  {scanResults.stats?.total_contacts || 0}
                </div>
                <p className="text-sm text-gray-400">Total Contacts</p>
              </Card>
              <Card className="bg-gray-900 border-gray-800 p-4">
                <div className="text-3xl font-bold text-gray-100">
                  {scanResults.stats?.total_relationships || 0}
                </div>
                <p className="text-sm text-gray-400">Relationships</p>
              </Card>
              <Card className="bg-gray-900 border-gray-800 p-4">
                <div className="text-3xl font-bold text-gray-100">
                  {scanResults.stats?.avg_influence_score?.toFixed(0) || 0}
                </div>
                <p className="text-sm text-gray-400">Avg Influence</p>
              </Card>
              <Card className="bg-gray-900 border-gray-800 p-4">
                <div className="text-3xl font-bold text-gray-100">
                  {scanResults.stats?.total_companies || 0}
                </div>
                <p className="text-sm text-gray-400">Companies</p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Network Visualization */}
        {contacts.length > 0 && (
          <NetworkGraph
            contacts={contacts}
            relationships={relationships}
            onNodeClick={(node) => {
              router.push(`/contacts/${node.id}`);
            }}
          />
        )}

        {/* Empty State */}
        {!scanResults && contacts.length === 0 && !isScanning && (
          <Card className="bg-gray-900 border-gray-800 p-12 text-center">
            <Network className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Network Data Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Import your LinkedIn profile to start mapping your professional network
            </p>
            <Button
              variant="outline"
              onClick={() => setProfileUrl('https://linkedin.com/in/')}
              className="mx-auto"
            >
              Get Started
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
}