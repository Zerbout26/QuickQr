
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Dynamic QR Landing Pages',
    description: 'Create beautiful landing pages with links and menus that update in real-time.',
    icon: '🚀',
  },
  {
    title: 'Custom Branding',
    description: 'Add your logo and brand colors to make your QR codes stand out.',
    icon: '🎨',
  },
  {
    title: 'Restaurant Menus',
    description: 'Create digital menus with categories, descriptions, and images.',
    icon: '🍽️',
  },
  {
    title: 'Multi-Link Support',
    description: 'Add multiple links to your QR landing page for versatile customer interactions.',
    icon: '🔗',
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
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-qr-primary/10 to-qr-secondary/10 -z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Create Interactive QR Landing Pages
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Generate beautiful QR codes that lead to custom landing pages with your links and menus. Perfect for restaurants, businesses, and events.
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
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-qr-primary to-qr-secondary opacity-30 blur-lg"></div>
                <div className="relative bg-white rounded-xl shadow-xl p-4 sm:p-8 transform rotate-3">
                  <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                    alt="QR Code in use" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="absolute top-4 right-20 -rotate-6 w-24 h-24 bg-qr-accent rounded-lg shadow-lg flex items-center justify-center text-white text-6xl">
                  📱
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-6">
            All-in-One QR Solution
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Create custom landing pages with links and menus that engage your audience
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-qr-primary">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Create Your QR Landing Page in Minutes
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Three simple steps to get your QR landing page online
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center relative">
              <div className="bg-qr-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-white text-2xl font-bold z-10">1</div>
              <div className="absolute top-8 left-1/2 h-0.5 bg-qr-primary w-full hidden md:block"></div>
              <h3 className="text-xl font-semibold mb-2">Create Your QR Code</h3>
              <p className="text-gray-600">Design your QR code with your brand colors and logo</p>
            </div>
            
            <div className="text-center relative">
              <div className="bg-qr-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-white text-2xl font-bold z-10">2</div>
              <div className="absolute top-8 left-1/2 h-0.5 bg-qr-primary w-full hidden md:block"></div>
              <h3 className="text-xl font-semibold mb-2">Add Links & Menus</h3>
              <p className="text-gray-600">Customize your landing page with links and restaurant menus</p>
            </div>
            
            <div className="text-center">
              <div className="bg-qr-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-white text-2xl font-bold z-10">3</div>
              <h3 className="text-xl font-semibold mb-2">Share & Update</h3>
              <p className="text-gray-600">Download your QR code and update your landing page anytime</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/signup')} className="qr-btn-primary text-lg py-6 px-8">
              Start Creating Now
            </Button>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to create professional QR landing pages
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-qr-primary to-qr-secondary p-6 text-white text-center">
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
                    <span>Restaurant menu builder</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Multiple links per QR code</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Real-time landing page updates</span>
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
