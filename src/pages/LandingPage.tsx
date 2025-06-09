import { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink, MapPin, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy load components
const MenuSection = lazy(() => import('@/components/landing/MenuSection'));
const VitrineSection = lazy(() => import('@/components/landing/VitrineSection'));
const SocialLinks = lazy(() => import('@/components/landing/SocialLinks'));

const LandingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Preload critical assets
  useEffect(() => {
    if (qrCode?.logoUrl) {
      const img = new Image();
      img.src = qrCode.logoUrl;
    }
  }, [qrCode?.logoUrl]);

  // Translations for menu display
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
  };

  // Function to map platform type to label, icon, and colors
  const getPlatformInfo = (type: string): { label: string; icon: React.ElementType; bgColor: string; hoverBgColor: string } => {
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
  };

  // Update the isItemAvailableToday function
  const isItemAvailableToday = (item: MenuItem): boolean => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return item.availability?.[today] ?? true;
  };

  // Function to detect menu language
  const detectMenuLanguage = (menu: any): 'en' | 'ar' => {
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
  };

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        if (!id) {
          setError('No QR code ID provided');
          setLoading(false);
          return;
        }

        // Start loading state
        setLoading(true);

        // Fetch QR code data and increment scan count in parallel
        const [data] = await Promise.all([
          qrCodeApi.getPublicQRCode(id),
          qrCodeApi.incrementScanCount(id)
        ]);

        setQRCode(data);
        
        // Handle direct URL type - redirect to original URL
        if (data.type === 'direct' && data.originalUrl) {
          window.location.href = data.originalUrl;
          return;
        }
        
        // Automatically detect and set menu language
        if (data.menu) {
          const detectedLanguage = detectMenuLanguage(data.menu);
          setMenuLanguage(detectedLanguage);
        }
        
        setLoading(false);
      } catch (err: any) {
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
  }, [id, navigate]);

  useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-lg text-gray-700 font-medium">{translations[menuLanguage].loading}</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center space-y-6 max-w-sm mx-auto px-4">
          <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{translations[menuLanguage].error}</h1>
          <p className="text-lg text-gray-600">{error || translations[menuLanguage].qrCodeNotFound}</p>
          <Button
            className="px-6 py-3 text-lg font-medium rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl"
            onClick={() => navigate('/')}
          >
            {translations[menuLanguage].returnHome}
          </Button>
        </div>
      </div>
    );
  }

  const hasUrls = qrCode.links && qrCode.links.length > 0;
  const hasMenu = qrCode.menu && qrCode.menu.categories && qrCode.menu.categories.length > 0;
  const hasVitrine = qrCode.type === 'vitrine' && qrCode.vitrine;

  return (
    <div
      className="min-h-screen py-4 sm:py-8 px-0 sm:px-4 font-sans"
      style={{
        background: `radial-gradient(circle at top, ${qrCode.backgroundColor || '#f9fafb'} 0%, ${qrCode.backgroundColor ? adjustColor(qrCode.backgroundColor, -30) : '#e5e7eb'} 100%)`,
      }}
    >
      <div className="w-full sm:max-w-2xl lg:max-w-7xl mx-auto">
        <Card className="overflow-hidden rounded-none sm:rounded-3xl shadow-2xl border-none bg-white/95 backdrop-blur-xl transition-all duration-300 hover:shadow-3xl">
          {qrCode.logoUrl && (
            <div className="flex justify-center pt-8 sm:pt-12">
              <img
                src={qrCode.logoUrl}
                alt="Logo"
                className="h-24 sm:h-36 w-auto object-contain transition-all duration-300 hover:scale-105"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          )}

          <CardContent className="p-4 sm:p-8 md:p-12">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-8 sm:mb-10 tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
            >
              {qrCode.name}
            </h1>

            {hasUrls && (
              <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading social links...</div>}>
                <SocialLinks links={qrCode.links} menuLanguage={menuLanguage} />
              </Suspense>
            )}

            {hasMenu && (
              <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading menu...</div>}>
                <MenuSection
                  menu={qrCode.menu}
                  menuLanguage={menuLanguage}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              </Suspense>
            )}

            {hasVitrine && (
              <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading vitrine...</div>}>
                <VitrineSection vitrine={qrCode.vitrine} menuLanguage={menuLanguage} />
              </Suspense>
            )}

            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500">
                {translations[menuLanguage].poweredBy} <span className="font-medium">QuickQR</span>
              </p>
            </div>
          </CardContent>
        </Card>
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
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

export default LandingPage;

