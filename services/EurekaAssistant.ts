// services/EurekaAssistant.ts
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

interface AssistantContext {
  userId: string;
  currentPage?: string;
  recentActions?: string[];
  userPreferences?: any;
}

interface AssistantResponse {
  message: string;
  actions?: any[];
  suggestions?: string[];
  data?: any;
}

export class EurekaAssistant {
  private openai: OpenAI;
  private supabase;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Process natural language query and return intelligent response
   */
  async query(prompt: string, context: AssistantContext): Promise<AssistantResponse> {
    console.log(`🤖 EUREKA processing: "${prompt}"`);

    // Analyze intent
    const intent = await this.analyzeIntent(prompt, context);

    // Execute appropriate action based on intent
    switch (intent.type) {
      case 'search':
        return await this.handleSearch(intent, context);
      case 'insight':
        return await this.handleInsight(intent, context);
      case 'task':
        return await this.handleTask(intent, context);
      case 'relationship':
        return await this.handleRelationship(intent, context);
      case 'schedule':
        return await this.handleSchedule(intent, context);
      default:
        return await this.handleGeneral(prompt, context);
    }
  }

  /**
   * Analyze user intent using GPT-4
   */
  private async analyzeIntent(prompt: string, context: AssistantContext) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are EUREKA, an intelligent CRM assistant. Analyze the user's intent and categorize it.
          
          Categories:
          - search: Looking for contacts, deals, or information
          - insight: Requesting analysis or recommendations
          - task: Creating or managing tasks
          - relationship: Exploring connections or warm paths
          - schedule: Calendar or meeting related
          - general: Other queries
          
