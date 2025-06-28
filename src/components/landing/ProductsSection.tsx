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
    products: 'Our Products',
    orderNow: 'Order Now',
    quantity: 'Quantity',
    viewDetails: 'View Details',
  },
  ar: {
    products: 'منتجاتنا',
    orderNow: 'اطلب الآن',
    quantity: 'الكمية',
    viewDetails: 'عرض التفاصيل',
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
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: SelectedVariants }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});
  const [dialogProduct, setDialogProduct] = useState<{
    product: MenuItem;
    productIndex: number;
  } | null>(null);

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

  const handleOrderNow = (product: MenuItem, productId: string) => {
    const quantity = quantities[productId] || 1;
    const variants = selectedVariants[productId];
    const priceAdjustment = getVariantPriceAdjustment(product, variants);
    const finalPrice = product.price + priceAdjustment;
    
    // Use direct order if available, otherwise fall back to basket
    if (onDirectOrder) {
      onDirectOrder(product, quantity, productId, 'Products', finalPrice, variants);
    } else {
      onAddToBasket(product, quantity, productId, 'Products', finalPrice, variants);
    }
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

      {/* Single Centered Product */}
      <div className="flex justify-center">
        <div className="max-w-2xl w-full">
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
                  <div className="relative h-80 w-full overflow-hidden">
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
                <div className="p-8">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed text-center">
                      {product.description}
                    </p>
                  )}

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {product.variants.map((variant) => (
                        <div key={variant.name} className="flex flex-col gap-2">
                          <span className="font-medium text-base text-gray-700 text-center">
                            {variant.name}:
                          </span>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {variant.options.map(option => {
                              const isSelected = variants?.[variant.name] === option.name;
                              return (
                                <button
                                  key={option.name}
                                  type="button"
                                  className={`px-4 py-2 rounded-full border text-base font-medium transition-all ${
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

                  {/* Price and Order Now */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-800">
                        {finalPrice} {currency || 'DZD'}
                      </span>
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-lg font-medium text-gray-700">
                        {translations[menuLanguage].quantity}:
                      </span>
                      <div className="flex items-center border-2 border-gray-300 rounded-lg">
                        <button
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition text-lg font-medium"
                          onClick={() => handleQuantityChange(productId, -1)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="px-6 py-2 w-12 text-center text-lg font-bold border-x-2 border-gray-300">
                          {quantity}
                        </span>
                        <button
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition text-lg font-medium"
                          onClick={() => handleQuantityChange(productId, 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      {/* View Details Button */}
                      <button
                        className="w-full py-3 px-6 rounded-xl text-lg font-semibold border-2 transition-all duration-200 hover:scale-105"
                        style={{ 
                          borderColor: colors.primaryColor,
                          color: colors.primaryColor
                        }}
                        onClick={() => setDialogProduct({ product, productIndex: index })}
                        type="button"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.primaryColor;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = colors.primaryColor;
                        }}
                      >
                        <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {translations[menuLanguage].viewDetails}
                      </button>

                      {/* Big Order Now Button */}
                      <button
                        className="w-full py-5 px-8 rounded-xl text-2xl font-bold text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                        style={{ backgroundColor: colors.primaryColor }}
                        onClick={() => handleOrderNow(product, productId)}
                        type="button"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.primaryHoverColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.primaryColor;
                        }}
                      >
                        <svg className="w-7 h-7 inline-block mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {translations[menuLanguage].orderNow}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dialog for product details */}
      <Dialog open={!!dialogProduct} onOpenChange={open => !open && setDialogProduct(null)}>
        <DialogContent className="max-w-md w-full">
          {dialogProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{dialogProduct.product.name}</DialogTitle>
              </DialogHeader>
              {(() => {
                const dialogImages = getValidImages(dialogProduct.product);
                return dialogImages.length > 0 && (
                  <div className="relative w-full h-64 mb-4">
                    <img
                      src={dialogImages[imageIndexes[`dialog-${dialogProduct.productIndex}`] || 0]}
                      alt={dialogProduct.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                    {dialogImages.length > 1 && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                          onClick={e => { e.stopPropagation(); handleImageNav(`dialog-${dialogProduct.productIndex}`, dialogImages, -1); }}
                          type="button"
                        >
                          &#8592;
                        </button>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                          onClick={e => { e.stopPropagation(); handleImageNav(`dialog-${dialogProduct.productIndex}`, dialogImages, 1); }}
                          type="button"
                        >
                          &#8594;
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {dialogImages.map((_, idx) => (
                            <span key={idx} className={`inline-block w-2 h-2 rounded-full ${idx === (imageIndexes[`dialog-${dialogProduct.productIndex}`] || 0) ? 'bg-primary' : 'bg-gray-300'}`}></span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
              {dialogProduct.product.description && (
                <p className="mb-3 text-gray-700 text-sm">{dialogProduct.product.description}</p>
              )}
              {dialogProduct.product.variants && dialogProduct.product.variants.length > 0 && (
                <div className="space-y-2 mb-3">
                  {dialogProduct.product.variants.map((variant) => (
                    <div key={variant.name} className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-gray-700">{variant.name}:</span>
                      <div className="flex flex-wrap gap-1">
                        {variant.options.map(option => {
                          const key = `${dialogProduct.product.name}-${dialogProduct.productIndex}`;
                          const selected = selectedVariants[key] || {};
                          const isSelected = selected[variant.name] === option.name;
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
                              onClick={() => handleVariantChange(key, variant.name, isSelected ? '' : option.name)}
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
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-gray-800">
                  {(dialogProduct.product.price + getVariantPriceAdjustment(dialogProduct.product, selectedVariants[`${dialogProduct.product.name}-${dialogProduct.productIndex}`]))} {currency || 'DZD'}
                </span>
                <button
                  className="px-3 py-1 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition"
                  style={{ backgroundColor: colors.primaryColor }}
                  onClick={() => {
                    handleOrderNow(dialogProduct.product, `${dialogProduct.product.name}-${dialogProduct.productIndex}`);
                    setDialogProduct(null);
                  }}
                  type="button"
                >
                  {translations[menuLanguage].orderNow}
                </button>
              </div>
              <DialogClose asChild>
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
              </DialogClose>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsSection;