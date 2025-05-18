export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  trialStartDate: Date;
  trialEndDate: Date;
  isActive: boolean;
  hasActiveSubscription: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCode {
  id: string;
  name: string;
  url: string;
  originalUrl: string;
  links: { label: string; url: string }[];
  logoUrl?: string;
  foregroundColor: string;
  backgroundColor: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => void;
  isAdmin: () => boolean;
  isTrialActive: () => boolean;
  isTrialExpired: () => boolean;
  daysLeftInTrial: () => number | null;
}

export interface AdminStats {
  totalUsers: number;
  activeTrials: number;
  subscribers: number;
  expiredTrials: number;
}
