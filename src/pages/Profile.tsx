import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProfileSettings from '@/components/profile/ProfileSettings';
import MainLayout from '@/components/layout/MainLayout';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  en: {
    profile: "Profile",
    profileDescription: "Manage your account settings and preferences"
  },
  ar: {
    profile: "الملف الشخصي",
    profileDescription: "إدارة إعدادات حسابك وتفضيلاتك"
  }
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  return (
    <MainLayout>
      <div className={`container mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {translations[language].profile}
          </h1>
          <p className="text-gray-600">
            {translations[language].profileDescription}
          </p>
        </div>
        <ProfileSettings />
      </div>
    </MainLayout>
  );
};

export default Profile; 