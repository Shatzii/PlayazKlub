import { getPodcasts } from '@/lib/api';

export default async function PodcastsPage() {
  const podcasts = await getPodcasts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Podcasts</h1>
      
      {podcasts.length === 0 ? (
        <p className="text-gray-600">No podcasts available yet.</p>
      ) : (
        <div className="grid gap-6">
          {podcasts.map((podcast) => (
            <div key={podcast.id} className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{podcast.title}</h2>
              <p className="text-gray-600 mb-4">{podcast.description}</p>
              <div className="text-sm text-gray-500">
                <p>Published: {new Date(podcast.publishDate).toLocaleDateString()}</p>
                {podcast.duration && <p>Duration: {podcast.duration} minutes</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}