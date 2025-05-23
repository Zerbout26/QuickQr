import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as LucideIcons from 'lucide-react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';

const LandingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');

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
        return { label: platformLabels.website, icon: Globe, bgColor: 'var(--primary)', hoverBgColor: 'var(--primary-dark)' };
      default:
        return { label: platformLabels.other, icon: ExternalLink, bgColor: 'var(--primary)', hoverBgColor: 'var(--primary-dark)' };
    }
  };

  // Update the isItemAvailableToday function
  const isItemAvailableToday = (item: MenuItem): boolean => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return item.availability?.[today] ?? true;
  };

  // Function to detect if text is in Arabic
  const isArabicText = (text: string): boolean => {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicPattern.test(text);
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

        // First, increment the scan count
        await qrCodeApi.incrementScanCount(id);
        // Then fetch the updated QR code using the public endpoint
        const data = await qrCodeApi.getPublicQRCode(id);
        setQRCode(data);
        
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium tracking-tight">{translations[menuLanguage].loading}</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{translations[menuLanguage].error}</h1>
          <p className="text-xl text-gray-600 mb-6">{error || translations[menuLanguage].qrCodeNotFound}</p>
          <Button
            className="px-6 py-3 text-lg font-medium rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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

  return (
    <div
      className="min-h-screen py-12 px-4 font-sans"
      style={{
        background: `radial-gradient(circle at top, ${qrCode.backgroundColor || '#f9fafb'} 0%, ${qrCode.backgroundColor ? adjustColor(qrCode.backgroundColor, -30) : '#e5e7eb'} 100%)`,
      }}
    >
      <div className="container mx-auto max-w-5xl">
        <Card className="overflow-hidden rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-sm">
          {qrCode.logoUrl && (
            <div className="flex justify-center pt-10">
              <img
                src={qrCode.logoUrl}
                alt="Logo"
                className="h-28 w-auto object-contain transition-transform duration-200 hover:scale-105"
              />
            </div>
          )}

          <CardContent className="p-6 md:p-10">
            <h1
              className="text-4xl md:text-5xl font-extrabold text-center mb-8 tracking-tight text-primary"
              dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
            >
              {qrCode.name}
            </h1>

            {/* Links Section */}
            {hasUrls && (
              <div className="mb-10">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {qrCode.links.map((link, index) => {
                    const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(link.type || 'default');
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button
                          className="w-full text-lg py-6 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50 focus:ring-primary flex items-center justify-center gap-3"
                          style={{
                            background: bgColor,
                            color: '#ffffff',
                            '--hover-bg': hoverBgColor,
                          } as React.CSSProperties}
                          onMouseEnter={(e) => (e.currentTarget.style.background = hoverBgColor)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = bgColor)}
                        >
                          <Icon size={24} />
                          <span>{label}</span>
                        </Button>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Separator for sections */}
            {hasUrls && hasMenu && (
              <Separator className="my-10 bg-gray-200/50" />
            )}

            {/* Menu Section */}
            {hasMenu && (
              <div className="space-y-8" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
                <div className="text-center mb-6">
                  <h2
                    className="text-3xl font-semibold tracking-tight text-primary"
                  >
                    {qrCode.menu?.restaurantName}
                  </h2>
                  {qrCode.menu?.description && (
                    <p className="text-gray-500 mt-3 text-base max-w-2xl mx-auto">
                      {qrCode.menu.description}
                    </p>
                  )}
                </div>

                <div className="space-y-8">
                  {qrCode.menu?.categories.map((category) => (
                    <div key={category.name} className="menu-category">
                      <h3
                        className="text-xl font-semibold text-center py-3 rounded-t-lg border-b-2 transition-colors duration-200 text-primary border-primary"
                      >
                        {category.name}
                      </h3>

                      <div className="space-y-3 p-4 rounded-b-lg bg-gray-50/50">
                        {category.items
                          .filter(item => isItemAvailableToday(item))
                          .map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                            >
                              <div className="flex-1 pr-6">
                                <div className="flex justify-between items-start mb-2">
                                  <h4
                                    className="text-lg font-semibold text-primary"
                                  >
                                    {item.name}
                                  </h4>
                                  <p
                                    className="text-lg font-semibold whitespace-nowrap ml-4 text-primary"
                                  >
                                    {translations[menuLanguage].price}: ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                {item.description && (
                                  <p className="text-gray-600 text-sm line-clamp-3">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              {item.imageUrl && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-20 w-20 object-cover rounded-lg transition-transform duration-200 hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = 'https://via.placeholder.com/80?text=No+Image';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500">
                {translations[menuLanguage].poweredBy} <span className="text-primary font-medium">QuickQR</span>
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

export default LandingPage;

