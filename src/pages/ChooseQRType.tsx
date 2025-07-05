import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  ShoppingCart, 
  Building2, 
  ArrowRight, 
  Sparkles,
  Crown,
  Calendar,
  CheckCircle
} from 'lucide-react';

const translations = {
  en: {
    welcome: "Welcome to QrCreator!",
    chooseBusinessType: "What type of business do you want to create?",
    freeTrial: "Free Trial",
    businessPlan: "Business Plan",
    daysLeft: "days left",
    unlimitedAccess: "Unlimited Access",
    vitrine: "Business Showcase (Vitrine)",
    vitrineDesc: "Create a professional business showcase with services, gallery, and contact information",
    menu: "Digital Menu",
    menuDesc: "Create a digital menu with categories, items, and online ordering",
    products: "E-commerce Store",
    productsDesc: "Create a single product store with ordering and payment",
    continue: "Continue",
    back: "Back",
    recommended: "Recommended",
    perfectFor: "Perfect for",
    restaurants: "Restaurants",
    retail: "Retail Stores", 
    services: "Professional Services",
    ecommerce: "E-commerce",
    smallBusiness: "Small Businesses",
    startups: "Startups",
    entrepreneurs: "Entrepreneurs",
    skip: "Skip and go to dashboard"
  },
  ar: {
    welcome: "مرحباً بك في QrCreator!",
    chooseBusinessType: "ما نوع العمل الذي تريد إنشاءه؟",
    freeTrial: "تجربة مجانية",
    businessPlan: "خطة تجارية",
    daysLeft: "أيام متبقية",
    unlimitedAccess: "وصول غير محدود",
    vitrine: "عرض الأعمال (فيترين)",
    vitrineDesc: "إنشاء عرض أعمال احترافي مع الخدمات والمعرض ومعلومات الاتصال",
    menu: "قائمة رقمية",
    menuDesc: "إنشاء قائمة رقمية مع الفئات والعناصر والطلب عبر الإنترنت",
    products: "متجر إلكتروني",
    productsDesc: "إنشاء متجر منتج واحد مع الطلب والدفع",
    continue: "متابعة",
    back: "رجوع",
    recommended: "موصى به",
    perfectFor: "مثالي لـ",
    restaurants: "المطاعم",
    retail: "متاجر التجزئة",
    services: "الخدمات المهنية", 
    ecommerce: "التجارة الإلكترونية",
    smallBusiness: "الشركات الصغيرة",
    startups: "الشركات الناشئة",
    entrepreneurs: "رواد الأعمال",
    skip: "تخطي والذهاب إلى لوحة التحكم"
  }
};

const businessTypes = [
  {
    id: 'vitrine',
    name: {
      en: 'Business Showcase (Vitrine)',
      ar: '(فيترين)عرض الأعمال'
    },
    description: {
      en: 'Create a professional business showcase with services, gallery, and contact information',
      ar: 'إنشاء عرض أعمال احترافي مع الخدمات والمعرض ومعلومات الاتصال'
    },
    icon: Building2,
    color: 'bg-blue-500',
    perfectFor: {
      en: ['Professional Services', 'Small Businesses', 'Startups', 'Consultants', 'Freelancers'],
      ar: ['الخدمات المهنية', 'الشركات الصغيرة', 'الشركات الناشئة', 'المستشارون', 'العاملون المستقلون']
    },
    features: {
      en: ['Business Information', 'Services List', 'Photo Gallery', 'Testimonials', 'Contact Details'],
      ar: ['معلومات العمل', 'قائمة الخدمات', 'معرض الصور', 'الشهادات', 'تفاصيل الاتصال']
    },
    recommended: false
  },
  {
    id: 'menu',
    name: {
      en: 'Digital Menu',
      ar: 'قائمة رقمية'
    },
    description: {
      en: 'Create a digital menu with categories, items, and online ordering',
      ar: 'إنشاء قائمة رقمية مع الفئات والعناصر والطلب عبر الإنترنت'
    },
    icon: Store,
    color: 'bg-green-500',
    perfectFor: {
      en: ['Restaurants', 'Cafes', 'Food Services', 'Bars', 'Catering', 'Food Trucks'],
      ar: ['المطاعم', 'المقاهي', 'خدمات الطعام', 'الحانات', 'خدمات التموين', 'شاحنات الطعام']
    },
    features: {
      en: ['Menu Categories', 'Item Descriptions', 'Pricing', 'Online Ordering', 'Cash on Delivery'],
      ar: ['فئات القائمة', 'وصف العناصر', 'الأسعار', 'الطلب عبر الإنترنت', 'الدفع عند الاستلام']
    },
    recommended: true
  },
  {
    id: 'products',
    name: {
      en: 'E-commerce Store',
      ar: 'متجر إلكتروني'
    },
    description: {
      en: 'Create a single product store with ordering and payment',
      ar: 'إنشاء متجر منتج واحد مع الطلب والدفع'
    },
    icon: ShoppingCart,
    color: 'bg-purple-500',
    perfectFor: {
      en: ['Product Sellers', 'Entrepreneurs', 'Handmade Items', 'Digital Products', 'Single Product Focus'],
      ar: ['بائعي المنتجات', 'رواد الأعمال', 'المنتجات اليدوية', 'المنتجات الرقمية', 'التركيز على منتج واحد']
    },
    features: {
      en: ['Product Showcase', 'Multiple Images', 'Variants & Options', 'Direct Ordering', 'COD Payment'],
      ar: ['عرض المنتج', 'صور متعددة', 'المتغيرات والخيارات', 'الطلب المباشر', 'الدفع عند الاستلام']
    },
    recommended: false
  }
];

