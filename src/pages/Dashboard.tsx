
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
import { 
  Lock, Download, Eye, Edit, Trash2, ExternalLink, 
  Plus, Calendar, CheckCircle, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, isTrialExpired, isTrialActive, daysLeftInTrial } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQR, setEditingQR] = useState<QRCode | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [previewQR, setPreviewQR] = useState<QRCode | null>(null);
  const [deleteConfirmQR, setDeleteConfirmQR] = useState<QRCode | null>(null);
  const navigate = useNavigate();

  // Function to fetch QR codes
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

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  // Initial fetch
  useEffect(() => {
    fetchQRCodes();
  }, [user]);

  // Set up periodic refresh every 30 seconds
  // useEffect(() => {
  //   const refreshInterval = setInterval(fetchQRCodes, 30000); // Refresh every 30 seconds
  //   
  //   return () => clearInterval(refreshInterval); // Cleanup on unmount
  // }, [user]);

  const handleQRCreated = (newQR: QRCode) => {
    setQrCodes(prev => [newQR, ...prev]);
    toast({
      title: "QR Code Created",
      description: "Your new QR code has been created successfully.",
    });
  };

  const handleEditQR = (qr: QRCode) => {
    setEditingQR(qr);
    setNewUrl(qr.url);
  };

  const handleUpdateQR = async () => {
    if (!editingQR) return;
    
    try {
      // Fix: Pass properly structured data instead of JSON strings
      const updatedQR = await qrCodeApi.update(editingQR.id, { 
        name: editingQR.name,
        type: editingQR.type,
        url: newUrl,
        foregroundColor: editingQR.foregroundColor,
        backgroundColor: editingQR.backgroundColor,
        // Pass proper objects instead of strings
        links: editingQR.links,
        menu: editingQR.menu || { restaurantName: '', description: '', categories: [] }
      });
      
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
      setDeleteConfirmQR(null);
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
      let svgElement: HTMLDivElement | null = null;
      let container: HTMLDivElement | null = null;

      try {
        if (format === 'svg') {
          // Create a new SVG element
          svgElement = document.createElement('div');
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
          
          // Render QR code using React
          const root = ReactDOM.createRoot(svgElement);
          root.render(
            <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-sm" style={{ width: '1000px', height: '1200px' }}>
              {qr.textAbove && (
                <div className="text-center mb-8 font-medium text-gray-700" style={{ fontSize: '48px' }}>
                  {qr.textAbove}
                </div>
              )}
              <QRCodeSVG
                value={qr.url}
                size={600}
                bgColor={qr.backgroundColor}
                fgColor={qr.foregroundColor}
                level="H"
                includeMargin={false}
                imageSettings={logoImage ? {
                  src: logoImage.src,
                  height: 150,
                  width: 150,
                  excavate: true,
                } : undefined}
              />
              {qr.textBelow && (
                <div className="text-center mt-8 font-medium text-gray-700" style={{ fontSize: '48px' }}>
                  {qr.textBelow}
                </div>
              )}
            </div>
          );

          // Wait for SVG to render
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              const container = svgElement?.querySelector('div');
              if (!container) {
                resolve();
                return;
              }

              // Create a new SVG element with the same content
              const svgData = new XMLSerializer().serializeToString(container);
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
              resolve();
            }, 100);
          });
        } else {
          // For PNG, create a temporary container
          container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.width = '1000px';
          container.style.height = '1200px';
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
          
          // Render QR code using React
          const root = ReactDOM.createRoot(qrContainer);
          root.render(
            <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-sm" style={{ width: '1000px', height: '1200px' }}>
              {qr.textAbove && (
                <div className="text-center mb-8 font-medium text-gray-700" style={{ fontSize: '48px' }}>
                  {qr.textAbove}
                </div>
              )}
              <QRCodeCanvas
                value={qr.url}
                size={600}
                bgColor={qr.backgroundColor}
                fgColor={qr.foregroundColor}
                level="H"
                includeMargin={false}
                imageSettings={logoImage ? {
                  src: logoImage.src,
                  height: 150,
                  width: 150,
                  excavate: true,
                } : undefined}
              />
              {qr.textBelow && (
                <div className="text-center mt-8 font-medium text-gray-700" style={{ fontSize: '48px' }}>
                  {qr.textBelow}
                </div>
              )}
            </div>
          );

          // Wait for QR code to render
          await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              try {
                // Use html2canvas to capture the entire container including text
                const container = qrContainer.querySelector('div');
                if (!container) {
                  reject(new Error('Container not found'));
                  return;
                }

                // Create a canvas with the same dimensions
                const canvas = document.createElement('canvas');
                canvas.width = 1000;
                canvas.height = 1200;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  reject(new Error('Could not get canvas context'));
                  return;
                }

                // Fill white background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw text above
                if (qr.textAbove) {
                  ctx.fillStyle = '#374151';
                  ctx.font = 'bold 48px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText(qr.textAbove, canvas.width / 2, 100);
                }

                // Draw QR code
                const qrCanvas = container.querySelector('canvas');
                if (qrCanvas) {
                  const qrSize = 600;
                  const qrX = (canvas.width - qrSize) / 2;
                  const qrY = qr.textAbove ? 200 : 100;
                  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
                }

                // Draw text below
                if (qr.textBelow) {
                  ctx.fillStyle = '#374151';
                  ctx.font = 'bold 48px Arial';
                  ctx.textAlign = 'center';
                  const textY = qr.textAbove ? 900 : 800;
                  ctx.fillText(qr.textBelow, canvas.width / 2, textY);
                }

                // Add border
                ctx.strokeStyle = '#E5E7EB';
                ctx.lineWidth = 4;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);

                // Convert to PNG and download
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `${qr.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                resolve();
              } catch (error) {
                reject(error);
              }
            }, 200);
          });
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
      } finally {
        // Clean up temporary elements
        if (svgElement && svgElement.parentNode) {
          svgElement.parentNode.removeChild(svgElement);
        }
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }
    };

    downloadWithLogo();
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with welcome message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name || user.email.split('@')[0]}</h1>
          <p className="text-gray-600 mb-4">Manage your QR codes and subscription from your personalized dashboard</p>
          
          {/* Subscription status badges */}
          <div className="flex flex-wrap gap-3 mt-2">
            {user.hasActiveSubscription && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Active Subscription
              </span>
            )}
            
            {isTrialActive() && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Trial: {daysLeftInTrial()} days left
              </span>
            )}
            
            {isTrialExpired() && !user.hasActiveSubscription && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Trial expired
              </span>
            )}
          </div>
        </div>
        
        {/* Account Status Alerts */}
        {!user.isActive && (
          <Alert variant="destructive" className="mb-8 animate-fade-in shadow-sm border-red-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <AlertTitle className="text-lg mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Account Not Activated
                </AlertTitle>
                <AlertDescription className="text-base">
                  Your account is pending activation. Please complete the payment process to activate your account.
                </AlertDescription>
              </div>
              <Button 
                onClick={() => navigate('/payment-instructions')} 
                className="bg-white hover:bg-gray-50 text-red-600 border-red-200 hover:border-red-300 min-w-[200px] h-12 text-base font-medium"
              >
                View Payment Instructions
              </Button>
            </div>
          </Alert>
        )}
        
        {isTrialExpired() && !user.hasActiveSubscription && (
          <Alert variant="destructive" className="mb-8 animate-fade-in shadow-sm border-red-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <AlertTitle className="text-lg mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Your trial has expired
                </AlertTitle>
                <AlertDescription className="text-base">
                  Your 14-day free trial has ended. Please subscribe to continue using our service.
                </AlertDescription>
              </div>
              <Button 
                onClick={() => navigate('/payment-instructions')} 
                className="bg-white hover:bg-gray-50 text-red-600 border-red-200 hover:border-red-300 min-w-[200px] h-12 text-base font-medium"
              >
                View Payment Instructions
              </Button>
            </div>
          </Alert>
        )}
        
        {isTrialActive() && (
          <Alert className="mb-8 border-qr-primary/30 bg-qr-primary/5 shadow-sm animate-fade-in">
            <AlertTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-qr-primary" /> Free Trial Active
            </AlertTitle>
            <AlertDescription>
              You have {daysLeftInTrial()} days left in your free trial. Enjoy full access to all features!
            </AlertDescription>
          </Alert>
        )}
        
        {user.hasActiveSubscription && (
          <Alert className="mb-8 border-qr-accent/30 bg-qr-accent/5 shadow-sm animate-fade-in">
            <AlertTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-qr-accent" /> Active Subscription
            </AlertTitle>
            <AlertDescription>
              Thank you for your subscription! You have full access to all QRCreator features.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Main tabs navigation */}
        <Tabs defaultValue="create" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 p-1 rounded-xl bg-gray-100">
            <TabsTrigger value="create" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create QR Code
              </div>
            </TabsTrigger>
            <TabsTrigger value="manage" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" /> Manage QR Codes
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* QR Code Creation Tab */}
          <TabsContent value="create" className="py-8 px-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 animate-fade-in">
              <QRCodeGenerator onCreated={handleQRCreated} />
            </div>
          </TabsContent>
          
          {/* QR Code Management Tab */}
          <TabsContent value="manage" className="py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your QR Codes</h2>
              <Button 
                onClick={() => document.querySelector('[data-value="create"]')?.dispatchEvent(new Event('click'))}
                className="qr-btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create New
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-qr-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500">Loading your QR codes...</p>
                </div>
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-16 border rounded-xl shadow-sm bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700">No QR codes yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">You haven't created any QR codes yet. Create your first QR code to get started.</p>
                  <Button 
                    onClick={() => document.querySelector('[data-value="create"]')?.dispatchEvent(new Event('click'))}
                    variant="outline" 
                    className="mt-3 border-qr-primary text-qr-primary hover:bg-qr-primary/5"
                  >
                    Create your first QR code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrCodes.map((qr) => (
                  <Card key={qr.id} className="qr-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-2 border-b bg-gray-50 rounded-t-xl">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="truncate">{qr.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {qr.scanCount || 0}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{qr.type}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {/* QR Code Display */}
                      <div 
                        className="w-full aspect-square mb-4 flex items-center justify-center border rounded-lg p-3 relative shadow-inner" 
                        style={{ backgroundColor: qr.backgroundColor }}
                        data-qr-id={qr.id}
                      >
                        {!user?.isActive && (
                          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center rounded-lg pointer-events-none z-10">
                            <div className="text-center bg-white/20 backdrop-blur-md rounded-lg p-3">
                              <Lock className="w-6 h-6 text-gray-600 mb-2 mx-auto" />
                              <p className="text-gray-700 text-sm font-medium">Preview Mode</p>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col items-center">
                          {qr.textAbove && (
                            <div className="text-center mb-2 font-medium text-gray-700">
                              {qr.textAbove}
                            </div>
                          )}
                          <QRCodeSVG
                            value={qr.url}
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
                          {qr.textBelow && (
                            <div className="text-center mt-2 font-medium text-gray-700">
                              {qr.textBelow}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4 space-y-2">
                        <div>
                          <Label className="text-xs text-gray-500">URL</Label>
                          <div className="flex items-center gap-1">
                            <p className="text-sm truncate font-medium">{qr.url}</p>
                            <a 
                              href={qr.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-qr-primary hover:text-qr-primary/80"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Created</Label>
                          <p className="text-sm">{new Date(qr.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/qrcodes/${qr.id}/edit`)}
                            className="w-full hover:bg-gray-50"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Content
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEditQR(qr)} className="w-full hover:bg-gray-50">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Edit URL
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit QR Code URL</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="newUrl">New URL</Label>
                                  <Input
                                    id="newUrl"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    placeholder="Enter new URL"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setEditingQR(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdateQR}>
                                    Update URL
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(qr, 'png')}
                            className="w-full hover:bg-gray-50"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" /> Download PNG
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(qr, 'svg')}
                            className="w-full hover:bg-gray-50"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" /> Download SVG
                          </Button>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setDeleteConfirmQR(qr)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                              Delete QR Code
                            </Button>
                          </DialogTrigger>
                          {deleteConfirmQR && (
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Are you sure you want to delete "{deleteConfirmQR.name}"? This action cannot be undone.</p>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setDeleteConfirmQR(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleDeleteQR(deleteConfirmQR.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
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
                  className="w-64 h-64 mb-4 flex items-center justify-center border rounded-lg p-2 relative shadow-inner" 
                  style={{ backgroundColor: previewQR.backgroundColor }}
                >
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center bg-white/20 backdrop-blur-md rounded-lg p-4">
                      <Lock className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-gray-700 font-medium">Preview Mode</p>
                    </div>
                  </div>
                  <QRCodeSVG
                    value={previewQR.url}
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
                <p className="text-sm text-gray-600 mb-4">
                  Activate your account to download high-resolution QR codes
                </p>
                <Button 
                  onClick={() => navigate('/payment-instructions')}
                  className="bg-qr-primary hover:bg-qr-primary/90 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Activate Account
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
