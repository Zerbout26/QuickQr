import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LandingPage = () => {
  const { id } = useParams();
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
        setError('Failed to load QR code');
        setLoading(false);
      }
    };

    if (id) {
      fetchQRCode();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-xl text-gray-600 mb-4">{error || 'QR code not found'}</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="text-center">
            {qrCode.logoUrl && (
              <img 
                src={qrCode.logoUrl} 
                alt="Logo" 
                className="w-32 h-32 mx-auto mb-6 object-contain"
              />
            )}
            <h1 className="text-2xl font-bold mb-6">{qrCode.name}</h1>
            <div className="space-y-4">
              {qrCode.links?.map((link, index) => (
                <Button
                  key={index}
                  className="w-full"
                  style={{ backgroundColor: qrCode.foregroundColor || '#6366F1' }}
                  onClick={() => window.location.href = link.url}
                >
                  {link.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPage; 