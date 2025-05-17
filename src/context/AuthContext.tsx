
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { mockLogin, mockRegister } from '../lib/mockData';
import { toast } from '../components/ui/use-toast';

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  isAdmin: () => false,
  isTrialActive: () => false,
  isTrialExpired: () => false,
  daysLeftInTrial: () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await mockLogin(email, password);
      setUser(user);
      toast({
        title: "Signed in successfully",
        description: `Welcome back${user.name ? `, ${user.name}` : ''}!`,
      });
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

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await mockRegister(email, password);
      setUser(user);
      toast({
        title: "Account created",
        description: `Welcome to QR Code Generator! Your 14-day free trial has started.`,
      });
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
