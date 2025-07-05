import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Helmet } from 'react-helmet';

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
    return 'linear-gradient(135deg, #3b82f615 0%, #3b82f608 25%, white 50%, #64748b08 75%, #64748b15 100%)';
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
const ProductsSection = lazy(() => import(
  /* webpackPrefetch: true */
  '@/components/landing/ProductsSection'
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

// Add SelectedVariants type
type SelectedVariants = { [variantName: string]: string };

// Helper to calculate price with variants
const getVariantPriceAdjustment = (item: MenuItem, selectedVariants?: SelectedVariants) => {
  if (!item.variants || !selectedVariants) return 0;
  return item.variants.reduce((sum, variant) => {
    const selectedOptionName = selectedVariants[variant.name];
    const option = variant.options.find(opt => opt.name === selectedOptionName);
    return sum + (option?.price || 0);
  }, 0);
};

const LandingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [landingPageColors, setLandingPageColors] = useState<LandingPageColors>({
    primaryColor: '#3b82f6',
    primaryHoverColor: '#2563eb',
    accentColor: '#64748b',
    backgroundGradient: 'linear-gradient(135deg, #3b82f615 0%, #3b82f608 25%, white 50%, #64748b08 75%, #64748b15 100%)',
    loadingSpinnerColor: '#3b82f6',
    loadingSpinnerBorderColor: 'rgba(59, 130, 246, 0.2)'
  });
  const [basket, setBasket] = useState<Array<{
    key: string;
    item: MenuItem;
    quantity: number;
    categoryName: string;
    price: number;
    selectedVariants?: SelectedVariants;
  }>>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [showCodForm, setShowCodForm] = useState(false);
  const [codFormData, setCodFormData] = useState({ name: '', phone: '', address: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Set timeout for initial loading state - reduced for better UX
        const timeout = setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 200);

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

  // Update basket state to include selectedVariants
  const addToBasket = (item: MenuItem, quantity: number, key: string, categoryName: string, price: number, selectedVariants?: SelectedVariants) => {
    setBasket(prev => {
      const existing = prev.find(b => b.key === key && JSON.stringify(b.selectedVariants) === JSON.stringify(selectedVariants));
      if (existing) {
        return prev.map(b => (b.key === key && JSON.stringify(b.selectedVariants) === JSON.stringify(selectedVariants)) ? { ...b, quantity: b.quantity + quantity } : b);
      } else {
        return [...prev, { key, item, quantity, categoryName, price, selectedVariants }];
      }
    });
  };

  // Direct order function for products (bypasses basket)
  const handleDirectOrder = (item: MenuItem, quantity: number, key: string, categoryName: string, price: number, selectedVariants?: SelectedVariants) => {
    // Clear any existing basket items and add only this product
    setBasket([{ key, item, quantity, categoryName, price, selectedVariants }]);
    
    // Show COD form directly
    setShowCodForm(true);
  };

  // Remove item from basket
  const removeFromBasket = (key: string) => {
    setBasket(prev => prev.filter(b => b.key !== key));
  };

  // Update quantity in basket
  const updateBasketQuantity = (key: string, quantity: number) => {
    setBasket(prev => prev.map(b => b.key === key ? { ...b, quantity } : b));
  };

  // Calculate total items in basket
  const totalItems = basket.reduce((sum, item) => sum + item.quantity, 0);

  // Check if basket contains only products (should hide basket for products)
  const basketContainsOnlyProducts = basket.length > 0 && basket.every(item => item.categoryName === 'Products');
  const shouldShowBasket = qrCode?.menu?.orderable && !basketContainsOnlyProducts;

  // Handle COD form submission
  const handleCodFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        qrCodeId: qrCode!.id,
        items: basket.map(b => ({
          key: b.key,
          itemName: b.item.name,
          categoryName: b.categoryName,
          quantity: b.quantity,
          price: b.price,
          imageUrl: b.item.images && b.item.images.length > 0 ? b.item.images[0] : undefined,
          selectedVariants: b.selectedVariants
        })),
        customerInfo: codFormData
      };

      // Send order to backend
      const response = await fetch('https://quickqr-heyg.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      
      // Reset form and close modal
      setCodFormData({ name: '', phone: '', address: '' });
      setShowCodForm(false);
      setBasket([]);
      setIsBasketOpen(false);
      
      // Show custom success dialog
      setShowConfirmDialog(true);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert(menuLanguage === 'ar' ? 
        'حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى.' : 
        'Error creating order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectOrderSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        qrCodeId: qrCode!.id,
        items: basket.map(b => ({
          key: b.key,
          itemName: b.item.name,
          categoryName: b.categoryName,
          quantity: b.quantity,
          price: b.price,
          imageUrl: b.item.images && b.item.images.length > 0 ? b.item.images[0] : undefined,
          selectedVariants: b.selectedVariants
        })),
        customerInfo: {
          name: 'Anonymous',
          phone: 'N/A',
          address: 'N/A'
        }
      };

      // Send order to backend
      const response = await fetch('https://quickqr-heyg.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      // Reset basket and close
      setBasket([]);
      setIsBasketOpen(false);
      
      // Show custom success dialog
      setShowConfirmDialog(true);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert(menuLanguage === 'ar' ? 
        'حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى.' : 
        'Error creating order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <>
      <CriticalCSS colors={landingPageColors} />
      <div className="landing-container pb-20">
        <div className="content-wrapper">
          {/* Skeleton loading state */}
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="text-center py-12 mb-8">
              <div className="w-32 h-8 bg-gray-200 rounded mx-auto mb-4"></div>
              <div className="w-48 h-4 bg-gray-200 rounded mx-auto mb-6"></div>
              <div className="w-24 h-10 bg-gray-200 rounded mx-auto"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-24 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading indicator */}
          <div className="text-center py-8">
            <div className="relative mb-4">
              <div className="w-8 h-8 border-2 border-gray-200 rounded-full mx-auto">
                <div 
                  className="w-full h-full border-2 border-transparent rounded-full animate-spin" 
                  style={{ 
                    borderTopColor: landingPageColors.loadingSpinnerColor,
                    animationDuration: '1.2s'
                  }}
                ></div>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              {menuLanguage === 'ar' ? 'جاري تحميل المحتوى...' : 'Loading content...'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
  if (error) return <><CriticalCSS colors={landingPageColors} /><div className="landing-container flex items-center justify-center text-red-500">{error}</div></>;
  if (!qrCode) return null;

  const hasMenu = qrCode.menu?.categories?.length > 0;
  const hasProducts = qrCode.products?.products?.length > 0;
  const hasLinks = qrCode.links?.length > 0;
  const hasVitrine = qrCode.vitrine && Object.keys(qrCode.vitrine).length > 0;
  const isOrderable = qrCode.menu?.orderable || qrCode.products?.orderable;

  return (
    <>
      <Helmet>
        <title>Qrcreator - Générateur QR Code Gratuit pour Menus, Vitrines, Ecommerce & Commandes</title>
        <meta name="description" content="Qrcreator est le générateur QR code gratuit #1 en Algérie. Créez des QR codes pour menus de restaurant, vitrines d'entreprise, ecommerce et gestion de commandes. Solution complète et gratuite." />
        <meta name="keywords" content="qrcreator, générateur QR code gratuit, QR code gratuit, créer QR code, QR code menu restaurant, QR code vitrine, QR code ecommerce, QR code Algérie, générateur QR code en ligne, QR code dynamique, QR code business, qr creator" />
        <meta property="og:title" content="Qrcreator - Générateur QR Code Gratuit pour Menus, Vitrines, Ecommerce & Commandes" />
        <meta property="og:description" content="Qrcreator est le générateur QR code gratuit #1 en Algérie. Créez des QR codes pour menus de restaurant, vitrines d'entreprise, ecommerce et gestion de commandes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://qrcreator.xyz/" />
        <meta property="og:image" content="https://qrcreator.xyz/Logo QrCreator sur fond blanc (1).webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Qrcreator - Générateur QR Code Gratuit pour Menus, Vitrines, Ecommerce & Commandes" />
        <meta name="twitter:description" content="Qrcreator est le générateur QR code gratuit #1 en Algérie. Créez des QR codes pour menus de restaurant, vitrines d'entreprise, ecommerce et gestion de commandes." />
        <meta name="twitter:image" content="https://qrcreator.xyz/Logo QrCreator sur fond blanc (1).webp" />
        <link rel="canonical" href="https://qrcreator.xyz/" />
      </Helmet>
      <CriticalCSS colors={landingPageColors} />
      <div className="landing-container pb-20 content-fade-in" style={{ opacity: 0, animation: 'fadeInUp 0.6s ease-out forwards' }}>
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

          {/* Menu Section */}
          {hasMenu && (
            <Suspense fallback={null}>
              <MenuSection
                menu={qrCode.menu}
                menuLanguage={menuLanguage}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                colors={landingPageColors}
                onAddToBasket={addToBasket}
              />
            </Suspense>
          )}

          {/* Products Section */}
          {qrCode.products?.products && qrCode.products.products.length > 0 && (
            <Suspense fallback={null}>
              <ProductsSection
                products={qrCode.products.products}
                storeName={qrCode.products.storeName || qrCode.name}
                menuLanguage={menuLanguage}
                colors={landingPageColors}
                currency={qrCode.products.currency}
                onAddToBasket={addToBasket}
                onDirectOrder={handleDirectOrder}
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
              href="https://qrcreator.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: landingPageColors.primaryColor,
                '--tw-text-opacity': '1'
              } as React.CSSProperties}
              className="hover:opacity-80 transition-opacity font-medium"
            >
              qrcreator.xyz
            </a>
          </div>
        </div>

        {/* Floating Basket Toggle Button */}
        {shouldShowBasket && (
          <div className="fixed bottom-20 right-6 z-[60]">
            <button
              onClick={() => setIsBasketOpen(!isBasketOpen)}
              className="relative w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-white"
              style={{ backgroundColor: landingPageColors.primaryColor }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Side Basket */}
        {shouldShowBasket && (
          <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[55] ${isBasketOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              {/* Basket Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold">{menuLanguage === 'ar' ? 'سلة الطلبات' : 'Basket'}</h3>
                <button
                  onClick={() => setIsBasketOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Basket Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {basket.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    <p>{menuLanguage === 'ar' ? 'السلة فارغة' : 'Basket is empty'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {basket.map(b => {
                      const variantAdjustment = getVariantPriceAdjustment(b.item, b.selectedVariants);
                      const finalPrice = b.item.price + variantAdjustment;
                      return (
                        <div key={b.key + JSON.stringify(b.selectedVariants)} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          {b.item.images && b.item.images.length > 0 && (
                            <img
                              src={b.item.images[0]}
                              alt={b.item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{b.item.name}</h4>
                            <p className="text-xs text-gray-500">{b.categoryName}</p>
                            {b.selectedVariants && (
                              <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                                {Object.entries(b.selectedVariants).map(([variant, option]) => (
                                  <li key={variant}>{variant}: {option}</li>
                                ))}
                              </ul>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateBasketQuantity(b.key, Math.max(1, b.quantity - 1))}
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium w-8 text-center">{b.quantity}</span>
                                <button
                                  onClick={() => updateBasketQuantity(b.key, b.quantity + 1)}
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{finalPrice * b.quantity} {qrCode.menu?.currency || qrCode.products?.currency || 'DZD'}</p>
                                <button
                                  onClick={() => removeFromBasket(b.key)}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  {menuLanguage === 'ar' ? 'حذف' : 'Remove'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Basket Footer */}
              {basket.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">{menuLanguage === 'ar' ? 'المجموع' : 'Total'}:</span>
                    <span className="text-lg font-bold">{basket.reduce((sum, b) => {
                      const variantAdjustment = getVariantPriceAdjustment(b.item, b.selectedVariants);
                      const finalPrice = b.item.price + variantAdjustment;
                      return sum + finalPrice * b.quantity;
                    }, 0)} {qrCode.menu?.currency || qrCode.products?.currency || 'DZD'}</span>
                  </div>
                  <button
                    className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: landingPageColors.primaryColor }}
                    disabled={isSubmitting}
                    onClick={() => {
                      if (qrCode?.menu?.codFormEnabled) {
                        setShowCodForm(true);
                      } else {
                        handleDirectOrderSubmit();
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {menuLanguage === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
                      </div>
                    ) : (
                      menuLanguage === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COD Form Modal */}
        {showCodForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {menuLanguage === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
                  </h3>
                  <button
                    onClick={() => setShowCodForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCodFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {menuLanguage === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={codFormData.name}
                      onChange={(e) => setCodFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={menuLanguage === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {menuLanguage === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={codFormData.phone}
                      onChange={(e) => setCodFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={menuLanguage === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {menuLanguage === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'} *
                    </label>
                    <textarea
                      required
                      value={codFormData.address}
                      onChange={(e) => setCodFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={menuLanguage === 'ar' ? 'أدخل عنوان التوصيل الكامل' : 'Enter your complete delivery address'}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">
                      {menuLanguage === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {basket.map(b => {
                        const variantAdjustment = getVariantPriceAdjustment(b.item, b.selectedVariants);
                        const finalPrice = b.item.price + variantAdjustment;
                        return (
                          <div key={b.key + JSON.stringify(b.selectedVariants)} className="flex justify-between text-sm">
                            <span>
                              {b.item.name} x{b.quantity}
                              {b.selectedVariants && (
                                <span className="block text-xs text-gray-500">
                                  {Object.entries(b.selectedVariants).map(([variant, option]) => `${variant}: ${option}`).join(', ')}
                                </span>
                              )}
                            </span>
                            <span>{(() => {
                              const variantAdjustment = getVariantPriceAdjustment(b.item, b.selectedVariants);
                              const finalPrice = b.item.price + variantAdjustment;
                              return finalPrice * b.quantity;
                            })()} {qrCode?.menu?.currency || qrCode?.products?.currency || 'DZD'}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>{menuLanguage === 'ar' ? 'المجموع' : 'Total'}:</span>
                        <span>{basket.reduce((sum, b) => {
                          const variantAdjustment = getVariantPriceAdjustment(b.item, b.selectedVariants);
                          const finalPrice = b.item.price + variantAdjustment;
                          return sum + finalPrice * b.quantity;
                        }, 0)} {qrCode?.menu?.currency || qrCode?.products?.currency || 'DZD'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCodForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {menuLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 rounded-md font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: landingPageColors.primaryColor }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {menuLanguage === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
                        </div>
                      ) : (
                        menuLanguage === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirm Order Success Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 text-center">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                {/* Success Message */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {menuLanguage === 'ar' ? 'تم تأكيد الطلب بنجاح!' : 'Order Confirmed Successfully!'}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {menuLanguage === 'ar' 
                    ? 'شكراً لك! تم استلام طلبك وسيتم التواصل معك قريباً.' 
                    : 'Thank you! Your order has been received and we will contact you soon.'
                  }
                </p>
                
                {/* Close Button */}
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="w-full px-4 py-2 rounded-md font-semibold text-white transition-colors"
                  style={{ backgroundColor: landingPageColors.primaryColor }}
                >
                  {menuLanguage === 'ar' ? 'حسناً' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {isBasketOpen && shouldShowBasket && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[54]"
            onClick={() => setIsBasketOpen(false)}
          />
        )}

        <div className="fixed bottom-0 left-0 w-full z-50 shadow bg-white/90 min-h-14 flex items-center" style={{background: landingPageColors.backgroundGradient}}>
          <Suspense fallback={null}>
            <SocialLinks 
              links={qrCode.links} 
              menuLanguage={menuLanguage} 
              colors={landingPageColors}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default LandingPage;