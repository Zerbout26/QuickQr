import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Shield, Star, Globe, ChartBar, Settings, Award, Smartphone, ExternalLink, Users } from 'lucide-react';
import { useState } from 'react';

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
    }
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
    }
  }
};

const features = [
  {
    title: 'Dynamic QR Landing Pages',
    description: 'Create beautiful landing pages with links and menus that update in real-time.',
    icon: <Globe className="w-10 h-10 text-primary" />,
  },
  {
    title: 'Custom Branding',
    description: 'Add your logo and brand colors to make your QR codes stand out.',
    icon: <Star className="w-10 h-10 text-primary" />,
  },
  {
    title: 'Restaurant Menus',
    description: 'Create digital menus with categories, descriptions, and images.',
    icon: <ChartBar className="w-10 h-10 text-primary" />,
  },
  {
    title: 'Multi-Link Support',
    description: 'Add multiple links to your QR landing page for versatile customer interactions.',
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
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

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
                <div className="relative rounded-xl shadow-xl transform hover:rotate-0 transition-all duration-300">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl">
                    <div className="aspect-square rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
                      <img 
                        src="/ChatGPT Image May 23, 2025, 12_04_53 AM.png"
                        alt="QR Code in use" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
                      <img 
                        src="/Design sans titre.png"
                        alt="Restaurant QR menu" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
                      <img 
                        src="/ChatGPT Image May 23, 2025, 12_08_02 AM.png"
                        alt="Retail store" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
                      <img 
                        src="/ChatGPT Image May 23, 2025, 12_09_50 AM.png"
                        alt="Digital menu scanning" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24">
                    <path fill={`${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()}`} d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 11h6v6H3v-6zm2 2v2h2v-2H5zm13-2h1v1h-1v-1zm-5 2h1v1h-1v-1zm2 0h1v1h-1v-1zm2 0h1v1h-1v-1zm0 2h1v1h-1v-1zm-4-2h1v3h-1v-3zm4 2h1v3h-1v-3zm-2 1h1v1h-1v-1zm-4 1h1v1h-1v-1zm2 0h1v1h-1v-1z"/>
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types Section - New section showing industry solutions */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
              Solutions For All Industries
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              QR Codes For Every Type of Business
            </h2>
            <p className="text-xl text-gray-600">
              Discover how our QR solutions can help your specific industry connect with customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessTypes.map((business, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all border border-gray-100 group"
              >
                <div className="bg-gray-50 p-4 rounded-xl inline-flex mb-6 group-hover:scale-110 transition-transform duration-300">
                  {business.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{business.name}</h3>
                <p className="text-gray-600">{business.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/signup')} className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white py-2 px-4 rounded-lg">
              Find Your Solution
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Updated with enhanced design */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              {translations[language].features}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              All-in-One QR Solution for Your Business
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
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 flex-grow">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced with cleaner design */}
      <section className="py-24 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
              {translations[language].simpleProcess}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Create Your QR Landing Page in Minutes
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
              Start Creating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - New section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              Trusted by Businesses
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from businesses that have transformed their customer engagement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="testimonial-card"
            >
              <div className="flex items-center mb-4">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Client" className="testimonial-avatar" />
                <div className="ml-4">
                  <h4 className="font-bold">Ahmed Benali</h4>
                  <p className="text-sm text-gray-500">Restaurant Owner, Algiers</p>
                </div>
              </div>
              <p className="testimonial-quote mb-4">
                Since implementing QR code menus, we've seen a 30% increase in special order items. Customers love being able to see photos of our dishes!
              </p>
              <div className="flex text-accent">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-accent" />
                ))}
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="testimonial-card"
            >
              <div className="flex items-center mb-4">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Client" className="testimonial-avatar" />
                <div className="ml-4">
                  <h4 className="font-bold">Samira Hakim</h4>
                  <p className="text-sm text-gray-500">Boutique Owner, Oran</p>
                </div>
              </div>
              <p className="testimonial-quote mb-4">
                The QR codes have become an essential part of our marketing strategy. They connect our physical store to our online presence seamlessly.
              </p>
              <div className="flex text-accent">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-accent" />
                ))}
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="testimonial-card"
            >
              <div className="flex items-center mb-4">
                <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="Client" className="testimonial-avatar" />
                <div className="ml-4">
                  <h4 className="font-bold">Karim Meziane</h4>
                  <p className="text-sm text-gray-500">Hotel Manager, Constantine</p>
                </div>
              </div>
              <p className="testimonial-quote mb-4">
                Our guests appreciate having easy access to hotel information, local attractions, and services through the QR landing pages we've created.
              </p>
              <div className="flex text-accent">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-accent" />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section - Enhanced design */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
              {translations[language].pricing}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
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
                    "Unlimited QR codes",
                    "Custom branding and colors",
                    "Restaurant menu builder",
                    "Multiple links per QR code", 
                    "Real-time landing page updates",
                    "Analytics and scan tracking",
                    "Direct customer interaction tools",
                    "Priority support"
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
                  Start 14-Day Free Trial
                </Button>
                <p className="text-sm text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4" />
                  No credit card required to start your trial
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - New bottom CTA */}
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
                  Start Free Trial
                </Button>
                <Button onClick={() => navigate('/signin')} variant="outline" className="bg-white border-2 border-secondary text-secondary hover:bg-secondary/5 py-6 px-8 rounded-lg">
                  Sign In
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
