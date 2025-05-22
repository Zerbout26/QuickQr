import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CreditCard, Phone, Mail, ArrowRight } from 'lucide-react';

const PaymentInstructions = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 py-12 px-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        <Card className="overflow-hidden rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col items-center mb-6">
              <AlertCircle className="h-12 w-12 text-algeria-red mb-2" />
              <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-algeria-red">Subscription Required</h1>
              <p className="text-center text-gray-600 text-base">Your trial period has ended or your account is inactive. Please subscribe to continue using our services.</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-algeria-green">
                <CreditCard className="mr-2 h-5 w-5" /> Payment Instructions
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                <p className="mb-3">To activate your subscription, please make a payment using one of the following methods:</p>
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-algeria-green">Bank Transfer</h3>
                  <ul className="list-disc list-inside text-sm pl-2 space-y-1 text-gray-700">
                    <li>Bank Name: Algeria National Bank</li>
                    <li>Account Holder: QuickQR Solutions</li>
                    <li>Account Number: 0123456789</li>
                    <li>Reference: Your email address</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-algeria-green">Mobile Payment</h3>
                  <ul className="list-disc list-inside text-sm pl-2 space-y-1 text-gray-700">
                    <li>Send payment to: 05XX-XX-XX-XX</li>
                    <li>Include your email in the message</li>
                    <li>Service supported: CCP Mobile, Baridimob</li>
                  </ul>
                </div>
                <div className="mb-2">
                  <h3 className="font-medium mb-2 text-algeria-green">In-Person Payment</h3>
                  <p className="text-sm text-gray-700">
                    Visit our office at: 123 Digital Plaza, Algeria Technology Park, Algiers
                  </p>
                </div>
              </div>
              <div className="bg-algeria-red/5 p-4 rounded-lg border-l-4 border-algeria-red">
                <p className="text-sm">
                  <span className="font-semibold block mb-1">Important:</span>
                  After making your payment, please contact our support team with your payment details, and we'll activate your subscription within 24 hours.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-algeria-green">
                <Phone className="mr-2 h-5 w-5" /> Contact Support
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-algeria-red mr-2" />
                  <span>support@quickqr.dz</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-algeria-red mr-2" />
                  <span>+213 XX XX XX XX</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Return to Homepage
                </Button>
              </Link>
              <a href="mailto:support@quickqr.dz">
                <Button className="w-full bg-algeria-green hover:bg-algeria-green/90 text-white flex items-center gap-2">
                  Contact Support
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            For any questions about your subscription, please contact our customer service team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;
