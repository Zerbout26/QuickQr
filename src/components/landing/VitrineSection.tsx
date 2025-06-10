import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink } from 'lucide-react';

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
      imageUrl?: string;
      imageDescription?: string;
    }>;
    gallery: Array<{
      imageUrl: string;
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
      socialMedia: Record<string, string>;
    };
    footer: {
      copyright: string;
      businessName: string;
      quickLinks: Array<{
        label: string;
        url: string;
      }>;
    };
  };
  menuLanguage: 'en' | 'ar';
}

const getPlatformInfo = (type: string) => {
  const platforms: Record<string, { label: string; icon: any; bgColor: string; hoverBgColor: string }> = {
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

const VitrineSection = ({ vitrine, menuLanguage }: VitrineSectionProps) => {
  if (!vitrine) return null;

  return (
    <div className="space-y-16 mt-12" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-black/10 -z-10 rounded-3xl"></div>
        <motion.h2 
          className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {vitrine.hero.businessName}
        </motion.h2>
        {vitrine.hero.tagline && (
          <motion.p 
            className="text-white/90 mt-4 text-lg sm:text-xl max-w-3xl mx-auto px-4 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {vitrine.hero.tagline}
          </motion.p>
        )}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {vitrine.hero.ctas.map((cta, index) => {
            const { label, icon: Icon } = getPlatformInfo(cta.type);
            return (
              <motion.a
                key={index}
                href={cta.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 sm:px-8 py-3 text-base sm:text-lg font-medium rounded-full text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] whitespace-nowrap bg-[#22c55e] hover:bg-[#16a34a]"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-base sm:text-lg">{label}</span>
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
          <div className="absolute inset-0 bg-black/10 -z-10 rounded-3xl"></div>
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {menuLanguage === 'ar' ? 'من نحن' : 'About Us'}
          </h3>
          <p className="text-white/90 text-lg sm:text-xl leading-relaxed">
            {vitrine.about.description}
          </p>
          {vitrine.about.city && (
            <p className="text-white/80 mt-4 text-lg font-medium">
              {vitrine.about.city}
            </p>
          )}
        </motion.div>
      )}

      {/* Services Section */}
      {vitrine.services.length > 0 && (
        <div className="space-y-10 px-4">
          <motion.h3 
            className="text-3xl sm:text-4xl font-bold text-white text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {menuLanguage === 'ar' ? 'خدماتنا' : 'Our Services'}
          </motion.h3>
          <div className={`grid gap-8 ${
            vitrine.services.length === 1 
              ? 'grid-cols-1 max-w-2xl mx-auto' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {vitrine.services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {service.imageUrl && (
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
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
                  <h4 className="text-2xl font-bold text-white mb-3">{service.name}</h4>
                  {service.description && (
                    <p className="text-white/90 mb-4 text-base leading-relaxed">{service.description}</p>
                  )}
                  {service.title && (
                    <p className="text-white/80 font-medium">{service.title}</p>
                  )}
                  {service.imageDescription && (
                    <p className="text-white/70 mt-2 text-sm">{service.imageDescription}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {vitrine.gallery.length > 0 && (
        <div className="space-y-10 px-4">
          <motion.h3 
            className="text-3xl sm:text-4xl font-bold text-white text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {menuLanguage === 'ar' ? 'معرض الصور' : 'Gallery'}
          </motion.h3>
          <div className={`grid gap-8 ${
            vitrine.gallery.length === 1 
              ? 'grid-cols-1 max-w-2xl mx-auto' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {vitrine.gallery.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title || `Gallery image ${index + 1}`}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  {item.title && (
                    <h4 className="text-2xl font-bold text-white mb-3">{item.title}</h4>
                  )}
                  {item.description && (
                    <p className="text-white/90 text-base leading-relaxed">{item.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      {vitrine.testimonials.length > 0 && (
        <div className="space-y-10 px-4">
          <motion.h3 
            className="text-3xl sm:text-4xl font-bold text-white text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {menuLanguage === 'ar' ? 'آراء العملاء' : 'Testimonials'}
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {vitrine.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 relative"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute top-4 left-4 text-6xl text-white/10 font-serif">"</div>
                <p className="text-white/90 text-lg leading-relaxed mb-6 mt-4">"{testimonial.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-lg">{testimonial.author}</span>
                  {testimonial.city && (
                    <span className="text-white/80 text-base">{testimonial.city}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="space-y-10 px-4">
        <motion.h3 
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {menuLanguage === 'ar' ? 'اتصل بنا' : 'Contact Us'}
        </motion.h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <motion.div 
            className="space-y-6 bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {vitrine.contact.address && (
              <div>
                <h4 className="font-bold text-white text-lg mb-2">
                  {menuLanguage === 'ar' ? 'العنوان' : 'Address'}
                </h4>
                <p className="text-white/90 text-base">{vitrine.contact.address}</p>
              </div>
            )}
            {vitrine.contact.phone && (
              <div>
                <h4 className="font-bold text-white text-lg mb-2">
                  {menuLanguage === 'ar' ? 'الهاتف' : 'Phone'}
                </h4>
                <p className="text-white/90 text-base">{vitrine.contact.phone}</p>
              </div>
            )}
            {vitrine.contact.email && (
              <div>
                <h4 className="font-bold text-white text-lg mb-2">
                  {menuLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </h4>
                <p className="text-white/90 text-base">{vitrine.contact.email}</p>
              </div>
            )}
          </motion.div>
          <motion.div 
            className="space-y-6 bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="font-bold text-white text-lg mb-4">
              {menuLanguage === 'ar' ? 'تابعنا' : 'Follow Us'}
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {/* Social Media Links */}
              {Object.entries(vitrine.contact.socialMedia).map(([platform, url]) => {
                if (!url) return null;
                const { label, icon: Icon } = getPlatformInfo(platform);
                return (
                  <motion.a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 bg-[#22c55e] hover:bg-[#16a34a]"
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </motion.a>
                );
              })}
              {/* CTA Links */}
              {vitrine.hero.ctas.map((cta, index) => {
                const { label, icon: Icon } = getPlatformInfo(cta.type);
                return (
                  <motion.a
                    key={`cta-${index}`}
                    href={cta.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 bg-[#22c55e] hover:bg-[#16a34a]"
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <motion.div 
        className="border-t border-white/10 pt-12 mt-16 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <p className="text-white/80 text-base">
            {vitrine.footer.copyright} <span className="text-white font-medium">{vitrine.footer.businessName}</span>
          </p>
          {vitrine.footer.quickLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              {vitrine.footer.quickLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors duration-200 text-base font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VitrineSection; 