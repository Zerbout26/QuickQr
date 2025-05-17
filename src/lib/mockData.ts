
import { User, QRCode } from '../types';

// Mock users with different statuses
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'user',
    trialStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
    isActive: true,
    hasActiveSubscription: false
  },
  {
    id: '2',
    email: 'expired@example.com',
    name: 'Expired Trial',
    role: 'user',
    trialStartDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    trialEndDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    isActive: false,
    hasActiveSubscription: false
  },
  {
    id: '3',
    email: 'paid@example.com',
    name: 'Paid User',
    role: 'user',
    trialStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    trialEndDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago
    isActive: true,
    hasActiveSubscription: true
  },
  {
    id: '4',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    trialStartDate: new Date(),
    trialEndDate: new Date(),
    isActive: true,
    hasActiveSubscription: true
  }
];

// Mock QR codes
export const mockQRCodes: QRCode[] = [
  {
    id: '1',
    userId: '1',
    name: 'Website QR',
    url: 'https://example.com',
    foregroundColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    userId: '1',
    name: 'Contact Card',
    url: 'https://example.com/contact',
    logoUrl: 'https://placeholder.com/150',
    foregroundColor: '#8B5CF6',
    backgroundColor: '#F9FAFB',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    userId: '3',
    name: 'Product Page',
    url: 'https://example.com/product',
    foregroundColor: '#1F2937',
    backgroundColor: '#FFFFFF',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

// Login function that simulates authentication
export const mockLogin = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500);
  });
};

// Register function that simulates user creation
export const mockRegister = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockUsers.some(u => u.email === email)) {
        reject(new Error('User already exists'));
        return;
      }
      
      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        email,
        role: 'user',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        isActive: true,
        hasActiveSubscription: false
      };
      
      mockUsers.push(newUser);
      resolve(newUser);
    }, 500);
  });
};

// Function to get QR codes for a specific user
export const getUserQRCodes = (userId: string): Promise<QRCode[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userCodes = mockQRCodes.filter(code => code.userId === userId);
      resolve(userCodes);
    }, 300);
  });
};

// Function to create a new QR code
export const createQRCode = (qrCode: Omit<QRCode, 'id' | 'createdAt' | 'updatedAt'>): Promise<QRCode> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newQR: QRCode = {
        ...qrCode,
        id: `${mockQRCodes.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockQRCodes.push(newQR);
      resolve(newQR);
    }, 300);
  });
};

// Function to update a QR code
export const updateQRCode = (id: string, updates: Partial<QRCode>): Promise<QRCode> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockQRCodes.findIndex(qr => qr.id === id);
      if (index === -1) {
        reject(new Error('QR code not found'));
        return;
      }
      
      const updatedQR = {
        ...mockQRCodes[index],
        ...updates,
        updatedAt: new Date()
      };
      
      mockQRCodes[index] = updatedQR;
      resolve(updatedQR);
    }, 300);
  });
};

// Admin functions for managing users
export const activateUser = (userId: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockUsers.findIndex(u => u.id === userId);
      if (index === -1) {
        reject(new Error('User not found'));
        return;
      }
      
      mockUsers[index] = {
        ...mockUsers[index],
        isActive: true,
        hasActiveSubscription: true
      };
      
      resolve(mockUsers[index]);
    }, 300);
  });
};

export const deactivateUser = (userId: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockUsers.findIndex(u => u.id === userId);
      if (index === -1) {
        reject(new Error('User not found'));
        return;
      }
      
      mockUsers[index] = {
        ...mockUsers[index],
        isActive: false
      };
      
      resolve(mockUsers[index]);
    }, 300);
  });
};

export const getAllUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockUsers]);
    }, 300);
  });
};
