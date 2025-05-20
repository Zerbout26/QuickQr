
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";

const Navbar = () => {
  const { user, signOut, isAdmin, daysLeftInTrial, isTrialActive, isTrialExpired } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b shadow-sm bg-white sticky top-0 z-40">
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
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
              
              {/* Trial status indicator */}
              {isTrialActive() && (
                <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Trial: {daysLeftInTrial()} days
                </div>
              )}
              
              {isTrialExpired() && !user.hasActiveSubscription && (
                <div className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Trial expired
                </div>
              )}
              
              {user.hasActiveSubscription && (
                <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Active Subscription
                </div>
              )}
              
              {isAdmin() && (
                <Link to="/admin">
                  <Button variant="outline" className="border-qr-secondary text-qr-secondary">
                    Admin Panel
                  </Button>
                </Link>
              )}
              
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
                    <div className="font-normal text-sm text-gray-500">Signed in as</div>
                    <div className="font-medium truncate">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/payment-instructions" className="flex items-center cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" /> Subscription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" className="font-medium hover:bg-gray-100">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="qr-btn-primary">Sign Up</Button>
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
                        <div className="text-sm text-gray-500">Signed in as</div>
                        <div className="font-medium truncate">{user.email}</div>
                        
                        {/* Subscription status */}
                        <div className="mt-3">
                          {isTrialActive() && (
                            <div className="text-sm text-blue-600 bg-blue-100 px-3 py-2 rounded-md flex items-center gap-1.5 mb-2">
                              <Calendar className="w-4 h-4" /> Trial: {daysLeftInTrial()} days left
                            </div>
                          )}
                          
                          {isTrialExpired() && !user.hasActiveSubscription && (
                            <div className="text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md flex items-center gap-1.5 mb-2">
                              <AlertCircle className="w-4 h-4" /> Trial expired
                            </div>
                          )}
                          
                          {user.hasActiveSubscription && (
                            <div className="text-sm text-green-600 bg-green-100 px-3 py-2 rounded-md flex items-center gap-1.5 mb-2">
                              <CheckCircle className="w-4 h-4" /> Active Subscription
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-2 mb-6">
                        <Link to="/signin" className="flex-1">
                          <Button variant="outline" className="w-full">Sign In</Button>
                        </Link>
                        <Link to="/signup" className="flex-1">
                          <Button className="qr-btn-primary w-full">Sign Up</Button>
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
                      <Home className="h-5 w-5 mr-3 text-gray-500" /> Home
                    </Link>
                    
                    {user && (
                      <Link 
                        to="/dashboard" 
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500" /> Dashboard
                      </Link>
                    )}
                    
                    {user && (
                      <Link 
                        to="/payment-instructions" 
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5 mr-3 text-gray-500" /> Subscription
                      </Link>
                    )}
                    
                    {isAdmin() && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5 mr-3 text-gray-500" /> Admin Panel
                      </Link>
                    )}
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
                      <LogOut className="h-5 w-5 mr-3" /> Sign Out
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
