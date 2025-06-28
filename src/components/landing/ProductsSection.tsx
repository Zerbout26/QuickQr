import React, { useState } from 'react';
import { MenuItem } from '@/types';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface ProductsSectionProps {
  products: MenuItem[];
  storeName: string;
  menuLanguage: 'en' | 'ar';
  colors: {
    primaryColor: string;
    primaryHoverColor: string;
    accentColor: string;
  };
  currency?: string;
  onAddToBasket: (item: MenuItem, quantity: number, key: string, categoryName: string, price: number, selectedVariants?: { [variantName: string]: string }) => void;
  onDirectOrder?: (item: MenuItem, quantity: number, key: string, categoryName: string, price: number, selectedVariants?: { [variantName: string]: string }) => void;
}

type SelectedVariants = { [variantName: string]: string };

const translations = {
  en: {
    products: 'Product Details',
    orderNow: 'Order Now',
    quantity: 'Quantity',
    viewDetails: 'View Details',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    description: 'Description',
    features: 'Key Features',
    specifications: 'Specifications'
  },
  ar: {
    products: 'تفاصيل المنتج',
    orderNow: 'اطلب الآن',
    quantity: 'الكمية',
    viewDetails: 'عرض التفاصيل',
    addToCart: 'أضف إلى السلة',
    buyNow: 'اشتري الآن',
    description: 'الوصف',
    features: 'الميزات الرئيسية',
    specifications: 'المواصفات'
  },
};

const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  storeName,
  menuLanguage,
  colors,
  currency,
  onAddToBasket,
  onDirectOrder
}) => {
  // Early return if products are not available
  if (!products || products.length === 0) {
    return null;
  }

  // For now, we'll display the first product
  const product = products[0];

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariants>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleVariantChange = (variantName: string, optionName: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: optionName
    }));
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const getVariantPriceAdjustment = () => {
    if (!product.variants) return 0;
    return product.variants.reduce((sum, variant) => {
      const selectedOptionName = selectedVariants[variant.name];
      const option = variant.options.find(opt => opt.name === selectedOptionName);
      return sum + (option?.price || 0);
    }, 0);
  };

  const handleOrderNow = (isDirectOrder: boolean) => {
    const priceAdjustment = getVariantPriceAdjustment();
    const finalPrice = product.price + priceAdjustment;
    const productId = `${product.name}-0`;
    
    if (isDirectOrder && onDirectOrder) {
      onDirectOrder(product, quantity, productId, 'Products', finalPrice, selectedVariants);
    } else {
      onAddToBasket(product, quantity, productId, 'Products', finalPrice, selectedVariants);
    }
  };

  const handleImageNav = (images: string[], dir: 1 | -1) => {
    setCurrentImageIndex(prev => (prev + dir + images.length) % images.length);
  };

  const getValidImages = () => {
    if (!product) return [];
    const imgs = (product.images || []).filter(url => !url.startsWith('blob:'));
    if (imgs.length > 0) return imgs;
    if (product.imageUrl) return [product.imageUrl];
    return [];
  };

  const images = getValidImages();
  const priceAdjustment = getVariantPriceAdjustment();
  const finalPrice = product.price + priceAdjustment;

  return (
    <div className="px-4 py-12 max-w-7xl mx-auto" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Product Section */}
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Product Images */}
        {images.length > 0 && (
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="eager"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-lg z-10 hover:bg-white transition-all"
                    onClick={() => handleImageNav(images, -1)}
                    type="button"
                  >
                    {menuLanguage === 'ar' ? '→' : '←'}
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-lg z-10 hover:bg-white transition-all"
                    onClick={() => handleImageNav(images, 1)}
                    type="button"
                  >
                    {menuLanguage === 'ar' ? '←' : '→'}
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-primary' : 'bg-gray-300'}`}
                        style={idx === currentImageIndex ? { backgroundColor: colors.primaryColor } : {}}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Badge for featured product */}
              <div 
                className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: colors.accentColor }}
              >
                {menuLanguage === 'ar' ? 'مميز' : 'Featured'}
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto py-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-primary scale-105' : 'border-transparent'}`}
                    style={idx === currentImageIndex ? { borderColor: colors.primaryColor } : {}}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Product Info */}
        <div className="w-full lg:w-1/2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-800">
                {finalPrice} {currency || 'DZD'}
              </span>
              {priceAdjustment > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  {product.price} {currency || 'DZD'}
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-gray-600 ml-2">(24 {menuLanguage === 'ar' ? 'تقييم' : 'reviews'})</span>
            </div>
            
            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.variants.map((variant) => (
                  <div key={variant.name} className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-800">
                      {variant.name}:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map(option => {
                        const isSelected = selectedVariants[variant.name] === option.name;
                        return (
                          <button
                            key={option.name}
                            type="button"
                            className={`px-4 py-2 rounded-lg border text-base font-medium transition-all ${
                              isSelected
                                ? 'text-white shadow-md'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                            style={isSelected ? {
                              backgroundColor: colors.primaryColor,
                              borderColor: colors.primaryColor
                            } : {}}
                            onClick={() => handleVariantChange(
                              variant.name, 
                              isSelected ? '' : option.name
                            )}
                          >
                            {option.name}
                            {option.price ? ` (+${option.price} ${currency || 'DZD'})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-lg font-medium text-gray-800">
                {translations[menuLanguage].quantity}:
              </h3>
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition text-lg font-medium"
                  onClick={() => handleQuantityChange(-1)}
                  type="button"
                >
                  -
                </button>
                <span className="px-6 py-2 w-12 text-center text-lg font-bold border-x-2 border-gray-300">
                  {quantity}
                </span>
                <button
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition text-lg font-medium"
                  onClick={() => handleQuantityChange(1)}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Call-to-Action Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="w-full py-5 px-8 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:opacity-90 shadow-lg"
                style={{ backgroundColor: colors.primaryColor }}
                onClick={() => handleOrderNow(true)}
                type="button"
              >
                <svg className="w-7 h-7 inline-block mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {menuLanguage === 'ar' ? 'تسوق الآن' : 'Shop Now'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-16 border-t pt-8">
        <div className="flex border-b">
          <button 
            className="px-4 py-2 font-medium border-b-2 text-gray-800"
            style={{ borderColor: colors.primaryColor }}
          >
            {translations[menuLanguage].description}
          </button>
        </div>
        
        <div className="py-6">
          {product.description ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          ) : (
            <p className="text-gray-500 italic">
              {menuLanguage === 'ar' ? 'لا يوجد وصف متوفر' : 'No description available'}
            </p>
          )}
        </div>
      </div>
      
      {/* Trust Badges */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
          <svg className="w-10 h-10 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h4 className="font-medium">{menuLanguage === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee'}</h4>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
          <svg className="w-10 h-10 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h4 className="font-medium">{menuLanguage === 'ar' ? 'شحن سريع' : 'Fast Shipping'}</h4>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
          <svg className="w-10 h-10 mb-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h4 className="font-medium">{menuLanguage === 'ar' ? 'دفع آمن' : 'Secure Payment'}</h4>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
          <svg className="w-10 h-10 mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h4 className="font-medium">{menuLanguage === 'ar' ? 'دعم 24/7' : '24/7 Support'}</h4>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;