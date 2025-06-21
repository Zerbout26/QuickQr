import axios, { AxiosError, AxiosResponse } from 'axios';
import { User } from '@/types';

const API_BASE_URL = 'https://quickqr-heyg.onrender.com/api';

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
  register: async (data: { email: string; phone: string; password: string; name?: string }) => {
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

  updateProfile: async (data: { name?: string; email?: string; phone?: string }) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  resetPassword: async (data: { email: string; newPassword: string; confirmPassword: string }) => {
    const response = await api.patch('/users/reset-password', data);
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },
  
  verifyEmail: async (email: string) => {
    const response = await api.post('/users/verify-email', { email });
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
    type: 'url' | 'menu' | 'both' | 'direct' | 'vitrine';
    url?: string;
    logoUrl?: string;
    foregroundColor: string;
    backgroundColor: string;
    textAbove?: string;
    textBelow?: string;
    links?: { label: string; url: string; type: string }[];
    menu?: {
      restaurantName: string;
      description?: string;
      categories: {
        name: string;
        items: {
          name: string;
          description?: string;
          price: number;
          imageUrl?: string;
        }[];
      }[];
    };
    vitrine?: {
      hero: {
        businessName: string;
        logo?: string;
        tagline: string;
        cta: {
          text: string;
          link: string;
        };
      };
      about: {
        description: string;
        city: string;
      };
      services: Array<{
        name: string;
        description?: string;
        imageUrl?: string;
        title?: string;
        imageDescription?: string;
      }>;
      gallery: Array<{
        imageUrl: string;
        title?: string;
        description?: string;
      }>;
      testimonials: Array<{
        text: string;
        author: string;
        city?: string;
      }>;
      contact: {
        address?: string;
        phone: string;
        email: string;
        socialMedia: {
          facebook?: string;
          instagram?: string;
          twitter?: string;
          linkedin?: string;
          youtube?: string;
          tiktok?: string;
        };
        contactForm?: {
          enabled: boolean;
          fields: Array<{
            name: string;
            type: 'text' | 'email' | 'phone' | 'textarea';
            required: boolean;
          }>;
        };
      };
      footer: {
        copyright: string;
        businessName: string;
        quickLinks: Array<{
          label: string;
          url: string;
        }>;
        socialIcons: {
          facebook?: string;
          instagram?: string;
          twitter?: string;
          linkedin?: string;
          youtube?: string;
          tiktok?: string;
        };
      };
    };
  }) => {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('name', data.name);
    formData.append('type', data.type);
    formData.append('foregroundColor', data.foregroundColor);
    formData.append('backgroundColor', data.backgroundColor);
    
    if (data.textAbove) formData.append('textAbove', data.textAbove);
    if (data.textBelow) formData.append('textBelow', data.textBelow);
    
    // Add type-specific data
    if (data.type === 'direct' && data.url) {
      formData.append('url', data.url);
    }
    
    if ((data.type === 'url' || data.type === 'both') && data.links) {
      formData.append('links', JSON.stringify(data.links));
    }
    
    if ((data.type === 'menu' || data.type === 'both') && data.menu) {
      formData.append('menu', JSON.stringify(data.menu));
    }
    
    if (data.type === 'vitrine' && data.vitrine) {
      formData.append('vitrine', JSON.stringify(data.vitrine));
    }
    
    const response = await api.post('/qrcodes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  update: async (id: string, data: {
    name?: string;
    type?: 'url' | 'menu' | 'both' | 'direct' | 'vitrine';
    url?: string;
    logoUrl?: string;
    foregroundColor?: string;
    backgroundColor?: string;
    textAbove?: string;
    textBelow?: string;
    links?: { label: string; url: string; type: string }[];
    menu?: {
      restaurantName: string;
      description?: string;
      categories: {
        name: string;
        items: {
          name: string;
          description?: string;
          price: number;
          imageUrl?: string;
        }[];
      }[];
    };
    vitrine?: {
      hero: {
        businessName: string;
        logo?: string;
        tagline: string;
        cta: {
          text: string;
          link: string;
        };
      };
      about: {
        description: string;
        city: string;
      };
      services: Array<{
        name: string;
        description?: string;
        imageUrl?: string;
        title?: string;
        imageDescription?: string;
      }>;
      gallery: Array<{
        imageUrl: string;
        title?: string;
        description?: string;
      }>;
      testimonials: Array<{
        text: string;
        author: string;
        city?: string;
      }>;
      contact: {
        address?: string;
        phone: string;
        email: string;
        socialMedia: {
          facebook?: string;
          instagram?: string;
          twitter?: string;
          linkedin?: string;
          youtube?: string;
          tiktok?: string;
        };
        contactForm?: {
          enabled: boolean;
          fields: Array<{
            name: string;
            type: 'text' | 'email' | 'phone' | 'textarea';
            required: boolean;
          }>;
        };
      };
      footer: {
        copyright: string;
        businessName: string;
        quickLinks: Array<{
          label: string;
          url: string;
        }>;
        socialIcons: {
          facebook?: string;
          instagram?: string;
          twitter?: string;
          linkedin?: string;
          youtube?: string;
          tiktok?: string;
        };
      };
    };
  }) => {
    const response = await api.put(`/qrcodes/${id}`, data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/qrcodes');
    return response.data;
  },

  getQRCode: async (id: string) => {
    const response = await api.get(`/qrcodes/${id}`);
    return response.data;
  },

  getPublicQRCode: async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/qrcodes/public/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 5000
      });
    return response.data;
    } catch (error) {
      console.error('Error fetching QR code:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    const response = await api.delete(`/qrcodes/${id}`);
    return response.data;
  },

  incrementScanCount: async (id: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/qrcodes/${id}/scan`, {}, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 3000
      });
    return response.data;
    } catch (error) {
      console.error('Error incrementing scan count:', error);
      throw error;
    }
  }
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
  getAllUsers: async (page = 1, limit = 10): Promise<{ data: User[], totalPages: number, total: number }> => {
    const response = await api.get('/admin/users', { params: { page, limit } });
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<User> => {
    const response = await api.patch(`/users/admin/users/${userId}/status`, { isActive });
    return response.data;
  }
};