const ChooseQRType = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, loading, daysLeftInTrial } = useAuth();
  const t = translations[language];

  useEffect(() => {
    if (!loading && user && (user.hasVitrine || user.hasMenu || user.hasProducts)) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50/80 to-white/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-12 h-12 border-2 border-gray-200 rounded-full relative">
                <div 
                  className="w-full h-full border-2 border-transparent rounded-full animate-spin" 
                  style={{ 
                    borderTopColor: '#6b7280',
                    borderRightColor: '#6b728040',
                    borderBottomColor: '#6b728020',
                    borderLeftColor: '#6b728010',
                    animationDuration: '1.5s',
                    animationTimingFunction: 'ease-in-out'
                  }}
                ></div>
              </div>
            </div>
          </div>
          <p className="text-gray-500 font-normal text-sm mb-2">Loading...</p>
          <div className="flex space-x-1.5 justify-center">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-gray-300" style={{ animationDelay: '0ms', animationDuration: '2s' }}></div>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-gray-300" style={{ animationDelay: '300ms', animationDuration: '2s' }}></div>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-gray-300" style={{ animationDelay: '600ms', animationDuration: '2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // If no user, PrivateRoute will handle the redirect
  if (!user) {
    return null;
  }

  const handleContinue = () => {
    if (selectedType) {
      // Set onboarding flag in sessionStorage
      sessionStorage.setItem('fromOnboarding', 'true');
      console.log('Set fromOnboarding flag to true for type:', selectedType);
      // Redirect to dashboard with parameters to open generator
      navigate(`/dashboard?type=${selectedType}&openGenerator=true`);
    }
  };

  const isPaidUser = user.hasActiveSubscription;
  const trialDays = daysLeftInTrial();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
        <div className="flex-1 py-6 sm:py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary mr-2 sm:mr-3" />
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">{t.welcome}</h1>
              </div>
              <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6 px-4">{t.chooseBusinessType}</p>
              
              {/* Plan Badge */}
              <div className="inline-flex items-center gap-2 mb-6 sm:mb-8">
                {isPaidUser ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 sm:px-4 sm:py-2 text-sm">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t.businessPlan} - {t.unlimitedAccess}
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 sm:px-4 sm:py-2 text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t.freeTrial} - {trialDays} {t.daysLeft}
                  </Badge>
                )}
              </div>
            </div>

            {/* Business Type Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-20 sm:mb-24">
              {businessTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                      isSelected 
                        ? 'border-primary shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardHeader className="text-center pb-3 sm:pb-4">
                      <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <div className={`p-2 sm:p-3 rounded-full ${type.color} text-white`}>
                          <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold">
                        {type.name[language]}
                        {type.recommended && (
                          <Badge className="ml-2 bg-primary text-white text-xs">
                            {t.recommended}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center px-3 sm:px-6">
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                        {type.description[language]}
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.perfectFor}:</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {type.perfectFor[language].slice(0, 3).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {type.perfectFor[language].length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{type.perfectFor[language].length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            {language === 'ar' ? 'الميزات:' : 'Features:'}
                          </p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {type.features[language].slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-gray-100">
                                {feature}
                              </Badge>
                            ))}
                            {type.features[language].length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-gray-100">
                                +{type.features[language].length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-4 flex items-center justify-center text-primary">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="font-medium text-sm sm:text-base">
                            {language === 'ar' ? 'محدد' : 'Selected'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons - Always Visible */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 sm:py-6 z-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="flex-1 sm:flex-none px-6 py-3 sm:px-8 sm:py-3 text-sm sm:text-base"
              >
                {t.skip}
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={!selectedType}
                className="flex-1 sm:flex-none px-6 py-3 sm:px-8 sm:py-3 bg-primary hover:bg-primary/90 text-sm sm:text-base"
              >
                {t.continue}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChooseQRType; 