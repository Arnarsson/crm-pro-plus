import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { TaskExtractor } from '@/services/TaskExtractor';
import { mkdir } from 'fs/promises';

const UPLOAD_DIR = join(process.cwd(), 'tmp', 'uploads');

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = join(UPLOAD_DIR, file.name);
      
      // Save file temporarily
      await writeFile(filePath, buffer);

      try {
        // Process the file and extract tasks
        await TaskExtractor.processFile(filePath, user.id);
        results.push({ fileName: file.name, status: 'success' });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({ fileName: file.name, status: 'error', error: error.message });
      }

      // Clean up the temporary file
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Error deleting temporary file ${filePath}:`, error);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in task extraction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 