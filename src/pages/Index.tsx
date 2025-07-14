import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Shield, Star, Globe, ChartBar, Settings, CheckCircle, Facebook, Instagram, CreditCard, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import CardOrderSection from '@/components/landing/CardOrderSection';


// Clean translations object
const translations = {
  en: {
    hero: {
      title: "Professional QR Code Solutions",
      subtitle: "Create engaging digital experiences for your business",
      description: "Transform your business with custom QR landing pages. Perfect for restaurants, retail stores, and professional services.",
      startFreeTrial: "Start Free Trial",
      signIn: "Sign In",
      noCreditCard: "14-day free trial. No credit card required."
    },
    features: {
      title: "Everything You Need",
      subtitle: "Professional QR solutions for modern businesses",
      customBranding: "Custom Branding",
      customBrandingDesc: "Match your brand colors and logo perfectly",
      menuBuilder: "Menu Builder",
      menuBuilderDesc: "Create beautiful digital menus for restaurants",
      multipleLinks: "Multiple Links",
      multipleLinksDesc: "Add unlimited links and content to your QR",
      realTimeUpdates: "Real-time Updates",
      realTimeUpdatesDesc: "Update content anytime without new QR codes"
    },
    howItWorks: {
      title: "Simple Process",
      subtitle: "Get your QR landing page online in minutes",
      step1: {
        title: "Create QR Code",
        description: "Design with your brand colors and logo"
      },
      step2: {
        title: "Add Content",
        description: "Customize with links, menus, and information"
      },
      step3: {
        title: "Share & Update",
        description: "Download and update anytime"
      }
    },
    social: {
      title: "Follow Us",
      subtitle: "Stay updated with the latest QR trends and tips",
      followText: "Follow us on social media for updates, tips, and inspiration"
    },
    cta: {
      title: "Ready to Transform Your Business?",
      subtitle: "Join businesses using our QR platform to enhance customer experience",
      button: "Start Creating Now"
    }
  },
  ar: {
    hero: {
      title: "حلول QR احترافية",
      subtitle: "أنشئ تجارب رقمية جذابة لعملك",
      description: "حول عملك بصفحات QR مخصصة. مثالية للمطاعم والمتاجر والخدمات المهنية.",
      startFreeTrial: "ابدأ التجربة المجانية",
      signIn: "تسجيل الدخول",
      noCreditCard: "تجربة مجانية 14 يوم. لا حاجة لبطاقة ائتمان."
    },
    features: {
      title: "كل ما تحتاجه",
      subtitle: "حلول QR احترافية للشركات الحديثة",
      customBranding: "تخصيص العلامة التجارية",
      customBrandingDesc: "طابق ألوان علامتك التجارية وشعارك تماماً",
      menuBuilder: "منشئ القوائم",
      menuBuilderDesc: "أنشئ قوائم طعام رقمية جميلة للمطاعم",
      multipleLinks: "روابط متعددة",
      multipleLinksDesc: "أضف روابط ومحتوى غير محدود لرمز QR",
      realTimeUpdates: "تحديثات فورية",
      realTimeUpdatesDesc: "حدث المحتوى في أي وقت دون رموز QR جديدة"
    },
    howItWorks: {
      title: "عملية بسيطة",
      subtitle: "احصل على صفحة QR في دقائق",
      step1: {
        title: "أنشئ رمز QR",
        description: "صمم بألوان علامتك التجارية وشعارك"
      },
      step2: {
        title: "أضف المحتوى",
        description: "خصص بالروابط والقوائم والمعلومات"
      },
      step3: {
        title: "شارك وحدث",
        description: "حمل وحدث في أي وقت"
      }
    },
    social: {
      title: "تابعنا",
      subtitle: "ابق محدثاً بأحدث اتجاهات QR والنصائح",
      followText: "تابعنا على وسائل التواصل الاجتماعي للحصول على التحديثات والنصائح والإلهام"
    },
    cta: {
      title: "هل أنت مستعد لتحويل عملك؟",
      subtitle: "انضم للشركات التي تستخدم منصتنا لتعزيز تجربة العملاء",
      button: "ابدأ الإنشاء الآن"
    }
  }
};

