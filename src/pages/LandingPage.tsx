
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Twitter, ExternalLink } from 'lucide-react';

// Helper function to determine the icon for a link
const getLinkIcon = (url: string) => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('facebook') || urlLower.includes('fb.com')) {
    return <Facebook className="mr-2" />;
  } else if (urlLower.includes('instagram') || urlLower.includes('ig.com')) {
    return <Instagram className="mr-2" />;
  } else if (urlLower.includes('twitter') || urlLower.includes('x.com')) {
    return <Twitter className="mr-2" />;
  } else {
    return <ExternalLink className="mr-2" />;
  }
};

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
        console.error('Error fetching QR code:', err);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-qr-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Error</h1>
          <p className="text-xl text-gray-600 mb-4">{error || 'QR code not found'}</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const hasUrls = qrCode.links && qrCode.links.length > 0;
  const hasMenu = qrCode.menu && qrCode.menu.categories.length > 0;

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${qrCode.backgroundColor || '#f9fafb'} 0%, ${qrCode.backgroundColor ? adjustColor(qrCode.backgroundColor, -20) : '#e5e7eb'} 100%)`,
      }}
    >
      <div className="container mx-auto max-w-4xl">
        <Card className="overflow-hidden shadow-xl">
          {qrCode.logoUrl && (
            <div className="flex justify-center pt-8">
              <img 
                src={qrCode.logoUrl} 
                alt="Logo" 
                className="h-24 w-auto object-contain"
              />
            </div>
          )}
          
          <CardContent className="p-6 md:p-8">
            <h1 
              className="text-3xl md:text-4xl font-bold text-center mb-6"
              style={{ color: qrCode.foregroundColor || '#1f2937' }}
            >
              {qrCode.name}
            </h1>

            {/* Enhanced Links Section with Icons */}
            {hasUrls && (
              <div className="mb-8">
                <div className="grid gap-3">
                  {qrCode.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button 
                        className="w-full text-lg py-6 flex items-center justify-center" 
                        style={{ 
                          backgroundColor: qrCode.foregroundColor || '#5D5FEF',
                          color: '#ffffff'
                        }}
                      >
                        {getLinkIcon(link.url)}
                        <span>{link.label}</span>
                      </Button>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Display both links and menu */}
            {hasUrls && hasMenu && (
              <Separator className="my-8" />
            )}

            {/* Enhanced Menu Section with inline items and images on the right */}
            {hasMenu && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 
                    className="text-2xl font-semibold"
                    style={{ color: qrCode.foregroundColor || '#1f2937' }}
                  >
                    {qrCode.menu?.restaurantName}
                  </h2>
                  {qrCode.menu?.description && (
                    <p className="text-gray-600 mt-2 text-sm">{qrCode.menu.description}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  {qrCode.menu?.categories.map((category) => (
                    <div key={category.name} className="bg-white shadow-sm rounded-md overflow-hidden">
                      <h3 
                        className="text-lg font-bold py-2 px-4 text-center rounded-t-md"
                        style={{ 
                          backgroundColor: qrCode.foregroundColor || '#5D5FEF',
                          color: '#ffffff'
                        }}
                      >
                        {category.name}
                      </h3>
                      
                      <div className="divide-y divide-gray-100">
                        {category.items.map((item, index) => (
                          <div key={index} className="p-4 flex justify-between items-center">
                            <div className="flex-grow pr-4">
                              <div className="flex justify-between">
                                <h4 
                                  className="font-medium"
                                  style={{ color: qrCode.foregroundColor || '#1f2937' }}
                                >
                                  {item.name}
                                </h4>
                                <p 
                                  className="font-medium"
                                  style={{ color: qrCode.foregroundColor || '#1f2937' }}
                                >
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                              {item.description && (
                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                              )}
                            </div>
                            {item.imageUrl && (
                              <div className="flex-shrink-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  // Remove the # if present
  color = color.replace(/^#/, '');
  
  // Parse the color
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Adjust each channel
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default LandingPage;
