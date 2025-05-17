import React, { useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Upload, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PaymentPage = () => {
  const { user } = useAuth();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image or PDF file",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Receipt must be less than 5MB",
      });
      return;
    }

    setReceiptFile(file);
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      toast({
        variant: "destructive",
        title: "No receipt selected",
        description: "Please upload your payment receipt",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('userId', user?.id || '');
      formData.append('email', user?.email || '');

      const response = await fetch('http://localhost:3000/api/payments/submit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit payment');
      }

      toast({
        title: "Payment Submitted",
        description: "Your payment receipt has been submitted. We'll review it and activate your account soon.",
      });

      // Reset form
      setReceiptFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was a problem submitting your payment receipt. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Account Activation Payment</h1>
        
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Bank Transfer Details:</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p><span className="font-medium">Bank:</span> Your Bank Name</p>
                <p><span className="font-medium">Account Name:</span> Your Company Name</p>
                <p><span className="font-medium">IBAN:</span> XX00 XXXX XXXX XXXX XXXX XXXX</p>
                <p><span className="font-medium">SWIFT/BIC:</span> XXXXXXXX</p>
                <p><span className="font-medium">Amount:</span> $XX.XX</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">After Payment:</h3>
              <p className="text-sm text-gray-600">
                Please upload your payment receipt or screenshot of the transfer confirmation.
                Our team will review it and activate your account within 24 hours.
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                Send receipt to: <span className="font-normal">admin@yourcompany.com</span> {/* Replace with actual admin email */}
              </p>

              <div className="space-y-2">
                <Label>Upload Payment Receipt</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {receiptFile ? 'Change Receipt' : 'Upload Receipt'}
                  </Button>
                </div>
                {receiptFile && (
                  <p className="text-sm text-gray-600">
                    Selected file: {receiptFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!receiptFile || isLoading}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Submitting...' : 'Submit Payment Receipt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaymentPage; 