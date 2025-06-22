import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';

// Landing page colors interface
interface LandingPageColors {
  primaryColor: string;
  primaryHoverColor: string;
  accentColor: string;
  backgroundGradient: string;
  loadingSpinnerColor: string;
  loadingSpinnerBorderColor: string;
}

// Function to generate dynamic background gradient based on user colors
const generateDynamicBackground = (primaryColor: string, accentColor: string): string => {
  // Convert hex to RGB for better gradient control
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const primaryRgb = hexToRgb(primaryColor);
  const accentRgb = hexToRgb(accentColor);

  if (!primaryRgb || !accentRgb) {
    // Fallback to default gradient if color parsing fails
    return 'linear-gradient(135deg, #8b5cf615 0%, #8b5cf608 25%, white 50%, #ec489908 75%, #ec489915 100%)';
  }

  // Check if primary and accent colors are the same
  const isSameColor = primaryColor.toLowerCase() === accentColor.toLowerCase();
  
  if (isSameColor) {
    // When colors are the same, create a monochromatic gradient
    const colorIntensity = (primaryRgb.r + primaryRgb.g + primaryRgb.b) / 3;
    
    if (colorIntensity > 200) {
      // Light colors - create subtle gradient with white
      return `linear-gradient(135deg, 
        ${primaryColor}30 0%, 
        ${primaryColor}20 25%, 
        white 50%, 
        ${primaryColor}20 75%, 
        ${primaryColor}30 100%
      )`;
    } else if (colorIntensity > 150) {
      // Medium-light colors - more pronounced gradient
      return `linear-gradient(135deg, 
        ${primaryColor}40 0%, 
        ${primaryColor}25 30%, 
        white 60%, 
        ${primaryColor}25 80%, 
        ${primaryColor}40 100%
      )`;
    } else {
      // Dark colors - subtle gradient
      return `linear-gradient(135deg, 
        ${primaryColor}25 0%, 
        ${primaryColor}15 30%, 
        white 60%, 
        ${primaryColor}15 80%, 
        ${primaryColor}25 100%
      )`;
    }
  }

  // Different colors - create multiple gradient options
  const gradients = [
    // Option 1: Diagonal gradient with degradation
    `linear-gradient(135deg, 
      ${primaryColor}25 0%, 
      ${primaryColor}15 20%, 
      white 50%, 
      ${accentColor}15 80%, 
      ${accentColor}25 100%
    )`,
    
    // Option 2: Radial gradient for more organic feel
    `radial-gradient(ellipse at center, 
      ${primaryColor}20 0%, 
      ${primaryColor}12 30%, 
      white 60%, 
      ${accentColor}12 80%, 
      ${accentColor}20 100%
    )`,
    
    // Option 3: Multi-stop gradient for more complex degradation
    `linear-gradient(135deg, 
      ${primaryColor}30 0%, 
      ${primaryColor}20 15%, 
      ${primaryColor}10 30%, 
      white 50%, 
      ${accentColor}10 70%, 
      ${accentColor}20 85%, 
      ${accentColor}30 100%
    )`
  ];

  // Choose gradient based on color intensity
  const colorIntensity = (primaryRgb.r + primaryRgb.g + primaryRgb.b) / 3;
  const accentIntensity = (accentRgb.r + accentRgb.g + accentRgb.b) / 3;
  
  // Use different gradients based on color characteristics
  if (colorIntensity < 128 && accentIntensity < 128) {
    // Dark colors - use more subtle gradient
    return gradients[0];
  } else if (Math.abs(colorIntensity - accentIntensity) > 100) {
    // High contrast colors - use radial gradient
    return gradients[1];
  } else {
    // Similar intensity colors - use multi-stop gradient
    return gradients[2];
  }
};

