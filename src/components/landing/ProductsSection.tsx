import React, { useState } from 'react';
import { MenuItem } from '@/types';
import { motion } from 'framer-motion';

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

const translations = {
  en: {
    products: 'Our Products',
    addToBasket: 'Add to Basket',
    quantity: 'Quantity',
  },
  ar: {
    products: 'منتجاتنا',
    addToBasket: 'أضف إلى السلة',
    quantity: 'الكمية',
  },
};

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
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});

  const handleVariantChange = (productId: string, variantName: string, optionName: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantName]: optionName
      }
    }));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
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

  const handleAddToBasket = (product: MenuItem, productId: string) => {
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

  const handleImageNav = (key: string, images: string[], dir: 1 | -1) => {
    setImageIndexes(prev => {
      const current = prev[key] || 0;
      const next = (current + dir + images.length) % images.length;
      return { ...prev, [key]: next };
    });
  };

  const getValidImages = (item: MenuItem) => {
    const imgs = (item.images || []).filter(url => !url.startsWith('blob:'));
    if (imgs.length > 0) return imgs;
    if (item.imageUrl) return [item.imageUrl];
    return [];
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="px-4 pb-16 max-w-7xl mx-auto" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-2" style={{ color: colors.primaryColor }}>
          {translations[menuLanguage].products}
        </h2>
        <p className="text-gray-600">
          {menuLanguage === 'ar' ? 'اكتشف مجموعتنا المميزة من المنتجات' : 'Discover our amazing collection of products'}
        </p>
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => {
          const productId = `${product.name}-${index}`;
          const quantity = quantities[productId] || 1;
          const variants = selectedVariants[productId];
          const priceAdjustment = getVariantPriceAdjustment(product, variants);
          const finalPrice = product.price + priceAdjustment;
          const validImages = getValidImages(product);

          return (
            <motion.div
              key={productId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Product Image */}
              {validImages.length > 0 && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={validImages[imageIndexes[productId] || 0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  {validImages.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                        onClick={e => { e.stopPropagation(); handleImageNav(productId, validImages, -1); }}
                        type="button"
                      >
                        &#8592;
                      </button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                        onClick={e => { e.stopPropagation(); handleImageNav(productId, validImages, 1); }}
                        type="button"
                      >
                        &#8594;
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {validImages.map((_, idx) => (
                          <span key={idx} className={`inline-block w-2 h-2 rounded-full ${idx === (imageIndexes[productId] || 0) ? 'bg-primary' : 'bg-gray-300'}`}></span>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                </div>
              )}

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                </div>
                
                {product.description && (
                  <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {product.variants.map((variant) => (
                      <div key={variant.name} className="flex flex-col gap-1">
                        <span className="font-medium text-sm text-gray-700">
                          {variant.name}:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {variant.options.map(option => {
                            const isSelected = variants?.[variant.name] === option.name;
                            return (
                              <button
                                key={option.name}
                                type="button"
                                className={`px-2 py-1 rounded-full border text-xs font-medium transition-all ${
                                  isSelected
                                    ? 'text-white border-primary shadow'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                                style={isSelected ? {
                                  backgroundColor: colors.primaryColor,
                                  borderColor: colors.primaryColor
                                } : {}}
                                onClick={() => handleVariantChange(
                                  productId, 
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

                {/* Price and Add to Basket */}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-gray-800">
                    {finalPrice} {currency || 'DZD'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition"
                        onClick={() => handleQuantityChange(productId, -1)}
                        type="button"
                      >
                        -
                      </button>
                      <span className="px-2 w-8 text-center">{quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition"
                        onClick={() => handleQuantityChange(productId, 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="px-3 py-1 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition"
                      style={{ backgroundColor: colors.primaryColor }}
                      onClick={() => handleAddToBasket(product, productId)}
                      type="button"
                    >
                      {translations[menuLanguage].addToBasket}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsSection;