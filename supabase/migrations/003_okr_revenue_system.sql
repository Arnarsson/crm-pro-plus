-- Enhanced CRM Pro Plus Schema
-- OKR (Objectives and Key Results) System + Revenue Tracking + RICE Prioritization
-- Migration: 003_okr_revenue_system.sql

-- =====================================================
-- 1. OBJECTIVES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS objectives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    quarter TEXT NOT NULL, -- e.g., "Q1 2025"
    year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
    target_completion_date DATE,
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 1 = highest
    category TEXT DEFAULT 'business', -- business, personal, learning, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. KEY RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS key_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2), -- for quantitative KRs
    current_value DECIMAL(10,2) DEFAULT 0,
    unit TEXT, -- e.g., "posts", "hours", "clients", "DKK"
    metric_type TEXT DEFAULT 'number' CHECK (metric_type IN ('number', 'percentage', 'currency', 'boolean')),
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. REVENUE TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS revenue_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    income_source TEXT NOT NULL, -- e.g., "Teaching", "Consulting", "SaaS"
    amount DECIMAL(10,2) NOT NULL,
    target_amount DECIMAL(10,2), -- monthly target for this source
    currency TEXT DEFAULT 'DKK',
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    invoice_date DATE,
    payment_received BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month, year, income_source) -- prevent duplicate entries
);

-- =====================================================
-- 4. ENHANCED DEALS TABLE (ADD RICE SCORING)
-- =====================================================
-- Add RICE scoring columns to existing deals table
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS reach INTEGER CHECK (reach >= 1 AND reach <= 10),
ADD COLUMN IF NOT EXISTS impact INTEGER CHECK (impact >= 1 AND impact <= 10),
ADD COLUMN IF NOT EXISTS confidence INTEGER CHECK (confidence >= 1 AND confidence <= 10),
ADD COLUMN IF NOT EXISTS effort INTEGER CHECK (effort >= 1 AND effort <= 10),
ADD COLUMN IF NOT EXISTS rice_score DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
        WHEN reach IS NOT NULL AND impact IS NOT NULL AND confidence IS NOT NULL AND effort IS NOT NULL AND effort > 0
        THEN ROUND((reach * impact * confidence)::DECIMAL / effort, 2)
        ELSE NULL
    END
) STORED;

-- =====================================================
-- 5. DAILY TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL, -- optional link to OKR
    key_result_id UUID REFERENCES key_results(id) ON DELETE SET NULL, -- optional link to KR
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL, -- optional link to deal
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- 1 = highest
    estimated_hours DECIMAL(3,1), -- e.g., 2.5 hours
    actual_hours DECIMAL(3,1),
    category TEXT DEFAULT 'general', -- general, sales, marketing, admin, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 6. OKR UPDATES / PROGRESS LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS okr_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
    key_result_id UUID REFERENCES key_results(id) ON DELETE CASCADE,
    previous_value DECIMAL(10,2),
    new_value DECIMAL(10,2),
    progress_change DECIMAL(5,2), -- change in percentage
    update_note TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_objectives_user_quarter ON objectives(user_id, quarter, year);
CREATE INDEX IF NOT EXISTS idx_objectives_status ON objectives(status);
CREATE INDEX IF NOT EXISTS idx_key_results_objective ON key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_key_results_completed ON key_results(completed);
CREATE INDEX IF NOT EXISTS idx_revenue_user_period ON revenue_entries(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_revenue_source ON revenue_entries(income_source);
CREATE INDEX IF NOT EXISTS idx_deals_rice_score ON deals(rice_score DESC) WHERE rice_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_completed ON daily_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_okr_updates_objective ON okr_updates(objective_id);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for objectives
CREATE POLICY "Users can view their own objectives" ON objectives
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own objectives" ON objectives
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives" ON objectives
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own objectives" ON objectives
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for key_results (inherit user_id from objectives)
CREATE POLICY "Users can view key results of their objectives" ON key_results
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM objectives 
        WHERE objectives.id = key_results.objective_id 
        AND objectives.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert key results for their objectives" ON key_results
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM objectives 
        WHERE objectives.id = key_results.objective_id 
        AND objectives.user_id = auth.uid()
    ));

CREATE POLICY "Users can update key results of their objectives" ON key_results
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM objectives 
        WHERE objectives.id = key_results.objective_id 
        AND objectives.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete key results of their objectives" ON key_results
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM objectives 
        WHERE objectives.id = key_results.objective_id 
        AND objectives.user_id = auth.uid()
    ));

-- RLS Policies for revenue_entries
CREATE POLICY "Users can view their own revenue entries" ON revenue_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own revenue entries" ON revenue_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue entries" ON revenue_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue entries" ON revenue_entries
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_tasks
CREATE POLICY "Users can view their own tasks" ON daily_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON daily_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON daily_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON daily_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for okr_updates
CREATE POLICY "Users can view updates for their OKRs" ON okr_updates
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM objectives 
        WHERE objectives.id = okr_updates.objective_id 
        AND objectives.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert updates for their OKRs" ON okr_updates
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM objectives 
        WHERE objectives.id = okr_updates.objective_id 
        AND objectives.user_id = auth.uid()
    ));

