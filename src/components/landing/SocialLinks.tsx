import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink } from 'lucide-react';

interface Link {
  type: string;
  url: string;
}

interface SocialLinksProps {
  links: Link[];
  menuLanguage: 'en' | 'ar';
}

const getPlatformInfo = (type: string) => {
  const platforms: Record<string, { label: string; icon: any; bgColor: string; hoverBgColor: string }> = {
    facebook: {
      label: 'Facebook',
      icon: Facebook,
      bgColor: 'linear-gradient(135deg, #1877F2 0%, #0D6EFD 100%)',
      hoverBgColor: '#0D6EFD',
    },
    instagram: {
      label: 'Instagram',
      icon: Instagram,
      bgColor: 'linear-gradient(135deg, #E4405F 0%, #C13584 100%)',
      hoverBgColor: '#C13584',
    },
    twitter: {
      label: 'Twitter',
      icon: Twitter,
      bgColor: 'linear-gradient(135deg, #1DA1F2 0%, #0D8ECF 100%)',
      hoverBgColor: '#0D8ECF',
    },
    linkedin: {
      label: 'LinkedIn',
      icon: Linkedin,
      bgColor: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
      hoverBgColor: '#004182',
    },
    youtube: {
      label: 'YouTube',
      icon: Youtube,
      bgColor: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
      hoverBgColor: '#CC0000',
    },
    spotify: {
      label: 'Spotify',
      icon: Music,
      bgColor: 'linear-gradient(135deg, #1DB954 0%, #1AA34A 100%)',
      hoverBgColor: '#1AA34A',
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: MessageCircle,
      bgColor: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
      hoverBgColor: '#128C7E',
    },
    telegram: {
      label: 'Telegram',
      icon: Send,
      bgColor: 'linear-gradient(135deg, #0088CC 0%, #006699 100%)',
      hoverBgColor: '#006699',
    },
    website: {
      label: 'Website',
      icon: Globe,
      bgColor: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
      hoverBgColor: '#357ABD',
    },
    other: {
      label: 'Link',
      icon: ExternalLink,
      bgColor: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
      hoverBgColor: '#4B5563',
    },
  };

  return platforms[type] || platforms.other;
};

const SocialLinks = ({ links, menuLanguage }: SocialLinksProps) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {links.map((link, index) => {
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

export default SocialLinks; 