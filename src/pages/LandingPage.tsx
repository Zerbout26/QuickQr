import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';

// 1. Critical CSS Inlined (Loads Instantly)
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
      .landing-page {
        min-height: 100vh !important;
        background: linear-gradient(to bottom right, #8b5cf620, white, #ec489920) !important;
        display: flex !important;
        flex-direction: column !important;
      }
      .content-container {
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
      /* Menu specific styles */
      .menu-container {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .menu-category {
        scroll-margin-top: 20px;
      }
    `
  }} />
);

// 2. Lazy Load with Prefetch (Non-Blocking)
const MenuSection = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "menu" */
  '@/components/landing/MenuSection'
));
const VitrineSection = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "vitrine" */
  '@/components/landing/VitrineSection'
));
const SocialLinks = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "social" */
  '@/components/landing/SocialLinks'
));

const LandingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState<QRCode | null>(null);
  const [status, setStatus] = useState<'loading'|'ready'|'error'>('loading');
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Check if text contains Arabic characters
  const isArabicText = useCallback((text: string = '') => {
    return /[\u0600-\u06FF]/.test(text);
  }, []);

  // 3. Ultra-Fast Data Loading
  useEffect(() => {
    if (!id) {
      setStatus('error');
      return;
    }

    const controller = new AbortController();
    let timeout: NodeJS.Timeout;

    // 4. Immediate Cache Check
    const cachedData = sessionStorage.getItem(`qr_${id}`);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      setQrData(data);
      setMenuLanguage(isArabicText(data.menu?.restaurantName) ? 'ar' : 'en');
      setStatus('ready');
      return;
    }

    // 5. Fast Fallback (Show content after 300ms)
    timeout = setTimeout(() => {
      if (status === 'loading') setStatus('ready');
    }, 300);

    // 6. Race API vs Timeout (1.2s max)
    Promise.race([
      qrCodeApi.getPublicQRCode(id),
      new Promise((_, reject) => setTimeout(() => reject('Timeout'), 1200))
    ])
      .then((res) => {
        const data = res as QRCode;
        sessionStorage.setItem(`qr_${id}`, JSON.stringify(data));
        setQrData(data);
        setMenuLanguage(isArabicText(data.menu?.restaurantName) ? 'ar' : 'en');
        setStatus('ready');
        if (data.type === 'direct' && data.originalUrl) {
          window.location.href = data.originalUrl;
        }
      })
      .catch(() => setStatus('error'))
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [id, isArabicText, status]);

  // 7. Memoized platform info for social links
  const getPlatformInfo = useCallback((type: string) => {
    const platformLabels = {
      en: {
        facebook: 'Follow us on Facebook',
        instagram: 'Follow us on Instagram',
        // ... other platform labels
      },
      ar: {
        facebook: 'تابعنا على فيسبوك',
        instagram: 'تابعنا على انستغرام',
        // ... other platform labels
      }
    }[menuLanguage];

    const platforms = {
      facebook: { label: platformLabels.facebook, bgColor: '#1877F2' },
      instagram: { label: platformLabels.instagram, bgColor: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
      // ... other platforms
    };

    return platforms[type as keyof typeof platforms] || { 
      label: platformLabels.other, 
      bgColor: '#6366F1' 
    };
  }, [menuLanguage]);

  if (status === 'error') return (
    <div className="landing-page flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Error Loading Page</h2>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#8b5cf6] text-white rounded hover:bg-[#7c3aed]"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <>
      <CriticalCSS />
      {status === 'loading' && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      <div className="landing-page">
        <div className="content-container">
          {/* Full Menu Section */}
          {qrData?.menu?.categories?.length > 0 && (
            <Suspense fallback={null}>
              <MenuSection 
                menu={qrData.menu}
                menuLanguage={menuLanguage}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </Suspense>
          )}

          {/* Social Links */}
          {qrData?.links?.length > 0 && (
            <Suspense fallback={null}>
              <SocialLinks 
                links={qrData.links} 
                getPlatformInfo={getPlatformInfo} 
              />
            </Suspense>
          )}

          {/* Vitrine Section */}
          {qrData?.vitrine && Object.keys(qrData.vitrine).length > 0 && (
            <Suspense fallback={null}>
              <VitrineSection vitrine={qrData.vitrine} />
            </Suspense>
          )}

          {/* Footer */}
          <div className="text-center py-4 text-sm mt-auto">
            Powered by <a href="https://qrcreator.xyz" className="text-[#8b5cf6] hover:underline">qrcreator.xyz</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;