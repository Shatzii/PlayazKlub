'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Event {
  id: string;
  attributes: {
    title: string;
    description: string;
    eventDate: string;
    isPPV: boolean;
    isLive: boolean;
    streamStatus: 'scheduled' | 'live' | 'ended' | 'cancelled';
    price?: number;
    category: string;
    featuredImage?: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

interface AccessCheckResult {
  hasAccess: boolean;
  eventId: string;
}

export default function LiveStreamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const sessionId = searchParams.get('session_id');
  
  const [event, setEvent] = useState<Event | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [chatVisible, setChatVisible] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (eventId) {
      checkAccess();
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (sessionId && hasAccess) {
      // Clear session_id from URL after successful purchase
      const url = new URL(window.location.href);
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
    }
  }, [sessionId, hasAccess]);

  const fetchEvent = async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const response = await fetch(`${strapiUrl}/api/events/${eventId}?populate=*`);
      
      if (!response.ok) {
        throw new Error('Event not found');
      }

      const data = await response.json();
      setEvent(data.data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err instanceof Error ? err.message : 'Failed to load event');
    }
  };

  const checkAccess = async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      
      // First check if user is authenticated
      const authResponse = await fetch('/api/auth/session');
      const session = await authResponse.json();
      
      if (!session?.user?.email) {
        setError('Authentication required. Please sign in.');
        setLoading(false);
        return;
      }

      // Check if user has access to this event
      const accessResponse = await fetch(`${strapiUrl}/api/events/${eventId}/check-access`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (accessResponse.ok) {
        const accessData: AccessCheckResult = await accessResponse.json();
        setHasAccess(accessData.hasAccess);
        
        if (accessData.hasAccess) {
          await getStreamUrl();
        }
      } else {
        setHasAccess(false);
      }
    } catch (err) {
      console.error('Error checking access:', err);
      setError('Failed to verify access');
    } finally {
      setLoading(false);
    }
  };

  const getStreamUrl = async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const authResponse = await fetch('/api/auth/session');
      const session = await authResponse.json();

      const response = await fetch(`${strapiUrl}/api/events/${eventId}/stream-url`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStreamUrl(data.streamUrl);
      }
    } catch (err) {
      console.error('Error getting stream URL:', err);
    }
  };

  const initializePlayer = () => {
    if (videoRef.current && streamUrl) {
      // For OwnCast HLS streams
      if (window.Hls?.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoRef.current.src = streamUrl;
      }
    }
  };

  useEffect(() => {
    if (streamUrl && hasAccess) {
      initializePlayer();
    }
  }, [streamUrl, hasAccess]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-300 mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link
            href="/events"
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Required</h1>
          <p className="text-gray-300 mb-6">
            You need to purchase access to view this premium live stream.
          </p>
          <Link
            href={`/events`}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Purchase Access
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* HLS.js Script */}
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
      
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-sm border-b border-yellow-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/events"
              className="text-gray-300 hover:text-yellow-400 transition-colors"
            >
              ← Back to Events
            </Link>
            {event && (
              <div>
                <h1 className="text-xl font-bold text-white">{event.attributes.title}</h1>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    event.attributes.streamStatus === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-gray-300">{event.attributes.streamStatus.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setChatVisible(!chatVisible)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {chatVisible ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Player */}
        <div className={`${chatVisible ? 'w-3/4' : 'w-full'} bg-black flex items-center justify-center`}>
          {event?.attributes.streamStatus === 'live' && streamUrl ? (
            <div className="w-full h-full relative">
              <video
                ref={videoRef}
                controls
                autoPlay
                muted
                className="w-full h-full object-contain"
                poster={event.attributes.featuredImage?.data ? 
                  `${process.env.NEXT_PUBLIC_STRAPI_URL}${event.attributes.featuredImage.data.attributes.url}` : 
                  undefined
                }
              >
                Your browser does not support the video tag.
              </video>
              
              {/* Live Indicator */}
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                LIVE
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">📺</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {event?.attributes.streamStatus === 'scheduled' ? 'Stream Starting Soon' : 
                 event?.attributes.streamStatus === 'ended' ? 'Stream Ended' : 
                 'Stream Unavailable'}
              </h2>
              <p className="text-gray-300">
                {event?.attributes.streamStatus === 'scheduled' && 
                  `Starts at ${new Date(event.attributes.eventDate).toLocaleString()}`
                }
                {event?.attributes.streamStatus === 'ended' && 
                  'Thank you for watching! Check back for future events.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {chatVisible && (
          <div className="w-1/4 bg-gray-900 border-l border-yellow-500/20 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-bold">Live Chat</h3>
              <p className="text-gray-400 text-sm">Interact with other viewers</p>
            </div>
            
            <div className="flex-1 p-4">
              {/* OwnCast Chat Integration */}
              <div className="h-full">
                <iframe
                  src={`${process.env.NEXT_PUBLIC_OWNCAST_URL}/embed/chat`}
                  className="w-full h-full border-0"
                  title="Live Chat"
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      {event && (
        <div className="bg-black/90 backdrop-blur-sm border-t border-yellow-500/20 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-300">
                <span className="text-yellow-400 font-semibold">{event.attributes.category}</span>
                <span className="mx-2">•</span>
                <span>{new Date(event.attributes.eventDate).toLocaleDateString()}</span>
              </div>
              
              <div className="text-gray-400">
                Premium PlayazKlub Event
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add global HLS.js type
declare global {
  interface Window {
    Hls: any;
  }
}