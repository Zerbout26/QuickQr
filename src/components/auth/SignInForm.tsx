import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

// Translations object
const translations = {
  en: {
    signIn: "Sign In",
    enterCredentials: "Enter your email and password to access your account",
    email: "Email",
    emailPlaceholder: "your@email.com",
    password: "Password",
    forgotPassword: "Forgot Password?",
    signingIn: "Signing in...",
    signInButton: "Sign In",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    language: "العربية"
  },
  ar: {
    signIn: "تسجيل الدخول",
    enterCredentials: "أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك",
    email: "البريد الإلكتروني",
    emailPlaceholder: "بريدك@الإلكتروني.com",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    signingIn: "جاري تسجيل الدخول...",
    signInButton: "تسجيل الدخول",
    noAccount: "ليس لديك حساب؟",
    signUp: "إنشاء حساب",
    language: "English"
  }
};

interface LocationState {
  from?: string;
}

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page the user was trying to visit
  const from = (location.state as LocationState)?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await signIn(email, password);
      // Redirect based on original location or user role
      if (user.role === 'admin' && from === '/dashboard') {
        navigate('/admin');
      } else if (user.hasVitrine && user.hasMenu) {
        navigate('/dashboard');
      } else {
        navigate('/choose-qr-type');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="w-full shadow-lg border-0 sm:border">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              {translations[language].signIn}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 mt-2">
              {translations[language].enterCredentials}
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
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-qr-secondary hover:underline">
                    {translations[language].forgotPassword}
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col px-6 sm:px-8 pb-6 sm:pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium qr-btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? translations[language].signingIn : translations[language].signInButton}
              </Button>
              <div className="text-center mt-6 text-sm text-gray-500">
                {translations[language].noAccount}{' '}
                <Link to="/signup" className="text-qr-secondary font-medium hover:underline">
                  {translations[language].signUp}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignInForm;
