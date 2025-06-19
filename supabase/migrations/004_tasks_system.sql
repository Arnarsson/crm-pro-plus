-- Create tasks table with RICE scoring and Eisenhower matrix support
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Basic task information
    title TEXT NOT NULL,
    description TEXT,
    objective TEXT NOT NULL,
    stakeholder TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Delegated')),
    
    -- Eisenhower Matrix fields
    urgent BOOLEAN NOT NULL DEFAULT false,
    important BOOLEAN NOT NULL DEFAULT false,
    
    -- RICE Score components
    reach INTEGER NOT NULL DEFAULT 0,
    impact INTEGER NOT NULL CHECK (impact >= 0 AND impact <= 10),
    confidence NUMERIC(3,2) NOT NULL CHECK (confidence > 0 AND confidence <= 1),
    effort INTEGER NOT NULL CHECK (effort > 0),
    
    -- Additional metadata
    weekly_focus BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    
    -- User relationship
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for common queries
CREATE INDEX tasks_user_id_deadline_idx ON tasks(user_id, deadline);
CREATE INDEX tasks_user_id_status_idx ON tasks(user_id, status);

-- Create view for RICE score calculation
CREATE OR REPLACE VIEW task_rice_scores AS
SELECT 
    id,
    title,
    (reach * impact * confidence / effort) as rice_score
FROM tasks
ORDER BY rice_score DESC; 