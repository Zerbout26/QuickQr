import { motion } from 'framer-motion';
import { MenuItem } from '@/types';

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
  };
  menuLanguage: 'en' | 'ar';
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  colors: LandingPageColors;
}

const translations = {
  en: {
    available: 'Available',
    notAvailable: 'Not Available',
    menu: 'Our Menu',
    allItems: 'All Items'
  },
  ar: {
    available: 'متوفر',
    notAvailable: 'غير متوفر',
    menu: 'قائمتنا',
    allItems: 'جميع الأصناف'
  },
};

const MenuSection = ({ menu, menuLanguage, selectedCategory, setSelectedCategory, colors }: MenuSectionProps) => {
  if (!menu?.categories) return null;

  const isItemAvailableToday = (item: MenuItem): boolean => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return item.availability?.[today] ?? true;
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
                          
                          <div className="flex justify-between items-center">
                            <span 
                              className="text-lg font-bold text-gray-800"
                            >
                              {item.price} {menu.currency || 'DZD'}
                            </span>
                          </div>
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