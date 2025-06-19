-- CRM Pro Plus Database Schema
-- This file contains all the SQL needed to set up the database

-- Create revenue_entries table
CREATE TABLE IF NOT EXISTS revenue_entries (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month, year)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    due_date DATE,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_revenue_entries_updated_at BEFORE UPDATE ON revenue_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample revenue data for 2025
INSERT INTO revenue_entries (month, year, total_revenue) VALUES
    (1, 2025, 15000),
    (2, 2025, 18000),
    (3, 2025, 22000),
    (4, 2025, 20000),
    (5, 2025, 25000),
    (6, 2025, 28000),
    (7, 2025, 30000),
    (8, 2025, 32000),
    (9, 2025, 35000),
    (10, 2025, 38000),
    (11, 2025, 40000),
    (12, 2025, 42000)
ON CONFLICT (month, year) DO NOTHING;

-- Insert sample expense data
INSERT INTO expenses (month, year, category, amount) VALUES
    (1, 2025, 'Office Rent', 2000),
    (1, 2025, 'Software Subscriptions', 500),
    (1, 2025, 'Marketing', 1000),
    (2, 2025, 'Office Rent', 2000),
    (2, 2025, 'Software Subscriptions', 500),
    (2, 2025, 'Equipment', 1500);

-- Insert sample client data
INSERT INTO clients (name, email, phone, company) VALUES
    ('John Doe', 'john@example.com', '555-0101', 'Acme Corp'),
    ('Jane Smith', 'jane@example.com', '555-0102', 'Tech Solutions'),
    ('Bob Johnson', 'bob@example.com', '555-0103', 'Global Industries');

-- Enable Row Level Security (RLS)
ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create basic policies (adjust based on your auth requirements)
-- These allow all operations for now - you should restrict based on your needs
CREATE POLICY "Enable all operations for revenue_entries" ON revenue_entries
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for expenses" ON expenses
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for clients" ON clients
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for invoices" ON invoices
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for tasks" ON tasks
    FOR ALL USING (true) WITH CHECK (true);