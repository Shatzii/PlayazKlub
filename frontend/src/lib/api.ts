const STRAPI_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-strapi-url.com'
  : 'http://localhost:1337'; // Use Strapi backend

export interface Podcast {
  id: number;
  documentId: string;
  title: string;
  description: string;
  audioUrl: string;
  publishDate: string;
  duration?: number;
  publishedAt: string;
}

export async function getPodcasts(): Promise<Podcast[]> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${STRAPI_URL}/api/podcasts?populate=*`, {
      signal: controller.signal,
      cache: 'no-store', // Prevent caching issues
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`API responded with status: ${response.status}`);
      return []; // Return empty array instead of throwing
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.warn('Error fetching podcasts, returning empty array:', error);
    return []; // Return empty array on any error
  }
}