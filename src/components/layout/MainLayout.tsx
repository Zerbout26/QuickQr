
import React from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-qr-primary text-xl font-bold mb-2">QRCreator</div>
              <span className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} QRCreator. All rights reserved.
              </span>
            </div>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-8">
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-qr-primary transition">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-500 hover:text-qr-primary transition">
                  Terms of Service
                </a>
              </div>
              <a href="#" className="text-gray-500 hover:text-qr-primary transition">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
