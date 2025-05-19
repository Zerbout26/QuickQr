
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

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
  const hasSocialLinks = hasUrls && qrCode.links.some(link => 
    link.url.includes('facebook') || 
    link.url.includes('instagram') || 
    link.url.includes('twitter') || 
    link.url.includes('linkedin')
  );

  // Group regular links and social media links
  const regularLinks = qrCode.links?.filter(link => 
    !link.url.includes('facebook') && 
    !link.url.includes('instagram') && 
    !link.url.includes('twitter') && 
    !link.url.includes('linkedin')
  ) || [];

  const socialLinks = qrCode.links?.filter(link => 
    link.url.includes('facebook') || 
    link.url.includes('instagram') || 
    link.url.includes('twitter') || 
    link.url.includes('linkedin')
  ) || [];

  // Helper function to get the icon for a social media link
  const getSocialIcon = (url: string) => {
    if (url.includes('facebook')) return <Facebook size={20} />;
    if (url.includes('instagram')) return <Instagram size={20} />;
    if (url.includes('twitter')) return <Twitter size={20} />;
    if (url.includes('linkedin')) return <Linkedin size={20} />;
    return null;
  };

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${qrCode.backgroundColor || '#f9fafb'} 0%, ${adjustColor(qrCode.backgroundColor, -20) || '#e5e7eb'} 100%)`,
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

            {/* Social Media Links */}
            {hasSocialLinks && (
              <div className="flex justify-center space-x-4 mb-6">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: qrCode.foregroundColor || '#5D5FEF',
                      color: '#ffffff'
                    }}
                  >
                    {getSocialIcon(link.url)}
                  </a>
                ))}
              </div>
            )}

            {/* Regular Links Section */}
            {regularLinks.length > 0 && (
              <div className="mb-8">
                <div className="grid gap-3">
                  {regularLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button 
                        className="w-full text-lg py-6" 
                        style={{ 
                          backgroundColor: qrCode.foregroundColor || '#5D5FEF',
                          color: '#ffffff'
                        }}
                      >
                        {link.label}
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

            {/* Menu Section - Improved horizontal layout */}
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
                
                <div className="space-y-6">
                  {qrCode.menu?.categories.map((category) => (
                    <div key={category.name} className="menu-category">
                      <h3 
                        className="text-lg font-bold text-center rounded-t-md p-2"
                        style={{ 
                          backgroundColor: qrCode.foregroundColor || '#5D5FEF',
                          color: '#ffffff'
                        }}
                      >
                        {category.name}
                      </h3>
                      
                      <div className="menu-items-horizontal">
                        {category.items.map((item, index) => (
                          <div key={index} className="menu-item-row">
                            <div className="menu-item-info">
                              <div className="flex justify-between items-baseline">
                                <h4 
                                  className="text-base font-medium"
                                  style={{ color: qrCode.foregroundColor || '#1f2937' }}
                                >
                                  {item.name}
                                </h4>
                                <p 
                                  className="text-base font-medium whitespace-nowrap ml-2"
                                  style={{ color: qrCode.foregroundColor || '#1f2937' }}
                                >
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                              {item.description && (
                                <p className="text-gray-600 text-xs line-clamp-1">{item.description}</p>
                              )}
                            </div>
                            {item.imageUrl && (
                              <div className="menu-item-image">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded"
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
  if (!color) return '#e5e7eb';
  
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
