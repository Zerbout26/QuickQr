import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Helmet } from 'react-helmet';

const translations = {
  en: {
    title: "404",
    message: "Oops! Page not found",
    returnHome: "Return to Home"
  },
  ar: {
    title: "404",
    message: "عذراً! الصفحة غير موجودة",
    returnHome: "العودة إلى الرئيسية"
  }
};

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | QuickQr</title>
        <meta name="description" content="404 - Page not found. The page you are looking for does not exist on QuickQr." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{translations[language].title}</h1>
          <p className="text-xl text-gray-600 mb-4">{translations[language].message}</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            {translations[language].returnHome}
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
