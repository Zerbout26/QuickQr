import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{translations[language].title}</h1>
        <p className="text-xl text-gray-600 mb-4">{translations[language].message}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {translations[language].returnHome}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
