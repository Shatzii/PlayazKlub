'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface PPVPurchaseProps {
  eventId: string;
  title: string;
  price: number;
  description?: string;
  eventDate: string;
  streamStatus: 'scheduled' | 'live' | 'ended' | 'cancelled';
  className?: string;
}

export default function PPVPurchase({
  eventId,
  title,
  price,
  description,
  eventDate,
  streamStatus,
  className = ''
}: PPVPurchaseProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (status !== 'authenticated') {
      // Redirect to login
      window.location.href = '/api/auth/signin';
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ppv/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  // Check if event is available for purchase
  const isAvailableForPurchase = () => {
    if (streamStatus === 'ended' || streamStatus === 'cancelled') {
      return false;
    }
    return true;
  };

  // Get appropriate button text based on stream status
  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    
    switch (streamStatus) {
      case 'live':
        return `Join Live Stream - $${price}`;
      case 'scheduled':
        return `Pre-Order Access - $${price}`;
      case 'ended':
        return 'Event Ended';
      case 'cancelled':
        return 'Event Cancelled';
      default:
        return `Purchase Access - $${price}`;
    }
  };

  // Get status indicator
  const getStatusIndicator = () => {
    switch (streamStatus) {
      case 'live':
        return (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold">LIVE NOW</span>
          </div>
        );
      case 'scheduled':
        return (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-yellow-400 font-semibold">
              Starts {new Date(eventDate).toLocaleDateString()} at{' '}
              {new Date(eventDate).toLocaleTimeString()}
            </span>
          </div>
        );
      case 'ended':
        return (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400 font-semibold">Event Ended</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-red-400 font-semibold">Event Cancelled</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-gradient-to-br from-black via-gray-900 to-black rounded-lg p-6 border border-yellow-500/20 ${className}`}>
      <div className="text-center">
        {getStatusIndicator()}
        
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        
        {description && (
          <p className="text-gray-300 mb-4 text-sm">{description}</p>
        )}

        <div className="mb-6">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            ${price.toFixed(2)}
          </div>
          <p className="text-gray-400 text-sm">One-time purchase • Full access</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            disabled={!isAvailableForPurchase() || isLoading}
            className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
              isAvailableForPurchase() && !isLoading
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black hover:scale-105 shadow-lg shadow-yellow-500/25'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {getButtonText()}
          </button>

          {status !== 'authenticated' && (
            <p className="text-gray-400 text-xs">
              Sign in required to purchase access
            </p>
          )}
        </div>

        {/* Purchase benefits */}
        <div className="mt-6 pt-6 border-t border-yellow-500/20">
          <h4 className="text-yellow-400 font-semibold mb-3">Includes:</h4>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">✓</span>
              Full HD live stream access
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">✓</span>
              Interactive chat participation
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">✓</span>
              24-hour access after purchase
            </li>
            {streamStatus === 'scheduled' && (
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">✓</span>
                Early access & notifications
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}