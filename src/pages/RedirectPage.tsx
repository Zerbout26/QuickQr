import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink } from 'lucide-react';

interface QRCodeData {
  url: string;
  name: string;
  backgroundColor: string;
  foregroundColor: string;
  logoUrl?: string;
}

export default function RedirectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetch(`/api/qrcodes/redirect/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch URL');
        }
        
        setQrData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [id]);

  const handleRedirect = () => {
    if (qrData?.url) {
      window.location.href = qrData.url;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{qrData?.name || 'Welcome'}</CardTitle>
          <CardDescription className="text-center">
            You're about to visit an external website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show QR Code */}
          <div className="flex justify-center">
            <div 
              className="w-48 h-48 flex items-center justify-center border rounded-md p-2" 
              style={{ backgroundColor: qrData?.backgroundColor || '#FFFFFF' }}
            >
              <QRCodeSVG
                value={qrData?.url || ''}
                size={176}
                bgColor={qrData?.backgroundColor || '#FFFFFF'}
                fgColor={qrData?.foregroundColor || '#000000'}
                level="H"
                includeMargin={false}
                imageSettings={qrData?.logoUrl ? {
                  src: qrData.logoUrl,
                  height: 48,
                  width: 48,
                  excavate: true,
                } : undefined}
              />
            </div>
          </div>
          
          {/* Show URL */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Destination URL:</p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-700 break-all">
                {qrData?.url}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={handleRedirect} 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Visit Website
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full"
          >
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 