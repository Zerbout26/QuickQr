import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink, MapPin } from 'lucide-react';

interface Link {
  type: string;
  url: string;
}

interface SocialLinksProps {
  links: Link[];
  menuLanguage: 'en' | 'ar';
}

const getPlatformInfo = (type: string) => {
  const platforms = {
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
    tiktok: {
      label: 'TikTok',
      icon: Music,
      bgColor: '#000000',
      hoverBgColor: '#25F4EE',
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

  return platforms[type as keyof typeof platforms] || platforms.other;
};

const SocialLinks = ({ links, menuLanguage }: SocialLinksProps) => {
  if (!links || links.length === 0) return null;

  return (
    <motion.div 
      className="space-y-10 px-4"
      dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-3xl sm:text-4xl font-bold text-[#8b5cf6] text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {menuLanguage === 'ar' ? 'روابط التواصل' : 'Social Links'}
      </motion.h3>
      <motion.div 
        className="bg-white rounded-2xl p-8 shadow-lg relative max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 via-[#ec4899]/10 to-transparent rounded-2xl -z-10"></div>
        <div className={`grid ${links.length === 1 ? 'grid-cols-1 place-items-center' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
          {links.map((link, index) => {
            const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(link.type);
            return (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 ${
                  links.length === 1 ? 'w-[200px]' : ''
                }`}
                style={{ 
                  background: `linear-gradient(135deg, ${bgColor} 0%, ${hoverBgColor} 100%)`,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                }}
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
    </motion.div>
  );
};

export default SocialLinks;