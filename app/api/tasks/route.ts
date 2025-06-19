import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const json = await request.json();

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title: json.title,
      description: json.description,
      objective: json.objective,
      stakeholder: json.stakeholder,
      deadline: json.deadline,
      status: json.status || 'Not Started',
      urgent: json.urgent || false,
      important: json.important || false,
      reach: json.reach || 0,
      impact: json.impact || 0,
      confidence: json.confidence || 0,
      effort: json.effort || 1,
      weekly_focus: json.weekly_focus || false,
      notes: json.notes
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(task);
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const json = await request.json();
  const { id, ...updates } = json;

  const { data: task, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(task);
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 