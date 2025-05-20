export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  trialStartDate: Date;
  trialEndDate: Date;
  isActive: boolean;
  hasActiveSubscription: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type QRCodeType = 'url' | 'menu' | 'both';

export interface MenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface Menu {
  restaurantName: string;
  description?: string;
  categories: MenuCategory[];
}

export interface QRCodeLink {
  label: string;
  url: string;
  type: string;
}

export interface QRCode {
  id: string;
  name: string;
  type: QRCodeType;
  url: string;
  originalUrl: string;
  links: QRCodeLink[];
  menu?: Menu;
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
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAdmin: () => boolean;
  isTrialActive: () => boolean;
  isTrialExpired: () => boolean;
  daysLeftInTrial: () => number | null;
  refreshUserProfile?: () => Promise<void>;
}

export interface AdminStats {
  totalUsers: number;
  activeTrials: number;
  subscribers: number;
  expiredTrials: number;
}
