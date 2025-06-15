import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Critical CSS with !important overrides to eliminate all white space
const CriticalCSS = () => (
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
        background: linear-gradient(to bottom right, #8b5cf620, white, #ec489920) !important;
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
        border: 3px solid rgba(139, 92, 246, 0.2) !important;
        border-top: 3px solid #8b5cf6 !important;
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

// Memoized translations
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
      location: 'Find our Location',
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
      location: 'اعثر على موقعنا',
      other: 'زيارة الرابط'
    }
  }
} as const;

const LandingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Check if text contains Arabic characters
  const isArabicText = useCallback((text: string = '') => {
    return /[\u0600-\u06FF]/.test(text);
  }, []);

  // Optimized data fetching with caching
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

        // Check cache first
        const cachedData = sessionStorage.getItem(`qr_${id}`);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          if (isMounted) {
            setQRCode(data);
            setMenuLanguage(isArabicText(data.menu?.restaurantName) ? 'ar' : 'en');
            setLoading(false);
          }
          return;
        }

        // Fast timeout (500ms)
        const timeout = setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 500);

        const [data] = await Promise.race([
          Promise.all([
            qrCodeApi.getPublicQRCode(id),
            qrCodeApi.incrementScanCount(id)
          ]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);

        clearTimeout(timeout);

        if (!isMounted) return;

        sessionStorage.setItem(`qr_${id}`, JSON.stringify(data));
        setQRCode(data);
        setMenuLanguage(isArabicText(data.menu?.restaurantName) ? 'ar' : 'en');

        if (data.type === 'direct' && data.originalUrl) {
          window.location.href = data.originalUrl;
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load QR code');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, navigate, isArabicText]);

  // Memoized platform info
  const getPlatformInfo = useCallback((type: string) => {
    const platformLabels = translations[menuLanguage].followUs;
    const platforms = {
      facebook: { label: platformLabels.facebook, bgColor: '#1877F2' },
      instagram: { label: platformLabels.instagram, bgColor: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
      twitter: { label: platformLabels.twitter, bgColor: '#1DA1F2' },
      linkedin: { label: platformLabels.linkedin, bgColor: '#0A66C2' },
      youtube: { label: platformLabels.youtube, bgColor: '#FF0000' },
      tiktok: { label: platformLabels.tiktok, bgColor: '#000000' },
      whatsapp: { label: platformLabels.whatsapp, bgColor: '#25D366' },
      telegram: { label: platformLabels.telegram, bgColor: '#0088CC' },
      website: { label: platformLabels.website, bgColor: '#6366F1' },
      location: { label: platformLabels.location, bgColor: '#FF4B4B' },
      default: { label: platformLabels.other, bgColor: '#6366F1' }
    };
    return platforms[type as keyof typeof platforms] || platforms.default;
  }, [menuLanguage]);

  if (loading) return <><CriticalCSS /><div className="landing-container flex items-center justify-center"><div className="loading-spinner" /></div></>;
  if (error) return <><CriticalCSS /><div className="landing-container flex items-center justify-center text-red-500">{error}</div></>;
  if (!qrCode) return null;

  const hasMenu = qrCode.menu?.categories?.length > 0;
  const hasLinks = qrCode.links?.length > 0;
  const hasVitrine = qrCode.vitrine && Object.keys(qrCode.vitrine).length > 0;

  return (
    <>
      <CriticalCSS />
      <div className="landing-container">
        <div className="content-wrapper">
          <main className="space-y-8 pt-0"> {/* pt-0 removes top padding */}
            {hasMenu && (
              <Suspense fallback={null}>
                <MenuSection
                  menu={qrCode.menu}
                  menuLanguage={menuLanguage}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              </Suspense>
            )}

            {hasLinks && (
              <Suspense fallback={null}>
                <SocialLinks 
                  links={qrCode.links} 
                  getPlatformInfo={getPlatformInfo} 
                />
              </Suspense>
            )}

            {hasVitrine && (
              <Suspense fallback={null}>
                <VitrineSection vitrine={qrCode.vitrine} />
              </Suspense>
            )}
          </main>

          <div className="mt-8 text-center text-sm pb-4">
            <p>{translations[menuLanguage].poweredBy} <a href="https://www.qrcreator.xyz" className="text-[#8b5cf6] hover:text-[#7c3aed]">qrcreator.xyz</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;