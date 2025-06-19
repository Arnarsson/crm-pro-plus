export interface Contact {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  company?: string
  position?: string
  tags: string[]
  notes?: string
  engagement_score: number
  last_contact?: string
  next_followup?: string
  created_at: string
  updated_at: string
}

export interface Relationship {
  id: string
  contact_a_id: string
  contact_b_id: string
  relationship_type: string
  strength: number
  notes?: string
  created_at: string
}

export interface Deal {
  id: string
  user_id: string
  contact_id?: string
  title: string
  value?: number
  currency: string
  stage: string
  probability: number
  expected_close?: string
  notes?: string
  reach?: number
  impact?: number
  confidence?: number
  effort?: number
  rice_score?: number
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  contact_id?: string
  deal_id?: string
  type: 'email' | 'call' | 'meeting' | 'note'
  content?: string
  completed: boolean
  due_date?: string
  created_at: string
}

// =====================================================
// OKR SYSTEM TYPES
// =====================================================

export interface Objective {
  id: string
  user_id: string
  title: string
  description?: string
  quarter: string
  year: number
  target_completion_date?: string
  progress: number
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  priority: number
  category: string
  created_at: string
  updated_at: string
}

export interface KeyResult {
  id: string
  objective_id: string
  title: string
  description?: string
  target_value?: number
  current_value: number
  unit?: string
  metric_type: 'number' | 'percentage' | 'currency' | 'boolean'
  progress: number
  completed: boolean
  due_date?: string
  created_at: string
  updated_at: string
}

export interface OKRUpdate {
  id: string
  objective_id: string
  key_result_id: string
  previous_value?: number
  new_value?: number
  progress_change?: number
  update_note?: string
  created_by: string
  created_at: string
}

// =====================================================
// REVENUE TRACKING TYPES
// =====================================================

export interface RevenueEntry {
  id: string
  user_id: string
  month: number
  year: number
  income_source: string
  amount: number
  target_amount?: number
  currency: string
  description?: string
  is_recurring: boolean
  invoice_date?: string
  payment_received: boolean
  payment_date?: string
  created_at: string
  updated_at: string
}

// =====================================================
// DAILY PLANNING TYPES
// =====================================================

export interface DailyTask {
  id: string
  user_id: string
  objective_id?: string
  key_result_id?: string
  deal_id?: string
  title: string
  description?: string
  completed: boolean
  scheduled_date: string
  due_date?: string
  priority: number
  estimated_hours?: number
  actual_hours?: number
  category: string
  created_at: string
  updated_at: string
  completed_at?: string
}

// =====================================================
// RICE PRIORITIZATION TYPES
// =====================================================

export interface RiceScore {
  reach: number
  impact: number
  confidence: number
  effort: number
  score: number
}

export interface RiceItem {
  id: string
  title: string
  rice_score?: number
  reach?: number
  impact?: number
  confidence?: number
  effort?: number
}

// =====================================================
// COMPOSITE TYPES FOR UI
// =====================================================

export interface ObjectiveWithKeyResults extends Objective {
  key_results: KeyResult[]
}

export interface DashboardOKR {
  id: string
  title: string
  progress: number
  keyResults: Array<{
    title: string
    completed: boolean
  }>
}

export interface MonthlyRevenue {
  month: string
  target: number
  actual: number
}

export interface RevenueBySource {
  source: string
  amount: number
  percentage: number
}

export interface TasksByCategory {
  category: string
  total: number
  completed: number
  percentage: number
}