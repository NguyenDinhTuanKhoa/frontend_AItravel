const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      return { error: data.message || 'Something went wrong' };
    }
    
    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
}

// Auth APIs
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};

// User APIs
export const userApi = {
  getProfile: () => fetchApi('/users/profile'),
  updateProfile: (data: object) =>
    fetchApi('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// Destination APIs
export const destinationApi = {
  getAll: (params?: { category?: string; priceRange?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi(`/destinations${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => fetchApi(`/destinations/${id}`),
};

// Review APIs
export const reviewApi = {
  getByDestination: (destinationId: string) =>
    fetchApi(`/reviews/destination/${destinationId}`),
  create: (data: object) =>
    fetchApi('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// Itinerary APIs
export const itineraryApi = {
  getAll: () => fetchApi('/itineraries'),
  create: (data: object) =>
    fetchApi('/itineraries', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) =>
    fetchApi(`/itineraries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi(`/itineraries/${id}`, { method: 'DELETE' }),
};

// Recommendation APIs
export const recommendationApi = {
  // Gợi ý cá nhân hóa
  getPersonalized: (limit = 10) =>
    fetchApi(`/recommendations/personalized?limit=${limit}`),
  
  // Điểm đến tương tự
  getSimilar: (destinationId: string, limit = 6) =>
    fetchApi(`/recommendations/similar/${destinationId}?limit=${limit}`),
  
  // Gợi ý từ users tương tự
  getCollaborative: (limit = 10) =>
    fetchApi(`/recommendations/collaborative?limit=${limit}`),
  
  // Điểm đến phổ biến
  getPopular: (limit = 10) =>
    fetchApi(`/recommendations/popular?limit=${limit}`),
  
  // Điểm đến trending
  getTrending: (limit = 10) =>
    fetchApi(`/recommendations/trending?limit=${limit}`),
  
  // Tracking
  trackView: (destinationId: string, timeSpent = 0) =>
    fetchApi('/recommendations/track/view', {
      method: 'POST',
      body: JSON.stringify({ destinationId, timeSpent })
    }),
  
  trackSearch: (query: string, filters = {}) =>
    fetchApi('/recommendations/track/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters })
    }),
  
  // Lưu điểm đến
  toggleSave: (destinationId: string) =>
    fetchApi(`/recommendations/save/${destinationId}`, { method: 'POST' }),
  
  // Lấy đã lưu
  getSaved: () => fetchApi('/recommendations/saved'),
  
  // Thống kê
  getStats: () => fetchApi('/recommendations/stats'),
};

// AI APIs
export const aiApi = {
  // Chat với AI
  chat: (messages: { role: string; content: string }[]) =>
    fetchApi<{ response: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),

  // Chat streaming
  chatStream: async (
    messages: { role: string; content: string }[],
    onChunk: (chunk: string) => void
  ) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const res = await fetch(`${API_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ messages }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch {}
        }
      }
    }
  },

  // Gợi ý lịch trình
  suggestItinerary: (data: {
    destination: string;
    days: number;
    budget?: string;
    interests?: string[];
  }) =>
    fetchApi<{ suggestion: string }>('/ai/suggest-itinerary', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Gợi ý điểm đến
  suggestDestinations: (data: {
    travelStyle?: string[];
    budget?: string;
    interests?: string[];
    duration?: string;
  }) =>
    fetchApi<{ suggestion: string }>('/ai/suggest-destinations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Hỏi về điểm đến
  askDestination: (destination: string, question: string) =>
    fetchApi<{ answer: string }>('/ai/ask-destination', {
      method: 'POST',
      body: JSON.stringify({ destination, question }),
    }),
};
