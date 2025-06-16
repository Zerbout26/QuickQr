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
      className="w-full px-4 py-8"
      dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {menuLanguage === 'ar' ? 'روابط التواصل' : 'Social Links'}
      </motion.h3>
      
      <motion.div 
        className="bg-white rounded-xl p-6 shadow-md max-w-md sm:max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 via-[#ec4899]/10 to-transparent rounded-xl -z-10"></div>
        
        <div className={`grid ${links.length === 1 ? 'grid-cols-1 place-items-center' : 'grid-cols-2'} gap-3 max-w-2xl mx-auto`}>
          {links.map((link, index) => {
            const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(link.type);
            return (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 text-sm sm:text-base sm:px-4 sm:py-3 ${
                  links.length === 1 ? 'w-[200px]' : ''
                }`}
                style={{ 
                  background: bgColor,
                  boxShadow: `0 4px 14px ${bgColor}40`,
                }}
                whileHover={{ 
                  y: -3,
                  scale: 1.03,
                  backgroundColor: hoverBgColor,
                  boxShadow: `0 6px 18px ${hoverBgColor}60`
                }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium truncate">{label}</span>
              </motion.a>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SocialLinks;