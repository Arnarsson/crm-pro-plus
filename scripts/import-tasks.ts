import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Papa from 'papaparse';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RawTask {
  Task: string;
  Objective: string;
  Stakeholder: string;
  Deadline: string;
  'Urgent?': string;
  'Important?': string;
  Reach: string;
  Impact: string;
  Confidence: string;
  Effort: string;
  Status: string;
  'Weekly Focus (✔)': string;
  Notes: string;
}

interface FormattedTask {
  title: string;
  objective: string;
  stakeholder: string;
  deadline: string;
  urgent: boolean;
  important: boolean;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delegated';
  weekly_focus: boolean;
  notes: string;
  user_id: string;
}

async function importTasks(userId: string, csvPath: string) {
  // Read and parse CSV
  const csvFile = fs.readFileSync(csvPath, 'utf-8');
  const { data } = Papa.parse(csvFile, { header: true });
  
  // Format tasks
  const tasks: FormattedTask[] = (data as RawTask[]).map(row => ({
    title: row.Task,
    objective: row.Objective,
    stakeholder: row.Stakeholder,
    deadline: new Date(row.Deadline).toISOString(),
    urgent: row['Urgent?'].toLowerCase() === 'true',
    important: row['Important?'].toLowerCase() === 'true',
    reach: parseInt(row.Reach) || 0,
    impact: parseInt(row.Impact) || 0,
    confidence: parseFloat(row.Confidence) || 0,
    effort: parseInt(row.Effort) || 1,
    status: row.Status as FormattedTask['status'],
    weekly_focus: row['Weekly Focus (✔)'].toLowerCase() === 'true',
    notes: row.Notes || '',
    user_id: userId
  }));

  // Insert tasks in batches
  const batchSize = 50;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const { error } = await supabase.from('tasks').insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      continue;
    }
    
    console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(tasks.length / batchSize)}`);
  }

  console.log('Task import completed!');
}

// Usage example:
// Replace these values with your actual user ID and CSV file path
const userId = process.env.IMPORT_USER_ID;
const csvPath = './tasks.csv';

if (!userId) {
  console.error('Please set IMPORT_USER_ID in your .env file');
  process.exit(1);
}

importTasks(userId, csvPath).catch(console.error); 