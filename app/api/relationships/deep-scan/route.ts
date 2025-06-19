import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Return dummy data for now
  return NextResponse.json({
    success: true,
    message: 'Deep scan completed (stub)',
    data: [
      { id: 'c1', name: 'Sarah Chen', connections: 3 },
      { id: 'c2', name: 'Michael Johnson', connections: 2 },
      { id: 'c3', name: 'TechCorp Inc', connections: 1 },
    ],
  });
} 