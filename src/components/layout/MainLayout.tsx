
import React from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} QRCreator. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-qr-primary">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-qr-primary">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-qr-primary">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
