import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<'business' | 'nfc' | 'tags' | 'stickers'>('business');
  const [quantity, setQuantity] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        type: 'card_order',
        cardType: selectedCardType,
        quantity: quantity,
        customerInfo: formData,
        totalAmount: selectedCardType === 'business' ? quantity * 0.5 : 
                   selectedCardType === 'nfc' ? quantity * 2 :
                   selectedCardType === 'tags' ? quantity * 0.3 :
                   quantity * 0.2 // stickers
      };

      console.log('Sending order data:', orderData);

      // Send order to backend
      const response = await fetch('https://quickqr-heyg.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorMessage = 'Failed to create order';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);

      // Reset form and show success
      setFormData({ name: '', phone: '', address: '', notes: '' });
      setShowOrderForm(false);
      setShowSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert(language === 'ar' ? 
        'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.' : 
        'Error submitting order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full"
                      style={{ 
                        backgroundColor: colors.primaryColor,
                        '--tw-ring-color': colors.primaryColor
                      } as React.CSSProperties}
                      onClick={() => setSelectedCardType(cardType.type)}
                      data-order-form-trigger={cardType.type === 'business' ? 'true' : undefined}
                    >
                      {t.orderNow}
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {t.deliveryInfo}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {t.fullName} *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t.enterName}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {t.phoneNumber} *
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder={t.enterPhone}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {t.address} *
                        </label>
                        <Textarea
                          required
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder={t.enterAddress}
                          rows={3}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {t.quantity}
                        </label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(Math.max(50, quantity - 50))}
                          >
                            -
                          </Button>
                          <span className="px-4 py-2 bg-gray-50 rounded-md min-w-[80px] text-center">
                            {quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(quantity + 50)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {t.notes}
                        </label>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder={t.enterNotes}
                          rows={2}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {t.cardType}:
                          </span>
                          <span className="text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {selectedCardType === 'business' ? t.businessCard : 
                             selectedCardType === 'nfc' ? t.nfcCard :
                             selectedCardType === 'tags' ? 'QR Tags' : 'QR Stickers'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {t.quantity}:
                          </span>
                          <span className="text-sm text-gray-600">{quantity}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-bold" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            Total:
                          </span>
                          <span className="font-bold">
                            {selectedCardType === 'business' ? quantity * 0.5 : 
                             selectedCardType === 'nfc' ? quantity * 2 :
                             selectedCardType === 'tags' ? quantity * 0.3 :
                             quantity * 0.2} DZD
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowOrderForm(false)}
                        >
                          {t.cancel}
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isSubmitting}
                          style={{ 
                            backgroundColor: colors.primaryColor,
                            '--tw-ring-color': colors.primaryColor
                          } as React.CSSProperties}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              {t.loading}
                            </div>
                          ) : (
                            t.submitOrder
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.orderSubmitted}
            </h3>
            <p className="text-gray-600 mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.orderSubmittedDesc}
            </p>
            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full"
              style={{ 
                backgroundColor: colors.primaryColor,
                '--tw-ring-color': colors.primaryColor
              } as React.CSSProperties}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CardOrderSection; 