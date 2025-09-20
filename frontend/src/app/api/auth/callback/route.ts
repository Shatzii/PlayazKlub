import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    // Handle authentication error
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }

  if (code) {
    // Handle successful authentication
    // In a real implementation, you'd exchange the code for tokens
    // For now, we'll redirect to the home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  // No code or error, redirect to home
  return NextResponse.redirect(new URL('/', request.url));
}