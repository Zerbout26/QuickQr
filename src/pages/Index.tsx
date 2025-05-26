import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Shield, Star, Globe, ChartBar, Settings, Award, Smartphone, ExternalLink, Users } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
    icon: <Globe className="w-10 h-10 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].customBranding,
    description: (lang: 'en' | 'ar') => translations[lang].customBranding,
    icon: <Star className="w-10 h-10 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].restaurantMenuBuilder,
    description: (lang: 'en' | 'ar') => translations[lang].restaurantMenuBuilder,
    icon: <ChartBar className="w-10 h-10 text-primary" />,
  },
  {
    title: (lang: 'en' | 'ar') => translations[lang].multipleLinks,
    description: (lang: 'en' | 'ar') => translations[lang].multipleLinks,
    icon: <Settings className="w-10 h-10 text-primary" />,
  },
];

const businessTypes = [
  {
    name: translations.en.businessTypes.restaurants.name,
    description: translations.en.businessTypes.restaurants.description,
    icon: <ChartBar className="w-10 h-10 text-primary" />,
  },
  {
    name: translations.en.businessTypes.retail.name,
    description: translations.en.businessTypes.retail.description,
    icon: <Users className="w-10 h-10 text-secondary" />,
  },
  {
    name: translations.en.businessTypes.services.name,
    description: translations.en.businessTypes.services.description,
    icon: <Award className="w-10 h-10 text-accent" />,
  },
  {
    name: translations.en.businessTypes.tourism.name,
    description: translations.en.businessTypes.tourism.description,
    icon: <Globe className="w-10 h-10 text-secondary" />,
  },
  {
    name: translations.en.businessTypes.events.name,
    description: translations.en.businessTypes.events.description,
    icon: <ExternalLink className="w-10 h-10 text-accent" />,
  },
  {
    name: translations.en.businessTypes.education.name,
    description: translations.en.businessTypes.education.description,
    icon: <Smartphone className="w-10 h-10 text-primary" />,
  },
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <MainLayout>
      {/* Hero Section - Modern design with gradient overlay and animation */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-br from-white to-gray-50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"></div>
        <div className="absolute -right-20 top-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl -z-10"></div>
        <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-block py-1 px-4 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
                  <span className="arabic mx-1">{translations[language].welcome}</span> | {translations[language].digitalSolutions}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].createEngaging}
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {translations[language].description}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Button onClick={() => navigate('/signup')} className="business-cta-btn text-lg py-6 px-8 flex items-center gap-2 group">
                  {translations[language].startFreeTrial}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => navigate('/signin')} variant="outline" className="text-lg py-6 px-8 border-2 hover:bg-gray-50">
                  {translations[language].signIn}
                </Button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8 flex items-center text-gray-500"
              >
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm">14-day free trial. No credit card required.</span>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
                <div className="relative bg-white rounded-xl shadow-xl p-8">
                  <div className="aspect-square w-full max-w-md mx-auto">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-48 h-48 mx-auto mb-4">
                          <QRCodeSVG
                            value="https://quickqr.com"
                            size={192}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        <p className="text-sm text-gray-500">Scan to see a demo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              {translations[language].features}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {translations[language].allInOne}
            </h2>
            <p className="text-xl text-gray-600">
              {translations[language].featuresDescription}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all border-l-4 border-l-primary/80 flex flex-col h-full hover:translate-y-[-5px] duration-300"
              >
                <div className="bg-primary/5 p-3 rounded-xl inline-flex mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature.title(language)}</h3>
                <p className="text-gray-600 flex-grow" dir={language === 'ar' ? 'rtl' : 'ltr'}>{feature.description(language)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
              {translations[language].simpleProcess}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {translations[language].createInMinutes}
            </h2>
            <p className="text-xl text-gray-600">
              {translations[language].threeSteps}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Timeline connector */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-accent hidden md:block"></div>
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-white text-2xl font-bold border-4 border-white">1</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{translations[language].step1.title}</h3>
              <p className="text-gray-600">{translations[language].step1.description}</p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-white text-2xl font-bold border-4 border-white">2</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{translations[language].step2.title}</h3>
              <p className="text-gray-600">{translations[language].step2.description}</p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-white text-2xl font-bold border-4 border-white">3</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{translations[language].step3.title}</h3>
              <p className="text-gray-600">{translations[language].step3.description}</p>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-primary to-secondary text-lg py-6 px-8 flex items-center gap-2 group text-white rounded-lg shadow-lg hover:shadow-xl transition-all mx-auto">
              {translations[language].startCreatingNow}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
              {translations[language].solutionsForAllIndustries}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {translations[language].qrCodesForEveryBusiness}
            </h2>
            <p className="text-xl text-gray-600">
              {translations[language].discoverHow}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(translations[language].businessTypes).map(([key, business], index) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all border border-gray-100 group"
              >
                <div className="bg-gray-50 p-4 rounded-xl inline-flex mb-6 group-hover:scale-110 transition-transform duration-300">
                  {businessTypes[index]?.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>{business.name}</h3>
                <p className="text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{business.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/signup')} className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white py-2 px-4 rounded-lg">
              {translations[language].findYourSolution}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
              {translations[language].pricing}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {translations[language].simplePricing}
            </h2>
            <p className="text-xl text-gray-600">
              {translations[language].pricingDescription}
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4 w-40 h-40 bg-white/10 rounded-full"></div>
                <h3 className="text-2xl font-bold relative z-10">{translations[language].businessPlan}</h3>
                <div className="text-4xl font-bold mt-2 relative z-10">500<span className="text-lg font-normal">{translations[language].perMonth}</span></div>
                <p className="mt-2 opacity-90 relative z-10">{translations[language].everythingYouNeed}</p>
              </div>
              <div className="p-8">
                <ul className="space-y-5">
                  {[
                    translations[language].unlimitedQrCodes,
                    translations[language].customBranding,
                    translations[language].restaurantMenuBuilder,
                    translations[language].multipleLinks,
                    translations[language].realTimeUpdates,
                    translations[language].analytics,
                    translations[language].customerTools,
                    translations[language].prioritySupport
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Check className="h-5 w-5 text-secondary" />
                      </div>
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate('/signup')} className="w-full mt-8 py-6 bg-accent hover:bg-accent/90 text-white">
                  {translations[language].startFreeTrial}
                </Button>
                <p className="text-sm text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4" />
                  {translations[language].noCreditCard}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {translations[language].readyToTransform}
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                {translations[language].joinBusinesses}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={() => navigate('/signup')} className="bg-primary hover:bg-primary/90 text-white py-6 px-8 rounded-lg shadow-lg">
                  {translations[language].startFreeTrial}
                </Button>
                <Button onClick={() => navigate('/signin')} variant="outline" className="bg-white border-2 border-secondary text-secondary hover:bg-secondary/5 py-6 px-8 rounded-lg">
                  {translations[language].signIn}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
