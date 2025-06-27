import { motion } from 'framer-motion';
import { MenuItem, Variant, VariantOption } from '@/types';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

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
  onAddToBasket: (
    item: MenuItem, 
    quantity: number, 
    key: string, 
    categoryName: string, 
    price: number, 
    selectedVariants?: { [variantName: string]: string }
  ) => void;
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

const MenuSection = ({ 
  menu, 
  menuLanguage, 
  selectedCategory, 
  setSelectedCategory, 
  colors, 
  onAddToBasket 
}: MenuSectionProps) => {
  if (!menu?.categories) return null;

  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedVariants, setSelectedVariants] = useState<{ 
    [key: string]: { [variantName: string]: string } 
  }>({});
  const [dialogItem, setDialogItem] = useState<{
    item: MenuItem;
    categoryIndex: number;
    itemIndex: number;
  } | null>(null);
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});

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

  const handleImageNav = (key: string, images: string[], dir: 1 | -1) => {
    setImageIndexes(prev => {
      const current = prev[key] || 0;
      const next = (current + dir + images.length) % images.length;
      return { ...prev, [key]: next };
    });
  };

  const categories = menu.categories.map(cat => cat.name);

  const getValidImages = (item: MenuItem) => {
    const imgs = (item.images || []).filter(url => !url.startsWith('blob:'));
    if (imgs.length > 0) return imgs;
    if (item.imageUrl) return [item.imageUrl];
    return [];
  };

  return (
    <div className="px-4 pb-16 max-w-7xl mx-auto" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Category Filter */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-4">
        <motion.div 
          className="bg-white rounded-lg p-2 shadow-sm border border-gray-100"
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
              style={selectedCategory === null ? { 
                backgroundColor: colors.primaryColor 
              } : {}}
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
                style={selectedCategory === category ? { 
                  backgroundColor: colors.primaryColor 
                } : {}}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.categories
          .filter(category => selectedCategory === null || category.name === selectedCategory)
          .map((category, categoryIndex) => (
            <React.Fragment key={categoryIndex}>
              {category.items.map((item, itemIndex) => {
                const isAvailable = isItemAvailableToday(item);
                const key = `${categoryIndex}-${itemIndex}`;
                const quantity = quantities[key] || 1;
                const variantAdjustment = getVariantPriceAdjustment(item, key);
                const finalPrice = item.price + variantAdjustment;
                const selected = selectedVariants[key] || {};
                
                return (
                  <motion.div
                    key={itemIndex}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                    whileHover={{ y: -4 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.05 }}
                    onClick={() => setDialogItem({ item, categoryIndex, itemIndex })}
                  >
                    {getValidImages(item).length > 0 && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={getValidImages(item)[imageIndexes[key] || 0]}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                        {getValidImages(item).length > 1 && (
                          <>
                            <button
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                              onClick={e => { e.stopPropagation(); handleImageNav(key, item.images!, -1); }}
                              type="button"
                            >
                              &#8592;
                            </button>
                            <button
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                              onClick={e => { e.stopPropagation(); handleImageNav(key, item.images!, 1); }}
                              type="button"
                            >
                              &#8594;
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {getValidImages(item).map((_, idx) => (
                                <span key={idx} className={`inline-block w-2 h-2 rounded-full ${idx === (imageIndexes[key] || 0) ? 'bg-primary' : 'bg-gray-300'}`}></span>
                              ))}
                            </div>
                          </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          isAvailable
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {isAvailable ? translations[menuLanguage].available : translations[menuLanguage].notAvailable}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {item.variants && item.variants.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {item.variants.map((variant) => (
                            <div key={variant.name} className="flex flex-col gap-1">
                              <span className="font-medium text-sm text-gray-700">
                                {variant.name}:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {variant.options.map(option => {
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
                                      } : menu.orderable === false ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                      onClick={() => menu.orderable !== false && handleVariantChange(
                                        key, 
                                        variant.name, 
                                        isSelected ? '' : option.name
                                      )}
                                      disabled={menu.orderable === false}
                                    >
                                      {option.name}
                                      {option.price ? ` (+${option.price} ${menu.currency || 'DZD'})` : ''}
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
                          {finalPrice} {menu.currency || 'DZD'}
                        </span>
                        
                        {menu.orderable && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <button
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition"
                                onClick={() => handleQuantityChange(categoryIndex, itemIndex, -1)}
                                type="button"
                              >
                                -
                              </button>
                              <span className="px-2 w-8 text-center">{quantity}</span>
                              <button
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition"
                                onClick={() => handleQuantityChange(categoryIndex, itemIndex, 1)}
                                type="button"
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="px-3 py-1 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition"
                              style={{ backgroundColor: colors.primaryColor }}
                              onClick={() => handleConfirm(categoryIndex, itemIndex)}
                              type="button"
                            >
                              {translations[menuLanguage].addToBasket}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
      </div>

      {/* Dialog for item details */}
      <Dialog open={!!dialogItem} onOpenChange={open => !open && setDialogItem(null)}>
        <DialogContent className="max-w-md w-full">
          {dialogItem && (
            <>
              <DialogHeader>
                <DialogTitle>{dialogItem.item.name}</DialogTitle>
              </DialogHeader>
              {getValidImages(dialogItem.item).length > 0 && (
                <div className="relative w-full h-64 mb-4">
                  <img
                    src={getValidImages(dialogItem.item)[imageIndexes[`dialog-${dialogItem.categoryIndex}-${dialogItem.itemIndex}`] || 0]}
                    alt={dialogItem.item.name}
                    className="w-full h-full object-cover rounded"
                  />
                  {getValidImages(dialogItem.item).length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                        onClick={e => { e.stopPropagation(); handleImageNav(`dialog-${dialogItem.categoryIndex}-${dialogItem.itemIndex}`, dialogItem.item.images!, -1); }}
                        type="button"
                      >
                        &#8592;
                      </button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                        onClick={e => { e.stopPropagation(); handleImageNav(`dialog-${dialogItem.categoryIndex}-${dialogItem.itemIndex}`, dialogItem.item.images!, 1); }}
                        type="button"
                      >
                        &#8594;
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {getValidImages(dialogItem.item).map((_, idx) => (
                          <span key={idx} className={`inline-block w-2 h-2 rounded-full ${idx === (imageIndexes[`dialog-${dialogItem.categoryIndex}-${dialogItem.itemIndex}`] || 0) ? 'bg-primary' : 'bg-gray-300'}`}></span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {dialogItem.item.description && (
                <p className="mb-3 text-gray-700 text-sm">{dialogItem.item.description}</p>
              )}
              {dialogItem.item.variants && dialogItem.item.variants.length > 0 && (
                <div className="space-y-2 mb-3">
                  {dialogItem.item.variants.map((variant) => (
                    <div key={variant.name} className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-gray-700">{variant.name}:</span>
                      <div className="flex flex-wrap gap-1">
                        {variant.options.map(option => {
                          const key = `${dialogItem.categoryIndex}-${dialogItem.itemIndex}`;
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
                              } : menu.orderable === false ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                              onClick={() => menu.orderable !== false && handleVariantChange(key, variant.name, isSelected ? '' : option.name)}
                              disabled={menu.orderable === false}
                            >
                              {option.name}
                              {option.price ? ` (+${option.price} ${menu.currency || 'DZD'})` : ''}
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
                  {(dialogItem.item.price + getVariantPriceAdjustment(dialogItem.item, `${dialogItem.categoryIndex}-${dialogItem.itemIndex}`))} {menu.currency || 'DZD'}
                </span>
                {menu.orderable && (
                  <button
                    className="px-3 py-1 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition"
                    style={{ backgroundColor: colors.primaryColor }}
                    onClick={() => {
                      handleConfirm(dialogItem.categoryIndex, dialogItem.itemIndex);
                      setDialogItem(null);
                    }}
                    type="button"
                  >
                    {translations[menuLanguage].addToBasket}
                  </button>
                )}
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

export default MenuSection;