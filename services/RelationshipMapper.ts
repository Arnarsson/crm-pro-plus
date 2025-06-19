// services/RelationshipMapper.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);

export class RelationshipMapper {
  private supabase;
  private apiToken: string;
  private browserZone: string;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.apiToken = process.env.BRIGHTDATA_API_TOKEN!;
    this.browserZone = process.env.BROWSER_ZONE || 'mcp_browser';
  }

  /**
   * Deep scan a LinkedIn profile and map all relationships
   */
  async deepScanProfile(profileUrl: string, userId: string, depth: number = 2) {
    console.log(`🔍 Starting deep scan for ${profileUrl} with depth ${depth}`);
    
    // Create or update the main contact
    const mainContact = await this.importProfile(profileUrl, userId);
    
    // Start recursive connection mapping
    await this.mapConnectionsRecursively(
      mainContact.id,
      profileUrl,
      userId,
      depth,
      new Set([profileUrl])
    );

    // Calculate influence scores
    await this.calculateInfluenceScores(userId);

    // Find warm paths
    await this.identifyWarmPaths(userId);

    // Generate AI insights
    await this.generateInsights(userId);

    return {
      mainContact,
      stats: await this.getNetworkStats(userId)
    };
  }

  /**
   * Import a single LinkedIn profile
   */
  private async importProfile(profileUrl: string, userId: string) {
    const mcpCommand = `
      API_TOKEN="${this.apiToken}" 
      BROWSER_ZONE="${this.browserZone}" 
      npx -y @brightdata/mcp fetch ${profileUrl} --format json
    `;

    try {
      const { stdout } = await execAsync(mcpCommand);
      const profileData = JSON.parse(stdout);

      // Extract structured data
      const contactData = {
        user_id: userId,
        linkedin_url: profileUrl,
        first_name: profileData.firstName || this.extractFirstName(profileData.name),
        last_name: profileData.lastName || this.extractLastName(profileData.name),
        email: profileData.email || null,
        headline: profileData.headline,
        location: profileData.location,
        company: this.extractCompanyInfo(profileData),
        current_position: this.extractCurrentPosition(profileData),
        skills: profileData.skills || [],
        connection_count: profileData.connectionCount || 0,
        profile_image: profileData.profilePicture,
        metadata: {
          raw_data: profileData,
          scraped_at: new Date().toISOString(),
          profile_views: profileData.profileViews,
          post_impressions: profileData.postImpressions
        }
      };

      // Upsert to database
      const { data: contact, error } = await this.supabase
        .from('contacts')
        .upsert(contactData, { onConflict: 'linkedin_url' })
        .select()
        .single();

      if (error) throw error;
      
      console.log(`✅ Imported contact: ${contact.first_name} ${contact.last_name}`);
      return contact;
    } catch (error) {
      console.error(`❌ Error importing profile ${profileUrl}:`, error);
      throw error;
    }
  }

  /**
   * Recursively map connections to specified depth
   */
  private async mapConnectionsRecursively(
    contactId: string,
    profileUrl: string,
    userId: string,
    depth: number,
    visited: Set<string>
  ) {
    if (depth === 0) return;

    console.log(`🔗 Mapping connections for ${profileUrl} (depth: ${depth})`);

    // Get connections for this profile
    const connections = await this.scrapeConnections(profileUrl);

    // Process connections in batches for efficiency
    const batchSize = 10;
    for (let i = 0; i < connections.length; i += batchSize) {
      const batch = connections.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (conn) => {
        if (visited.has(conn.profileUrl)) return;
        visited.add(conn.profileUrl);

        try {
          // Import the connected profile
          const connectedContact = await this.importProfile(conn.profileUrl, userId);

          // Create the relationship
          await this.createRelationship(contactId, connectedContact.id, conn);

          // Recursively map their connections
          if (depth > 1) {
            await this.mapConnectionsRecursively(
              connectedContact.id,
              conn.profileUrl,
              userId,
              depth - 1,
              visited
            );
          }
        } catch (error) {
          console.error(`⚠️ Error processing connection ${conn.profileUrl}:`, error);
        }
      }));

      // Rate limiting pause
      await this.delay(2000);
    }
  }

  /**
   * Scrape connections from a LinkedIn profile
   */
  private async scrapeConnections(profileUrl: string) {
    const mcpCommand = `
      API_TOKEN="${this.apiToken}" 
      BROWSER_ZONE="${this.browserZone}" 
      npx -y @brightdata/mcp linkedin-connections ${profileUrl} --format json
    `;

    try {
      const { stdout } = await execAsync(mcpCommand);
      const connectionsData = JSON.parse(stdout);

      return connectionsData.connections.map((conn: any) => ({
        profileUrl: conn.profileUrl,
        name: conn.name,
        headline: conn.headline,
        degree: conn.degree, // '1st', '2nd', '3rd'
        mutualConnections: conn.mutualConnections || 0,
        company: conn.company,
        location: conn.location
      }));
    } catch (error) {
      console.error(`⚠️ Error scraping connections for ${profileUrl}:`, error);
      return [];
    }
  }

  /**
   * Create relationship between two contacts
   */
  private async createRelationship(contactAId: string, contactBId: string, connectionData: any) {
    // Calculate relationship strength based on various factors
    const strength = this.calculateRelationshipStrength(connectionData);

    const relationshipData = {
      contact_a_id: contactAId,
      contact_b_id: contactBId,
      relationship_type: 'linkedin_connection',
      degree: connectionData.degree,
      strength,
      mutual_connections: connectionData.mutualConnections,
      metadata: {
        headline: connectionData.headline,
        company: connectionData.company,
        location: connectionData.location,
        imported_at: new Date().toISOString()
      }
    };

    await this.supabase
      .from('relationships')
      .upsert(relationshipData, { 
        onConflict: 'contact_a_id,contact_b_id' 
      });

    console.log(`✅ Created relationship: ${connectionData.degree} degree connection`);
  }

  /**
   * Calculate relationship strength (1-10 scale)
   */
  private calculateRelationshipStrength(connectionData: any): number {
    let strength = 5; // Base strength

    // Adjust based on connection degree
    if (connectionData.degree === '1st') strength += 3;
    else if (connectionData.degree === '2nd') strength += 1;

    // Boost for mutual connections
    if (connectionData.mutualConnections > 50) strength += 2;
    else if (connectionData.mutualConnections > 20) strength += 1;

    // Same company boost
    if (connectionData.sameCompany) strength += 1;

    return Math.min(10, strength);
  }

  /**
   * Calculate influence scores using PageRank-like algorithm
   */
  async calculateInfluenceScores(userId: string) {
    console.log('📊 Calculating influence scores...');

    // Fetch all relationships
    const { data: relationships } = await this.supabase
      .from('relationships')
      .select('contact_a_id, contact_b_id, strength')
      .in('contact_a_id', 
        this.supabase
          .from('contacts')
          .select('id')
          .eq('user_id', userId)
      );

    if (!relationships || relationships.length === 0) return;

    // Build adjacency matrix
    const nodes = new Map<string, number>();
    const edges: Array<[string, string, number]> = [];

    relationships.forEach(rel => {
      if (!nodes.has(rel.contact_a_id)) nodes.set(rel.contact_a_id, 0);
      if (!nodes.has(rel.contact_b_id)) nodes.set(rel.contact_b_id, 0);
      edges.push([rel.contact_a_id, rel.contact_b_id, rel.strength]);
    });

    // Simple PageRank implementation
    const damping = 0.85;
    const iterations = 100;
    const nodeCount = nodes.size;
    const initialScore = 1 / nodeCount;

    // Initialize scores
    nodes.forEach((_, nodeId) => nodes.set(nodeId, initialScore));

    // Iterate PageRank
    for (let i = 0; i < iterations; i++) {
      const newScores = new Map<string, number>();
      
      nodes.forEach((_, nodeId) => {
        let score = (1 - damping) / nodeCount;
        
        // Sum incoming link scores
        edges.forEach(([from, to, weight]) => {
          if (to === nodeId) {
            const fromScore = nodes.get(from) || 0;
            const fromOutDegree = edges.filter(e => e[0] === from).length;
            score += damping * (fromScore / fromOutDegree) * (weight / 10);
          }
        });
        
        newScores.set(nodeId, score);
      });

      // Update scores
      newScores.forEach((score, nodeId) => nodes.set(nodeId, score));
    }

    // Update influence scores in database
    const updates = Array.from(nodes.entries()).map(([contactId, score]) => ({
      id: contactId,
      influence_score: Math.round(score * 1000) // Scale to 0-1000
    }));

    for (const update of updates) {
      await this.supabase
        .from('contacts')
        .update({ influence_score: update.influence_score })
        .eq('id', update.id);
    }

    console.log('✅ Influence scores calculated');
  }

  /**
   * Identify warm introduction paths between contacts
   */
  async identifyWarmPaths(userId: string) {
    console.log('🔍 Identifying warm introduction paths...');

    // Get all contacts for the user
    const { data: contacts } = await this.supabase
      .from('contacts')
      .select('id, first_name, last_name, company')
      .eq('user_id', userId);

    if (!contacts || contacts.length < 2) return;

    // For each pair of contacts, find shortest path
    const warmPaths = [];

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const path = await this.findShortestPath(
          contacts[i].id,
          contacts[j].id,
          userId
        );

        if (path && path.length > 2 && path.length <= 4) {
          warmPaths.push({
            from: contacts[i],
            to: contacts[j],
            path,
            strength: this.calculatePathStrength(path)
          });
        }
      }
    }

    // Store warm paths for quick access
    await this.supabase
      .from('warm_paths')
      .upsert(warmPaths.map(path => ({
        user_id: userId,
        from_contact_id: path.from.id,
        to_contact_id: path.to.id,
        path_contacts: path.path,
        path_strength: path.strength,
        updated_at: new Date().toISOString()
      })));

    console.log(`✅ Found ${warmPaths.length} warm introduction paths`);
    return warmPaths;
  }

  /**
   * Find shortest path between two contacts using BFS
   */
  private async findShortestPath(
    fromId: string,
    toId: string,
    userId: string
  ): Promise<string[] | null> {
    // Get all relationships
    const { data: relationships } = await this.supabase
      .from('relationships')
      .select('contact_a_id, contact_b_id');

    if (!relationships) return null;

    // Build adjacency list
    const graph = new Map<string, Set<string>>();
    relationships.forEach(rel => {
      if (!graph.has(rel.contact_a_id)) graph.set(rel.contact_a_id, new Set());
      if (!graph.has(rel.contact_b_id)) graph.set(rel.contact_b_id, new Set());
      graph.get(rel.contact_a_id)!.add(rel.contact_b_id);
      graph.get(rel.contact_b_id)!.add(rel.contact_a_id);
    });

    // BFS to find shortest path
    const queue: Array<[string, string[]]> = [[fromId, [fromId]]];
    const visited = new Set<string>([fromId]);

    while (queue.length > 0) {
      const [current, path] = queue.shift()!;
      
      if (current === toId) return path;
      
      const neighbors = graph.get(current) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([neighbor, [...path, neighbor]]);
        }
      }
    }

    return null;
  }

  /**
   * Calculate the strength of a path
   */
  private calculatePathStrength(path: string[]): number {
    // Simple heuristic: shorter paths are stronger
    return Math.max(1, 10 - (path.length - 2) * 2);
  }

  /**
   * Generate AI-powered insights
   */
  async generateInsights(userId: string) {
    console.log('🤖 Generating AI insights...');

    const { data: stats } = await this.supabase.rpc('get_network_stats', { user_id: userId });
    const { data: topInfluencers } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('influence_score', { ascending: false })
      .limit(5);

    const insights = [
      {
        user_id: userId,
        type: 'network_growth',
        title: 'Network Growth Opportunity',
        description: `Your network has ${stats.total_contacts} contacts. Focus on connecting with ${topInfluencers[0]?.first_name}'s network for maximum impact.`,
        priority: 8,
        data: { stats, topInfluencer: topInfluencers[0] }
      },
      {
        user_id: userId,
        type: 'warm_introduction',
        title: 'Strategic Introduction Available',
        description: `You have a warm path to key decision makers in ${stats.total_companies} companies through your network.`,
        priority: 7,
        data: { companyCount: stats.total_companies }
      }
    ];

    await this.supabase.from('insights').insert(insights);
    console.log('✅ AI insights generated');
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(userId: string) {
    const stats = await this.supabase.rpc('get_network_stats', { user_id: userId });
    return stats.data;
  }

  // Utility functions
  private extractFirstName(fullName: string): string {
    return fullName?.split(' ')[0] || '';
  }

  private extractLastName(fullName: string): string {
    const parts = fullName?.split(' ') || [];
    return parts.slice(1).join(' ') || '';
  }

  private extractCompanyInfo(profileData: any) {
    return {
      name: profileData.currentCompany || profileData.company,
      position: profileData.currentPosition,
      industry: profileData.industry,
      size: profileData.companySize
    };
  }

  private extractCurrentPosition(profileData: any) {
    const experience = profileData.experience?.[0];
    return experience ? {
      title: experience.title,
      company: experience.company,
      startDate: experience.startDate,
      current: experience.current || !experience.endDate
    } : null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}