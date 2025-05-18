import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode } from '@/types';
import { qrCodeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold text-center mb-8">{qrCode.name}</h1>
            
            {qrCode.type === 'url' ? (
              <div className="space-y-6">
                {qrCode.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full" variant="outline">
                      {link.label}
                    </Button>
                  </a>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">{qrCode.menu?.restaurantName}</h2>
                  {qrCode.menu?.description && (
                    <p className="text-gray-600">{qrCode.menu.description}</p>
                  )}
                </div>
                
                <Tabs defaultValue={qrCode.menu?.categories[0]?.name} className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto">
                    {qrCode.menu?.categories.map((category) => (
                      <TabsTrigger key={category.name} value={category.name}>
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {qrCode.menu?.categories.map((category) => (
                    <TabsContent key={category.name} value={category.name} className="space-y-4">
                      {category.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{item.name}</h3>
                              {item.description && (
                                <p className="text-gray-600 mt-1">{item.description}</p>
                              )}
                            </div>
                            <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                          </div>
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="mt-4 rounded-lg w-full h-48 object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage; 