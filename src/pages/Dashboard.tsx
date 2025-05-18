import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import QRCodeGenerator from '@/components/qr/QRCodeGenerator';
import { useAuth } from '@/context/AuthContext';
import { QRCode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import ReactDOM from 'react-dom/client';
import { qrCodeApi } from '@/lib/api';
import { Lock, Download, Eye } from 'lucide-react';

const Dashboard = () => {
  const { user, isTrialExpired, isTrialActive, daysLeftInTrial } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQR, setEditingQR] = useState<QRCode | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [previewQR, setPreviewQR] = useState<QRCode | null>(null);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  // Fetch user QR codes
  useEffect(() => {
    const fetchQRCodes = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const codes = await qrCodeApi.getAll();
        setQrCodes(codes);
      } catch (error) {
        console.error('Failed to fetch QR codes', error);
        toast({
          variant: "destructive",
          title: "Error loading QR codes",
          description: "There was a problem loading your QR codes.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQRCodes();
  }, [user]);

  const handleQRCreated = (newQR: QRCode) => {
    setQrCodes(prev => [newQR, ...prev]);
  };

  const handleEditQR = (qr: QRCode) => {
    setEditingQR(qr);
    setNewUrl(qr.url);
  };

  const handleUpdateQR = async () => {
    if (!editingQR) return;
    
    try {
      const updatedQR = await qrCodeApi.update(editingQR.id, { url: newUrl });
      setQrCodes(prev => prev.map(qr => qr.id === updatedQR.id ? updatedQR : qr));
      setEditingQR(null);
      toast({
        title: "QR Code Updated",
        description: "Your QR code URL has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update QR code', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your QR code.",
      });
    }
  };

  const handleDeleteQR = async (qrId: string) => {
    try {
      await qrCodeApi.delete(qrId);
      setQrCodes(prev => prev.filter(qr => qr.id !== qrId));
      toast({
        title: "QR Code Deleted",
        description: "Your QR code has been deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete QR code', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was a problem deleting your QR code.",
      });
    }
  };

  const handlePreview = (qr: QRCode) => {
    setPreviewQR(qr);
  };

  const handleDownload = (qr: QRCode, format: 'png' | 'svg') => {
    if (!user?.isActive) {
      toast({
        variant: "destructive",
        title: "Account Not Activated",
        description: "Please activate your account to download QR codes.",
      });
      return;
    }

    // Create the redirect URL for this QR code
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/qr/${qr.id}`;

    const preloadLogo = (logoUrl: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Add timestamp to URL to prevent caching
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${logoUrl}?t=${timestamp}`;
        
        img.onload = () => {
          // Create a canvas to draw the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);
          
          // Create a new image from the canvas
          const newImg = new Image();
          newImg.src = canvas.toDataURL('image/png');
          newImg.onload = () => resolve(newImg);
          newImg.onerror = reject;
        };
        
        img.onerror = () => {
          // If CORS fails, try without crossOrigin
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = reject;
          fallbackImg.src = urlWithTimestamp;
        };
        
        img.src = urlWithTimestamp;
      });
    };

    const downloadWithLogo = async () => {
      try {
        if (format === 'svg') {
          // Create a new SVG element
          const svgElement = document.createElement('div');
          document.body.appendChild(svgElement);
          
          // Preload logo if exists
          let logoImage: HTMLImageElement | undefined;
          if (qr.logoUrl) {
            try {
              logoImage = await preloadLogo(qr.logoUrl);
            } catch (error) {
              console.warn('Failed to preload logo:', error);
            }
          }
          
          // Render QR code using React - use redirectUrl instead of direct URL
          const root = ReactDOM.createRoot(svgElement);
          root.render(
            <QRCodeSVG
              value={redirectUrl}
              size={800}
              bgColor={qr.backgroundColor}
              fgColor={qr.foregroundColor}
              level="H"
              includeMargin={false}
              imageSettings={logoImage ? {
                src: logoImage.src,
                height: 200,
                width: 200,
                excavate: true,
              } : undefined}
            />
          );

          // Wait for SVG to render
          setTimeout(() => {
            const svg = svgElement.querySelector('svg');
            if (!svg) return;

            // Create a new SVG element with the same content
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = `${qr.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
            document.body.removeChild(svgElement);
          }, 100);
        } else {
          // For PNG, create a temporary container
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          document.body.appendChild(container);

          // Preload logo if exists
          let logoImage: HTMLImageElement | undefined;
          if (qr.logoUrl) {
            try {
              logoImage = await preloadLogo(qr.logoUrl);
            } catch (error) {
              console.warn('Failed to preload logo:', error);
            }
          }

          // Create QR code using QRCodeCanvas component
          const qrContainer = document.createElement('div');
          container.appendChild(qrContainer);
          
          // Render QR code using React - use redirectUrl instead of direct URL
          const root = ReactDOM.createRoot(qrContainer);
          root.render(
            <QRCodeCanvas
              value={redirectUrl}
              size={800}
              bgColor={qr.backgroundColor}
              fgColor={qr.foregroundColor}
              level="H"
              includeMargin={false}
              imageSettings={logoImage ? {
                src: logoImage.src,
                height: 200,
                width: 200,
                excavate: true,
              } : undefined}
            />
          );

          // Wait for QR code to render
          setTimeout(() => {
            try {
              const qrCanvas = qrContainer.querySelector('canvas');
              if (!qrCanvas) {
                throw new Error('QR code canvas not found');
              }

              // Convert to PNG and download
              const pngUrl = qrCanvas.toDataURL('image/png');
              const downloadLink = document.createElement('a');
              downloadLink.href = pngUrl;
              downloadLink.download = `${qr.name.toLowerCase().replace(/\s+/g, '-')}.png`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              document.body.removeChild(container);
            } catch (error) {
              console.error('Error during PNG generation:', error);
              toast({
                variant: "destructive",
                title: "Download Failed",
                description: "There was a problem generating the PNG file.",
              });
              document.body.removeChild(container);
            }
          }, 200);
        }

        toast({
          title: `QR Code Downloaded`,
          description: `Your QR code has been downloaded as ${format.toUpperCase()}`,
        });
      } catch (error) {
        console.error('Download failed:', error);
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "There was a problem downloading your QR code.",
        });
      }
    };

    downloadWithLogo();
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your QR codes and subscription</p>
        
        {/* Account Status */}
        {!user.isActive && (
          <Alert variant="destructive" className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <AlertTitle className="text-lg mb-2">Account Not Activated</AlertTitle>
                <AlertDescription className="text-base">
                  Your account is pending activation. Please complete the payment process to activate your account.
                </AlertDescription>
              </div>
              <Button 
                onClick={() => navigate('/payment-instructions')} 
                className="bg-white hover:bg-gray-50 text-qr-primary border-qr-primary min-w-[200px] h-12 text-base font-medium"
              >
                View Payment Instructions
              </Button>
            </div>
          </Alert>
        )}
        
        {/* Subscription Status */}
        {isTrialExpired() && !user.hasActiveSubscription && (
          <Alert variant="destructive" className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <AlertTitle className="text-lg mb-2">Your trial has expired</AlertTitle>
                <AlertDescription className="text-base">
                  Your 14-day free trial has ended. Please subscribe to continue using our service.
                </AlertDescription>
              </div>
              <Button 
                onClick={() => navigate('/payment-instructions')} 
                className="bg-white hover:bg-gray-50 text-qr-primary border-qr-primary min-w-[200px] h-12 text-base font-medium"
              >
                View Payment Instructions
              </Button>
            </div>
          </Alert>
        )}
        
        {isTrialActive() && (
          <Alert className="mb-8 border-qr-primary/20 bg-qr-primary/5">
            <AlertTitle>Free Trial Active</AlertTitle>
            <AlertDescription>
              You have {daysLeftInTrial()} days left in your free trial. Enjoy full access to all features!
            </AlertDescription>
          </Alert>
        )}
        
        {user.hasActiveSubscription && (
          <Alert className="mb-8 border-qr-accent/20 bg-qr-accent/5">
            <AlertTitle>Active Subscription</AlertTitle>
            <AlertDescription>
              Thank you for your subscription! You have full access to all QRCreator features.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="create" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create">Create QR Code</TabsTrigger>
            <TabsTrigger value="manage">Manage QR Codes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="py-6">
            <QRCodeGenerator onCreated={handleQRCreated} />
          </TabsContent>
          
          <TabsContent value="manage" className="py-6">
            <h2 className="text-xl font-semibold mb-4">Your QR Codes</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse-slow">Loading your QR codes...</div>
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <p className="text-gray-500">You haven't created any QR codes yet.</p>
                <Button 
                  onClick={() => document.querySelector('[data-value="create"]')?.dispatchEvent(new Event('click'))}
                  variant="link" 
                  className="text-qr-primary mt-2"
                >
                  Create your first QR code
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrCodes.map((qr) => (
                  <Card key={qr.id} className="qr-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{qr.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* QR Code Display - use the redirect URL */}
                      <div 
                        className="w-full aspect-square mb-4 flex items-center justify-center border rounded-md p-2 relative" 
                        style={{ backgroundColor: qr.backgroundColor }}
                        data-qr-id={qr.id}
                      >
                        {!user?.isActive && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-md pointer-events-none">
                            <div className="text-center">
                              <Lock className="w-6 h-6 text-gray-400 mb-2" />
                              <p className="text-gray-500 text-sm">Preview Mode</p>
                            </div>
                          </div>
                        )}
                        <QRCodeSVG
                          value={`${window.location.origin}/qr/${qr.id}`}
                          size={160}
                          bgColor={qr.backgroundColor}
                          fgColor={qr.foregroundColor}
                          level="H"
                          includeMargin={false}
                          imageSettings={qr.logoUrl ? {
                            src: qr.logoUrl,
                            height: 40,
                            width: 40,
                            excavate: true,
                          } : undefined}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <Label className="text-xs text-gray-500">QR Code URL</Label>
                        <p className="text-sm truncate mb-2">
                          {`${window.location.origin}/qr/${qr.id}`}
                        </p>
                        <Label className="text-xs text-gray-500">Target URL</Label>
                        <p className="text-sm truncate mb-2">{qr.url}</p>
                        <Label className="text-xs text-gray-500">Created</Label>
                        <p className="text-sm">{new Date(qr.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditQR(qr)} className="w-full">
                              Edit URL
                            </Button>
                          </DialogTrigger>
                          {editingQR && (
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update QR Code URL</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <Label htmlFor="url">New URL</Label>
                                <Input
                                  id="url"
                                  value={newUrl}
                                  onChange={(e) => setNewUrl(e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setEditingQR(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateQR} className="qr-btn-primary">
                                  Update URL
                                </Button>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                        
                        <div className="flex space-x-2">
                          {user?.isActive ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDownload(qr, 'png')}
                                className="flex-1"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                PNG
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDownload(qr, 'svg')}
                                className="flex-1"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                SVG
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePreview(qr)}
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          )}
                        </div>

                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteQR(qr.id)}
                          className="w-full"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewQR} onOpenChange={() => setPreviewQR(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>QR Code Preview</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {previewQR && (
              <div className="flex flex-col items-center">
                <div 
                  className="w-64 h-64 mb-4 flex items-center justify-center border rounded-md p-2 relative" 
                  style={{ backgroundColor: previewQR.backgroundColor }}
                >
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-md">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-500">Preview Mode</p>
                    </div>
                  </div>
                  <QRCodeSVG
                    value={`${window.location.origin}/qr/${previewQR.id}`}
                    size={240}
                    bgColor={previewQR.backgroundColor}
                    fgColor={previewQR.foregroundColor}
                    level="H"
                    includeMargin={false}
                    imageSettings={previewQR.logoUrl ? {
                      src: previewQR.logoUrl,
                      height: 60,
                      width: 60,
                      excavate: true,
                    } : undefined}
                  />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Activate your account to download high-resolution QR codes
                </p>
                <Button 
                  onClick={() => navigate('/payment-instructions')}
                  className="bg-qr-primary hover:bg-qr-primary/90"
                >
                  Activate Account
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Dashboard;
