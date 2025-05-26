import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { Globe } from 'lucide-react';

// Translations object
const translations = {
  en: {
    resetPassword: "Reset Password",
    enterNewPassword: "Enter your new password below",
    enterEmail: "Enter your email address to reset your password",
    email: "Email",
    emailPlaceholder: "your@email.com",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    passwordsDoNotMatch: "Passwords do not match",
    verifying: "Verifying...",
    verifyEmail: "Verify Email",
    updating: "Updating...",
    updatePassword: "Update Password",
    rememberPassword: "Remember your password?",
    signIn: "Sign in",
    language: "العربية",
    emailVerified: "Email verified",
    enterNewPasswordPrompt: "Please enter your new password.",
    noAccountFound: "No account found with this email address",
    passwordUpdated: "Password updated",
    passwordUpdateSuccess: "Your password has been successfully updated.",
    error: "Error"
  },
  ar: {
    resetPassword: "إعادة تعيين كلمة المرور",
    enterNewPassword: "أدخل كلمة المرور الجديدة أدناه",
    enterEmail: "أدخل عنوان بريدك الإلكتروني لإعادة تعيين كلمة المرور",
    email: "البريد الإلكتروني",
    emailPlaceholder: "بريدك@الإلكتروني.com",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة",
    verifying: "جاري التحقق...",
    verifyEmail: "التحقق من البريد الإلكتروني",
    updating: "جاري التحديث...",
    updatePassword: "تحديث كلمة المرور",
    rememberPassword: "تتذكر كلمة المرور؟",
    signIn: "تسجيل الدخول",
    language: "English",
    emailVerified: "تم التحقق من البريد الإلكتروني",
    enterNewPasswordPrompt: "الرجاء إدخال كلمة المرور الجديدة.",
    noAccountFound: "لم يتم العثور على حساب بهذا البريد الإلكتروني",
    passwordUpdated: "تم تحديث كلمة المرور",
    passwordUpdateSuccess: "تم تحديث كلمة المرور بنجاح.",
    error: "خطأ"
  }
};

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.verifyEmail(email);
      if (response.exists) {
        setIsEmailVerified(true);
        toast({
          title: translations[language].emailVerified,
          description: translations[language].enterNewPasswordPrompt,
        });
      } else {
        setError(translations[language].noAccountFound);
        toast({
          variant: "destructive",
          title: translations[language].error,
          description: translations[language].noAccountFound,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify email');
      toast({
        variant: "destructive",
        title: translations[language].error,
        description: err.response?.data?.error || 'Failed to verify email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(translations[language].passwordsDoNotMatch);
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ email, newPassword, confirmPassword });
      toast({
        title: translations[language].passwordUpdated,
        description: translations[language].passwordUpdateSuccess,
      });
      navigate('/signin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
      toast({
        variant: "destructive",
        title: translations[language].error,
        description: err.response?.data?.error || 'Failed to update password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>{translations[language].resetPassword}</CardTitle>
          <Button variant="ghost" onClick={toggleLanguage} className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {translations[language].language}
          </Button>
        </div>
        <CardDescription>
          {isEmailVerified 
            ? translations[language].enterNewPassword
            : translations[language].enterEmail
          }
        </CardDescription>
      </CardHeader>
      {!isEmailVerified ? (
        <form onSubmit={handleEmailSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{translations[language].email}</Label>
              <Input 
                id="email"
                type="email" 
                placeholder={translations[language].emailPlaceholder}
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? translations[language].verifying : translations[language].verifyEmail}
            </Button>
            <div className="text-center mt-4 text-sm text-gray-500">
              {translations[language].rememberPassword}{' '}
              <Link to="/signin" className="text-qr-secondary font-medium hover:underline">
                {translations[language].signIn}
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{translations[language].newPassword}</Label>
              <Input 
                id="newPassword"
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                required
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{translations[language].confirmPassword}</Label>
              <Input 
                id="confirmPassword"
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? translations[language].updating : translations[language].updatePassword}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default ForgotPasswordForm; 