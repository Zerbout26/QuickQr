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
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-xl text-gray-700 font-medium tracking-tight animate-pulse">{translations[menuLanguage].loading}</p>
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

  // Function to render social links
  const renderSocialLinks = () => {
    if (!qrCode.links || qrCode.links.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {qrCode.links.map((link, index) => {
          const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(link.type);
          return (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-2xl text-white font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              style={{
                background: bgColor,
                '--hover-bg': hoverBgColor,
              } as any}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-base sm:text-lg">{label}</span>
            </motion.a>
          );
        })}
      </div>
    );
  };

  // Function to render menu items
  const renderMenuItems = () => {
    if (!qrCode.menu?.categories) return null;

    return (
      <div className="space-y-8 mt-8">
        {qrCode.menu.categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.items.map((item, itemIndex) => {
                const isAvailable = isItemAvailableToday(item);
                return (
                  <motion.div
                    key={itemIndex}
                    className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                    whileHover={{ y: -4 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.1 }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg sm:text-xl font-bold text-primary">
                            {item.price} {qrCode.menu?.currency || '$'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isAvailable ? translations[menuLanguage].available : translations[menuLanguage].notAvailable}
                          </span>
                        </div>
                      </div>
                      {item.imageUrl && (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to render vitrine section
  const renderVitrine = () => {
    if (!hasVitrine || !qrCode.vitrine) return null;

    return (
      <div className="space-y-12 mt-8" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {qrCode.vitrine.hero.businessName}
          </h2>
          {qrCode.vitrine.hero.tagline && (
            <p className="text-gray-600 mt-4 text-base sm:text-lg max-w-3xl mx-auto px-4">
              {qrCode.vitrine.hero.tagline}
            </p>
          )}
          {qrCode.vitrine.hero.cta.link && (
            <Button
              className="mt-6 px-6 sm:px-8 py-3 text-base sm:text-lg font-medium rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => window.open(qrCode.vitrine.hero.cta.link, '_blank')}
            >
              {qrCode.vitrine.hero.cta.text}
            </Button>
          )}
        </div>

        {/* About Section */}
        {qrCode.vitrine.about.description && (
          <div className="max-w-3xl mx-auto text-center px-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-4">About Us</h3>
            <p className="text-gray-600 text-base sm:text-lg">
              {qrCode.vitrine.about.description}
            </p>
            {qrCode.vitrine.about.city && (
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                {qrCode.vitrine.about.city}
              </p>
            )}
          </div>
        )}

        {/* Services Section */}
        {qrCode.vitrine.services.length > 0 && (
          <div className="space-y-8 px-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary text-center">Our Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCode.vitrine.services.map((service, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {service.imageUrl && (
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/144?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-primary mb-2">{service.name}</h4>
                    {service.description && (
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">{service.description}</p>
                    )}
                    {service.title && (
                      <p className="text-sm font-medium text-gray-500">{service.title}</p>
                    )}
                    {service.imageDescription && (
                      <p className="text-sm text-gray-500 mt-2">{service.imageDescription}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {qrCode.vitrine.gallery.length > 0 && (
          <div className="space-y-8 px-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary text-center">Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCode.vitrine.gallery.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={item.imageUrl}
                      alt={item.title || `Gallery image ${index + 1}`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    {item.title && (
                      <h4 className="text-xl font-bold text-primary mb-2">{item.title}</h4>
                    )}
                    {item.description && (
                      <p className="text-gray-600 text-sm sm:text-base">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        {qrCode.vitrine.testimonials.length > 0 && (
          <div className="space-y-8 px-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary text-center">Testimonials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {qrCode.vitrine.testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="text-gray-600 italic mb-4 text-sm sm:text-base">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{testimonial.author}</span>
                    {testimonial.city && (
                      <span className="text-gray-500 text-sm">{testimonial.city}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="space-y-8 px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-primary text-center">Contact Us</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              {qrCode.vitrine.contact.address && (
                <div>
                  <h4 className="font-medium text-gray-900 text-base sm:text-lg">Address</h4>
                  <p className="text-gray-600 text-sm sm:text-base">{qrCode.vitrine.contact.address}</p>
                </div>
              )}
              {qrCode.vitrine.contact.phone && (
                <div>
                  <h4 className="font-medium text-gray-900 text-base sm:text-lg">Phone</h4>
                  <p className="text-gray-600 text-sm sm:text-base">{qrCode.vitrine.contact.phone}</p>
                </div>
              )}
              {qrCode.vitrine.contact.email && (
                <div>
                  <h4 className="font-medium text-gray-900 text-base sm:text-lg">Email</h4>
                  <p className="text-gray-600 text-sm sm:text-base">{qrCode.vitrine.contact.email}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-base sm:text-lg">Follow Us</h4>
              <div className="flex flex-wrap gap-4">
                {Object.entries(qrCode.vitrine.contact.socialMedia).map(([platform, url]) => {
                  if (!url) return null;
                  const { icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(platform);
                  return (
                    <motion.a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full text-white transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: bgColor }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t pt-8 mt-12 px-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              {qrCode.vitrine.footer.copyright} {qrCode.vitrine.footer.businessName}
            </p>
            {qrCode.vitrine.footer.quickLinks.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {qrCode.vitrine.footer.quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors duration-200 text-sm sm:text-base"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
                loading="lazy"
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

            {hasUrls && renderSocialLinks()}
            {hasMenu && renderMenuItems()}
            {hasVitrine && renderVitrine()}

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

export default LandingPage;

