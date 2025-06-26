import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Menu,
  LogOut,
  Home,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lock,
  Globe,
  UserCircle,
} from "lucide-react";

// Translations object
const translations = {
  en: {
    signIn: "Sign In",
    signUp: "Sign Up",
    dashboard: "Dashboard",
    adminPanel: "Admin Panel",
    signedInAs: "Signed in as",
    subscription: "Subscription",
    resetPassword: "Reset Password",
    signOut: "Sign Out",
    trial: "Trial",
    daysLeft: "days left",
    trialExpired: "Trial expired",
    activeSubscription: "Active Subscription",
    language: "العربية",
    home: "Home",
    profileSettings: "Profile Settings",
  },
  ar: {
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    dashboard: "لوحة التحكم",
    adminPanel: "لوحة الإدارة",
    signedInAs: "تم تسجيل الدخول باسم",
    subscription: "الاشتراك",
    resetPassword: "إعادة تعيين كلمة المرور",
    signOut: "تسجيل الخروج",
    trial: "تجريبي",
    daysLeft: "أيام متبقية",
    trialExpired: "انتهت الفترة التجريبية",
    activeSubscription: "اشتراك نشط",
    language: "English",
    home: "الرئيسية",
    profileSettings: "إعدادات الملف الشخصي",
  }
};

const Navbar = () => {
  const { user, signOut, isAdmin, daysLeftInTrial, isTrialActive, isTrialExpired } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  return (
    <nav className="border-b shadow-sm bg-white sticky top-0 z-40" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="text-qr-primary text-xl font-bold">QRCreator</div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="font-medium hover:bg-gray-100 flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> {translations[language].dashboard}
                </Button>
              </Link>
              <Link to="/orders">
                <Button variant="ghost" className="font-medium hover:bg-gray-100 flex items-center gap-1.5">
                  <Menu className="w-4 h-4" /> {language === 'ar' ? 'الطلبات' : 'Orders'}
                </Button>
              </Link>
              
              {/* Trial status indicator */}
              {isTrialActive() && (
                <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> {translations[language].trial}: {daysLeftInTrial()} {translations[language].daysLeft}
                </div>
              )}
              
              {isTrialExpired() && !user.hasActiveSubscription && (
                <div className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {translations[language].trialExpired}
                </div>
              )}
              
              {user.hasActiveSubscription && (
                <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> {translations[language].activeSubscription}
                </div>
              )}
              
              {isAdmin() && (
                <Link to="/admin">
                  <Button variant="outline" className="border-qr-secondary text-qr-secondary">
                    {translations[language].adminPanel}
                  </Button>
                </Link>
              )}
              
              {/* Language Toggle Button */}
              <Button variant="ghost" onClick={toggleLanguage} className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {translations[language].language}
              </Button>
              
              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                    <div className="w-8 h-8 rounded-full bg-qr-primary/10 flex items-center justify-center text-qr-primary">
                      <User className="w-4 h-4" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-normal text-sm text-gray-500">{translations[language].signedInAs}</div>
                    <div className="font-medium truncate">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> {translations[language].dashboard}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <UserCircle className="w-4 h-4 mr-2" /> {translations[language].profileSettings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/payment-instructions" className="flex items-center cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" /> {translations[language].subscription}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reset-password" className="flex items-center cursor-pointer">
                      <Lock className="w-4 h-4 mr-2" /> {translations[language].resetPassword}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> {translations[language].signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={toggleLanguage} className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {translations[language].language}
              </Button>
              <Link to="/signin">
                <Button variant="ghost" className="font-medium hover:bg-gray-100">{translations[language].signIn}</Button>
              </Link>
              <Link to="/signup">
                <Button className="qr-btn-primary">{translations[language].signUp}</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px]">
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 py-6">
                  <div className="px-3 py-2">
                    <h3 className="text-qr-primary font-bold text-xl mb-4">QRCreator</h3>
                    {user ? (
                      <div className="mb-4">
                        <div className="text-sm text-gray-500">{translations[language].signedInAs}</div>
                        <div className="font-medium truncate">{user.email}</div>
                        
                        {/* Subscription status */}
                        <div className="mt-3">
                          {isTrialActive() && (
                            <div className="text-sm text-blue-600 bg-blue-100 px-3 py-2 rounded-md flex items-center gap-1.5 mb-2">
                              <Calendar className="w-4 h-4" /> {translations[language].trial}: {daysLeftInTrial()} {translations[language].daysLeft}
                            </div>
                          )}
                          
                          {isTrialExpired() && !user.hasActiveSubscription && (
                            <div className="text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md flex items-center gap-1.5 mb-2">
                              <AlertCircle className="w-4 h-4" /> {translations[language].trialExpired}
                            </div>
                          )}
                          
                          {user.hasActiveSubscription && (
                            <div className="text-sm text-green-600 bg-green-100 px-3 py-2 rounded-md flex items-center gap-1.5 mb-2">
                              <CheckCircle className="w-4 h-4" /> {translations[language].activeSubscription}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-2 mb-6">
                        <Link to="/signin" className="flex-1">
                          <Button variant="outline" className="w-full">{translations[language].signIn}</Button>
                        </Link>
                        <Link to="/signup" className="flex-1">
                          <Button className="qr-btn-primary w-full">{translations[language].signUp}</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Link 
                      to="/" 
                      className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="h-5 w-5 mr-3 text-gray-500" /> {translations[language].home}
                    </Link>
                    
                    {user && (
                      <Link 
                        to="/dashboard" 
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500" /> {translations[language].dashboard}
                      </Link>
                    )}
                    
                    {user && (
                      <Link 
                        to="/payment-instructions" 
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5 mr-3 text-gray-500" /> {translations[language].subscription}
                      </Link>
                    )}
                    
                    {isAdmin() && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5 mr-3 text-gray-500" /> {translations[language].adminPanel}
                      </Link>
                    )}

                    <button
                      onClick={toggleLanguage}
                      className="flex w-full items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                    >
                      <Globe className="h-5 w-5 mr-3 text-gray-500" /> {translations[language].language}
                    </button>
                  </div>
                </div>
                
                {user && (
                  <div className="border-t py-4">
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }} 
                      className="flex w-full items-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="h-5 w-5 mr-3" /> {translations[language].signOut}
                    </button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
