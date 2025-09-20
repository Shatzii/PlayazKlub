'use client';

import { useEffect, useState } from 'react';
import { Podcast } from '@/lib/api';

interface PodcastCardProps {
  podcast: Podcast;
}

function PodcastCard({ podcast }: PodcastCardProps) {
  return (
    <div className="bg-gradient-to-br from-yellow-900/10 to-yellow-800/10 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/20 hover:border-yellow-400/40 hover:bg-gradient-to-br hover:from-yellow-900/20 hover:to-yellow-800/20 transition-all duration-300">
      <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">
        {podcast.title || 'Untitled Episode'}
      </h3>
      <p
        className="text-gray-300 mb-4 line-clamp-3"
        dangerouslySetInnerHTML={{
          __html: podcast.description || 'No description available'
        }}
      />
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          {podcast.publishDate
            ? new Date(podcast.publishDate).toLocaleDateString()
            : 'Date not available'
          }
        </span>
        {podcast.duration && <span>{podcast.duration} min</span>}
      </div>
    </div>
  );
}

interface FeaturedPodcastsProps {
  initialPodcasts: Podcast[];
}

export default function FeaturedPodcasts({ initialPodcasts }: FeaturedPodcastsProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>(initialPodcasts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If initial podcasts is empty, try to fetch on client side
    if (initialPodcasts.length === 0) {
      setIsLoading(true);
      fetch('/api/podcasts')
        .then(res => res.json())
        .then(data => {
          setPodcasts(data || []);
        })
        .catch(error => {
          console.warn('Client-side fetch failed:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialPodcasts.length]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-yellow-900/10 to-yellow-800/10 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/20 animate-pulse">
            <div className="h-6 bg-yellow-500/20 rounded mb-3"></div>
            <div className="h-4 bg-yellow-500/20 rounded mb-2"></div>
            <div className="h-4 bg-yellow-500/20 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-yellow-500/20 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-400 text-2xl">🎧</span>
          </div>
          <p className="text-gray-400 text-lg mb-2">New episodes coming soon...</p>
          <p className="text-gray-500 text-sm">Check back later for our latest podcast content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {podcasts.slice(0, 3).map((podcast) => (
        <PodcastCard key={podcast.id || podcast.documentId} podcast={podcast} />
      ))}
    </div>
  );
}