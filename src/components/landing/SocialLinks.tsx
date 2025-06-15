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

  // Calculate the wrapper class based on number of links
  const wrapperClass = links.length === 1 
    ? 'flex justify-center' 
    : 'grid grid-cols-1 sm:grid-cols-2';

  // Calculate the link width based on number of links
  const linkWidthClass = links.length === 1 
    ? 'w-full sm:w-1/2' 
    : 'w-full';

  return (
    <motion.div 
      className={`gap-4 mt-8 ${wrapperClass}`}
      dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {links.map((link, index) => {
        const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(link.type);
        return (
          <motion.div
            key={index}
            className={`${linkWidthClass} flex justify-center`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <motion.a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 p-4 rounded-2xl text-white font-medium transition-all duration-300 hover:shadow-lg ${linkWidthClass}`}
              style={{
                background: `linear-gradient(135deg, ${bgColor} 0%, ${hoverBgColor} 100%)`,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-base sm:text-lg">{label}</span>
            </motion.a>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default SocialLinks;