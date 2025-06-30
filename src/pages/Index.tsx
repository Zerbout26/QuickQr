import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Shield, Star, Globe, ChartBar, Settings } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

// Translations object
const translations = {
  en: {
    welcome: "Welcome",
    digitalSolutions: "Digital Solutions for Your Business",
    createEngaging: "Create Engaging QR Landing Pages For Your Business",
    description: "Generate beautiful QR codes that lead to custom landing pages with your links, menus, and business information - perfect for any type of business in Algeria and beyond.",
    startFreeTrial: "Start Free Trial",
    signIn: "Sign In",
    features: "Features That Deliver Results",
    allInOne: "All-in-One QR Solution for Your Business",
    featuresDescription: "Create custom landing pages with links and menus that engage your audience and drive results",
    simpleProcess: "Simple Process",
    createInMinutes: "Create Your QR Landing Page in Minutes",
    threeSteps: "Three simple steps to get your QR landing page online",
    step1: {
      title: "Create Your QR Code",
      description: "Design your QR code with your brand colors and logo to match your business identity"
    },
    step2: {
      title: "Add Links & Menus",
      description: "Customize your landing page with links, restaurant menus and promotional content"
    },
    step3: {
      title: "Share & Update",
      description: "Download your QR code and update your landing page anytime without creating new codes"
    },
    pricing: "Pricing",
    simplePricing: "Simple, Transparent Pricing",
    pricingDescription: "Everything you need to create professional QR landing pages",
    businessPlan: "Business Plan",
    perMonth: "DZD/month",
    everythingYouNeed: "Everything you need for your business",
    readyToTransform: "Ready to Transform Your Business with Smart QR Solutions?",
    joinBusinesses: "Join businesses across Algeria that are elevating their customer experience with our easy-to-use QR landing page platform.",
    businessTypes: {
      restaurants: {
        name: "Restaurants",
        description: "Digital menus, specials, and online ordering"
      },
      retail: {
        name: "Retail Stores",
        description: "Product catalogs, promotions, and loyalty programs"
      },
      services: {
        name: "Professional Services",
        description: "Appointment booking, testimonials, and service lists"
      },
      tourism: {
        name: "Tourism & Hospitality",
        description: "Virtual tours, booking links, and local attractions"
      },
      events: {
        name: "Event Planners",
        description: "Event schedules, maps, and registration links"
      },
      education: {
        name: "Education",
        description: "Course materials, schedules, and campus information"
      }
    },
    solutionsForAllIndustries: "Solutions For All Industries",
    qrCodesForEveryBusiness: "QR Codes For Every Type of Business",
    discoverHow: "Discover how our QR solutions can help your specific industry connect with customers",
    findYourSolution: "Find Your Solution",
    trustedByBusinesses: "Trusted by Businesses",
    whatCustomersSay: "What Our Customers Say",
    hearFromBusinesses: "Hear from businesses that have transformed their customer engagement",
    startCreatingNow: "Start Creating Now",
    noCreditCard: "No credit card required to start your trial",
    unlimitedQrCodes: "Unlimited QR codes",
    customBranding: "Custom branding and colors",
    restaurantMenuBuilder: "Restaurant menu builder",
    multipleLinks: "Multiple links per QR code",
    realTimeUpdates: "Real-time landing page updates",
    analytics: "Analytics and scan tracking",
    customerTools: "Direct customer interaction tools",
    prioritySupport: "Priority support"
  },
  ar: {
    welcome: "مرحباً",
    digitalSolutions: "حلول رقمية لعملك",
    createEngaging: "أنشئ صفحات QR جذابة لعملك",
    description: "قم بإنشاء رموز QR جميلة تؤدي إلى صفحات هبوط مخصصة مع روابطك وقوائم الطعام ومعلومات عملك - مثالية لأي نوع من الأعمال في الجزائر وما بعدها.",
    startFreeTrial: "ابدأ التجربة المجانية",
    signIn: "تسجيل الدخول",
    features: "ميزات تحقق النتائج",
    allInOne: "حل QR متكامل لعملك",
    featuresDescription: "أنشئ صفحات هبوط مخصصة مع روابط وقوائم طعام تجذب جمهورك وتحقق النتائج",
    simpleProcess: "عملية بسيطة",
    createInMinutes: "أنشئ صفحة QR في دقائق",
    threeSteps: "ثلاث خطوات بسيطة للحصول على صفحة QR الخاصة بك",
    step1: {
      title: "أنشئ رمز QR الخاص بك",
      description: "صمم رمز QR بألوان علامتك التجارية وشعارك ليتناسب مع هوية عملك"
    },
    step2: {
      title: "أضف الروابط والقوائم",
      description: "خصص صفحة الهبوط الخاصة بك بالروابط وقوائم المطاعم والمحتوى الترويجي"
    },
    step3: {
      title: "شارك وحدث",
      description: "قم بتنزيل رمز QR الخاص بك وتحديث صفحة الهبوط في أي وقت دون إنشاء رموز جديدة"
    },
    pricing: "التسعير",
    simplePricing: "تسعير بسيط وشفاف",
    pricingDescription: "كل ما تحتاجه لإنشاء صفحات QR احترافية",
    businessPlan: "الخطة التجارية",
    perMonth: "دج/شهرياً",
    everythingYouNeed: "كل ما تحتاجه لعملك",
    readyToTransform: "هل أنت مستعد لتحويل عملك بحلول QR الذكية؟",
    joinBusinesses: "انضم إلى الشركات في جميع أنحاء الجزائر التي تعزز تجربة عملائها من خلال منصة صفحات QR سهلة الاستخدام.",
    businessTypes: {
      restaurants: {
        name: "المطاعم",
        description: "قوائم طعام رقمية، عروض خاصة، وطلب عبر الإنترنت"
      },
      retail: {
        name: "متاجر التجزئة",
        description: "كتالوجات المنتجات، العروض الترويجية، وبرامج الولاء"
      },
      services: {
        name: "الخدمات المهنية",
        description: "حجز المواعيد، الشهادات، وقوائم الخدمات"
      },
      tourism: {
        name: "السياحة والضيافة",
        description: "جولات افتراضية، روابط الحجز، والمعالم المحلية"
      },
      events: {
        name: "منظمي الفعاليات",
        description: "جداول الفعاليات، الخرائط، وروابط التسجيل"
      },
      education: {
        name: "التعليم",
        description: "المواد التعليمية، الجداول الزمنية، ومعلومات الحرم الجامعي"
      }
    },
    solutionsForAllIndustries: "حلول لجميع الصناعات",
    qrCodesForEveryBusiness: "رموز QR لكل نوع من الأعمال",
    discoverHow: "اكتشف كيف يمكن لحلول QR الخاصة بنا مساعدة صناعتك المحددة في التواصل مع العملاء",
    findYourSolution: "ابحث عن حلك",
    trustedByBusinesses: "موثوق به من قبل الشركات",
    whatCustomersSay: "ماذا يقول عملاؤنا",
    hearFromBusinesses: "استمع إلى الشركات التي حولت تجربة عملائها",
    startCreatingNow: "ابدأ الإنشاء الآن",
    noCreditCard: "لا حاجة لبطاقة ائتمان لبدء تجربتك",
    unlimitedQrCodes: "رموز QR غير محدودة",
    customBranding: "تخصيص العلامة التجارية والألوان",
    restaurantMenuBuilder: "منشئ قوائم المطاعم",
    multipleLinks: "روابط متعددة لكل رمز QR",
    realTimeUpdates: "تحديثات صفحة الهبوط في الوقت الفعلي",
    analytics: "تحليلات وتتبع المسح",
    customerTools: "أدوات التفاعل المباشر مع العملاء",
    prioritySupport: "دعم ذو أولوية"
  }
};

