import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, CreditCard, Truck, Shield, ArrowRight, Home, Star, Globe, ChartBar, Settings } from 'lucide-react';

const API_BASE_URL = 'https://quickqr-heyg.onrender.com/api';

const translations = {
  en: {
    title: 'Order NFC Cards, Business Cards, Tags & Stickers',
    subtitle: 'Professional quality products for your business',
    name: 'Full Name',
    phone: 'Phone Number',
    address: 'Delivery Address',
    productType: 'Product Type',
    quantity: 'Quantity',
    notes: 'Additional Notes (Optional)',
    total: 'Total',
    orderNow: 'Order Now',
    orderSuccess: 'Order placed successfully!',
    orderError: 'Failed to place order. Please try again.',
    loading: 'Processing...',
    businessCards: 'Business Cards',
    nfcCards: 'NFC Visitor Cards',
    qrTags: 'QR Tags',
    qrStickers: 'QR Stickers',
    businessCardsDesc: 'Professional business cards with your QR code',
    nfcCardsDesc: 'NFC visitor cards for easy contact sharing',
    qrTagsDesc: 'QR code tags for products and items',
    qrStickersDesc: 'QR code stickers for marketing',
    features: 'Features',
    securePayment: 'Secure Payment',
    fastDelivery: 'Fast Delivery',
    qualityGuarantee: 'Quality Guarantee',
    customerSupport: '24/7 Support',
    pricing: {
      business: 1500,
      nfc: 2000,
      tags: 800,
      stickers: 500
    }
  },
  ar: {
    title: 'اطلب بطاقات NFC، بطاقات عمل، علامات وملصقات',
    subtitle: 'منتجات عالية الجودة لعملك',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    address: 'عنوان التوصيل',
    productType: 'نوع المنتج',
    quantity: 'الكمية',
    notes: 'ملاحظات إضافية (اختياري)',
    total: 'المجموع',
    orderNow: 'اطلب الآن',
    orderSuccess: 'تم تقديم الطلب بنجاح!',
    orderError: 'فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.',
    loading: 'جاري المعالجة...',
    businessCards: 'بطاقات عمل',
    nfcCards: 'بطاقات NFC للزوار',
    qrTags: 'علامات QR',
    qrStickers: 'ملصقات QR',
    businessCardsDesc: 'بطاقات عمل احترافية مع رمز QR الخاص بك',
    nfcCardsDesc: 'بطاقات NFC للزوار لمشاركة جهات الاتصال بسهولة',
    qrTagsDesc: 'علامات QR للمنتجات والعناصر',
    qrStickersDesc: 'ملصقات QR للتسويق',
    features: 'المميزات',
    securePayment: 'دفع آمن',
    fastDelivery: 'توصيل سريع',
    qualityGuarantee: 'ضمان الجودة',
    customerSupport: 'دعم 24/7',
    pricing: {
      business: 1500,
      nfc: 2000,
      tags: 800,
      stickers: 500
    }
  }
};

const OrderPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    productType: '',
    quantity: 1,
    notes: ''
  });

  const productTypes = [
    {
      value: 'nfc_standard',
      label: language === 'ar' ? 'بطاقة NFC عادية' : 'NFC Card Standard',
      description: language === 'ar' ? 'بطاقة NFC عادية بجودة عالية' : 'High quality standard NFC card',
      price: 1900
    },
    {
      value: 'nfc_custom',
      label: language === 'ar' ? 'بطاقة NFC مخصصة' : 'NFC Card Custom',
      description: language === 'ar' ? 'بطاقة NFC بتصميم مخصص' : 'Custom design NFC card',
      price: 2900
    }
  ];

  const selectedProduct = productTypes.find(p => p.value === formData.productType);
  const totalPrice = selectedProduct ? selectedProduct.price * formData.quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.productType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'card_order',
          cardType: formData.productType,
          quantity: formData.quantity,
          customerInfo: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address
          },
          notes: formData.notes,
          totalAmount: totalPrice
        })
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      
      toast({
        title: t.orderSuccess,
        description: `Order #${result.order.orderNumber} has been placed successfully!`
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        productType: '',
        quantity: 1,
        notes: ''
      });

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: t.orderError
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 py-8">
          {/* Navigation Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <Home className="w-4 h-4" />
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </Button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">
                {language === 'ar' ? 'طلب البطاقات والملصقات' : 'Order Cards & Stickers'}
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-xl text-gray-600">{t.subtitle}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    {language === 'ar' ? 'اطلب الآن' : 'Place Your Order'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.name} *</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder={t.name}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{t.phone} *</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder={t.phone}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{t.address} *</label>
                        <Textarea
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder={t.address}
                          rows={3}
                          required
                        />
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.productType} *</label>
                        <Select 
                          value={formData.productType} 
                          onValueChange={(value) => setFormData({...formData, productType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.productType} />
                          </SelectTrigger>
                          <SelectContent>
                            {productTypes.map((product) => (
                              <SelectItem key={product.value} value={product.value}>
                                <div className="flex justify-between items-center w-full">
                                  <span>{product.label}</span>
                                  <Badge variant="secondary">{product.price} DZD</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{t.quantity}</label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{t.notes}</label>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          placeholder={t.notes}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Total */}
                    {selectedProduct && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{selectedProduct.label}</span>
                          <span>{formData.quantity} x {selectedProduct.price} DZD</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>{t.total}:</span>
                            <span className="text-blue-600">{totalPrice} DZD</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-semibold"
                      disabled={loading || !formData.productType}
                    >
                      {loading ? t.loading : t.orderNow}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Features and Info */}
              <div className="space-y-6">
                {/* Features */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{t.features}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold">{t.securePayment}</h4>
                        <p className="text-sm text-gray-600">Cash on delivery</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Truck className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold">{t.fastDelivery}</h4>
                        <p className="text-sm text-gray-600">2-3 business days</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold">{t.qualityGuarantee}</h4>
                        <p className="text-sm text-gray-600">Premium materials</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-semibold">{t.customerSupport}</h4>
                        <p className="text-sm text-gray-600">Always here to help</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Details */}
                {selectedProduct && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">{selectedProduct.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">What's included:</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Professional design</li>
                          <li>• High-quality printing</li>
                          <li>• QR code integration</li>
                          <li>• Fast delivery</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Promotion Section */}
          <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5 mt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? 'ابدأ في إنشاء رموز QR الخاصة بك' : 'Start Creating Your Own QR Codes'}
                </h2>
                <p className="text-lg text-gray-600 mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? 
                    'انضم إلى آلاف الشركات التي تستخدم منصتنا لإنشاء تجارب رقمية مذهلة' : 
                    'Join thousands of businesses using our platform to create amazing digital experiences'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/signup')}
                    className="text-lg py-3 px-8 flex items-center gap-2"
                  >
                    {language === 'ar' ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline" 
                    className="text-lg py-3 px-8"
                  >
                    {language === 'ar' ? 'تعرف على المزيد' : 'Learn More'}
                  </Button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="bg-primary/10 p-3 rounded-lg inline-flex mb-4">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'تخصيص العلامة التجارية' : 'Custom Branding'}
                  </h3>
                  <p className="text-gray-600 text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'طابق ألوان علامتك التجارية وشعارك تماماً' : 'Match your brand colors and logo perfectly'}
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="bg-primary/10 p-3 rounded-lg inline-flex mb-4">
                    <ChartBar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'منشئ القوائم' : 'Menu Builder'}
                  </h3>
                  <p className="text-gray-600 text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'أنشئ قوائم طعام رقمية جميلة للمطاعم' : 'Create beautiful digital menus for restaurants'}
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="bg-primary/10 p-3 rounded-lg inline-flex mb-4">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'روابط متعددة' : 'Multiple Links'}
                  </h3>
                  <p className="text-gray-600 text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'أضف روابط ومحتوى غير محدود لرمز QR' : 'Add unlimited links and content to your QR'}
                  </p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="bg-primary/10 p-3 rounded-lg inline-flex mb-4">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'تحديثات فورية' : 'Real-time Updates'}
                  </h3>
                  <p className="text-gray-600 text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'حدث المحتوى في أي وقت دون رموز QR جديدة' : 'Update content anytime without new QR codes'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderPage; 