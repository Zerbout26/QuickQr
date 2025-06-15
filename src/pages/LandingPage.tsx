import React, { useEffect, useState, Suspense, lazy, useMemo, useCallback, useTransition } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink, MapPin, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load components with prefetch
const MenuSection = lazy(() => import('@/components/landing/MenuSection'));
const VitrineSection = lazy(() => import('@/components/landing/VitrineSection'));
const SocialLinks = lazy(() => import('@/components/landing/SocialLinks'));

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Preload critical components
const preloadComponents = () => {
  const components = [
    () => import('@/components/landing/MenuSection'),
    () => import('@/components/landing/VitrineSection'),
    () => import('@/components/landing/SocialLinks')
  ];
  components.forEach(component => component());
};

// Prefetch data for a QR code with aggressive caching
const prefetchQRCodeData = async (id: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout to 3s
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/qrcodes/public/${id}`, {
      signal: controller.signal,
      headers: {
        'Accept-Encoding': 'gzip',
        'Accept': 'application/json',
        'Cache-Control': 'max-age=3600'
      },
      cache: 'force-cache' // Force browser cache
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Failed to prefetch data');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error prefetching QR code data:', error);
    return null;
  }
};

// Memoized translations
const translations = {
  en: {
    price: 'Price',
    available: 'Available',
    notAvailable: 'Not Available',
    poweredBy: 'Powered by',
    loading: 'Loading...',
    error: 'Error',
    returnHome: 'Return to Home',
    qrCodeNotFound: 'QR code not found',
    failedToLoad: 'Failed to load QR code',
    followUs: {
      facebook: 'Follow us on Facebook',
      instagram: 'Follow us on Instagram',
      twitter: 'Follow us on Twitter',
      linkedin: 'Connect on LinkedIn',
      youtube: 'Subscribe on YouTube',
      tiktok: 'Follow us on TikTok',
      whatsapp: 'Chat on WhatsApp',
      telegram: 'Join our Telegram',
      website: 'Visit our Website',
      location: 'Find our Location',
      other: 'Visit Link'
    }
  },
  ar: {
    price: 'السعر',
    available: 'متوفر',
    notAvailable: 'غير متوفر',
    poweredBy: 'مدعوم بواسطة',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    returnHome: 'العودة للرئيسية',
    qrCodeNotFound: 'رمز QR غير موجود',
    failedToLoad: 'فشل تحميل رمز QR',
    followUs: {
      facebook: 'تابعنا على فيسبوك',
      instagram: 'تابعنا على انستغرام',
      twitter: 'تابعنا على تويتر',
      linkedin: 'تواصل معنا على لينكد إن',
      youtube: 'اشترك في قناتنا على يوتيوب',
      tiktok: 'تابعنا على تيك توك',
      whatsapp: 'تواصل معنا على واتساب',
      telegram: 'انضم إلى قناتنا على تيليجرام',
      website: 'زر موقعنا',
      location: 'اعثر على موقعنا',
      other: 'زيارة الرابط'
    }
  }
} as const;

const LandingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Memoized platform info
  const getPlatformInfo = useCallback((type: string): { label: string; icon: React.ElementType; bgColor: string; hoverBgColor: string } => {
    const platformLabels = translations[menuLanguage].followUs;
    switch (type) {
      case 'facebook':
        return { label: platformLabels.facebook, icon: Facebook, bgColor: '#1877F2', hoverBgColor: '#166FE5' };
      case 'instagram':
        return { label: platformLabels.instagram, icon: Instagram, bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', hoverBgColor: 'linear-gradient(45deg, #e08423 0%, #d6582c 25%, #cc1733 50%, #bc1356 75%, #ac0878 100%)' };
      case 'twitter':
        return { label: platformLabels.twitter, icon: Twitter, bgColor: '#1DA1F2', hoverBgColor: '#1A91DA' };
      case 'linkedin':
        return { label: platformLabels.linkedin, icon: Linkedin, bgColor: '#0A66C2', hoverBgColor: '#095BB5' };
      case 'youtube':
        return { label: platformLabels.youtube, icon: Youtube, bgColor: '#FF0000', hoverBgColor: '#E60000' };
      case 'tiktok':
        return { label: platformLabels.tiktok, icon: Music, bgColor: '#000000', hoverBgColor: '#1A1A1A' };
      case 'whatsapp':
        return { label: platformLabels.whatsapp, icon: MessageCircle, bgColor: '#25D366', hoverBgColor: '#20BA56' };
      case 'telegram':
        return { label: platformLabels.telegram, icon: Send, bgColor: '#0088CC', hoverBgColor: '#0077B5' };
      case 'website':
        return { label: platformLabels.website, icon: Globe, bgColor: '#6366F1', hoverBgColor: '#4F46E5' };
      case 'location':
        return { label: platformLabels.location, icon: MapPin, bgColor: '#FF4B4B', hoverBgColor: '#E63E3E' };
      default:
        return { label: platformLabels.other, icon: ExternalLink, bgColor: '#6366F1', hoverBgColor: '#4F46E5' };
    }
  }, [menuLanguage]);

  // Memoized availability check
  const isItemAvailableToday = useCallback((item: MenuItem): boolean => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return item.availability?.[today] ?? true;
  }, []);

  // Memoized language detection
  const detectMenuLanguage = useCallback((menu: any): 'en' | 'ar' => {
    if (!menu) return 'en';
    
    // Check restaurant name
    if (menu.restaurantName && isArabicText(menu.restaurantName)) {
      return 'ar';
    }

    // Check categories and items
    if (menu.categories) {
      for (const category of menu.categories) {
        // Check category name
        if (category.name && isArabicText(category.name)) {
          return 'ar';
        }

        // Check items
        if (category.items) {
          for (const item of category.items) {
            if ((item.name && isArabicText(item.name)) || 
                (item.description && isArabicText(item.description))) {
              return 'ar';
            }
          }
        }
      }
    }

    return 'en';
  }, []);

  // Preload critical assets immediately
  useEffect(() => {
    if (id) {
      // Start prefetching immediately
      const prefetchPromise = prefetchQRCodeData(id);
      preloadComponents();

      // Set a timeout for initial load
      const timeoutId = setTimeout(() => {
        if (!initialLoadComplete) {
          setLoading(false);
        }
      }, 500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [id]);

  // Optimized data fetching with caching and parallel requests
  useEffect(() => {
    let isMounted = true;
    const fetchQRCode = async () => {
      try {
        if (!id) {
          setError('No QR code ID provided');
          setLoading(false);
          return;
        }

        // Create AbortController for request cancellation
        const controller = new AbortController();
        const signal = controller.signal;

        // Parallel data fetching with reduced timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 2000)
        );

        // Use Promise.all for parallel requests
        const [data] = await Promise.race([
          Promise.all([
            qrCodeApi.getPublicQRCode(id),
            qrCodeApi.incrementScanCount(id)
          ]),
          timeoutPromise
        ]) as [QRCode, any];

        if (!isMounted) return;

        // Prepare content before showing it
        const detectedLanguage = data.menu ? detectMenuLanguage(data.menu) : 'en';
        
        // Use startTransition for non-urgent state updates
        startTransition(() => {
          if (!isMounted) return;
          
          setQRCode(data);
          setMenuLanguage(detectedLanguage);
          setContentReady(true);
          setInitialLoadComplete(true);
          
          // Handle direct URL type - redirect to original URL
          if (data.type === 'direct' && data.originalUrl) {
            window.location.href = data.originalUrl;
            return;
          }
        });
        
        // Only set loading to false after all data is ready
        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error('Error fetching QR code:', err);
        if (err.response) {
          if (err.response.status === 403) {
            navigate('/payment-instructions');
            return;
          }
          if (err.response.status === 404) {
            setError('QR code not found');
          } else {
            setError(err.response.data?.error || 'Failed to load QR code');
          }
        } else {
          setError('Failed to load QR code');
        }
        setLoading(false);
      }
    };

    fetchQRCode();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id, navigate, detectMenuLanguage]);

  // Add smooth scrolling behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  // Memoized loading component with optimized animation
  const LoadingComponent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img 
              src="/Logo QrCreator sur fond blanc (1).png" 
              alt="QR Creator Logo"
              className="w-full h-full object-contain animate-pulse"
              loading="eager"
            />
          </div>
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#8b5cf6] border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-[#8b5cf6] mb-2">Loading...</h2>
          <p className="text-gray-500 text-sm">Please wait while we prepare your content</p>
        </div>
      </div>
    </div>
  ), []);

  // Memoized error component
  const ErrorComponent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-white/80 mb-8">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-white text-[#8b5cf6] hover:bg-white/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  ), [error]);

  // Show loading state until everything is ready
  if (loading || !contentReady) return LoadingComponent;
  if (error) return ErrorComponent;
  if (!qrCode) return null;

  const hasMenu = qrCode.menu && qrCode.menu.categories.length > 0;
  const hasLinks = qrCode.links && qrCode.links.length > 0;
  const hasVitrine = qrCode.vitrine && Object.keys(qrCode.vitrine).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
      <div className="container mx-auto px-4 py-8">
        <main className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }} // Reduced from 0.2 to 0.1 for faster transition
            className="space-y-8"
          >
            {hasMenu && (
              <ErrorBoundary fallback={<div>Error loading menu</div>}>
                <Suspense fallback={<LoadingSkeleton />}>
                  <MenuSection
                    menu={qrCode.menu}
                    menuLanguage={menuLanguage}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                </Suspense>
              </ErrorBoundary>
            )}

            {hasLinks && (
              <ErrorBoundary fallback={<div>Error loading links</div>}>
                <Suspense fallback={<LoadingSkeleton />}>
                  <SocialLinks links={qrCode.links} menuLanguage={menuLanguage} />
                </Suspense>
              </ErrorBoundary>
            )}

            {hasVitrine && (
              <ErrorBoundary fallback={<div>Error loading vitrine</div>}>
                <Suspense fallback={<LoadingSkeleton />}>
                  <VitrineSection vitrine={qrCode.vitrine} menuLanguage={menuLanguage} />
                </Suspense>
              </ErrorBoundary>
            )}
          </motion.div>
        </main>

        {/* Watermark */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p className="mb-1">{translations[menuLanguage].poweredBy}</p>
          <a 
            href="https://www.qrcreator.xyz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#8b5cf6] hover:text-[#7c3aed] transition-colors font-medium"
          >
            www.qrcreator.xyz
          </a>
        </div>
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  color = color.replace(/^#/, '');
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to detect if text is in Arabic
function isArabicText(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

export default LandingPage;

