import { NextResponse } from 'next/server';
import { callService } from '@/services/call';

export async function GET() {
  try {
    const calls = await callService.listCalls();
    return NextResponse.json(calls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch call history' }, { status: 500 });
  }
} 