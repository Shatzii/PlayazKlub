import { NextResponse } from 'next/server';
import { getPodcasts } from '@/lib/api';

export async function GET() {
  try {
    const podcasts = await getPodcasts();
    return NextResponse.json(podcasts);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json([], { status: 500 });
  }
}