
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType } from '../types';
import { toast } from '../components/ui/use-toast';
import { authApi } from '../lib/api';

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signOut: () => {},
  login: async () => null,
  register: async () => null,
  logout: () => {},
  isAdmin: () => false,
  isTrialActive: () => false,
  isTrialExpired: () => false,
  daysLeftInTrial: () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Function to refresh user profile data
  const refreshUserProfile = useCallback(async () => {
    const token = localStorage.getItem('qr-generator-token');
    if (!token) {
      setUser(null);
      setLoading(false);
      setSessionChecked(true);
      return;
    }

    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      localStorage.removeItem('qr-generator-token');
      setUser(null);
    } finally {
      setLoading(false);
      setSessionChecked(true);
    }
  }, []);

  // Check for saved token and fetch user profile on mount
  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  // Set up refresh interval and visibility change handling
  useEffect(() => {
    if (!sessionChecked) return;

    // Refresh user data when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem('qr-generator-token')) {
        refreshUserProfile();
      }
    };

    // Set up periodic refresh (every 15 minutes)
    const intervalId = setInterval(() => {
      if (localStorage.getItem('qr-generator-token')) {
        refreshUserProfile();
      }
    }, 15 * 60 * 1000); // 15 minutes

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionChecked, refreshUserProfile]);

  const signIn = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const { user, token } = await authApi.login({ email, password });
      localStorage.setItem('qr-generator-token', token);
      setUser(user);
      toast({
        title: "Signed in successfully",
        description: `Welcome back${user.name ? `, ${user.name}` : ''}!`,
      });
      return user;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error?.response?.data?.error || "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const { user, token } = await authApi.register({ email, password });
      localStorage.setItem('qr-generator-token', token);
      setUser(user);
      toast({
        title: "Account created",
        description: `Welcome to QR Code Generator! Your 14-day free trial has started.`,
      });
      return user;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error?.response?.data?.error || "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('qr-generator-token');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  // Add aliases for backward compatibility
  const login = signIn;
  const register = signUp;
  const logout = signOut;

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
    login,
    register,
    logout,
    isAdmin,
    isTrialActive,
    isTrialExpired,
    daysLeftInTrial,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
