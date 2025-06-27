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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
          <CardTitle>{translations[language].signIn}</CardTitle>
        <CardDescription>
          {translations[language].enterCredentials}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
          <div className="space-y-2">
            <Label htmlFor="password">{translations[language].password}</Label>
            <Input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-qr-secondary hover:underline">
                {translations[language].forgotPassword}
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            type="submit" 
            className="w-full qr-btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? translations[language].signingIn : translations[language].signInButton}
          </Button>
          <div className="text-center mt-4 text-sm text-gray-500">
            {translations[language].noAccount}{' '}
            <Link to="/signup" className="text-qr-secondary font-medium hover:underline">
              {translations[language].signUp}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignInForm;
