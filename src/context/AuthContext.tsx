
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { mockLogin, mockRegister } from '../lib/mockData';
import { toast } from '../components/ui/use-toast';

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signOut: () => {},
  isAdmin: () => false,
  isTrialActive: () => false,
  isTrialExpired: () => false,
  daysLeftInTrial: () => null,
});

// Initialize default admin account on first load
const initializeDefaultAdmin = () => {
  // Check if there's already an admin in localStorage to avoid overwriting
  const savedUser = localStorage.getItem('qr-generator-user');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role === 'admin') {
        return; // Admin already exists
      }
    } catch (error) {
      console.error('Failed to parse saved user', error);
    }
  }

  // Set default admin in localStorage if it doesn't exist
  const defaultAdmin: User = {
    id: 'admin-1',
    email: 'admin@qrcreator.com',
    name: 'System Admin',
    role: 'admin',
    trialStartDate: new Date(),
    trialEndDate: new Date(),
    isActive: true,
    hasActiveSubscription: true
  };

  // Store default admin in mock data storage
  if (!mockLogin('admin@qrcreator.com', 'adminpassword')
      .then(() => {})
      .catch(() => {
        // If admin doesn't exist in mock data, add it
        mockRegister('admin@qrcreator.com', 'adminpassword')
          .then(user => {
            // Update the role to admin after registration
            user.role = 'admin';
            user.name = 'System Admin';
            user.hasActiveSubscription = true;
          })
          .catch(err => console.error('Failed to create default admin', err));
      }));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize default admin on first load
  useEffect(() => {
    initializeDefaultAdmin();
  }, []);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('qr-generator-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Convert string dates back to Date objects
        parsedUser.trialStartDate = new Date(parsedUser.trialStartDate);
        parsedUser.trialEndDate = new Date(parsedUser.trialEndDate);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user', error);
        localStorage.removeItem('qr-generator-user');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('qr-generator-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('qr-generator-user');
    }
  }, [user]);

  const signIn = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const user = await mockLogin(email, password);
      setUser(user);
      toast({
        title: "Signed in successfully",
        description: `Welcome back${user.name ? `, ${user.name}` : ''}!`,
      });
      return user;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const user = await mockRegister(email, password);
      setUser(user);
      toast({
        title: "Account created",
        description: `Welcome to QR Code Generator! Your 14-day free trial has started.`,
      });
      return user;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isTrialActive = () => {
    if (!user) return false;
    
    // If user has active subscription, they're not in trial
    if (user.hasActiveSubscription) return false;
    
    const now = new Date();
    return now <= user.trialEndDate && user.isActive;
  };

  const isTrialExpired = () => {
    if (!user) return false;
    
    // If user has active subscription, trial expiration doesn't matter
    if (user.hasActiveSubscription) return false;
    
    const now = new Date();
    return now > user.trialEndDate;
  };

  const daysLeftInTrial = () => {
    if (!user || user.hasActiveSubscription) return null;
    
    const now = new Date();
    const endDate = new Date(user.trialEndDate);
    
    // If trial has expired, return 0
    if (now > endDate) return 0;
    
    // Calculate days left
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isTrialActive,
    isTrialExpired,
    daysLeftInTrial
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
