
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, signOut, isAdmin, daysLeftInTrial, isTrialActive, isTrialExpired } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="text-qr-primary text-xl font-bold">QRCreator</div>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              
              {/* Trial status indicator */}
              {isTrialActive() && (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Trial: {daysLeftInTrial()} days left
                </div>
              )}
              
              {isTrialExpired() && !user.hasActiveSubscription && (
                <div className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full">
                  Trial expired
                </div>
              )}
              
              {user.hasActiveSubscription && (
                <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  Active Subscription
                </div>
              )}
              
              {isAdmin() && (
                <Link to="/admin">
                  <Button variant="outline" className="border-qr-secondary text-qr-secondary">
                    Admin Panel
                  </Button>
                </Link>
              )}
              
              <Button variant="ghost" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="qr-btn-primary">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
