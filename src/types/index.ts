export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'user' | 'admin';
  trialStartDate: Date;
  trialEndDate: Date;
  isActive: boolean;
  hasActiveSubscription: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalVisits?: number;
  totalQRCodes?: number;
  totalScans?: number;
  hasVitrine: boolean;
  hasMenu: boolean;
  hasProducts: boolean;
}

export type QRCodeType = 'url' | 'both' | 'direct' | 'vitrine' | 'products';

export interface VariantOption {
  name: string; // e.g. "Small", "Red"
  price?: number; // Optional price adjustment
}

export interface Variant {
  name: string; // e.g. "Size", "Color"
  options: VariantOption[];
}

export interface MenuItem {
  name: string;
  description?: string;
  price: number;
  images?: string[];
  imageUrl?: string; // legacy support
  availability?: Record<string, boolean>;
  variants?: Variant[];
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface Menu {
  restaurantName: string;
  description?: string;
  categories: MenuCategory[];
  currency?: string;
  orderable?: boolean;
  codFormEnabled?: boolean;
}

export interface Products {
  storeName: string;
  description?: string;
  products: MenuItem[];
  currency?: string;
  orderable?: boolean;
  codFormEnabled?: boolean;
}

export interface VitrineSection {
  hero: {
    businessName: string;
    logo?: string;
    tagline: string;
    ctas: Array<{
      text: string;
      link: string;
      type: string;
    }>;
  };
  about: {
    description: string;
    city: string;
  };
  services: Array<{
    name: string;
    description?: string;
    images?: string[];
    title?: string;
    imageDescription?: string;
  }>;
  gallery: Array<{
    images?: string[];
    title?: string;
    description?: string;
  }>;
  testimonials: Array<{
    text: string;
    author: string;
    city?: string;
  }>;
  contact: {
    address?: string;
    phone: string;
    email: string;
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
    };
    contactForm?: {
      enabled: boolean;
      fields: Array<{
        name: string;
        type: 'text' | 'email' | 'phone' | 'textarea';
        required: boolean;
      }>;
    };
  };
  footer: {
    copyright: string;
    businessName: string;
    quickLinks: Array<{
      label: string;
      url: string;
    }>;
    socialIcons: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
    };
  };
}

export interface QRCodeLink {
  label: string;
  url: string;
  type: string;
}

export interface QRCode {
  id: string;
  name: string;
  type: 'url' | 'menu' | 'vitrine' | 'links' | 'both' | 'direct' | 'products';
  url: string;
  scanCount: number;
  user: User;
  createdAt: Date;
  updatedAt: Date;
  logoUrl?: string;
  foregroundColor: string;
  backgroundColor: string;
  textAbove?: string;
  textBelow?: string;
  links: Link[];
  menu: Menu;
  products: Products;
  vitrine: VitrineSection;
  primaryColor?: string;
  primaryHoverColor?: string;
  accentColor?: string;
  backgroundGradient?: string;
  loadingSpinnerColor?: string;
  loadingSpinnerBorderColor?: string;
}

export interface Link {
        label: string;
        url: string;
  type: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, phone: string, password: string) => Promise<User>;
  signOut: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, phone: string, password: string) => Promise<User>;
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
