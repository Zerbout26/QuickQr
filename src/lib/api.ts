import axios, { AxiosError, AxiosResponse } from 'axios';
import { User } from '@/types';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Keep track of if we are refreshing the token
let isRefreshingToken = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to subscribe to token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Function to notify subscribers about a new token
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qr-generator-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // Check if response contains a new token
    const newToken = response.headers['x-auth-token'];
    if (newToken) {
      localStorage.setItem('qr-generator-token', newToken);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    
    // If the error is not 401 or we've already tried to refresh, reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    const errorData = error.response.data as any;
    
    // Only handle token expired errors
    if (errorData.code !== 'TOKEN_EXPIRED') {
      return Promise.reject(error);
    }
    
    // Mark this request as retried
    originalRequest._retry = true;
    
    // If already refreshing, wait for new token
    if (isRefreshingToken) {
      try {
        const token = await new Promise<string>((resolve) => {
          subscribeTokenRefresh((token: string) => {
            resolve(token);
          });
        });
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    
    // Set refreshing flag
    isRefreshingToken = true;
    
    try {
      // Try to get a new token using current user credentials
      // This is a simplified approach - in production, you might use a refresh token
      const response = await authApi.silentRefresh();
      const { token } = response;
      
      // Save the new token
      localStorage.setItem('qr-generator-token', token);
      
      // Update authorization header
      originalRequest.headers.Authorization = `Bearer ${token}`;
      
      // Notify all subscribers about new token
      onTokenRefreshed(token);
      
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear token and reject
      localStorage.removeItem('qr-generator-token');
      window.location.href = '/signin'; // Redirect to login
      return Promise.reject(refreshError);
    } finally {
      isRefreshingToken = false;
    }
  }
);

// Auth API calls
export const authApi = {
  register: async (data: { email: string; password: string; name?: string }) => {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/users/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },
  
  silentRefresh: async () => {
    // In a real implementation, this would use a refresh token
    // For now, we'll simulate it with the current token
    const response = await api.post('/users/refresh-token');
    return response.data;
  }
};

// QR Code API calls
export const qrCodeApi = {
  create: async (data: {
    name: string;
    type: 'url' | 'menu' | 'both';
    url?: string;
    logoUrl?: string;
    foregroundColor: string;
    backgroundColor: string;
    textAbove?: string;
    textBelow?: string;
    links?: { label: string; url: string }[];
    menu?: {
      restaurantName: string;
      description?: string;
      categories: {
        name: string;
        items: {
          name: string;
          description?: string;
          price: number;
          category: string;
          imageUrl?: string;
        }[];
      }[];
    };
  }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    formData.append('foregroundColor', data.foregroundColor);
    formData.append('backgroundColor', data.backgroundColor);
    
    if ((data.type === 'url' || data.type === 'both') && data.links) {
      formData.append('links', JSON.stringify(data.links));
    }
    
    if ((data.type === 'menu' || data.type === 'both') && data.menu) {
      formData.append('menu', JSON.stringify(data.menu));
    }
    
    if (data.logoUrl) {
      formData.append('logoUrl', data.logoUrl);
    }

    const response = await fetch(`${API_BASE_URL}/qrcodes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to create QR code');
    return response.json();
  },

  update: async (id: string, data: {
    name: string;
    type: 'url' | 'menu' | 'both';
    url?: string;
    logoUrl?: string;
    foregroundColor: string;
    backgroundColor: string;
    links: string;
    menu: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/qrcodes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update QR code');
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/qrcodes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch QR codes');
    return response.json();
  },

  getQRCode: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/qrcodes/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch QR code');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/qrcodes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete QR code');
  },
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Admin API functions
export const adminApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/admin/users');
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<User> => {
    const response = await api.patch(`/users/admin/users/${userId}/status`, { isActive });
    return response.data;
  }
};