// Critical CSS with !important overrides to eliminate all white space
const CriticalCSS = ({ colors }: { colors: LandingPageColors }) => {
  // Generate dynamic background based on user colors
  const dynamicBackground = generateDynamicBackground(colors.primaryColor, colors.accentColor);
  
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-height: 100vh !important;
          overflow-x: hidden !important;
        }
        .landing-container {
          background: ${dynamicBackground} !important;
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .content-wrapper {
          flex: 1 !important;
          width: 100% !important;
          max-width: 1200px !important;
          margin: 0 auto !important;
          padding: 0 16px !important;
        }
        .loading-spinner {
          border: 3px solid ${colors.loadingSpinnerBorderColor} !important;
          border-top: 3px solid ${colors.loadingSpinnerColor} !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          animation: spin 1s linear infinite !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg) !important; }
          100% { transform: rotate(360deg) !important; }
        }
      `
    }} />
  );
};

// Lazy load all components with prefetch
const MenuSection = lazy(() => import(
  /* webpackPrefetch: true */
  '@/components/landing/MenuSection'
));
const VitrineSection = lazy(() => import(
  /* webpackPrefetch: true */
  '@/components/landing/VitrineSection'
));
const SocialLinks = lazy(() => import(
  /* webpackPrefetch: true */
  '@/components/landing/SocialLinks'
));
const QRHeader = lazy(() => import(
  /* webpackPrefetch: true */
  '@/components/landing/QRHeader'
));

const LandingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [landingPageColors, setLandingPageColors] = useState<LandingPageColors>({
    primaryColor: '#8b5cf6',
    primaryHoverColor: '#7c3aed',
    accentColor: '#ec4899',
    backgroundGradient: 'linear-gradient(135deg, #8b5cf615 0%, #8b5cf608 25%, white 50%, #ec489908 75%, #ec489915 100%)',
    loadingSpinnerColor: '#8b5cf6',
    loadingSpinnerBorderColor: 'rgba(139, 92, 246, 0.2)'
  });

  // Check if text contains Arabic characters
  const isArabicText = useCallback((text: string = '') => {
    return /[\u0600-\u06FF]/.test(text);
  }, []);

  // Fetch landing page colors
  const fetchLandingPageColors = useCallback(async (qrId: string) => {
    try {
      const colors = await qrCodeApi.getLandingPageColors(qrId);
      setLandingPageColors(colors);
    } catch (error) {
      console.error('Error fetching landing page colors:', error);
      // Keep default colors if fetch fails
    }
  }, []);

  // Optimized data fetching with caching and scan count
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        if (!id) {
          setError('No QR code ID provided');
          setLoading(false);
          return;
        }

        // Fetch landing page colors first
        await fetchLandingPageColors(id);

        // Check cache first
        const cachedData = sessionStorage.getItem(`qr_${id}`);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          if (isMounted) {
            setQRCode(data);
            setMenuLanguage(isArabicText(data.menu?.restaurantName) ? 'ar' : 'en');
            setLoading(false);
          }
          // Still increment scan count for cached visits
          qrCodeApi.incrementScanCount(id).catch(console.error);
          return;
        }

        // Set timeout for initial loading state
        const timeout = setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 500);

        // First fetch the QR code data
        const data = await qrCodeApi.getPublicQRCode(id);
        
        // Then increment scan count (fire and forget)
        qrCodeApi.incrementScanCount(id).catch(console.error);

        clearTimeout(timeout);

        if (!isMounted) return;

        // Cache the response
        sessionStorage.setItem(`qr_${id}`, JSON.stringify(data));

        setQRCode(data);
        setMenuLanguage(isArabicText(data.menu?.restaurantName) ? 'ar' : 'en');
        setLoading(false);

        if (data.type === 'direct' && data.originalUrl) {
          window.location.href = data.originalUrl;
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        
        console.error('Error fetching QR code:', err);
        if (err && typeof err === 'object' && 'response' in err) {
          const errorResponse = err as { response: { status: number; data?: { error?: string } } };
          if (errorResponse.response.status === 403) {
            navigate('/payment-instructions');
            return;
          }
          if (errorResponse.response.status === 404) {
            setError('QR code not found');
          } else {
            setError(errorResponse.response.data?.error || 'Failed to load QR code');
          }
        } else {
          setError('Failed to load QR code');
        }
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, navigate, isArabicText, fetchLandingPageColors]);

  if (loading) return <><CriticalCSS colors={landingPageColors} /><div className="landing-container flex items-center justify-center"><div className="loading-spinner" /></div></>;
  if (error) return <><CriticalCSS colors={landingPageColors} /><div className="landing-container flex items-center justify-center text-red-500">{error}</div></>;
  if (!qrCode) return null;

  const hasMenu = qrCode.menu?.categories?.length > 0;
  const hasLinks = qrCode.links?.length > 0;
  const hasVitrine = qrCode.vitrine && Object.keys(qrCode.vitrine).length > 0;

  return (
    <>
      <CriticalCSS colors={landingPageColors} />
      <div className="landing-container">
        <div className="content-wrapper">
          {/* QR Header - Always show for menu and URL types */}
          {(qrCode.type === 'menu' || qrCode.type === 'url' || qrCode.type === 'both') && (
            <Suspense fallback={null}>
              <QRHeader 
                qrCode={qrCode}
                menuLanguage={menuLanguage} 
                colors={landingPageColors}
              />
            </Suspense>
          )}

          {/* Social Links */}
          {hasLinks && (
            <Suspense fallback={null}>
              <SocialLinks 
                links={qrCode.links} 
                menuLanguage={menuLanguage} 
                colors={landingPageColors}
              />
            </Suspense>
          )}

          {/* Menu Section */}
          {hasMenu && (
            <Suspense fallback={null}>
              <MenuSection
                menu={qrCode.menu}
                menuLanguage={menuLanguage}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                colors={landingPageColors}
              />
            </Suspense>
          )}

          {/* Vitrine Section */}
          {hasVitrine && (
            <Suspense fallback={null}>
              <VitrineSection 
                vitrine={qrCode.vitrine} 
                menuLanguage={menuLanguage} 
                colors={landingPageColors}
              />
            </Suspense>
          )}

          {/* Footer */}
          <div className="text-center py-4 text-sm">
            <p className="mb-1">Powered by</p>
            <a 
              href="https://www.qrcreator.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: landingPageColors.primaryColor,
                '--tw-text-opacity': '1'
              } as React.CSSProperties}
              className="hover:opacity-80 transition-opacity font-medium"
            >
              www.qrcreator.xyz
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;