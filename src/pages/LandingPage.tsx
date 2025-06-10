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
      <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
            <p className="text-white/80">Please wait while we prepare your experience</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-white/80 mb-8">{error || translations[menuLanguage].qrCodeNotFound}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#22c55e] text-white rounded-full font-medium hover:bg-[#16a34a] transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasUrls = qrCode.links && qrCode.links.length > 0;
  const hasMenu = qrCode.menu && qrCode.menu.categories && qrCode.menu.categories.length > 0;
  const hasVitrine = qrCode.type === 'vitrine' && qrCode.vitrine;

  // Generate a dynamic gradient based on the QR code's background color
  const getBackgroundGradient = () => {
    const baseColor = qrCode.backgroundColor || '#f9fafb';
    return `radial-gradient(circle at top, ${baseColor} 0%, ${adjustColor(baseColor, -30)} 100%)`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8b5cf6]/20 via-white to-[#ec4899]/20">
      <div className="min-h-screen">
        <header className="relative py-12 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-black/10 -z-10"></div>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center">
              {qrCode.logoUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-12"
                >
                  <img
                    src={qrCode.logoUrl}
                    alt="Logo"
                    className="h-24 w-24 object-contain rounded-2xl shadow-lg bg-white/10 backdrop-blur-sm"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {hasUrls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black/10 rounded-3xl -z-10"></div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-100">
                    {menuLanguage === 'ar' ? 'تواصل معنا' : 'Connect With Us'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qrCode.links.map((link, index) => {
                    const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(link.type || 'website');
                    return (
                      <motion.a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-4 p-6 rounded-2xl text-gray-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] bg-white/10 backdrop-blur-sm"
                        style={{ 
                          background: `linear-gradient(135deg, ${bgColor} 0%, ${hoverBgColor} 100%)`,
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                        }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Icon className="w-8 h-8 text-gray-100" />
                        <span className="text-lg font-medium text-gray-100">{label}</span>
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {hasMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black/10 rounded-3xl -z-10"></div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-100">
                    {menuLanguage === 'ar' ? 'قائمة الطعام' : 'Menu'}
                  </h2>
                </div>
                <Suspense fallback={
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-transparent"></div>
                    <p className="mt-4 text-gray-100/80">Loading menu...</p>
                  </div>
                }>
                  <MenuSection
                    menu={qrCode.menu}
                    menuLanguage={menuLanguage}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                </Suspense>
              </motion.div>
            )}

            {hasVitrine && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black/10 rounded-3xl -z-10"></div>
                <Suspense fallback={
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-transparent"></div>
                    <p className="mt-4 text-gray-100/80">Loading vitrine...</p>
                  </div>
                }>
                  <VitrineSection vitrine={qrCode.vitrine} menuLanguage={menuLanguage} />
                </Suspense>
              </motion.div>
            )}
          </div>
        </main>
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

