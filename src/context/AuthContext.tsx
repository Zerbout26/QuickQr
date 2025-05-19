
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User, AuthContextType } from '@/types';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => Promise.resolve({}),
  signUp: () => Promise.resolve({}),
  signOut: () => {},
  isAdmin: () => false,
  isTrialActive: () => false,
  isTrialExpired: () => false,
  daysLeftInTrial: () => 0,
  // Adding aliases for compatibility
  login: () => Promise.resolve({}),
  register: () => Promise.resolve({}),
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('qrToken');
        
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/users/me');
          setUser(data);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('qrToken');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/users/login', {
        email,
        password
      });

      localStorage.setItem('qrToken', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // Fetch user data
      const { data: userData } = await api.get('/users/me');
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/users/register', {
        email,
        password
      });

      localStorage.setItem('qrToken', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // Fetch user data
      const { data: userData } = await api.get('/users/me');
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('qrToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isTrialActive = () => {
    if (!user) return false;
    
    const today = new Date();
    const trialEndDate = new Date(user.trialEndDate);
    
    return !user.hasActiveSubscription && user.isActive && today <= trialEndDate;
  };

  const isTrialExpired = () => {
    if (!user) return false;
    
    const today = new Date();
    const trialEndDate = new Date(user.trialEndDate);
    
    return !user.hasActiveSubscription && today > trialEndDate;
  };

  const daysLeftInTrial = () => {
    if (!user) return 0;
    
    const today = new Date();
    const trialEndDate = new Date(user.trialEndDate);
    const timeDiff = trialEndDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysLeft);
  };

  // Create alias functions for backward compatibility
  const login = signIn;
  const register = signUp;
  const logout = signOut;

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isTrialActive,
    isTrialExpired,
    daysLeftInTrial,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
