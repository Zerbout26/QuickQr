import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';

interface LandingPageColors {
  primaryColor: string;
  primaryHoverColor: string;
  accentColor: string;
  backgroundGradient: string;
  loadingSpinnerColor: string;
  loadingSpinnerBorderColor: string;
}

interface QRHeaderProps {
  qrCode: {
    name: string;
    logoUrl?: string;
    type: string;
  };
  menuLanguage: 'en' | 'ar';
  colors: LandingPageColors;
}

const QRHeader = ({ qrCode, menuLanguage, colors }: QRHeaderProps) => {
  if (!qrCode) return null;

  return (
    <motion.div 
      className="w-full px-4 py-4"
      dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="bg-white rounded-lg p-4 shadow-sm max-w-sm sm:max-w-md mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-br rounded-lg -z-10"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primaryColor}10, ${colors.accentColor}05, transparent)`
          }}
        ></div>
        
        {/* QR Logo */}
        <motion.div 
          className="flex justify-center mb-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {qrCode.logoUrl ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-3 shadow-md"
                 style={{ borderColor: colors.primaryColor }}>
              <img
                src={qrCode.logoUrl}
                alt={qrCode.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: colors.primaryColor }}
            >
              <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          )}
        </motion.div>

        {/* QR Name */}
        <motion.h1 
          className="text-xl sm:text-2xl font-bold"
          style={{ color: colors.primaryColor }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {qrCode.name}
        </motion.h1>
      </motion.div>
    </motion.div>
  );
};

export default QRHeader; 