const features = [
  {
    title: (lang: 'en' | 'ar') => translations[lang].features.customBranding,
    description: (lang: 'en' | 'ar') => translations[lang].features.customBrandingDesc,
    icon: <Star className="w-6 h-6 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].features.menuBuilder,
    description: (lang: 'en' | 'ar') => translations[lang].features.menuBuilderDesc,
    icon: <ChartBar className="w-6 h-6 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].features.multipleLinks,
    description: (lang: 'en' | 'ar') => translations[lang].features.multipleLinksDesc,
    icon: <Globe className="w-6 h-6 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].features.realTimeUpdates,
    description: (lang: 'en' | 'ar') => translations[lang].features.realTimeUpdatesDesc,
    icon: <Settings className="w-6 h-6 text-primary" />,
  },
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If user is already logged in, don't redirect - let them access the card order section
  // The card order section should be accessible to everyone

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        type: 'card_order',
        cardType: selectedProductType,
        quantity: quantity,
        customerInfo: formData,
        totalAmount: selectedProductType === 'business' ? quantity * 0.5 : 
                   selectedProductType === 'nfc' ? quantity * 2 :
                   selectedProductType === 'tags' ? quantity * 0.3 :
                   quantity * 0.2 // stickers
      };

      console.log('Sending order data:', orderData);

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

  return (
    <>
      <Helmet>
        <title>QRCreator - Professional QR Code Solutions</title>
        <meta name="description" content="Create engaging digital experiences for your business with custom QR landing pages. Perfect for restaurants, retail stores, and professional services." />
        <meta name="keywords" content="qr creator, qr code generator, digital menu, business qr codes, landing pages" />
        <meta property="og:title" content="QRCreator - Professional QR Code Solutions" />
        <meta property="og:description" content="Create engaging digital experiences for your business with custom QR landing pages." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://qrcreator.xyz/" />
        <meta property="og:image" content="https://qrcreator.xyz/Logo QrCreator sur fond blanc (1).webp" />
        <link rel="canonical" href="https://qrcreator.xyz/" />
      </Helmet>
      
      <MainLayout>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-white to-gray-50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="mb-6">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {translations[language].hero.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 mb-4 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {translations[language].hero.subtitle}
                  </p>
                  <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {translations[language].hero.description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                  {user ? (
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      className="text-lg py-4 px-8 flex items-center justify-center gap-2 group w-full sm:w-auto"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={() => navigate('/signup')} 
                        className="text-lg py-4 px-8 flex items-center justify-center gap-2 group w-full sm:w-auto"
                      >
                        {translations[language].hero.startFreeTrial}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button 
                        onClick={() => navigate('/signin')} 
                        variant="outline" 
                        className="text-lg py-4 px-8 border-2 hover:bg-gray-50 w-full sm:w-auto"
                      >
                        {translations[language].hero.signIn}
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Card Order Quick Access */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-3 text-center lg:text-left">
                    {language === 'ar' ? 'أو اطلب البطاقات والملصقات مباشرة:' : 'Or order cards, tags & stickers directly:'}
                  </p>
                  <div className="flex justify-center lg:justify-start">
                    <Button 
                      onClick={() => navigate('/order')}
                      className="text-base py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      {language === 'ar' ? 'طلب NFC، بطاقات عمل، علامات وملصقات' : 'Order NFC, Business Cards, Tags & Stickers'}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-center lg:justify-start text-gray-500">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm">{translations[language].hero.noCreditCard}</span>
                </div>
              </div>
              
              <div className="lg:w-1/2 w-full">
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-2xl shadow-xl">
                    <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src="/ChatGPT Image May 23, 2025, 12_04_53 AM.webp"
                        alt="QR Code in use" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/ChatGPT Image May 23, 2025, 12_04_53 AM.png';
                        }}
                      />
                    </div>
                    
                    <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src="/Design sans titre.webp"
                        alt="Restaurant QR menu" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/Design sans titre.png';
                        }}
                      />
                    </div>
                    
                    <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src="/ChatGPT Image May 23, 2025, 12_08_02 AM.webp"
                        alt="Retail store" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/ChatGPT Image May 23, 2025, 12_08_02 AM.png';
                        }}
                      />
                    </div>
                    
                    <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src="/ChatGPT Image May 23, 2025, 12_09_50 AM.webp"
                        alt="Digital menu scanning" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/ChatGPT Image May 23, 2025, 12_09_50 AM.png';
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 11h6v6H3v-6zm2 2v2h2v-2H5zm13-2h1v1h-1v-1zm-5 2h1v1h-1v-1zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1zm0 2h1v1h-1v-1zm-4-2h1v3h-1v-3zm4 2h1v3h-1v-3zm-2 1h1v1h-1v-1zm-4 1h1v1h-1v-1zm2 0h1v1h-1v-1z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Card Order Section - Prominent Position */}
        <CardOrderSection 
          colors={{
            primaryColor: '#3b82f6',
            primaryHoverColor: '#2563eb'
          }}
        />

        {/* Features Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {translations[language].features.title}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                {translations[language].features.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="bg-primary/10 p-3 rounded-lg inline-flex mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {feature.title(language)}
                  </h3>
                  <p className="text-gray-600 text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {feature.description(language)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {translations[language].howItWorks.title}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                {translations[language].howItWorks.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-primary font-bold text-xl sm:text-2xl">1</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].howItWorks.step1.title}
                </h3>
                <p className="text-gray-600 text-base" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].howItWorks.step1.description}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-primary font-bold text-xl sm:text-2xl">2</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].howItWorks.step2.title}
                </h3>
                <p className="text-gray-600 text-base" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].howItWorks.step2.description}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-primary font-bold text-xl sm:text-2xl">3</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].howItWorks.step3.title}
                </h3>
                <p className="text-gray-600 text-base" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].howItWorks.step3.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {translations[language].social.title}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                {translations[language].social.subtitle}
              </p>
            </div>
            
            <div className="flex justify-center space-x-6 sm:space-x-8">
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/Spotted02Universityofchlef" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/qrcreator_qr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Instagram</span>
              </a>

              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@qrcreator1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">TikTok</span>
              </a>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 text-base">
                {translations[language].social.followText}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-primary text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
              {translations[language].cta.title}
            </h2>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              {translations[language].cta.subtitle}
            </p>
            <Button 
              onClick={() => user ? navigate('/dashboard') : navigate('/signup')} 
              className="bg-white text-primary hover:bg-gray-100 text-lg py-4 px-8 text-lg"
            >
              {user ? 'Go to Dashboard' : translations[language].cta.button}
            </Button>
          </div>
        </section>
      </MainLayout>

      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'تم إرسال الطلب بنجاح' : 'Order Submitted Successfully'}
            </h3>
            <p className="text-gray-600 mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'سنتواصل معك قريباً لتأكيد طلبك' : 'We will contact you soon to confirm your order'}
            </p>
            <DialogButton
              onClick={() => setShowSuccess(false)}
              className="w-full"
            >
              OK
            </DialogButton>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
