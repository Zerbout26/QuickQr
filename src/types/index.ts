
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
}

export interface QRCode {
  id: string;
  userId: string;
  name: string;
  url: string;
  logoUrl?: string;
  foregroundColor: string;
  backgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAdmin: () => boolean;
  isTrialActive: () => boolean;
  isTrialExpired: () => boolean;
  daysLeftInTrial: () => number | null;
}
