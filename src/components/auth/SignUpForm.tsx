import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

// Translations object
const translations = {
  en: {
    createAccount: "Create Account",
    signUpTrial: "Sign up and start your 14-day free trial",
    email: "Email",
    emailPlaceholder: "your@email.com",
    phone: "Phone Number",
    phonePlaceholder: "+1234567890",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordsDoNotMatch: "Passwords do not match",
    termsAndPrivacy: "By signing up, you agree to our",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    creatingAccount: "Creating Account...",
    startFreeTrial: "Start Free Trial",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
    language: "العربية"
  },
  ar: {
    createAccount: "إنشاء حساب",
    signUpTrial: "سجل وابدأ تجربتك المجانية لمدة 14 يومًا",
    email: "البريد الإلكتروني",
    emailPlaceholder: "بريدك@الإلكتروني.com",
    phone: "رقم الهاتف",
    phonePlaceholder: "+1234567890",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة",
    termsAndPrivacy: "بالتسجيل، فإنك توافق على",
    termsOfService: "شروط الخدمة",
    and: "و",
    privacyPolicy: "سياسة الخصوصية",
    creatingAccount: "جاري إنشاء الحساب...",
    startFreeTrial: "ابدأ التجربة المجانية",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    language: "English"
  }
};

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(translations[language].passwordsDoNotMatch);
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, phone, password);
      // Add a small delay to ensure state is properly updated
      setTimeout(() => {
        navigate('/choose-qr-type');
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="w-full shadow-lg border-0 sm:border">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                {translations[language].createAccount}
              </CardTitle>
              <Button variant="ghost" onClick={toggleLanguage} className="flex items-center gap-2 p-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{translations[language].language}</span>
              </Button>
            </div>
            <CardDescription className="text-sm sm:text-base text-gray-600 mt-2">
              {translations[language].signUpTrial}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-6 sm:px-8">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {translations[language].email}
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder={translations[language].emailPlaceholder}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  {translations[language].phone}
                </Label>
                <Input 
                  id="phone"
                  type="tel" 
                  placeholder={translations[language].phonePlaceholder}
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {translations[language].password}
                </Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  {translations[language].confirmPassword}
                </Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {translations[language].termsAndPrivacy}{' '}
                <a href="#" className="text-qr-secondary hover:underline">{translations[language].termsOfService}</a>{' '}
                {translations[language].and}{' '}
                <a href="#" className="text-qr-secondary hover:underline">{translations[language].privacyPolicy}</a>.
              </div>
            </CardContent>
            <CardFooter className="flex flex-col px-6 sm:px-8 pb-6 sm:pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium qr-btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? translations[language].creatingAccount : translations[language].startFreeTrial}
              </Button>
              <div className="text-center mt-6 text-sm text-gray-500">
                {translations[language].alreadyHaveAccount}{' '}
                <Link to="/signin" className="text-qr-secondary font-medium hover:underline">
                  {translations[language].signIn}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignUpForm;
