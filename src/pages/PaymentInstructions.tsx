import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const PaymentInstructions = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Payment Instructions</h1>
          <p className="text-gray-600 mb-8">Follow these steps to complete your payment and activate your account</p>

          <div className="space-y-6">
            {/* Payment Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Subscription Plan</h3>
                  <p className="text-2xl font-bold text-qr-primary">$9.99/month</p>
                  <p className="text-sm text-gray-600 mt-1">Billed monthly, cancel anytime</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Methods</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Bank Transfer</li>
                    <li>PayPal</li>
                    <li>Credit Card</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-qr-primary/10 p-2 rounded-full">
                      <span className="text-qr-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Choose Your Payment Method</h3>
                      <p className="text-gray-600">Select your preferred payment method from the options above.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-qr-primary/10 p-2 rounded-full">
                      <span className="text-qr-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Complete the Payment</h3>
                      <p className="text-gray-600">Make the payment using your chosen method.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-qr-primary/10 p-2 rounded-full">
                      <span className="text-qr-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Send Your Receipt</h3>
                      <p className="text-gray-600">Email your payment receipt to our support team.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receipt Submission Card */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Email Your Receipt</AlertTitle>
                  <AlertDescription>
                    Send your payment receipt to: <span className="font-semibold">support@qrcodecreator.com</span>
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">What to Include in Your Email:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Your account email address</li>
                    <li>Payment receipt or transaction ID</li>
                    <li>Payment method used</li>
                    <li>Date of payment</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>We typically activate accounts within 24 hours of receipt confirmation</span>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have any questions about the payment process or need assistance,
                  please don't hesitate to contact our support team.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@qrcodecreator.com'}
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentInstructions; 