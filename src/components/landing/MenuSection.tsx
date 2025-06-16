import { motion } from 'framer-motion';
import { MenuItem } from '@/types';

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
}

const translations = {
  en: {
    available: 'Available',
    notAvailable: 'Not Available',
    menu: 'Menu',
    allItems: 'All Items'
  },
  ar: {
    available: 'متوفر',
    notAvailable: 'غير متوفر',
    menu: 'القائمة',
    allItems: 'جميع العناصر'
  },
};

const MenuSection = ({ menu, menuLanguage, selectedCategory, setSelectedCategory }: MenuSectionProps) => {
  if (!menu?.categories) return null;

  const isItemAvailableToday = (item: MenuItem): boolean => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return item.availability?.[today] ?? true;
  };

  // Get all categories for the filter
  const categories = menu.categories.map(cat => cat.name);

  return (
    <div className="space-y-10 px-4" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <motion.h3 
        className="text-3xl sm:text-4xl font-bold text-[#8b5cf6] text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {translations[menuLanguage].menu}
      </motion.h3>

      {/* Filter Menu */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-lg relative max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 via-[#ec4899]/10 to-transparent rounded-2xl -z-10"></div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === null
                ? 'bg-[#8b5cf6] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {translations[menuLanguage].allItems}
          </motion.button>
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-[#8b5cf6] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Menu Categories */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {menu.categories
          .filter(category => selectedCategory === null || category.name === selectedCategory)
          .map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-lg relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 via-[#ec4899]/10 to-transparent rounded-2xl -z-10"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-6">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {category.items.map((item, itemIndex) => {
                    const isAvailable = isItemAvailableToday(item);
                    return (
                      <motion.div
                        key={itemIndex}
                        className="group relative bg-white/50 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                        whileHover={{ y: -4 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: itemIndex * 0.1 }}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-lg sm:text-xl font-bold text-[#8b5cf6]">
                                {item.price} {menu.currency || '$'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {isAvailable ? translations[menuLanguage].available : translations[menuLanguage].notAvailable}
                              </span>
                            </div>
                          </div>
                          {item.imageUrl && (
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default MenuSection; 