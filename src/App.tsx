
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";
import MainLayout from "./components/layout/MainLayout";
import PaymentInstructions from "@/pages/PaymentInstructions";
import LandingPage from '@/pages/LandingPage';
import PrivateRoute from '@/components/PrivateRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } />
            <Route path="/signin" element={
              <MainLayout>
                <div className="container mx-auto px-4 py-12">
                  <SignInForm />
                </div>
              </MainLayout>
            } />
            <Route path="/signup" element={
              <MainLayout>
                <div className="container mx-auto px-4 py-12">
                  <SignUpForm />
                </div>
              </MainLayout>
            } />
            <Route path="/payment-instructions" element={<PaymentInstructions />} />
            <Route path="/landing/:id" element={<LandingPage />} />
            <Route path="/landing/:id/:url" element={<LandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