const features = [
  {
    title: (lang: 'en' | 'ar') => translations[lang].features,
    description: (lang: 'en' | 'ar') => translations[lang].featuresDescription,
    icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].customBranding,
    description: (lang: 'en' | 'ar') => translations[lang].customBranding,
    icon: <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].restaurantMenuBuilder,
    description: (lang: 'en' | 'ar') => translations[lang].restaurantMenuBuilder,
    icon: <ChartBar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].multipleLinks,
    description: (lang: 'en' | 'ar') => translations[lang].multipleLinks,
    icon: <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
];

const businessTypes = [
  {
    name: translations.en.businessTypes.restaurants.name,
    description: translations.en.businessTypes.restaurants.description,
    icon: <ChartBar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
  {
    name: translations.en.businessTypes.retail.name,
    description: translations.en.businessTypes.retail.description,
    icon: <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
  {
    name: translations.en.businessTypes.services.name,
    description: translations.en.businessTypes.services.description,
    icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
  {
    name: translations.en.businessTypes.tourism.name,
    description: translations.en.businessTypes.tourism.description,
    icon: <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
  {
    name: translations.en.businessTypes.events.name,
    description: translations.en.businessTypes.events.description,
    icon: <ChartBar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
  },
  {
    name: translations.en.businessTypes.education.name,
    description: translations.en.businessTypes.education.description,
    icon: <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
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
        <title>Générateur QR Code Gratuit - Créer QR Codes pour Menus, Vitrines, Ecommerce | QrCreator</title>
        <meta name="description" content="Générateur QR code gratuit en ligne. Créez des QR codes pour menus de restaurant, vitrines d'entreprise, ecommerce et gestion de commandes. Solution complète pour entreprises en Algérie et partout." />
        <meta name="keywords" content="générateur QR code gratuit, QR code gratuit, créer QR code, QR code menu restaurant, QR code vitrine, QR code ecommerce, QR code Algérie, générateur QR code en ligne, QR code dynamique, QR code business" />
        <meta property="og:title" content="Générateur QR Code Gratuit - Créer QR Codes pour Menus, Vitrines, Ecommerce | QrCreator" />
        <meta property="og:description" content="Générateur QR code gratuit en ligne. Créez des QR codes pour menus de restaurant, vitrines d'entreprise, ecommerce et gestion de commandes. Solution complète pour entreprises en Algérie et partout." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://qrcreator.xyz/" />
        <meta property="og:image" content="https://qrcreator.xyz/Logo QrCreator sur fond blanc (1).webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Générateur QR Code Gratuit - Créer QR Codes pour Menus, Vitrines, Ecommerce | QrCreator" />
        <meta name="twitter:description" content="Générateur QR code gratuit en ligne. Créez des QR codes pour menus de restaurant, vitrines d'entreprise, ecommerce et gestion de commandes." />
        <meta name="twitter:image" content="https://qrcreator.xyz/Logo QrCreator sur fond blanc (1).webp" />
        <link rel="canonical" href="https://qrcreator.xyz/" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "QrCreator",
            "url": "https://qrcreator.xyz",
            "logo": "https://qrcreator.xyz/Logo QrCreator sur fond blanc (1).webp",
            "description": "Générateur QR code gratuit en ligne pour menus, vitrines, ecommerce et gestion de commandes.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "DZ",
              "addressRegion": "Algérie"
            },
            "sameAs": [
              "https://www.facebook.com/qrcreator",
              "https://www.instagram.com/qrcreator"
            ]
          }
        `}</script>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "QrCreator - Générateur QR Code Gratuit",
            "url": "https://qrcreator.xyz",
            "description": "Générateur QR code gratuit en ligne pour créer des QR codes pour menus, vitrines, ecommerce et gestion de commandes.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "DZD"
            }
          }
        `}</script>
      </Helmet>
      <MainLayout>
        {/* SEO h1 and paragraph for keyword targeting */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-primary mb-2">
            Générateur QR Code Gratuit - Créer QR Codes pour Menus, Vitrines, Ecommerce & Commandes
          </h1>
          <p className="text-center text-gray-700 max-w-3xl mx-auto">
            QrCreator est votre générateur QR code gratuit en ligne. Créez facilement des QR codes pour menus de restaurant, vitrines d'entreprise, ecommerce et gestion de commandes. Solution complète et gratuite pour toutes les entreprises en Algérie et dans le monde. Aucune inscription requise, QR codes illimités.
          </p>
        </div>
        
        {/* Hero Section - Mobile optimized */}
        <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-white to-gray-50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
              <div className="lg:w-1/2 mb-6 lg:mb-0 text-center lg:text-left">
                <div className="mb-4">
                  <span className="inline-block py-1 px-3 sm:px-4 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm mb-4">
                    <span className="arabic mx-1">{translations[language].welcome}</span> | {translations[language].digitalSolutions}
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {translations[language].createEngaging}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {translations[language].description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                  <Button onClick={() => navigate('/signup')} className="business-cta-btn text-base py-3 sm:py-4 px-6 flex items-center justify-center gap-2 group w-full sm:w-auto">
                    {translations[language].startFreeTrial}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button onClick={() => navigate('/signin')} variant="outline" className="text-base py-3 sm:py-4 px-6 border-2 hover:bg-gray-50 w-full sm:w-auto">
                    {translations[language].signIn}
                  </Button>
                </div>
                
                <div className="mt-4 sm:mt-6 flex items-center justify-center lg:justify-start text-gray-500">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">14-day free trial. No credit card required.</span>
                </div>
              </div>
              
              <div className="lg:w-1/2 w-full">
                <div className="relative">
                  <div className="relative rounded-xl shadow-lg">
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mb-2 p-2 bg-yellow-50 rounded">
                      Debug: Grid should show 4 images (2x2 layout)
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl" style={{minHeight: '200px'}}>
                      {/* Image 1 */}
                      <div className="aspect-square rounded-lg overflow-hidden shadow-sm bg-gray-100 border border-gray-200">
                        <img 
                          src="/ChatGPT Image May 23, 2025, 12_04_53 AM.webp"
                          alt="QR Code in use" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Image 1 loaded successfully')}
                          onError={(e) => {
                            console.log('❌ Image 1 failed to load');
                            e.currentTarget.src = '/ChatGPT Image May 23, 2025, 12_04_53 AM.png';
                          }}
                        />
                      </div>
                      
                      {/* Image 2 */}
                      <div className="aspect-square rounded-lg overflow-hidden shadow-sm bg-gray-100 border border-gray-200">
                        <img 
                          src="/Design sans titre.webp"
                          alt="Restaurant QR menu" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Image 2 loaded successfully')}
                          onError={(e) => {
                            console.log('❌ Image 2 failed to load');
                            e.currentTarget.src = '/Design sans titre.png';
                          }}
                        />
                      </div>
                      
                      {/* Image 3 */}
                      <div className="aspect-square rounded-lg overflow-hidden shadow-sm bg-gray-100 border border-gray-200">
                        <img 
                          src="/ChatGPT Image May 23, 2025, 12_08_02 AM.webp"
                          alt="Retail store" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Image 3 loaded successfully')}
                          onError={(e) => {
                            console.log('❌ Image 3 failed to load');
                            e.currentTarget.src = '/ChatGPT Image May 23, 2025, 12_08_02 AM.png';
                          }}
                        />
                      </div>
                      
                      {/* Image 4 */}
                      <div className="aspect-square rounded-lg overflow-hidden shadow-sm bg-gray-100 border border-gray-200">
                        <img 
                          src="/ChatGPT Image May 23, 2025, 12_09_50 AM.webp"
                          alt="Digital menu scanning" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Image 4 loaded successfully')}
                          onError={(e) => {
                            console.log('❌ Image 4 failed to load');
                            e.currentTarget.src = '/ChatGPT Image May 23, 2025, 12_09_50 AM.png';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg shadow-md flex items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24">
                      <path fill="currentColor" className="text-primary" d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 11h6v6H3v-6zm2 2v2h2v-2H5zm13-2h1v1h-1v-1zm-5 2h1v1h-1v-1zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1zm0 2h1v1h-1v-1zm-4-2h1v3h-1v-3zm4 2h1v3h-1v-3zm-2 1h1v1h-1v-1zm-4 1h1v1h-1v-1zm2 0h1v1h-1v-1z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Mobile optimized */}
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm mb-4">
                {translations[language].features}
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {translations[language].allInOne}
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                {translations[language].featuresDescription}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary/80 flex flex-col h-full"
                >
                  <div className="bg-primary/5 p-2 rounded-lg inline-flex mb-3 sm:mb-4">{feature.icon}</div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature.title(language)}</h3>
                  <p className="text-gray-600 flex-grow text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature.description(language)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - Mobile optimized */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-white to-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-medium text-xs sm:text-sm mb-4">
                {translations[language].simpleProcess}
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {translations[language].createInMinutes}
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                {translations[language].threeSteps}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg sm:text-xl">1</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].step1.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].step1.description}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg sm:text-xl">2</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].step2.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].step2.description}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg sm:text-xl">3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].step3.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].step3.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Mobile optimized */}
        <section className="py-8 sm:py-12 lg:py-16 bg-primary text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
              {translations[language].readyToTransform}
            </h2>
            <p className="text-base sm:text-lg mb-6 max-w-2xl mx-auto opacity-90">
              {translations[language].joinBusinesses}
            </p>
            <Button 
              onClick={() => navigate('/signup')} 
              className="bg-white text-primary hover:bg-gray-100 text-base py-3 sm:py-4 px-8"
            >
              {translations[language].startCreatingNow}
            </Button>
            <p className="text-sm mt-4 opacity-75">
              {translations[language].noCreditCard}
            </p>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-900">
                Générateur QR Code Gratuit - La Solution Complète pour Votre Business
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary">Pourquoi Choisir QrCreator ?</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Générateur QR code <strong>100% gratuit</strong> sans limite</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>QR codes <strong>dynamiques</strong> modifiables à tout moment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Spécialement conçu pour les <strong>entreprises algériennes</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Interface en <strong>français et arabe</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>Aucune inscription requise, <strong>utilisation immédiate</strong></span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary">Utilisations Principales</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>Menus de restaurant</strong> - QR codes pour cartes digitales</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>Vitrines d'entreprise</strong> - Présentation interactive</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>Ecommerce</strong> - Catalogues produits dynamiques</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>Gestion de commandes</strong> - Système de commande intégré</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>Marketing</strong> - Campagnes promotionnelles interactives</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-primary">Générateur QR Code Gratuit - Fonctionnalités Avancées</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">🎨</span>
                    </div>
                    <h4 className="font-semibold mb-2">Personnalisation</h4>
                    <p className="text-sm text-gray-600">Couleurs, logos, styles personnalisés pour votre marque</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">📊</span>
                    </div>
                    <h4 className="font-semibold mb-2">Analytics</h4>
                    <p className="text-sm text-gray-600">Suivi des scans et statistiques détaillées</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">🔄</span>
                    </div>
                    <h4 className="font-semibold mb-2">Mise à Jour</h4>
                    <p className="text-sm text-gray-600">Modifiez le contenu sans changer le QR code</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-primary">Générateur QR Code Gratuit - Commencez Maintenant</h3>
                <p className="text-gray-700 mb-6">
                  Rejoignez des milliers d'entreprises en Algérie qui utilisent déjà QrCreator pour digitaliser leur business. 
                  Créez votre premier QR code gratuit en moins de 2 minutes !
                </p>
                <Button 
                  onClick={() => navigate('/signup')} 
                  className="bg-primary hover:bg-primary/90 text-white text-lg py-4 px-8"
                >
                  Créer Mon QR Code Gratuit
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Index;
