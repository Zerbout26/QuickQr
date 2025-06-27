import { motion } from 'framer-motion';
import { MenuItem, Variant, VariantOption } from '@/types';
import React, { useState } from 'react';

interface LandingPageColors {
  primaryColor: string;
  primaryHoverColor: string;
  accentColor: string;
  backgroundGradient: string;
  loadingSpinnerColor: string;
  loadingSpinnerBorderColor: string;
}

interface MenuSectionProps {
  menu: {
    categories: {
      name: string;
      items: MenuItem[];
    }[];
    currency?: string;
    orderable?: boolean;
  };
  menuLanguage: 'en' | 'ar';
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  colors: LandingPageColors;
  onAddToBasket: (item: MenuItem, quantity: number, key: string, categoryName: string, price: number, selectedVariants?: { [variantName: string]: string }) => void;
}

const translations = {
  en: {
    available: 'Available',
    notAvailable: 'Not Available',
    menu: 'Our Menu',
    allItems: 'All Items',
    addToBasket: 'Add to Basket',
    confirm: 'Confirm',
    quantity: 'Quantity',
  },
  ar: {
    available: 'متوفر',
    notAvailable: 'غير متوفر',
    menu: 'قائمتنا',
    allItems: 'جميع الأصناف',
    addToBasket: 'أضف إلى السلة',
    confirm: 'تأكيد',
    quantity: 'الكمية',
  },
};

const MenuSection = ({ menu, menuLanguage, selectedCategory, setSelectedCategory, colors, onAddToBasket }: MenuSectionProps) => {
  if (!menu?.categories) return null;

  // Track quantity for each item by category and item index
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: { [variantName: string]: string } }>({});

  const isItemAvailableToday = (item: MenuItem): boolean => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return item.availability?.[today] ?? true;
  };

  const handleQuantityChange = (catIdx: number, itemIdx: number, delta: number) => {
    const key = `${catIdx}-${itemIdx}`;
    setQuantities(qs => ({ ...qs, [key]: Math.max(1, (qs[key] || 1) + delta) }));
  };

  const getVariantPriceAdjustment = (item: MenuItem, key: string) => {
    if (!item.variants) return 0;
    const selected = selectedVariants[key] || {};
    return item.variants.reduce((sum, variant) => {
      const selectedOptionName = selected[variant.name];
      const option = variant.options.find(opt => opt.name === selectedOptionName);
      return sum + (option?.price || 0);
    }, 0);
  };

  const handleVariantChange = (key: string, variantName: string, optionName: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [variantName]: optionName
      }
    }));
  };

  const handleConfirm = (catIdx: number, itemIdx: number) => {
    const key = `${catIdx}-${itemIdx}`;
    const category = menu.categories[catIdx];
    const item = category.items[itemIdx];
    const quantity = quantities[key] || 1;
    const variantAdjustment = getVariantPriceAdjustment(item, key);
    const finalPrice = item.price + variantAdjustment;
    const selected = selectedVariants[key] || {};
    onAddToBasket(
      item,
      quantity,
      key,
      category.name,
      finalPrice,
      selected
    );
    setQuantities(qs => ({ ...qs, [key]: 1 }));
  };

  const categories = menu.categories.map(cat => cat.name);

  return (
    <div className="space-y-12 px-4 pb-16" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Category Filter */}
      <motion.div 
        className="bg-white rounded-lg p-2 shadow-sm max-w-4xl mx-auto border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            style={selectedCategory === null ? { backgroundColor: colors.primaryColor } : {}}
          >
            {translations[menuLanguage].allItems}
          </motion.button>
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              style={selectedCategory === category ? { backgroundColor: colors.primaryColor } : {}}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Menu Items */}
      <div className="space-y-12 max-w-4xl mx-auto">
        {menu.categories
          .filter(category => selectedCategory === null || category.name === selectedCategory)
          .map((category, categoryIndex) => (
            <motion.section
              key={categoryIndex}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className="px-2">
                <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                  {category.name}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {category.items.map((item, itemIndex) => {
                  const isAvailable = isItemAvailableToday(item);
                  const key = `${categoryIndex}-${itemIndex}`;
                  const quantity = quantities[key] || 1;
                  const variantAdjustment = getVariantPriceAdjustment(item, key);
                  const finalPrice = item.price + variantAdjustment;
                  const selected = selectedVariants[key] || {};
                  return (
                    <motion.article
                      key={itemIndex}
                      className="bg-white rounded-lg shadow-xs hover:shadow-sm border border-gray-100 overflow-hidden transition-all duration-200"
                      whileHover={{ y: -2 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: itemIndex * 0.05 }}
                    >
                      <div className="flex flex-col sm:flex-row">
                        {item.imageUrl && (
                          <div className="sm:w-1/3 h-48 sm:h-auto relative overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
                          </div>
                        )}
                        
                        <div className={`p-5 ${item.imageUrl ? 'sm:w-2/3' : 'w-full'}`}>
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                              isAvailable
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {isAvailable ? translations[menuLanguage].available : translations[menuLanguage].notAvailable}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          
                          {item.variants && item.variants.length > 0 && (
                            <div className="space-y-2 mb-2">
                              {item.variants.map((variant) => (
                                <div key={variant.name} className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">{variant.name}:</span>
                                  {variant.options.map(option => {
                                    const isSelected = selected[variant.name] === option.name;
                                    return (
                                      <button
                                        key={option.name}
                                        type="button"
                                        className={`px-3 py-1 rounded border text-sm font-medium transition-all mr-2 mb-2 ${
                                          isSelected
                                            ? 'bg-primary text-white border-primary shadow'
                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                        }`}
                                        style={isSelected ? { backgroundColor: colors.primaryColor, borderColor: colors.primaryColor } : {}}
                                        onClick={() => handleVariantChange(key, variant.name, option.name)}
                                      >
                                        {option.name}{option.price ? ` (+${option.price} ${menu.currency || 'DZD'})` : ''}
                                      </button>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <span 
                              className="text-lg font-bold text-gray-800"
                            >
                              {(item.price + variantAdjustment)} {menu.currency || 'DZD'}
                            </span>
                          </div>
                          {menu.orderable && (
                            <div className="flex items-center gap-2 mt-2">
                              <span>{translations[menuLanguage].quantity}:</span>
                              <button
                                className="px-2 py-1 border rounded"
                                onClick={() => handleQuantityChange(categoryIndex, itemIndex, -1)}
                                type="button"
                              >-</button>
                              <span className="px-2">{quantity}</span>
                              <button
                                className="px-2 py-1 border rounded"
                                onClick={() => handleQuantityChange(categoryIndex, itemIndex, 1)}
                                type="button"
                              >+</button>
                              <button
                                className="ml-4 px-4 py-1 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
                                style={{ backgroundColor: colors.primaryColor }}
                                onClick={() => handleConfirm(categoryIndex, itemIndex)}
                                type="button"
                                disabled={item.variants && item.variants.some(v => !selected[v.name])}
                              >
                                {translations[menuLanguage].addToBasket}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </motion.section>
          ))}
      </div>
    </div>
  );
};

export default MenuSection;