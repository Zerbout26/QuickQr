import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  en: {
    chooseQR: 'Choose QR Type',
    vitrine: 'Vitrine Only',
    vitrineDesc: 'Showcase your business, products, or services with a digital vitrine QR code.',
    menu: 'Menu (E-commerce / Food)',
    menuDesc: 'Create a QR code for your menu, e-commerce, or food business with ordering features.'
  },
  ar: {
    chooseQR: 'اختر نوع رمز QR',
    vitrine: 'فترينة فقط',
    vitrineDesc: 'اعرض نشاطك التجاري أو منتجاتك أو خدماتك برمز QR للفترينة الرقمية.',
    menu: 'قائمة (تجارة إلكترونية / مطاعم)',
    menuDesc: 'أنشئ رمز QR لقائمة الطعام أو التجارة الإلكترونية أو المطاعم مع ميزات الطلب.'
  }
};

const ChooseQRType = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t.chooseQR}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <button
          onClick={() => navigate('/dashboard?type=vitrine')}
          className="bg-white rounded-lg shadow p-8 flex flex-col items-center hover:shadow-lg transition group border-2 border-transparent hover:border-blue-500"
        >
          <svg className="w-12 h-12 mb-4 text-blue-500 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-xl font-semibold mb-2">{t.vitrine}</span>
          <span className="text-gray-500 text-center">{t.vitrineDesc}</span>
        </button>
        <button
          onClick={() => navigate('/dashboard?type=menu')}
          className="bg-white rounded-lg shadow p-8 flex flex-col items-center hover:shadow-lg transition group border-2 border-transparent hover:border-green-500"
        >
          <svg className="w-12 h-12 mb-4 text-green-500 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          <span className="text-xl font-semibold mb-2">{t.menu}</span>
          <span className="text-gray-500 text-center">{t.menuDesc}</span>
        </button>
      </div>
    </div>
  );
};

export default ChooseQRType; 