
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Shield, Star, Globe, Settings, ChartBar } from 'lucide-react';

const features = [
  {
    title: 'Dynamic QR Landing Pages',
    description: 'Create beautiful landing pages with links and menus that update in real-time.',
    icon: <Globe className="w-10 h-10 text-qr-primary" />,
  },
  {
    title: 'Custom Branding',
    description: 'Add your logo and brand colors to make your QR codes stand out.',
    icon: <Star className="w-10 h-10 text-qr-primary" />,
  },
  {
    title: 'Restaurant Menus',
    description: 'Create digital menus with categories, descriptions, and images.',
    icon: <ChartBar className="w-10 h-10 text-qr-primary" />,
  },
  {
    title: 'Multi-Link Support',
    description: 'Add multiple links to your QR landing page for versatile customer interactions.',
    icon: <Settings className="w-10 h-10 text-qr-primary" />,
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
      {/* Hero Section - Improved design */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="absolute inset-0 bg-gradient-to-br from-qr-primary/5 to-qr-secondary/5 -z-10"></div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-bl from-qr-primary/10 to-transparent -z-10 transform rotate-12 translate-x-1/4"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-block py-1 px-3 rounded-full bg-qr-primary/10 text-qr-primary font-medium text-sm mb-4">
                  QR Code Landing Pages for Business
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Transform Your <span className="text-qr-primary">Digital Presence</span> With Smart QR Codes
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Generate beautiful QR codes that lead to custom landing pages with your links and menus. Perfect for restaurants, retail businesses, and professional services.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Button onClick={() => navigate('/signup')} className="business-cta-btn text-lg py-6 px-8 flex items-center gap-2 group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => navigate('/signin')} variant="outline" className="text-lg py-6 px-8 border-2 hover:bg-gray-50">
                  Sign In
                </Button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8 flex items-center text-gray-500"
              >
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm">14-day free trial. No credit card required.</span>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-qr-primary to-qr-secondary opacity-30 blur-lg"></div>
                <div className="relative bg-white rounded-xl shadow-xl p-4 sm:p-8 transform rotate-3 transition-all hover:rotate-0 duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                    alt="QR Code in use" 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                <div className="absolute top-4 right-20 -rotate-6 w-24 h-24 bg-qr-accent rounded-lg shadow-lg flex items-center justify-center text-white text-6xl">
                  📱
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Updated with more business-oriented style */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-qr-accent/10 text-qr-accent font-medium text-sm mb-4">
              Features That Deliver Results
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All-in-One QR Solution for Your Business
            </h2>
            <p className="text-xl text-gray-600">
              Create custom landing pages with links and menus that engage your audience and drive results
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full"
              >
                <div className="bg-qr-primary/5 p-3 rounded-xl inline-flex mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 flex-grow">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Improved with timeline style */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-qr-primary/10 text-qr-primary font-medium text-sm mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your QR Landing Page in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to get your QR landing page online
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Timeline connector */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-qr-primary/20 hidden md:block"></div>
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <div className="bg-qr-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-white text-2xl font-bold border-4 border-white">1</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Create Your QR Code</h3>
              <p className="text-gray-600">Design your QR code with your brand colors and logo to match your business identity</p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <div className="bg-qr-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-white text-2xl font-bold border-4 border-white">2</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Add Links & Menus</h3>
              <p className="text-gray-600">Customize your landing page with links, restaurant menus and promotional content</p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center relative z-10"
            >
              <div className="bg-qr-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-white text-2xl font-bold border-4 border-white">3</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Share & Update</h3>
              <p className="text-gray-600">Download your QR code and update your landing page anytime without creating new codes</p>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button onClick={() => navigate('/signup')} className="business-cta-btn text-lg py-6 px-8 flex items-center gap-2 group">
              Start Creating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Pricing Section - Improved conversion-focused design */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-qr-secondary/10 text-qr-secondary font-medium text-sm mb-4">
              Pricing
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to create professional QR landing pages
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-r from-qr-primary to-qr-secondary p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4 w-40 h-40 bg-white/10 rounded-full"></div>
                <h3 className="text-2xl font-bold relative z-10">Business Plan</h3>
                <div className="text-4xl font-bold mt-2 relative z-10">$19.99<span className="text-lg font-normal">/month</span></div>
                <p className="mt-2 opacity-90 relative z-10">Everything you need for your business</p>
              </div>
              <div className="p-8">
                <ul className="space-y-5">
                  {[
                    "Unlimited QR codes",
                    "Custom branding and colors",
                    "Restaurant menu builder",
                    "Multiple links per QR code", 
                    "Real-time landing page updates"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Check className="h-5 w-5 text-qr-accent" />
                      </div>
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate('/signup')} className="business-cta-btn w-full mt-8 py-6">
                  Start 14-Day Free Trial
                </Button>
                <p className="text-sm text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4" />
                  No credit card required to start your trial
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
