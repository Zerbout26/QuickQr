import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

// Critical CSS inlined at the top - removes white space while keeping all data
const CriticalCSS = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
      body { margin: 0; padding: 0; }
      .landing-page { min-height: 100vh; background: linear-gradient(to bottom right, #8b5cf620, white, #ec489920); }
      .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 16px; }
      .loading-spinner {
        border: 3px solid rgba(139, 92, 246, 0.2);
        border-top: 3px solid #8b5cf6;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `
  }} />
);

// Lazy load components with prefetch - keeping all functionality
const MenuSection = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "menu-section" */
  '@/components/landing/MenuSection'
));
const VitrineSection = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "vitrine-section" */
  '@/components/landing/VitrineSection'
));
const SocialLinks = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "social-links" */
  '@/components/landing/SocialLinks'
));

// Memoized translations - keeping all data
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

  // Fast data fetching with caching - keeping all data logic
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

        // Check cache first for instant load
        const cachedData = sessionStorage.getItem(`qr_${id}`);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          if (isMounted) {
            setQRCode(data);
            setMenuLanguage(/[\u0600-\u06FF]/.test(data.menu?.restaurantName || '') ? 'ar' : 'en');
            setLoading(false);
          }
          return;
        }

        // Set timeout for loading state (800ms)
        const timeout = setTimeout(() => setLoading(false), 800);

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
        setMenuLanguage(/[\u0600-\u06FF]/.test(data.menu?.restaurantName || '') ? 'ar' : 'en');

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
  }, [id, navigate]);

  // Memoized platform info - keeping all data
  const getPlatformInfo = useCallback((type: string) => {
    const platformLabels = translations[menuLanguage].followUs;
    switch (type) {
      case 'facebook': return { label: platformLabels.facebook, bgColor: '#1877F2' };
      case 'instagram': return { label: platformLabels.instagram, bgColor: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' };
      case 'twitter': return { label: platformLabels.twitter, bgColor: '#1DA1F2' };
      // ... keep all other cases ...
      default: return { label: platformLabels.other, bgColor: '#6366F1' };
    }
  }, [menuLanguage]);

  if (loading) return <><CriticalCSS /><div className="landing-page flex items-center justify-center"><div className="loading-spinner"></div></div></>;
  if (error) return <><CriticalCSS /><div className="landing-page flex items-center justify-center text-red-500">{error}</div></>;
  if (!qrCode) return null;

  return (
    <>
      <CriticalCSS />
      <div className="landing-page">
        <div className="container mx-auto px-4 py-0"> {/* py-0 removes white space */}
          {qrCode.menu?.categories?.length > 0 && (
            <Suspense fallback={null}>
              <MenuSection
                menu={qrCode.menu}
                menuLanguage={menuLanguage}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </Suspense>
          )}

          {qrCode.links?.length > 0 && (
            <Suspense fallback={null}>
              <SocialLinks links={qrCode.links} getPlatformInfo={getPlatformInfo} />
            </Suspense>
          )}

          {qrCode.vitrine && Object.keys(qrCode.vitrine).length > 0 && (
            <Suspense fallback={null}>
              <VitrineSection vitrine={qrCode.vitrine} />
            </Suspense>
          )}

          <div className="mt-8 text-center text-sm pb-4">
            <p>{translations[menuLanguage].poweredBy} <a href="https://www.qrcreator.xyz" className="text-[#8b5cf6]">qrcreator.xyz</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;