export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  skipUnauthorizedRedirect?: boolean;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = localStorage.getItem('raffleadmin_token');

  const headers: Record<string, string> = {
    ...options.headers,
  };

  // Only set Content-Type to application/json if body is NOT FormData
  // FormData handles its own boundary and Content-Type automatically
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (!options.skipUnauthorizedRedirect) {
      localStorage.removeItem('raffleadmin_token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred');
  }

  return response.json();
}
