import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  en: {
    profileSettings: "Profile Settings",
    updateProfile: "Update your profile information",
    email: "Email",
    phone: "Phone Number",
    saveChanges: "Save Changes",
    saving: "Saving...",
    profileUpdated: "Profile updated successfully",
    error: "Error updating profile"
  },
  ar: {
    profileSettings: "إعدادات الملف الشخصي",
    updateProfile: "تحديث معلومات ملفك الشخصي",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    saveChanges: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح",
    error: "خطأ في تحديث الملف الشخصي"
  }
};

const ProfileSettings = () => {
  const { user, refreshUserProfile } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.updateProfile({ email, phone });
      await refreshUserProfile?.();
      toast({
        title: translations[language].profileUpdated,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: translations[language].error,
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations[language].profileSettings}</CardTitle>
        <CardDescription>{translations[language].updateProfile}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{translations[language].email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{translations[language].phone}</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? translations[language].saving : translations[language].saveChanges}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings; 