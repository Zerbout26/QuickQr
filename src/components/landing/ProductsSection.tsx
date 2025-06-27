import React, { useState } from 'react';
import { MenuItem } from '@/types';

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
}

type SelectedVariants = { [variantName: string]: string };

const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  storeName,
  menuLanguage,
  colors,
  currency,
  onAddToBasket
}) => {
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: SelectedVariants }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleVariantChange = (productId: string, variantName: string, optionName: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantName]: optionName
      }
    }));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  const getVariantPriceAdjustment = (item: MenuItem, selectedVariants?: SelectedVariants) => {
    if (!item.variants || !selectedVariants) return 0;
    return item.variants.reduce((sum, variant) => {
      const selectedOptionName = selectedVariants[variant.name];
      const option = variant.options.find(opt => opt.name === selectedOptionName);
      return sum + (option?.price || 0);
    }, 0);
  };

  const handleAddToBasket = (product: MenuItem) => {
    const productId = `${product.name}-${Date.now()}`;
    const quantity = quantities[productId] || 1;
    const variants = selectedVariants[productId];
    const priceAdjustment = getVariantPriceAdjustment(product, variants);
    const finalPrice = product.price + priceAdjustment;
    
    onAddToBasket(product, quantity, productId, 'Products', finalPrice, variants);
    
    // Reset quantity for this product
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  };

  if (!products || products.length === 0) return null;

  // Display single product in a large card
  const product = products[0];
  const productId = `${product.name}-0`;
  const quantity = quantities[productId] || 1;
  const variants = selectedVariants[productId];
  const priceAdjustment = getVariantPriceAdjustment(product, variants);
  const finalPrice = product.price + priceAdjustment;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Product Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Product Image */}
            <div className="relative">
              {product.images && product.images.length > 0 ? (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              {/* Store Name */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {storeName}
                </h3>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {/* Product Description */}
              {product.description && (
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 mb-6">
                  {product.variants.map((variant) => (
                    <div key={variant.name} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {variant.name}:
                      </label>
                      <select
                        value={variants?.[variant.name] || ''}
                        onChange={(e) => handleVariantChange(productId, variant.name, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{menuLanguage === 'ar' ? 'اختر' : 'Select'}</option>
                        {variant.options.map((option) => (
                          <option key={option.name} value={option.name}>
                            {option.name}
                            {option.price && option.price !== 0 && (
                              option.price > 0 ? ` (+${option.price})` : ` (${option.price})`
                            )}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold" style={{ color: colors.primaryColor }}>
                    {finalPrice} {currency || 'DZD'}
                  </span>
                  {priceAdjustment > 0 && (
                    <span className="text-xl text-gray-500 line-through">
                      {product.price} {currency || 'DZD'}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium text-gray-700">
                    {menuLanguage === 'ar' ? 'الكمية' : 'Quantity'}:
                  </span>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(productId, quantity - 1)}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 text-lg font-medium"
                    >
                      -
                    </button>
                    <span className="px-6 py-3 border-x-2 border-gray-300 min-w-[60px] text-center text-lg font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(productId, quantity + 1)}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 text-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToBasket(product)}
                  className="w-full py-4 px-8 rounded-lg text-xl font-bold text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                  style={{ 
                    backgroundColor: colors.primaryColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primaryHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primaryColor;
                  }}
                >
                  <svg className="w-6 h-6 inline-block mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {menuLanguage === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {menuLanguage === 'ar' ? 'جودة مضمونة' : 'Quality Guaranteed'}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {menuLanguage === 'ar' ? 'شحن سريع' : 'Fast Shipping'}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {menuLanguage === 'ar' ? 'خدمة عملاء 24/7' : '24/7 Support'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;