import { NextRequest, NextResponse } from 'next/server';

// Basic Auth0 integration - will be enhanced with proper SDK
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'login') {
    // Redirect to Auth0 login
    const auth0Url = `https://dev-hi54vhznvyubj5yv.us.auth0.com/authorize?` +
      `client_id=AtajoIu3cC5oJDFDiOG36SeHjgUu9OvB&` +
      `redirect_uri=${encodeURIComponent('http://localhost:3001/api/auth/callback')}&` +
      `response_type=code&` +
      `scope=openid profile email`;

    return NextResponse.redirect(auth0Url);
  }

  if (action === 'logout') {
    // Redirect to Auth0 logout
    const logoutUrl = `https://dev-hi54vhznvyubj5yv.us.auth0.com/v2/logout?` +
      `client_id=AtajoIu3cC5oJDFDiOG36SeHjgUu9OvB&` +
      `returnTo=${encodeURIComponent('http://localhost:3001/')}`;

    return NextResponse.redirect(logoutUrl);
  }

  return NextResponse.json({ message: 'Auth0 endpoint' });
}

export async function POST() {
  return NextResponse.json({ message: 'Auth0 POST endpoint' });
}