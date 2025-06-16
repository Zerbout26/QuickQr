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

  const categories = menu.categories.map(cat => cat.name);

  return (
    <div className="space-y-10 px-4 pb-10" dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <motion.h3 
        className="text-3xl sm:text-4xl font-bold text-[#8b5cf6] text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {translations[menuLanguage].menu}
      </motion.h3>

      {/* Category Filter */}
      <motion.div 
        className="bg-white rounded-xl p-4 shadow-sm relative max-w-4xl mx-auto border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {translations[menuLanguage].allItems}
          </motion.button>
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Menu Items */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {menu.categories
          .filter(category => selectedCategory === null || category.name === selectedCategory)
          .map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 px-2">
                {category.name}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {category.items.map((item, itemIndex) => {
                  const isAvailable = isItemAvailableToday(item);
                  return (
                    <motion.div
                      key={itemIndex}
                      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300"
                      whileHover={{ y: -5, shadow: 'lg' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: itemIndex * 0.05 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-[#ec4899]/5 to-transparent -z-10"></div>
                      
                      <div className="flex flex-col h-full">
                        {item.imageUrl && (
                          <div className="relative h-40 w-full overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                          </div>
                        )}
                        
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.name}</h3>
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                              isAvailable
                                ? 'bg-green-50 text-green-700 border border-green-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {isAvailable ? translations[menuLanguage].available : translations[menuLanguage].notAvailable}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                          )}
                          
                          <div className="mt-auto flex justify-between items-center">
                            <span className="text-lg font-extrabold text-[#8b5cf6]">
                              {item.price} {menu.currency || '$'}
                            </span>
                            {isAvailable && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-colors"
                              >
                                {menuLanguage === 'ar' ? 'أضف' : 'Add'}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default MenuSection;