          Extract key entities and parameters from the query.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content!);
  }

  /**
   * Handle search queries
   */
  private async handleSearch(intent: any, context: AssistantContext): Promise<AssistantResponse> {
    const { entities, parameters } = intent;

    // Search contacts
    if (entities.includes('contact') || entities.includes('person')) {
      const { data: contacts } = await this.supabase
        .from('contacts')
        .select('*')
        .eq('user_id', context.userId)
        .ilike('first_name', `%${parameters.name || ''}%`)
        .limit(5);

      return {
        message: `Found ${contacts?.length || 0} contacts matching your search.`,
        data: contacts,
        suggestions: [
          'View detailed profile',
          'See relationship map',
          'Schedule a meeting'
        ]
      };
    }

    // Search deals
    if (entities.includes('deal') || entities.includes('opportunity')) {
      const { data: deals } = await this.supabase
        .from('deals')
        .select('*')
        .eq('user_id', context.userId)
        .order('rice_score', { ascending: false })
        .limit(5);

      return {
        message: `Here are your top opportunities by RICE score.`,
        data: deals,
        suggestions: [
          'Update deal stage',
          'Add a note',
          'Calculate win probability'
        ]
      };
    }

    return {
      message: 'What would you like me to search for?',
      suggestions: ['Search contacts', 'Find deals', 'Look up companies']
    };
  }

  /**
   * Handle insight requests
   */
  private async handleInsight(intent: any, context: AssistantContext): Promise<AssistantResponse> {
    // Get latest insights
    const { data: insights } = await this.supabase
      .from('insights')
      .select('*')
      .eq('user_id', context.userId)
      .eq('is_dismissed', false)
      .order('priority', { ascending: false })
      .limit(3);

    // Get network stats
    const stats = await this.supabase.rpc('get_network_stats', { 
      user_id: context.userId 
    });

    // Generate personalized insight using GPT-4
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Generate actionable business insights based on the data provided. Be specific and suggest concrete next steps.'
        },
        {
          role: 'user',
          content: JSON.stringify({ insights, stats: stats.data })
        }
      ],
      temperature: 0.7
    });

    return {
      message: response.choices[0].message.content!,
      data: { insights, stats: stats.data },
      actions: [
        { type: 'view_network', label: 'Explore Network Map' },
        { type: 'find_introductions', label: 'Find Warm Introductions' }
      ]
    };
  }

  /**
   * Handle task creation and management
   */
  private async handleTask(intent: any, context: AssistantContext): Promise<AssistantResponse> {
    const { action, parameters } = intent;

    if (action === 'create') {
      // Create a new task
      const { data: task } = await this.supabase
        .from('daily_tasks')
        .insert({
          user_id: context.userId,
          title: parameters.title,
          description: parameters.description,
          due_date: parameters.due_date || new Date().toISOString(),
          category: parameters.category || 'general',
          priority: parameters.priority || 'medium'
        })
        .select()
        .single();

      return {
        message: `✅ Task created: "${task.title}". I'll remind you when it's due.`,
        data: task,
        suggestions: [
          'Add to calendar',
          'Link to contact',
          'Set reminder'
        ]
      };
    }

    // Get today's tasks
    const { data: tasks } = await this.supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', context.userId)
      .eq('is_completed', false)
      .order('priority', { ascending: false });

    return {
      message: `You have ${tasks?.length || 0} tasks pending. Focus on the high-priority ones first.`,
      data: tasks,
      suggestions: [
        'Mark as complete',
        'Reschedule',
        'Delegate task'
      ]
    };
  }

  /**
   * Handle relationship queries
   */
  private async handleRelationship(intent: any, context: AssistantContext): Promise<AssistantResponse> {
    const { parameters } = intent;

    if (parameters.from && parameters.to) {
      // Find warm path between two contacts
      const { data: path } = await this.supabase
        .from('warm_paths')
        .select(`
          *,
          from_contact:contacts!from_contact_id(*),
          to_contact:contacts!to_contact_id(*)
        `)
        .eq('user_id', context.userId)
        .or(`from_contact_id.eq.${parameters.from},to_contact_id.eq.${parameters.to}`)
        .single();

      if (path) {
        return {
          message: `I found a warm introduction path through ${path.path_contacts.length - 2} connections. The path strength is ${path.path_strength}/10.`,
          data: path,
          actions: [
            { type: 'request_intro', label: 'Request Introduction' },
            { type: 'view_path', label: 'View Connection Path' }
          ]
        };
      }
    }

    // Get top influencers
    const { data: influencers } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('user_id', context.userId)
      .order('influence_score', { ascending: false })
      .limit(5);

    return {
      message: 'Here are your most influential connections. They can help you reach more people in your network.',
      data: influencers,
      suggestions: [
        'Explore their network',
        'Schedule a catch-up',
        'Ask for introductions'
      ]
    };
  }

  /**
   * Handle scheduling queries
   */
  private async handleSchedule(intent: any, context: AssistantContext): Promise<AssistantResponse> {
    const { parameters } = intent;

    // Get upcoming meetings
    const { data: events } = await this.supabase
      .from('calendar_events')
      .select(`
        *,
        contact:contacts(*)
      `)
      .eq('user_id', context.userId)
      .gte('start_time', new Date().toISOString())
      .order('start_time')
      .limit(5);

    // Find available slots
    const availableSlots = this.findAvailableSlots(events);

    return {
      message: `You have ${events?.length || 0} upcoming meetings. I found ${availableSlots.length} available time slots this week.`,
      data: { events, availableSlots },
      actions: [
        { type: 'schedule_meeting', label: 'Schedule New Meeting' },
        { type: 'find_time', label: 'Find Common Time' }
      ],
      suggestions: [
        'Block time for deep work',
        'Schedule follow-ups',
        'Review calendar analytics'
      ]
    };
  }

  /**
   * Handle general queries with GPT-4
   */
  private async handleGeneral(prompt: string, context: AssistantContext): Promise<AssistantResponse> {
    // Get relevant context data
    const { data: recentContacts } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentDeals } = await this.supabase
      .from('deals')
      .select('*')
      .eq('user_id', context.userId)
      .order('updated_at', { ascending: false })
      .limit(5);

    // Generate response with context
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are EUREKA, an intelligent CRM assistant. You help users manage their business relationships, tasks, and goals. 
          
          Context:
          - User has ${recentContacts?.length || 0} recent contacts
          - User has ${recentDeals?.length || 0} active deals
          - Current page: ${context.currentPage}
          
          Provide helpful, actionable responses. Suggest specific features they can use.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    });

    return {
      message: response.choices[0].message.content!,
      suggestions: [
        'Import LinkedIn contacts',
        'View relationship map',
        'Check today\'s tasks',
        'Review OKR progress'
      ]
    };
  }

  /**
   * Get proactive insights
   */
  async getInsights(context: AssistantContext): Promise<any[]> {
    const insights = [];

    // Check for stale deals
    const { data: staleDeals } = await this.supabase
      .from('deals')
      .select('*')
      .eq('user_id', context.userId)
      .lt('updated_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    if (staleDeals?.length) {
      insights.push({
        type: 'stale_deals',
        title: `${staleDeals.length} deals need attention`,
        description: 'These deals haven\'t been updated in 2 weeks',
        priority: 8,
        action: { type: 'view_deals', label: 'Review Deals' }
      });
    }

    // Check for networking opportunities
    const { data: events } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', context.userId)
      .gte('start_time', new Date().toISOString())
      .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    const networkingTime = events?.filter(e => 
      e.title.toLowerCase().includes('coffee') || 
      e.title.toLowerCase().includes('lunch') ||
      e.title.toLowerCase().includes('meeting')
    ).length || 0;

    if (networkingTime < 3) {
      insights.push({
        type: 'networking',
        title: 'Time to expand your network',
        description: 'You have few networking meetings scheduled this week',
        priority: 6,
        action: { type: 'schedule_coffee', label: 'Schedule Coffee Chat' }
      });
    }

    return insights;
  }

  /**
   * Suggest next actions based on context
   */
  async suggestNextActions(context: AssistantContext): Promise<any[]> {
    const suggestions = [];

    // Time-based suggestions
    const hour = new Date().getHours();
    
    if (hour >= 8 && hour < 10) {
      suggestions.push({
        type: 'morning_routine',
        label: 'Review today\'s priorities',
        description: 'Start your day with clarity'
      });
    } else if (hour >= 14 && hour < 16) {
      suggestions.push({
        type: 'afternoon_check',
        label: 'Process emails and follow-ups',
        description: 'Keep communication flowing'
      });
    }

    // Context-based suggestions
    if (context.currentPage === 'contacts') {
      suggestions.push({
        type: 'import_linkedin',
        label: 'Import from LinkedIn',
        description: 'Expand your network'
      });
    }

    return suggestions;
  }

  /**
   * Execute a command
   */
  async executeCommand(command: any, context: AssistantContext): Promise<any> {
    switch (command.type) {
      case 'import_linkedin':
        return { 
          action: 'navigate', 
          path: '/import/linkedin',
          message: 'Let\'s import your LinkedIn connections' 
        };
      
      case 'schedule_meeting':
        return {
          action: 'open_modal',
          modal: 'schedule_meeting',
          data: command.data
        };
      
      case 'view_network':
        return {
          action: 'navigate',
          path: '/relationships/network',
          message: 'Here\'s your relationship network'
        };
      
      default:
        return { 
          message: 'Command not recognized',
          error: true 
        };
    }
  }

  /**
   * Find available time slots
   */
  private findAvailableSlots(events: any[]): any[] {
    const slots = [];
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Simple algorithm to find 1-hour slots between 9 AM and 5 PM
    for (let d = new Date(now); d < weekEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue; // Skip weekends

      for (let hour = 9; hour < 17; hour++) {
        const slotStart = new Date(d);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(d);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        // Check if slot is available
        const isAvailable = !events?.some(event => {
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);
          return (
            (eventStart >= slotStart && eventStart < slotEnd) ||
            (eventEnd > slotStart && eventEnd <= slotEnd) ||
            (eventStart <= slotStart && eventEnd >= slotEnd)
          );
        });

        if (isAvailable && slotStart > now) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: true
          });
        }
      }
    }

    return slots.slice(0, 10); // Return top 10 slots
  }
}