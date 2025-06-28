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
    vitrine: "Business Showcase",
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
    vitrine: "عرض الأعمال",
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
      en: 'Business Showcase',
      ar: 'عرض الأعمال'
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
    if (!loading && user && user.hasVitrine && user.hasMenu) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null; // or a spinner
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">{t.welcome}</h1>
            </div>
            <p className="text-xl text-gray-600 mb-6">{t.chooseBusinessType}</p>
            
            {/* Plan Badge */}
            <div className="inline-flex items-center gap-2 mb-8">
              {isPaidUser ? (
                <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                  <Crown className="w-4 h-4 mr-2" />
                  {t.businessPlan} - {t.unlimitedAccess}
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t.freeTrial} - {trialDays} {t.daysLeft}
                </Badge>
              )}
            </div>
          </div>

          {/* Business Type Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
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
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`p-3 rounded-full ${type.color} text-white`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {type.name[language]}
                      {type.recommended && (
                        <Badge className="ml-2 bg-primary text-white text-xs">
                          {t.recommended}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {type.description[language]}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{t.perfectFor}:</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {type.perfectFor[language].map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {language === 'ar' ? 'الميزات:' : 'Features:'}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {type.features[language].map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-gray-100">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-4 flex items-center justify-center text-primary">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Selected</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3"
            >
              {t.skip}
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedType}
              className="px-8 py-3 bg-primary hover:bg-primary/90"
            >
              {t.continue}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChooseQRType; 