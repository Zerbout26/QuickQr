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

  return (
    <section className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: colors.primaryColor }}>
          {menuLanguage === 'ar' ? 'منتجاتنا' : 'Our Products'}
        </h2>
        <p className="text-gray-600">
          {menuLanguage === 'ar' ? 'اكتشف مجموعتنا المميزة من المنتجات' : 'Discover our amazing collection of products'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => {
          const productId = `${product.name}-${index}`;
          const quantity = quantities[productId] || 1;
          const variants = selectedVariants[productId];
          const priceAdjustment = getVariantPriceAdjustment(product, variants);
          const finalPrice = product.price + priceAdjustment;

          return (
            <div key={productId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Product Image */}
              {product.images && product.images.length > 0 && (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {product.variants.map((variant) => (
                      <div key={variant.name} className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          {variant.name}:
                        </label>
                        <select
                          value={variants?.[variant.name] || ''}
                          onChange={(e) => handleVariantChange(productId, variant.name, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold" style={{ color: colors.primaryColor }}>
                    {finalPrice} {currency || 'DZD'}
                  </span>
                  {priceAdjustment > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.price} {currency || 'DZD'}
                    </span>
                  )}
                </div>

                {/* Quantity and Add to Basket */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(productId, quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(productId, quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleAddToBasket(product)}
                    className="flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors"
                    style={{ 
                      backgroundColor: colors.primaryColor,
                      '--tw-hover-bg-opacity': '0.9'
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primaryHoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primaryColor;
                    }}
                  >
                    {menuLanguage === 'ar' ? 'أضف للسلة' : 'Add to Basket'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductsSection; 