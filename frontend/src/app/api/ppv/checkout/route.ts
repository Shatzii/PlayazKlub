import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Fetch event details from Strapi
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    const eventResponse = await fetch(`${strapiUrl}/api/events/${eventId}?populate=*`);
    
    if (!eventResponse.ok) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = await eventResponse.json();
    const event = eventData.data;

    // Validate this is a PPV event
    if (!event.attributes.isPPV) {
      return NextResponse.json(
        { error: 'This event is not available for purchase' },
        { status: 400 }
      );
    }

    // Check if event hasn't ended
    if (event.attributes.streamStatus === 'ended') {
      return NextResponse.json(
        { error: 'This event has already ended' },
        { status: 400 }
      );
    }

    // Check if user already has access
    const accessCheckResponse = await fetch(
      `${strapiUrl}/api/events/${eventId}/check-access`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }
    );

    if (accessCheckResponse.ok) {
      const accessData = await accessCheckResponse.json();
      if (accessData.hasAccess) {
        return NextResponse.json(
          { error: 'You already have access to this event' },
          { status: 400 }
        );
      }
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `PPV Access: ${event.attributes.title}`,
              description: event.attributes.shortDescription || event.attributes.description?.substring(0, 200),
              images: event.attributes.featuredImage?.data
                ? [`${process.env.STRAPI_URL}${event.attributes.featuredImage.data.attributes.url}`]
                : undefined,
            },
            unit_amount: Math.round(parseFloat(event.attributes.price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/portal/live/${eventId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/events/${eventId}`,
      client_reference_id: session.user.email,
      metadata: {
        eventId: eventId,
        userEmail: session.user.email,
        type: 'ppv_purchase',
      },
      customer_email: session.user.email,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
    });

    // Create pending purchase record in Strapi
    await fetch(`${strapiUrl}/api/ppv-purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          eventId: eventId,
          userEmail: session.user.email,
          stripeSessionId: checkoutSession.id,
          amount: event.attributes.price,
          currency: 'usd',
          status: 'pending',
          purchaseDate: new Date().toISOString(),
        },
      }),
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('PPV Checkout Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}