
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const features = [
  {
    title: 'Unlimited QR Codes',
    description: 'Create as many QR codes as you need with your subscription.',
    icon: '🔄',
  },
  {
    title: 'Custom Branding',
    description: 'Add your logo and brand colors to make your QR codes stand out.',
    icon: '🎨',
  },
  {
    title: 'Dynamic URLs',
    description: 'Change where your QR codes point to without creating new ones.',
    icon: '🔗',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track scans and understand how your QR codes are performing.',
    icon: '📊',
  },
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="qr-gradient-bg py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Create Custom QR Codes for Your Business
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Generate professional QR codes that enhance your marketing and streamline customer interactions. Start your 14-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button onClick={() => navigate('/signup')} className="qr-btn-primary text-lg py-6 px-8">
                  Start Free Trial
                </Button>
                <Button onClick={() => navigate('/signin')} variant="outline" className="text-lg py-6 px-8">
                  Sign In
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-10">
              <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 transform rotate-3">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                  alt="QR Code in use" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Your Business
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="qr-card p-6">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Generate professional QR codes in just a few simple steps
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-qr-primary text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
              <p className="text-gray-600">Sign up and start your 14-day free trial with full access to all features</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-qr-primary text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Generate QR Codes</h3>
              <p className="text-gray-600">Create custom QR codes for your business with your branding</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-qr-primary text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Share & Track</h3>
              <p className="text-gray-600">Download your QR codes and update them anytime without creating new ones</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/signup')} className="qr-btn-primary text-lg py-6 px-8">
              Start Creating QR Codes
            </Button>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            No hidden fees, just straightforward pricing for your business needs
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-qr-primary p-6 text-white text-center">
                <h3 className="text-2xl font-bold">Business Plan</h3>
                <div className="text-4xl font-bold mt-2">$19.99<span className="text-lg font-normal">/month</span></div>
                <p className="mt-2 opacity-90">Everything you need for your business</p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited QR codes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Custom branding and colors</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Editable QR destinations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>PNG & SVG downloads</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Email support</span>
                  </li>
                </ul>
                <Button onClick={() => navigate('/signup')} className="qr-btn-primary w-full mt-6">
                  Start 14-Day Free Trial
                </Button>
                <p className="text-sm text-center text-gray-500 mt-4">
                  No credit card required to start your trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
