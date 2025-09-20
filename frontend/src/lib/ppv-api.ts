// API utility functions for PPV system

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Wrapper for fetch with error handling and retries
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<ApiResponse<T>> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, defaultOptions);
      const data = response.ok ? await response.json() : null;

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}`;
        throw new ApiError(errorMessage, response.status);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      if (i === retries - 1) {
        // Last retry failed
        if (error instanceof ApiError) {
          return {
            error: error.message,
            status: error.status,
          };
        }
        return {
          error: 'Network error or server unavailable',
          status: 500,
        };
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  return {
    error: 'Max retries exceeded',
    status: 500,
  };
}

/**
 * Check user's access to a specific event
 */
export async function checkEventAccess(eventId: string): Promise<boolean> {
  try {
    const response = await apiRequest(`/api/events/${eventId}/check-access`);
    return response.data?.hasAccess || false;
  } catch (error) {
    console.error('Error checking event access:', error);
    return false;
  }
}

/**
 * Create PPV checkout session
 */
export async function createPPVCheckout(eventId: string): Promise<{
  sessionId?: string;
  url?: string;
  error?: string;
}> {
  const response = await apiRequest('/api/ppv/checkout', {
    method: 'POST',
    body: JSON.stringify({ eventId }),
  });

  if (response.error) {
    return { error: response.error };
  }

  return {
    sessionId: response.data?.sessionId,
    url: response.data?.url,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}