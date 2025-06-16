import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';

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
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error('Error fetching QR code:', err);
        if (err.response) {
          if (err.response.status === 403) {
            navigate('/payment-instructions');
            return;
          }
          if (err.response.status === 404) {
            setError('QR code not found');
          } else {
            setError(err.response.data?.error || 'Failed to load QR code');
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
  }, [id, navigate, isArabicText]);

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
                    {/* Social Links */}
          {hasLinks && (
            <Suspense fallback={null}>
              <SocialLinks links={qrCode.links} menuLanguage={menuLanguage} />
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
              />
            </Suspense>
          )}

          {/* Vitrine Section */}
          {hasVitrine && (
            <Suspense fallback={null}>
              <VitrineSection vitrine={qrCode.vitrine} menuLanguage={menuLanguage} />
            </Suspense>
          )}

          {/* Footer */}
          <div className="text-center py-4 text-sm">
            <p className="mb-1">Powered by</p>
            <a 
              href="https://www.qrcreator.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#8b5cf6] hover:text-[#7c3aed] transition-colors font-medium"
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