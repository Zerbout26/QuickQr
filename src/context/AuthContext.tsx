import React, { createContext, useContext, useState, useEffect } from 'react';
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
  isAdmin: () => false,
  isTrialActive: () => false,
  isTrialExpired: () => false,
  daysLeftInTrial: () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved token and fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem('qr-generator-token');
    if (token) {
      authApi.getProfile()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('qr-generator-token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
