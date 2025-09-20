'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PPVPurchase from '@/components/PPVPurchase';

interface Event {
  id: string;
  attributes: {
    title: string;
    description: string;
    shortDescription?: string;
    eventDate: string;
    duration?: number;
    isPPV: boolean;
    isLive: boolean;
    streamStatus: 'scheduled' | 'live' | 'ended' | 'cancelled';
    price?: number;
    category: string;
    slug: string;
    featuredImage?: {
      data: {
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ppv' | 'free'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const response = await fetch(`${strapiUrl}/api/events?populate=*&sort=eventDate:desc`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    switch (filter) {
      case 'ppv':
        return event.attributes.isPPV;
      case 'free':
        return !event.attributes.isPPV;
      default:
        return true;
    }
  });

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-red-400';
      case 'scheduled':
        return 'text-yellow-400';
      case 'ended':
        return 'text-gray-400';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              Live <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Events</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience exclusive live streaming events, interviews, and premium content from PlayazKlub
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-1 border border-yellow-500/20">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'all'
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('ppv')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'ppv'
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              Premium PPV
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                filter === 'free'
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              Free Events
            </button>
          </div>
        </div>

        {error && (
          <div className="text-center mb-8">
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-red-200 max-w-md mx-auto">
              {error}
            </div>
          </div>
        )}

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
            <p className="text-gray-400">
              {filter === 'all' 
                ? 'Check back soon for upcoming live events!' 
                : `No ${filter} events available at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300">
                {/* Event Image */}
                {event.attributes.featuredImage?.data && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${event.attributes.featuredImage.data.attributes.url}`}
                      alt={event.attributes.featuredImage.data.attributes.alternativeText || event.attributes.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {event.attributes.isLive && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        LIVE
                      </div>
                    )}
                    {event.attributes.isPPV && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                        PPV
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Event Status */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.attributes.streamStatus === 'live' ? 'bg-red-500 animate-pulse' :
                      event.attributes.streamStatus === 'scheduled' ? 'bg-yellow-400' :
                      'bg-gray-500'
                    }`}></div>
                    <span className={`text-sm font-semibold ${getEventStatusColor(event.attributes.streamStatus)}`}>
                      {event.attributes.streamStatus.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      • {new Date(event.attributes.eventDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Event Title & Description */}
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {event.attributes.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {event.attributes.shortDescription || event.attributes.description}
                  </p>

                  {/* Event Details */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                    <span className="bg-gray-800 px-2 py-1 rounded">
                      {event.attributes.category}
                    </span>
                    {event.attributes.duration && (
                      <span>{event.attributes.duration} minutes</span>
                    )}
                  </div>

                  {/* Action Button */}
                  {event.attributes.isPPV ? (
                    <PPVPurchase
                      eventId={event.id}
                      title={event.attributes.title}
                      price={event.attributes.price || 0}
                      description={event.attributes.shortDescription}
                      eventDate={event.attributes.eventDate}
                      streamStatus={event.attributes.streamStatus}
                      className="mt-4"
                    />
                  ) : (
                    <Link
                      href={`/events/${event.attributes.slug}`}
                      className="block w-full text-center bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      {event.attributes.streamStatus === 'live' ? 'Join Free Stream' : 'View Details'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}