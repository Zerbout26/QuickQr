import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink, MapPin } from 'lucide-react';

interface Link {
  type: string;
  url: string;
}

interface LandingPageColors {
  primaryColor: string;
  primaryHoverColor: string;
  accentColor: string;
  backgroundGradient: string;
  loadingSpinnerColor: string;
  loadingSpinnerBorderColor: string;
}

interface SocialLinksProps {
  links: Link[];
  menuLanguage: 'en' | 'ar';
  colors: LandingPageColors;
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

const SocialLinks = ({ links, menuLanguage, colors }: SocialLinksProps) => {
  if (!links || links.length === 0) return null;

  return (
    <motion.div 
      className="w-full px-4 py-4"
      dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-white rounded-lg p-4 shadow-sm max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-br rounded-lg -z-10"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primaryColor}10, ${colors.accentColor}05, transparent)`
          }}
        ></div>
        
        <div className={`grid ${links.length === 1 ? 'grid-cols-1 place-items-center' : 'grid-cols-2'} gap-2 max-w-md mx-auto`}>
      {links.map((link, index) => {
        const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(link.type);
        return (
              <motion.a
            key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md text-white font-medium shadow-sm transition-all duration-300 text-xs sm:text-sm w-full ${
                  links.length === 1 ? 'max-w-[200px]' : ''
                }`}
              style={{
                  background: bgColor,
                  boxShadow: `0 2px 8px ${bgColor}30`,
              }}
                whileHover={{ 
                  y: -2,
                  scale: 1.02,
                  backgroundColor: hoverBgColor,
                  boxShadow: `0 4px 12px ${hoverBgColor}50`
                }}
                whileTap={{ scale: 0.98 }}
            >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
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