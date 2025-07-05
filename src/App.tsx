import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";
import MainLayout from "./components/layout/MainLayout";
import PaymentInstructions from "@/pages/PaymentInstructions";
import LandingPage from '@/pages/LandingPage';
import PrivateRoute from '@/components/PrivateRoute';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import NotFound from "./pages/NotFound";
import { LoadingSpinner } from "@/components/ui/loading";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Orders = lazy(() => import("./pages/Orders"));
const EditQRCodePage = lazy(() => import('@/pages/EditQRCodePage'));
const ResetPasswordForm = lazy(() => import('@/components/auth/ResetPasswordForm'));
const Profile = lazy(() => import('@/pages/Profile'));
const ChooseQRType = lazy(() => import('./pages/ChooseQRType'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <PerformanceMonitor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Dashboard />
                  </Suspense>
                </PrivateRoute>
              } />
              <Route path="/orders" element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Orders />
                  </Suspense>
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Admin />
                  </Suspense>
                </PrivateRoute>
              } />
              <Route path="/signin" element={
                <MainLayout>
                  <SignInForm />
                </MainLayout>
              } />
              <Route path="/signup" element={
                <MainLayout>
                  <SignUpForm />
                </MainLayout>
              } />
              <Route path="/forgot-password" element={
                <MainLayout>
                  <div className="container mx-auto px-4 py-12">
                    <ForgotPasswordForm />
                  </div>
                </MainLayout>
              } />
              <Route path="/payment-instructions" element={<PaymentInstructions />} />
              <Route path="/landing/:id" element={<LandingPage />} />
              <Route path="/landing/:id/:url" element={<LandingPage />} />
              <Route path="/qrcodes/:id/edit" element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <EditQRCodePage />
                  </Suspense>
                </PrivateRoute>
              } />
              <Route path="/reset-password" element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ResetPasswordForm />
                  </Suspense>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Profile />
                </Suspense>
              } />
              <Route path="/choose-qr-type" element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ChooseQRType />
                  </Suspense>
                </PrivateRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
