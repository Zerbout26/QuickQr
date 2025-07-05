import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink, MapPin, Image as ImageIcon, Phone, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface LandingPageColors {
  primaryColor: string;
  primaryHoverColor: string;
  accentColor: string;
  backgroundGradient: string;
  loadingSpinnerColor: string;
  loadingSpinnerBorderColor: string;
}

interface VitrineSectionProps {
  vitrine: {
    hero: {
      businessName: string;
      tagline?: string;
      ctas: Array<{
        type: string;
        link: string;
      }>;
    };
    about: {
      description?: string;
      city?: string;
    };
    services: Array<{
      name: string;
      description?: string;
      title?: string;
      images?: string[];
      imageUrl?: string;
      imageDescription?: string;
    }>;
    gallery: Array<{
      images?: string[];
      imageUrl?: string;
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
      phone?: string;
      email?: string;
      socialMedia?: Record<string, string>;
    };
    footer: {
      copyright: string;
      businessName: string;
      quickLinks?: Array<{
        label: string;
        url: string;
      }>;
      socialIcons?: Record<string, string>;
    };
  };
  menuLanguage: 'en' | 'ar';
  colors: LandingPageColors;
}

const getPlatformInfo = (type: string) => {
  const platforms: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; bgColor: string; hoverBgColor: string }> = {
    facebook: {
      label: 'Facebook',
      icon: Facebook,
      bgColor: '#1877F2',
      hoverBgColor: '#0D6EFD',
    },
    instagram: {
      label: 'Instagram',
      icon: Instagram,
      bgColor: '#E4405F',
      hoverBgColor: '#C13584',
    },
    twitter: {
      label: 'Twitter',
      icon: Twitter,
      bgColor: '#1DA1F2',
      hoverBgColor: '#0D8ECF',
    },
    linkedin: {
      label: 'LinkedIn',
      icon: Linkedin,
      bgColor: '#0A66C2',
      hoverBgColor: '#004182',
    },
    youtube: {
      label: 'YouTube',
      icon: Youtube,
      bgColor: '#FF0000',
      hoverBgColor: '#CC0000',
    },
    spotify: {
      label: 'Spotify',
      icon: Music,
      bgColor: '#1DB954',
      hoverBgColor: '#1AA34A',
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: MessageCircle,
      bgColor: '#25D366',
      hoverBgColor: '#128C7E',
    },
    telegram: {
      label: 'Telegram',
      icon: Send,
      bgColor: '#0088CC',
      hoverBgColor: '#006699',
    },
    phone: {
      label: 'Call',
      icon: Phone,
      bgColor: '#10B981',
      hoverBgColor: '#059669',
    },
    viber: {
      label: 'Viber',
      icon: MessageSquare,
      bgColor: '#7360F2',
      hoverBgColor: '#5B4BC4',
    },
    tiktok: {
      label: 'TikTok',
      icon: Music,
      bgColor: '#000000',
      hoverBgColor: '#25F4EE',
    },
    location: {
      label: 'Location',
      icon: MapPin,
      bgColor: '#FF4B4B',
      hoverBgColor: '#FF0000',
    },
    website: {
      label: 'Website',
      icon: Globe,
      bgColor: '#4A90E2',
      hoverBgColor: '#357ABD',
    },
    other: {
      label: 'Link',
      icon: ExternalLink,
      bgColor: '#6B7280',
      hoverBgColor: '#4B5563',
    },
  };

  return platforms[type] || platforms.other;
};

// Add image optimization helper
const getOptimizedImageUrl = (url: string, width: number = 800) => {
  if (!url) return '';
  // If using Cloudinary
  if (url.includes('cloudinary')) {
    return url.replace('/upload/', `/upload/w_${width},c_scale,f_auto,q_auto/`);
  }
  return url;
};

