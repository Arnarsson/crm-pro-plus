import { NextRequest, NextResponse } from 'next/server';
import { EurekaAssistant } from '@/services/EurekaAssistant';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Initialize EUREKA Assistant
    const assistant = new EurekaAssistant();

    // Process the query
    const response = await assistant.query(prompt, {
      userId: user.id,
      currentPage: context?.currentPage,
      recentActions: context?.recentActions,
      userPreferences: context?.userPreferences
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in AI assistant:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Get insights for the user
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize EUREKA Assistant
    const assistant = new EurekaAssistant();

    // Get proactive insights
    const insights = await assistant.getInsights({
      userId: user.id,
      currentPage: request.headers.get('referer') || undefined
    });

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error getting insights:', error);
    return NextResponse.json(
      { error: 'Failed to get insights' },
      { status: 500 }
    );
  }
}