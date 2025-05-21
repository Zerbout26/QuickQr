import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode, MenuItem } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as LucideIcons from 'lucide-react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, MessageCircle, Send, Globe, ExternalLink } from 'lucide-react';

const LandingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to map platform type to label, icon, and colors
  const getPlatformInfo = (type: string): { label: string; icon: React.ElementType; bgColor: string; hoverBgColor: string } => {
    switch (type) {
      case 'facebook':
        return { label: 'Follow us on Facebook', icon: Facebook, bgColor: '#1877F2', hoverBgColor: '#166FE5' };
      case 'instagram':
        return { label: 'Follow us on Instagram', icon: Instagram, bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', hoverBgColor: 'linear-gradient(45deg, #e08423 0%, #d6582c 25%, #cc1733 50%, #bc1356 75%, #ac0878 100%)' };
      case 'twitter':
        return { label: 'Follow us on Twitter', icon: Twitter, bgColor: '#1DA1F2', hoverBgColor: '#1A91DA' };
      case 'linkedin':
        return { label: 'Connect on LinkedIn', icon: Linkedin, bgColor: '#0A66C2', hoverBgColor: '#095BB5' };
      case 'youtube':
        return { label: 'Subscribe on YouTube', icon: Youtube, bgColor: '#FF0000', hoverBgColor: '#E60000' };
      case 'tiktok':
        return { label: 'Follow us on TikTok', icon: Music, bgColor: '#000000', hoverBgColor: '#1A1A1A' };
      case 'whatsapp':
        return { label: 'Chat on WhatsApp', icon: MessageCircle, bgColor: '#25D366', hoverBgColor: '#20BA56' };
      case 'telegram':
        return { label: 'Join our Telegram', icon: Send, bgColor: '#0088CC', hoverBgColor: '#0077B5' };
      case 'website':
        return { label: 'Visit our Website', icon: Globe, bgColor: 'var(--algeria-red)', hoverBgColor: 'var(--algeria-red-dark)' };
      default:
        return { label: 'Visit Link', icon: ExternalLink, bgColor: 'var(--algeria-red)', hoverBgColor: 'var(--algeria-red-dark)' };
    }
  };

  // Update the isItemAvailableToday function
  const isItemAvailableToday = (item: MenuItem): boolean => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return item.availability?.[today] ?? true;
  };

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        // First, increment the scan count
        await qrCodeApi.incrementScanCount(id!);
        // Then fetch the updated QR code using the public endpoint
        const data = await qrCodeApi.getPublicQRCode(id!);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-algeria-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium tracking-tight">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Error</h1>
          <p className="text-xl text-gray-600 mb-6">{error || 'QR code not found'}</p>
          <Button
            className="px-6 py-3 text-lg font-medium rounded-full bg-algeria-red text-white hover:bg-algeria-red/90 hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-algeria-red"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const hasUrls = qrCode.links && qrCode.links.length > 0;
  const hasMenu = qrCode.menu && qrCode.menu.categories && qrCode.menu.categories.length > 0;

  return (
    <div
      className="min-h-screen py-12 px-4 font-sans"
      style={{
        background: `radial-gradient(circle at top, ${qrCode.backgroundColor || '#f9fafb'} 0%, ${qrCode.backgroundColor ? adjustColor(qrCode.backgroundColor, -30) : '#e5e7eb'} 100%)`,
      }}
    >
      <div className="container mx-auto max-w-5xl">
        <Card className="overflow-hidden rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-sm">
          {qrCode.logoUrl && (
            <div className="flex justify-center pt-10">
              <img
                src={qrCode.logoUrl}
                alt="Logo"
                className="h-28 w-auto object-contain transition-transform duration-200 hover:scale-105"
              />
            </div>
          )}

          <CardContent className="p-6 md:p-10">
            <h1
              className="text-4xl md:text-5xl font-extrabold text-center mb-8 tracking-tight text-algeria-red"
            >
              {qrCode.name}
            </h1>

            {/* Links Section */}
            {hasUrls && (
              <div className="mb-10">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {qrCode.links.map((link, index) => {
                    const { label, icon: Icon, bgColor, hoverBgColor } = getPlatformInfo(link.type || 'default');
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button
                          className="w-full text-lg py-6 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50 focus:ring-[color] flex items-center justify-center gap-3"
                          style={{
                            background: bgColor,
                            color: '#ffffff',
                            '--hover-bg': hoverBgColor,
                          } as React.CSSProperties}
                          onMouseEnter={(e) => (e.currentTarget.style.background = hoverBgColor)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = bgColor)}
                        >
                          <Icon size={24} />
                          <span>{label}</span>
                        </Button>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Separator for sections */}
            {hasUrls && hasMenu && (
              <Separator className="my-10 bg-gray-200/50" />
            )}

            {/* Menu Section */}
            {hasMenu && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <h2
                    className="text-3xl font-semibold tracking-tight text-algeria-red"
                  >
                    {qrCode.menu?.restaurantName}
                  </h2>
                  {qrCode.menu?.description && (
                    <p className="text-gray-500 mt-3 text-base max-w-2xl mx-auto">
                      {qrCode.menu.description}
                    </p>
                  )}
                </div>

                <div className="space-y-8">
                  {qrCode.menu?.categories.map((category) => (
                    <div key={category.name} className="menu-category">
                      <h3
                        className="text-xl font-semibold text-center py-3 rounded-t-lg border-b-2 transition-colors duration-200 text-algeria-red border-algeria-red"
                      >
                        {category.name}
                      </h3>

                      <div className="space-y-3 p-4 rounded-b-lg bg-gray-50/50">
                        {category.items
                          .filter(item => isItemAvailableToday(item))
                          .map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                            >
                              <div className="flex-1 pr-6">
                                <div className="flex justify-between items-start mb-2">
                                  <h4
                                    className="text-lg font-semibold text-algeria-red"
                                  >
                                    {item.name}
                                  </h4>
                                  <p
                                    className="text-lg font-semibold whitespace-nowrap ml-4 text-algeria-green"
                                  >
                                    ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                {item.description && (
                                  <p className="text-gray-600 text-sm line-clamp-3">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              {item.imageUrl && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-20 w-20 object-cover rounded-lg transition-transform duration-200 hover:scale-110"
                                    loading="lazy"
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

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500">
                Powered by <span className="text-algeria-red font-medium">QuickQR</span> - Digital Solutions for Business
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  color = color.replace(/^#/, '');
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default LandingPage;

