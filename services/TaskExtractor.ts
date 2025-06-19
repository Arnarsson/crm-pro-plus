import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import path from 'path';

const supabase = createClient(
  'https://xoimtuvhumgzaoqeipmp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaW10dXZodW1nemFvcWVpcG1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM2MzMyNSwiZXhwIjoyMDY1OTM5MzI1fQ.JCoyNSG5emR2WYlpls-tRF9sojoww5vvRc1_cX7UQbI'
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ExtractedTask {
  title: string;
  description: string;
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
}

export class TaskExtractor {
  private static readonly SUPPORTED_FILE_TYPES = [
    '.md', '.txt', '.js', '.ts', '.jsx', '.tsx', '.py', '.html', '.css'
  ];

  private static async extractTasksFromContent(content: string, fileName: string): Promise<ExtractedTask[]> {
    const prompt = `Analyze the following file content and extract potential tasks. For each task, provide:
- A clear title
- A brief description
- The objective it serves
- Who should be responsible (stakeholder)
- Estimated deadline (use relative dates from today)
- Whether it's urgent and important
- RICE score components (Reach, Impact, Confidence, Effort)
- Initial status
- Whether it should be a weekly focus
- Any additional notes

File name: ${fileName}
Content:
${content}

Respond in the following JSON format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "objective": "Business objective",
      "stakeholder": "Responsible person",
      "deadline": "YYYY-MM-DD",
      "urgent": boolean,
      "important": boolean,
      "reach": number (0-5000),
      "impact": number (1-10),
      "confidence": number (0-1),
      "effort": number (1-20),
      "status": "Not Started",
      "weekly_focus": boolean,
      "notes": "Additional context"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a task extraction assistant that analyzes code and documentation to identify actionable tasks. Focus on technical improvements, bug fixes, and feature implementations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.tasks;
  }

  static async processFile(filePath: string, userId: string): Promise<void> {
    const ext = path.extname(filePath);
    if (!this.SUPPORTED_FILE_TYPES.includes(ext)) {
      console.log(`Skipping unsupported file type: ${ext}`);
      return;
    }

    try {
      const content = await readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const tasks = await this.extractTasksFromContent(content, fileName);

      for (const task of tasks) {
        const { error } = await supabase
          .from('tasks')
          .insert({
            ...task,
            user_id: userId
          });

        if (error) {
          console.error(`Error inserting task from ${fileName}:`, error);
        } else {
          console.log(`Successfully added task: ${task.title}`);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }

  static async processDirectory(dirPath: string, userId: string): Promise<void> {
    try {
      const files = await readdir(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          await this.processDirectory(fullPath, userId);
        } else if (this.SUPPORTED_FILE_TYPES.includes(path.extname(file.name))) {
          await this.processFile(fullPath, userId);
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dirPath}:`, error);
    }
  }
}

// Example usage:
// await TaskExtractor.processDirectory('./src', 'user-123');
// await TaskExtractor.processFile('./README.md', 'user-123'); 