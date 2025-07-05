import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Shield, Star, Globe, ChartBar, Settings, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

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

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
              onClick={() => navigate('/signup')} 
              className="bg-white text-primary hover:bg-gray-100 text-lg py-4 px-8 text-lg"
            >
              {translations[language].cta.button}
            </Button>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Index;
