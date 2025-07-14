import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { CreditCard, Smartphone, Package, CheckCircle } from 'lucide-react';

interface CardOrderSectionProps {
  colors: {
    primaryColor: string;
    primaryHoverColor: string;
  };
}

const translations = {
  en: {
    title: 'Order Cards & NFC',
    subtitle: 'Get professional business cards and NFC visitor cards',
    businessCards: 'Business Cards',
    businessCardsDesc: 'Professional business cards with your QR code',
    nfcCards: 'NFC Visitor Cards',
    nfcCardsDesc: 'Smart NFC cards for instant contact sharing',
    orderNow: 'Order Now',
    deliveryInfo: 'Delivery Information',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    address: 'Delivery Address',
    cardType: 'Card Type',
    quantity: 'Quantity',
    notes: 'Additional Notes',
    submitOrder: 'Submit Order',
    orderSubmitted: 'Order Submitted Successfully',
    orderSubmittedDesc: 'We will contact you soon to confirm your order',
    businessCard: 'Business Card',
    nfcCard: 'NFC Card',
    enterName: 'Enter your full name',
    enterPhone: 'Enter your phone number',
    enterAddress: 'Enter your complete delivery address',
    enterNotes: 'Any special requirements or notes...',
    cancel: 'Cancel',
    loading: 'Submitting...',
    quickAccess: 'وصول سريع - لا حاجة لحساب',
  },
  ar: {
    title: 'طلب البطاقات و NFC',
    subtitle: 'احصل على بطاقات عمل احترافية وبطاقات زوار NFC',
    businessCards: 'بطاقات العمل',
    businessCardsDesc: 'بطاقات عمل احترافية مع رمز QR الخاص بك',
    nfcCards: 'بطاقات زوار NFC',
    nfcCardsDesc: 'بطاقات NFC ذكية لمشاركة جهات الاتصال فوراً',
    orderNow: 'اطلب الآن',
    deliveryInfo: 'معلومات التوصيل',
    fullName: 'الاسم الكامل',
    phoneNumber: 'رقم الهاتف',
    address: 'عنوان التوصيل',
    cardType: 'نوع البطاقة',
    quantity: 'الكمية',
    notes: 'ملاحظات إضافية',
    submitOrder: 'إرسال الطلب',
    orderSubmitted: 'تم إرسال الطلب بنجاح',
    orderSubmittedDesc: 'سنتواصل معك قريباً لتأكيد طلبك',
    businessCard: 'بطاقة عمل',
    nfcCard: 'بطاقة NFC',
    enterName: 'أدخل اسمك الكامل',
    enterPhone: 'أدخل رقم هاتفك',
    enterAddress: 'أدخل عنوان التوصيل الكامل',
    enterNotes: 'أي متطلبات خاصة أو ملاحظات...',
    cancel: 'إلغاء',
    loading: 'جاري الإرسال...',
    quickAccess: 'وصول سريع - لا حاجة لحساب',
  }
};

const CardOrderSection: React.FC<CardOrderSectionProps> = ({ colors }) => {
  const { language } = useLanguage();
  const t = translations[language];



  const cardTypes = [
    {
      type: 'business' as const,
      title: t.businessCards,
      description: t.businessCardsDesc,
      icon: <CreditCard className="w-8 h-8" />,
      price: '0.5 DZD per card',
      features: ['Professional design', 'QR code integration', 'High quality paper', 'Fast delivery']
    },
    {
      type: 'nfc' as const,
      title: t.nfcCards,
      description: t.nfcCardsDesc,
      icon: <Smartphone className="w-8 h-8" />,
      price: '2 DZD per card',
      features: ['NFC technology', 'Instant contact sharing', 'Reusable', 'Premium quality']
    },
    {
      type: 'tags' as const,
      title: 'QR Tags',
      description: 'Professional QR code tags for products and items',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>,
      price: '0.3 DZD per tag',
      features: ['Durable material', 'Weather resistant', 'Easy to apply', 'Custom sizing']
    },
    {
      type: 'stickers' as const,
      title: 'QR Stickers',
      description: 'High-quality QR code stickers for marketing',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      price: '0.2 DZD per sticker',
      features: ['Vinyl material', 'Waterproof', 'UV resistant', 'Multiple sizes']
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white" data-card-order-section>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            {language === 'ar' ? t.quickAccess : 'Quick Access - No Account Required'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.subtitle}
          </p>
          
          {/* Dedicated Order Page Link */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
            <h3 className="text-xl font-bold mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'صفحة طلب مخصصة للإعلانات' : 'Dedicated Order Page for Ads'}
            </h3>
            <p className="text-blue-100 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 
                'استخدم هذه الصفحة المخصصة في إعلاناتك للحصول على تجربة طلب سلسة' : 
                'Use this dedicated page in your ads for a seamless ordering experience'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => window.open('/order', '_blank')}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
              >
                {language === 'ar' ? 'فتح صفحة الطلب' : 'Open Order Page'}
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => navigator.clipboard.writeText(window.location.origin + '/order')}
              >
                {language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {cardTypes.map((cardType) => (
            <Card key={cardType.type} className="relative overflow-hidden hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.primaryColor + '20' }}>
                    <div style={{ color: colors.primaryColor }}>
                      {cardType.icon}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {cardType.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {cardType.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {cardType.price}
                  </Badge>
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <ul className="space-y-2 mb-6">
                  {cardType.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                                <Button 
                  className="w-full"
                  style={{ 
                    backgroundColor: colors.primaryColor,
                    '--tw-ring-color': colors.primaryColor
                  } as React.CSSProperties}
                  onClick={() => window.open('/order', '_blank')}
                >
                  {t.orderNow}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </section>
  );
};

export default CardOrderSection; 