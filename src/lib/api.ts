import axios from 'axios';
import { User } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

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
  }) => {
    const response = await api.post('/qrcodes', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/qrcodes');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/qrcodes/${id}`);
    return response.data;
  },

  update: async (id: string, data: {
    name?: string;
    url?: string;
    logoUrl?: string;
    foregroundColor?: string;
    backgroundColor?: string;
  }) => {
    const response = await api.patch(`/qrcodes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/qrcodes/${id}`);
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
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/admin/users');
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<User> => {
    const response = await api.patch(`/users/admin/users/${userId}/status`, { isActive });
    return response.data;
  }
}; 