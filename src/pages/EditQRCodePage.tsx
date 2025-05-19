import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import QRCodeEditor from '@/components/qr/QRCodeEditor';
import { Button } from '@/components/ui/button';
import { QRCode } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const EditQRCodePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const data = await qrCodeApi.getQRCode(id!);
        setQRCode(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError('Failed to load QR code');
        setLoading(false);
      }
    };

    if (id) {
      fetchQRCode();
    }
  }, [id]);

  const handleQRCodeUpdated = (updatedQRCode: QRCode) => {
    setQRCode(updatedQRCode);
    toast({
      title: "Success",
      description: "QR code updated successfully",
    });
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-qr-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-700 font-medium tracking-tight">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !qrCode) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Error</h1>
            <p className="text-xl text-gray-600 mb-6">{error || 'QR code not found'}</p>
            <Button
              className="px-6 py-3 text-lg font-medium rounded-full bg-qr-primary text-white hover:bg-opacity-90 hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-qr-primary"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit QR Code</h1>
            <p className="mt-2 text-gray-600">Update your QR code's content and appearance</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <QRCodeEditor qrCode={qrCode} onUpdated={handleQRCodeUpdated} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditQRCodePage; 