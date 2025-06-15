import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode } from '@/types';
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
      }
      .landing-page {
        background: linear-gradient(to bottom right, #8b5cf620, white, #ec489920);
        min-height: 100vh;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
  }} />
);

// 2. Ultra-Light Loading Component (0.5KB)
const LoadingSpinner = () => (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '24px',
    height: '24px',
    border: '3px solid rgba(139, 92, 246, 0.2)',
    borderTop: '3px solid #8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }} />
);

// 3. Lazy Load All Sections with Prefetch
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
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState<QRCode | null>(null);
  const [status, setStatus] = useState<'loading'|'ready'|'error'>('loading');

  // 4. Optimized Data Fetching with Cache
  useEffect(() => {
    if (!id) {
      setStatus('error');
      return;
    }

    const controller = new AbortController();
    let timeout: NodeJS.Timeout;

    // Check cache first
    const cachedData = sessionStorage.getItem(`qr_${id}`);
    if (cachedData) {
      setQrData(JSON.parse(cachedData));
      setStatus('ready');
      return;
    }

    // Fast fallback (show content after 500ms)
    timeout = setTimeout(() => {
      if (status === 'loading') setStatus('ready');
    }, 500);

    // Race API vs Timeout
    Promise.race([
      qrCodeApi.getPublicQRCode(id),
      new Promise((_, reject) => setTimeout(() => reject('Timeout'), 1500))
    ])
      .then((res) => {
        sessionStorage.setItem(`qr_${id}`, JSON.stringify(res));
        setQrData(res as QRCode);
        setStatus('ready');
        if ((res as QRCode).type === 'direct') {
          window.location.href = (res as QRCode).originalUrl || '';
        }
      })
      .catch(() => setStatus('error'))
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [id]);

  if (status === 'error') return (
    <div className="landing-page flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Error Loading Page</h2>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#8b5cf6] text-white rounded"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <>
      <CriticalCSS />
      {status === 'loading' && <LoadingSpinner />}
      
      <div className="landing-page">
        {qrData && (
          <>
            {/* Menu Section */}
            {qrData.menu?.categories?.length > 0 && (
              <Suspense fallback={null}>
                <MenuSection menu={qrData.menu} />
              </Suspense>
            )}

            {/* Social Links */}
            {qrData.links?.length > 0 && (
              <Suspense fallback={null}>
                <SocialLinks links={qrData.links} />
              </Suspense>
            )}

            {/* Vitrine Section */}
            {qrData.vitrine && Object.keys(qrData.vitrine).length > 0 && (
              <Suspense fallback={null}>
                <VitrineSection vitrine={qrData.vitrine} />
              </Suspense>
            )}

            {/* Footer */}
            <div className="text-center py-4 text-sm">
              Powered by <a href="https://qrcreator.xyz" className="text-[#8b5cf6]">qrcreator.xyz</a>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LandingPage;