-- =====================================================
-- 9. FUNCTIONS FOR AUTOMATIC PROGRESS CALCULATION
-- =====================================================

-- Function to update objective progress based on key results
CREATE OR REPLACE FUNCTION update_objective_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE objectives 
    SET progress = (
        SELECT COALESCE(AVG(progress), 0) 
        FROM key_results 
        WHERE objective_id = COALESCE(NEW.objective_id, OLD.objective_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.objective_id, OLD.objective_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update objective progress when key results change
DROP TRIGGER IF EXISTS trigger_update_objective_progress ON key_results;
CREATE TRIGGER trigger_update_objective_progress
    AFTER INSERT OR UPDATE OR DELETE ON key_results
    FOR EACH ROW
    EXECUTE FUNCTION update_objective_progress();

-- Function to update key result progress based on current vs target value
CREATE OR REPLACE FUNCTION update_key_result_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update progress if target_value is set and > 0
    IF NEW.target_value IS NOT NULL AND NEW.target_value > 0 THEN
        NEW.progress = LEAST(100, (NEW.current_value / NEW.target_value) * 100);
        
        -- Mark as completed if progress >= 100
        IF NEW.progress >= 100 THEN
            NEW.completed = TRUE;
        END IF;
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update key result progress
DROP TRIGGER IF EXISTS trigger_update_key_result_progress ON key_results;
CREATE TRIGGER trigger_update_key_result_progress
    BEFORE UPDATE ON key_results
    FOR EACH ROW
    EXECUTE FUNCTION update_key_result_progress();

-- Function to update task completion timestamp
CREATE OR REPLACE FUNCTION update_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = NOW();
    ELSIF NEW.completed = FALSE AND OLD.completed = TRUE THEN
        NEW.completed_at = NULL;
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task completion
DROP TRIGGER IF EXISTS trigger_update_task_completion ON daily_tasks;
CREATE TRIGGER trigger_update_task_completion
    BEFORE UPDATE ON daily_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_completion();

-- =====================================================
-- 10. SAMPLE DATA (Based on user's actual OKRs)
-- =====================================================

-- Note: This sample data will be inserted by the application
-- when a user first logs in, not here in the migration

-- Sample Objectives for Q1 2025
/*
INSERT INTO objectives (title, description, quarter, year, status, priority, category) VALUES
('Secure Revenue Foundation', 'Establish stable income streams and financial security', 'Q1', 2025, 'active', 1, 'business'),
('Build Brand Presence', 'Increase visibility and thought leadership in the market', 'Q1', 2025, 'active', 2, 'business'),
('Process Automation', 'Streamline workflows and improve operational efficiency', 'Q1', 2025, 'active', 3, 'business'),
('Proof of Concept', 'Validate new product ideas and business models', 'Q1', 2025, 'active', 4, 'business');

-- Sample Key Results
INSERT INTO key_results (objective_id, title, target_value, current_value, unit, metric_type) VALUES
((SELECT id FROM objectives WHERE title = 'Secure Revenue Foundation'), '11 teaching days in Bigum', 11, 11, 'days', 'number'),
((SELECT id FROM objectives WHERE title = 'Secure Revenue Foundation'), 'Apply for parental benefits', 1, 0, 'applications', 'boolean'),
((SELECT id FROM objectives WHERE title = 'Secure Revenue Foundation'), 'Land one more client in SVC', 1, 0, 'clients', 'number'),
((SELECT id FROM objectives WHERE title = 'Build Brand Presence'), '8 LinkedIn posts', 8, 3, 'posts', 'number'),
((SELECT id FROM objectives WHERE title = 'Build Brand Presence'), '100h relationship work', 100, 45, 'hours', 'number'),
((SELECT id FROM objectives WHERE title = 'Build Brand Presence'), '100h learning to code', 100, 100, 'hours', 'number');
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add helpful comments
COMMENT ON TABLE objectives IS 'OKR Objectives - high-level goals for each quarter';
COMMENT ON TABLE key_results IS 'Measurable key results that define success for each objective';
COMMENT ON TABLE revenue_entries IS 'Monthly revenue tracking by income source';
COMMENT ON TABLE daily_tasks IS 'Daily tasks that can be linked to OKRs and deals';
COMMENT ON TABLE okr_updates IS 'Progress history and updates for OKRs';

COMMENT ON COLUMN deals.rice_score IS 'RICE prioritization score: (Reach × Impact × Confidence) ÷ Effort';
COMMENT ON COLUMN objectives.progress IS 'Auto-calculated from average of key results progress';
COMMENT ON COLUMN key_results.progress IS 'Auto-calculated from current_value / target_value * 100';