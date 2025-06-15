import React, { useEffect, useState, Suspense, lazy, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Lazy load everything with prefetch
const MenuSection = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "menu-section" */
  '@/components/landing/MenuSection'
));
const VitrineSection = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "vitrine-section" */
  '@/components/landing/VitrineSection'
));
const SocialLinks = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "social-links" */
  '@/components/landing/SocialLinks'
));

// Dynamically import icons
const iconImport = (iconName: string) => lazy(() => import('lucide-react').then(module => ({
  default: module[iconName]
})));

const FacebookIcon = iconImport('Facebook');
const InstagramIcon = iconImport('Instagram');
const TwitterIcon = iconImport('Twitter');
const LinkedinIcon = iconImport('Linkedin');
const YoutubeIcon = iconImport('Youtube');
const MusicIcon = iconImport('Music');
const MessageCircleIcon = iconImport('MessageCircle');
const SendIcon = iconImport('Send');
const GlobeIcon = iconImport('Globe');
const ExternalLinkIcon = iconImport('ExternalLink');
const MapPinIcon = iconImport('MapPin');
const UtensilsIcon = iconImport('Utensils');

// Error boundary with minimal footprint
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

// Critical CSS inlined
const CriticalCSS = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
      .min-h-screen { min-height: 100vh; }
      .bg-gradient-to-br { background-image: linear-gradient(to bottom right, #8b5cf620, white, #ec489920); }
      .container { width: 100%; margin: 0 auto; padding: 0 1rem; }
      .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    `
  }} />
);

// Simplified loading skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

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
  const [contentReady, setContentReady] = useState(false);

  // Memoized platform info
  const getPlatformInfo = useCallback((type: string) => {
    const platformLabels = translations[menuLanguage].followUs;
    const platforms = {
      facebook: { label: platformLabels.facebook, icon: FacebookIcon, bgColor: '#1877F2', hoverBgColor: '#166FE5' },
      instagram: { label: platformLabels.instagram, icon: InstagramIcon, bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', hoverBgColor: 'linear-gradient(45deg, #e08423 0%, #d6582c 25%, #cc1733 50%, #bc1356 75%, #ac0878 100%)' },
      twitter: { label: platformLabels.twitter, icon: TwitterIcon, bgColor: '#1DA1F2', hoverBgColor: '#1A91DA' },
      linkedin: { label: platformLabels.linkedin, icon: LinkedinIcon, bgColor: '#0A66C2', hoverBgColor: '#095BB5' },
      youtube: { label: platformLabels.youtube, icon: YoutubeIcon, bgColor: '#FF0000', hoverBgColor: '#E60000' },
      tiktok: { label: platformLabels.tiktok, icon: MusicIcon, bgColor: '#000000', hoverBgColor: '#1A1A1A' },
      whatsapp: { label: platformLabels.whatsapp, icon: MessageCircleIcon, bgColor: '#25D366', hoverBgColor: '#20BA56' },
      telegram: { label: platformLabels.telegram, icon: SendIcon, bgColor: '#0088CC', hoverBgColor: '#0077B5' },
      website: { label: platformLabels.website, icon: GlobeIcon, bgColor: '#6366F1', hoverBgColor: '#4F46E5' },
      location: { label: platformLabels.location, icon: MapPinIcon, bgColor: '#FF4B4B', hoverBgColor: '#E63E3E' },
      default: { label: platformLabels.other, icon: ExternalLinkIcon, bgColor: '#6366F1', hoverBgColor: '#4F46E5' }
    };
    return platforms[type as keyof typeof platforms] || platforms.default;
  }, [menuLanguage]);

  // Memoized availability check
  const isItemAvailableToday = useCallback((item: MenuItem): boolean => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return item.availability?.[today] ?? true;
  }, []);

  // Optimized data fetching with caching
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        if (!id) {
          setError('No QR code ID provided');
          setLoading(false);
          return;
        }

        // Check session cache first
        const cachedData = sessionStorage.getItem(`qr_${id}`);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          if (isMounted) {
            setQRCode(data);
            setMenuLanguage(isArabicText(data.menu?.restaurantName) ? 'ar' : 'en');
            setContentReady(true);
            setLoading(false);
          }
          return;
        }

        // Set timeout for initial loading state
        const timeout = setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 1000);

        const [data] = await Promise.all([
          qrCodeApi.getPublicQRCode(id),
          qrCodeApi.incrementScanCount(id)
        ]);

        clearTimeout(timeout);

        if (!isMounted) return;

        // Cache in sessionStorage
        sessionStorage.setItem(`qr_${id}`, JSON.stringify(data));

        setQRCode(data);
        setMenuLanguage(isArabicText(data.menu?.restaurantName) ? 'ar' : 'en');
        setContentReady(true);
        setLoading(false);

        if (data.type === 'direct' && data.originalUrl) {
          window.location.href = data.originalUrl;
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

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, navigate]);

  // Arabic text detection helper
  const isArabicText = (text: string = ''): boolean => {
    return /[\u0600-\u06FF]/.test(text);
  };

  // Loading component
  const LoadingComponent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img 
              src="/Logo QrCreator sur fond blanc (1).png" 
              alt="QR Creator Logo"
              className="w-full h-full object-contain"
              loading="eager"
              width="96"
              height="96"
            />
          </div>
          <h2 className="text-xl font-bold text-[#8b5cf6] mb-2">Loading...</h2>
        </div>
      </div>
    </div>
  ), []);

  // Error component
  const ErrorComponent = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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

  if (loading || !contentReady) return <><CriticalCSS />{LoadingComponent}</>;
  if (error) return <><CriticalCSS />{ErrorComponent}</>;
  if (!qrCode) return null;

  const hasMenu = qrCode.menu?.categories?.length > 0;
  const hasLinks = qrCode.links?.length > 0;
  const hasVitrine = qrCode.vitrine && Object.keys(qrCode.vitrine).length > 0;

  return (
    <>
      <CriticalCSS />
      <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
        <div className="container mx-auto px-4 py-8">
          <main className="space-y-8">
            <div className="space-y-8">
              {hasMenu && (
                <ErrorBoundary>
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
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSkeleton />}>
                    <SocialLinks links={qrCode.links} menuLanguage={menuLanguage} />
                  </Suspense>
                </ErrorBoundary>
              )}

              {hasVitrine && (
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSkeleton />}>
                    <VitrineSection vitrine={qrCode.vitrine} menuLanguage={menuLanguage} />
                  </Suspense>
                </ErrorBoundary>
              )}
            </div>
          </main>

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
    </>
  );
};

export default LandingPage;