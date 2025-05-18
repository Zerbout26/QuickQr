import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink } from 'lucide-react';
import axios from 'axios';

interface QRCodeData {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
  foregroundColor: string;
  backgroundColor: string;
}

const QRRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching QR code data for ID: ${id}`);
        
        // Create an axios instance without auth headers for public endpoints
        const publicAxios = axios.create({
          baseURL: 'http://localhost:3000/api',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const response = await publicAxios.get(`/qrcodes/public/${id}`);
        console.log('QR code data received:', response.data);
        setQrData(response.data);
      } catch (err) {
        console.error('Error fetching QR code data:', err);
        if (axios.isAxiosError(err)) {
          const statusCode = err.response?.status;
          const errorMessage = err.response?.data?.error || err.message;
          console.error(`Error (${statusCode}): ${errorMessage}`);
          setError(`Error (${statusCode}): ${errorMessage}`);
        } else {
          setError('The QR code you scanned could not be found or has been deleted.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQRData();
    }
  }, [id]);

  const handleRedirect = () => {
    if (qrData?.url) {
      window.location.href = qrData.url;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="w-full max-w-md">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="animate-pulse text-gray-500">
                  Loading...
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="w-full max-w-md">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <Button onClick={() => navigate('/')}>
                  Go to Homepage
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-md">
          <Card className="text-center">
            <CardContent className="pt-6 flex flex-col items-center">
              {qrData && (
                <>
                  <h1 className="text-2xl font-bold mb-4">{qrData.name}</h1>
                  
                  {/* QR Code Display */}
                  <div 
                    className="w-48 h-48 mb-6 flex items-center justify-center border rounded-md p-2" 
                    style={{ backgroundColor: qrData.backgroundColor }}
                  >
                    <QRCodeSVG
                      value={qrData.url}
                      size={176}
                      bgColor={qrData.backgroundColor}
                      fgColor={qrData.foregroundColor}
                      level="H"
                      includeMargin={false}
                      imageSettings={qrData.logoUrl ? {
                        src: qrData.logoUrl,
                        height: 48,
                        width: 48,
                        excavate: true,
                      } : undefined}
                    />
                  </div>
                  
                  <p className="text-gray-500 mb-6">
                    You're about to be redirected to an external website.
                  </p>
                  
                  <Button 
                    onClick={handleRedirect} 
                    className="qr-btn-primary mb-4 flex items-center"
                    size="lg"
                  >
                    Continue to Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <p className="text-sm text-gray-400 truncate max-w-full">
                    {qrData.url}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default QRRedirect;