// Add blur placeholder component
const BlurImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const optimizedSrc = getOptimizedImageUrl(src);
  const blurSrc = getOptimizedImageUrl(src, 20); // Tiny version for blur

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence>
        {!isLoaded && !error && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-200 animate-pulse"
          />
        )}
      </AnimatePresence>
      <img
        src={blurSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <img
        src={optimizedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

const VitrineSection = ({ vitrine, menuLanguage, colors }: VitrineSectionProps) => {
  // Debug: Log vitrine data to see what images are available
  console.log('=== VITRINE DEBUG ===');
  console.log('Full vitrine data:', vitrine);
  if (vitrine?.services) {
    console.log('Services:', vitrine.services);
    vitrine.services.forEach((service, index) => {
      console.log(`Service ${index}:`, {
        name: service.name,
        images: service.images,
        imageUrl: service.imageUrl,
        imageCount: service.images?.length || 0,
        hasImageUrl: !!service.imageUrl
      });
    });
  }
  if (vitrine?.gallery) {
    console.log('Gallery:', vitrine.gallery);
    vitrine.gallery.forEach((item, index) => {
      console.log(`Gallery ${index}:`, {
        title: item.title,
        images: item.images,
        imageUrl: item.imageUrl,
        imageCount: item.images?.length || 0,
        hasImageUrl: !!item.imageUrl
      });
    });
  }
  console.log('=== END DEBUG ===');

  if (!vitrine) return null;

  return (
    <div className="space-y-8 sm:space-y-16 mt-8 sm:mt-12" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12 relative px-4">
        <div 
          className="absolute inset-0 -z-10 rounded-2xl sm:rounded-3xl"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primaryColor}20, white, ${colors.accentColor}20)`
          }}
        ></div>
        

        
        <motion.h2 
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-gray-800 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {vitrine.hero.businessName}
        </motion.h2>
        {vitrine.hero.tagline && (
          <motion.p 
            className="text-gray-600 mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto px-4 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {vitrine.hero.tagline}
          </motion.p>
        )}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-2">
          {vitrine.hero.ctas.map((cta, index) => {
            const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(cta.type);
            
            // Handle different CTA types
            const getCtaProps = () => {
              switch (cta.type) {
                case 'phone':
                  return {
                    href: `tel:${cta.link}`,
                    target: undefined,
                    rel: undefined,
                    onClick: (e: React.MouseEvent) => {
                      e.preventDefault();
                      window.location.href = `tel:${cta.link}`;
                    }
                  };
                case 'whatsapp':
                  return {
                    href: `https://wa.me/${cta.link.replace(/\D/g, '')}`,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  };
                case 'viber':
                  return {
                    href: `viber://chat?number=${cta.link.replace(/\D/g, '')}`,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    onClick: (e: React.MouseEvent) => {
                      e.preventDefault();
                      // Try Viber app first, fallback to web
                      window.location.href = `viber://chat?number=${cta.link.replace(/\D/g, '')}`;
                      // Fallback after a short delay
                      setTimeout(() => {
                        window.open(`https://viber.com/contact/${cta.link.replace(/\D/g, '')}`, '_blank');
                      }, 1000);
                    }
                  };
                default:
                  return {
                    href: cta.link,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  };
              }
            };

            const ctaProps = getCtaProps();

            return (
              <motion.a
                key={index}
                {...ctaProps}
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-3 text-sm sm:text-base lg:text-lg font-medium rounded-full text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] whitespace-nowrap w-full sm:w-auto min-h-[44px] sm:min-h-[48px]"
                style={{ 
                  background: `linear-gradient(135deg, ${bgColor} 0%, ${hoverBgColor} 100%)`,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                }}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base lg:text-lg">{label}</span>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* About Section */}
      {vitrine.about.description && (
        <motion.div 
          className="max-w-3xl mx-auto text-center px-4 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="absolute inset-0 -z-10 rounded-2xl sm:rounded-3xl"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primaryColor}20, white, ${colors.accentColor}20)`
            }}
          ></div>
          <h3 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 px-2"
          >
            {menuLanguage === 'ar' ? 'من نحن' : 'About Us'}
          </h3>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed px-2">
            {vitrine.about.description}
          </p>
          {vitrine.about.city && (
            <p 
              className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-700 px-2"
            >
              {vitrine.about.city}
            </p>
          )}
        </motion.div>
      )}

      {/* Services Section */}
      {vitrine.services.length > 0 && (
        <div className="space-y-8 sm:space-y-10 px-4">
          <motion.h3 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {menuLanguage === 'ar' ? 'خدماتنا' : 'Our Services'}
          </motion.h3>
          <div className={`grid gap-6 sm:gap-8 ${
            vitrine.services.length === 1 
              ? 'grid-cols-1 max-w-2xl mx-auto' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {vitrine.services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div 
                  className="absolute inset-0 -z-10"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.primaryColor}10, ${colors.accentColor}05, transparent)`
                  }}
                ></div>
                {(service.images && service.images.length > 0) || service.imageUrl ? (
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                    <BlurImage
                      src={service.imageUrl || (service.images && service.images[0]) || ''}
                      alt={service.name}
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs sm:text-sm text-gray-500">{service.name}</p>
                    </div>
                  </div>
                )}
                <div 
                  className="p-4 sm:p-6"
                  style={{
                    background: `linear-gradient(to bottom right, white, ${colors.primaryColor}05)`
                  }}
                >
                  <h4 
                    className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-800"
                  >{service.name}</h4>
                  {service.description && (
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">{service.description}</p>
                  )}
                  {service.title && (
                    <p 
                      className="font-medium text-gray-700 text-sm sm:text-base"
                    >{service.title}</p>
                  )}
                  {service.imageDescription && (
                    <p className="text-gray-500 mt-2 text-xs sm:text-sm">{service.imageDescription}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {vitrine.gallery.length > 0 && (
        <div className="space-y-8 sm:space-y-10 px-4">
          <motion.h3 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {menuLanguage === 'ar' ? 'معرض الصور' : 'Gallery'}
          </motion.h3>
          <div className={`grid gap-6 sm:gap-8 ${
            vitrine.gallery.length === 1 
              ? 'grid-cols-1 max-w-2xl mx-auto' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {vitrine.gallery.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div 
                  className="absolute inset-0 -z-10"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.primaryColor}10, ${colors.accentColor}05, transparent)`
                  }}
                ></div>
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  {(item.images && item.images.length > 0) || item.imageUrl ? (
                    <BlurImage
                      src={item.imageUrl || (item.images && item.images[0]) || ''}
                      alt={item.title || `Gallery image ${index + 1}`}
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs sm:text-sm text-gray-500">{item.title || `Gallery ${index + 1}`}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div 
                  className="p-4 sm:p-6"
                  style={{
                    background: `linear-gradient(to bottom right, white, ${colors.primaryColor}05)`
                  }}
                >
                  {item.title && (
                    <h4 
                      className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3"
                      style={{ color: colors.primaryColor }}
                    >{item.title}</h4>
                  )}
                  {item.description && (
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{item.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      {vitrine.testimonials.length > 0 && (
        <div className="space-y-8 sm:space-y-10 px-4">
          <motion.h3 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {menuLanguage === 'ar' ? 'آراء العملاء' : 'Testimonials'}
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {vitrine.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 relative"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div 
                  className="absolute inset-0 rounded-xl sm:rounded-2xl -z-10"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.primaryColor}20, ${colors.accentColor}10, transparent)`
                  }}
                ></div>
                <div 
                  className="absolute top-3 sm:top-4 left-3 sm:left-4 text-4xl sm:text-6xl font-serif"
                  style={{ color: `${colors.primaryColor}10` }}
                >"</div>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 mt-3 sm:mt-4">"{testimonial.text}"</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <span 
                    className="font-bold text-base sm:text-lg text-gray-800"
                  >{testimonial.author}</span>
                  {testimonial.city && (
                    <span 
                      className="text-sm sm:text-base text-gray-700"
                    >{testimonial.city}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="space-y-8 sm:space-y-10 px-4">
        <motion.h3 
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {menuLanguage === 'ar' ? 'اتصل بنا' : 'Contact Us'}
        </motion.h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 max-w-4xl mx-auto">
          <motion.div 
            className="space-y-4 sm:space-y-6 bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="absolute inset-0 rounded-xl sm:rounded-2xl -z-10"
              style={{
                background: `linear-gradient(to bottom right, ${colors.primaryColor}20, ${colors.accentColor}10, transparent)`
              }}
            ></div>
            {vitrine.contact.address && (
              <div>
                <h4 
                  className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800"
                >
                  {menuLanguage === 'ar' ? 'العنوان' : 'Address'}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">{vitrine.contact.address}</p>
              </div>
            )}
            {vitrine.contact.phone && (
              <div>
                <h4 
                  className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800"
                >
                  {menuLanguage === 'ar' ? 'الهاتف' : 'Phone'}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">{vitrine.contact.phone}</p>
              </div>
            )}
            {vitrine.contact.email && (
              <div>
                <h4 
                  className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800"
                >
                  {menuLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">{vitrine.contact.email}</p>
              </div>
            )}
          </motion.div>
          <motion.div 
            className="space-y-4 sm:space-y-6 bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="absolute inset-0 rounded-xl sm:rounded-2xl -z-10"
              style={{
                background: `linear-gradient(to bottom right, ${colors.primaryColor}20, ${colors.accentColor}10, transparent)`
              }}
            ></div>
            <h4 
              className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-800"
            >
              {menuLanguage === 'ar' ? 'تابعنا' : 'Follow Us'}
            </h4>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {/* Social Media Links */}
              {vitrine.contact.socialMedia && Object.entries(vitrine.contact.socialMedia).map(([platform, url]) => {
                if (!url) return null;
                const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(platform);
                return (
                  <motion.a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 min-h-[44px] sm:min-h-[40px]"
                    style={{ 
                      background: `linear-gradient(135deg, ${bgColor} 0%, ${hoverBgColor} 100%)`,
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                    }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-medium">{label}</span>
                  </motion.a>
                );
              })}
              {/* CTA Links */}
              {vitrine.hero.ctas.map((cta, index) => {
                const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(cta.type);
                return (
                  <motion.a
                    key={`cta-${index}`}
                    href={cta.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 min-h-[44px] sm:min-h-[40px]"
                    style={{ 
                      background: `linear-gradient(135deg, ${bgColor} 0%, ${hoverBgColor} 100%)`,
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                    }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-medium">{label}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <motion.div 
        className="border-t border-gray-200 pt-8 sm:pt-12 mt-12 sm:mt-16 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-6 sm:gap-8">
            <div className="flex-1 min-w-[200px]">
              <p className="text-gray-400 text-sm sm:text-base">&copy; {vitrine.footer.copyright} {vitrine.footer.businessName}</p>
            </div>
            {vitrine.footer.quickLinks && vitrine.footer.quickLinks.length > 0 && (
              <div className="flex-1 min-w-[200px]">
                <h4 
                  className="font-semibold mb-2 sm:mb-3 text-gray-800 text-sm sm:text-base"
                >
                  {menuLanguage === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                </h4>
                <ul className="space-y-1 sm:space-y-2">
                  {vitrine.footer.quickLinks.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.url} 
                        className="text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {vitrine.footer.socialIcons && Object.keys(vitrine.footer.socialIcons).length > 0 && (
              <div className="flex-1 min-w-[200px] text-center sm:text-right">
                <h4 
                  className="font-semibold mb-2 sm:mb-3 text-gray-800 text-sm sm:text-base"
                >
                  {menuLanguage === 'ar' ? 'تابعنا' : 'Follow Us'}
                </h4>
                <div className="flex justify-center sm:justify-end gap-3 sm:gap-4">
                  {Object.entries(vitrine.footer.socialIcons).map(([platform, link]) => {
                    if (!link) return null;
                    const { icon: Icon, bgColor } = getPlatformInfo(platform);
                    return (
                      <motion.a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VitrineSection; 