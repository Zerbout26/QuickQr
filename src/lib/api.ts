import axios from 'axios';
import { User } from '@/types';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qr-generator-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
};

// QR Code API calls
export const qrCodeApi = {
  create: async (data: {
    name: string;
    url: string;
    logoUrl?: string;
    foregroundColor: string;
    backgroundColor: string;
    links: { label: string; url: string }[];
  }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('foregroundColor', data.foregroundColor);
    formData.append('backgroundColor', data.backgroundColor);
    formData.append('links', JSON.stringify(data.links));
    
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

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/qrcodes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch QR codes');
    return response.json();
  },

  getQRCode: async (id: string, requireAuth: boolean = true) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = localStorage.getItem('qr-generator-token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}/qrcodes/${id}`, {
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch QR code');
    return response.json();
  },

  update: async (id: string, data: {
    name?: string;
    url?: string;
    logoUrl?: string;
    foregroundColor?: string;
    backgroundColor?: string;
    links?: { label: string; url: string }[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/qrcodes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update QR code');
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