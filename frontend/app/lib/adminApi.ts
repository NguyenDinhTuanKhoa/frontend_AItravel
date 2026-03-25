const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function fetchAdmin<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const res = await fetch(`${API_URL}/admin${endpoint}`, {
      ...options,
      cache: 'no-store', // Disable cache
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await res.json();
    if (!res.ok) return { error: data.message || 'Error' };
    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
}

export const adminApi = {
  // Stats
  getStats: () => fetchAdmin('/stats'),

  // Users
  getUsers: (page = 1, search = '') => 
    fetchAdmin(`/users?page=${page}&search=${search}`),
  updateUserRole: (id: string, role: string) =>
    fetchAdmin(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (id: string) =>
    fetchAdmin(`/users/${id}`, { method: 'DELETE' }),

  // Destinations
  getDestinations: (page = 1, search = '', category = '') =>
    fetchAdmin(`/destinations?page=${page}&search=${search}&category=${category}`),
  createDestination: (data: object) =>
    fetchAdmin('/destinations', { method: 'POST', body: JSON.stringify(data) }),
  updateDestination: (id: string, data: object) =>
    fetchAdmin(`/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDestination: (id: string) =>
    fetchAdmin(`/destinations/${id}`, { method: 'DELETE' }),

  // Reviews
  getReviews: (page = 1) => fetchAdmin(`/reviews?page=${page}`),
  deleteReview: (id: string) => fetchAdmin(`/reviews/${id}`, { method: 'DELETE' }),
};
