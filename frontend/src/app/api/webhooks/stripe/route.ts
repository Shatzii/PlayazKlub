import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        console.log('PaymentIntent succeeded:', event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const { eventId, userEmail } = session.metadata!;
    
    if (!eventId || !userEmail) {
      throw new Error('Missing required metadata in session');
    }

    console.log(`Processing PPV purchase: Event ${eventId} for ${userEmail}`);

    // Update purchase record in Strapi
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    
    const updateResponse = await fetch(`${strapiUrl}/api/ppv-purchases`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        filters: {
          stripeSessionId: session.id,
        },
        data: {
          status: 'completed',
          stripePaymentIntentId: session.payment_intent as string,
          accessGrantedAt: new Date().toISOString(),
          amount: (session.amount_total! / 100).toString(), // Convert from cents
        },
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update purchase record: ${updateResponse.statusText}`);
    }

    // Grant access in OwnCast
    await grantOwnCastAccess(eventId, userEmail);

    console.log(`Successfully processed PPV purchase for ${userEmail}`);

  } catch (error) {
    console.error('Error handling checkout completion:', error);
    // You might want to implement retry logic or dead letter queue here
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    
    // Find and update the purchase record
    const response = await fetch(`${strapiUrl}/api/ppv-purchases`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        filters: {
          stripePaymentIntentId: paymentIntent.id,
        },
        data: {
          status: 'failed',
        },
      }),
    });

    if (!response.ok) {
      console.error('Failed to update failed payment record');
    }

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Grant access to OwnCast stream via admin API
 */
async function grantOwnCastAccess(eventId: string, userEmail: string): Promise<void> {
  try {
    const owncastUrl = process.env.OWNCAST_URL;
    const adminUser = process.env.OWNCAST_ADMIN_USER;
    const adminPass = process.env.OWNCAST_ADMIN_PASS;

    if (!owncastUrl || !adminUser || !adminPass) {
      throw new Error('OwnCast configuration missing in environment variables');
    }

    // Create basic auth credentials
    const credentials = Buffer.from(`${adminUser}:${adminPass}`).toString('base64');

    // Generate JWT token for user access
    const jwtPayload = {
      email: userEmail,
      eventId: eventId,
      accessLevel: 'viewer',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    // For production, use a proper JWT library
    // This is a simplified example
    const userDisplayName = userEmail.split('@')[0];

    // Method 1: Grant access via OwnCast admin API (if available)
    try {
      const response = await fetch(`${owncastUrl}/api/admin/access`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDisplayName: userDisplayName,
          userEmail: userEmail,
          accessLevel: 'viewer',
          scopes: ['chat', 'video'],
          metadata: {
            eventId: eventId,
            purchaseType: 'ppv',
            grantedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OwnCast API error: ${response.status} - ${errorText}`);
      }

      console.log(`Successfully granted OwnCast access for ${userEmail} to event ${eventId}`);

    } catch (apiError) {
      console.error('OwnCast admin API error:', apiError);
      
      // Method 2: Fallback - Store access grant in our database for manual/custom auth
      await storeAccessGrant(eventId, userEmail);
    }

  } catch (error) {
    console.error('Error granting OwnCast access:', error);
    throw error;
  }
}

/**
 * Fallback method to store access grant in our database
 */
async function storeAccessGrant(eventId: string, userEmail: string): Promise<void> {
  try {
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    
    // Create access grant record
    const response = await fetch(`${strapiUrl}/api/stream-access-grants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          eventId: eventId,
          userEmail: userEmail,
          grantedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          isActive: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to store access grant: ${response.statusText}`);
    }

    console.log(`Stored fallback access grant for ${userEmail} to event ${eventId}`);

  } catch (error) {
    console.error('Error storing access grant:', error);
    throw error;
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  });
}