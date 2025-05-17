
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import QRCodeGenerator from '@/components/qr/QRCodeGenerator';
import { useAuth } from '@/context/AuthContext';
import { QRCode } from '@/types';
import { getUserQRCodes, updateQRCode } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';

const Dashboard = () => {
  const { user, isTrialExpired, isTrialActive, daysLeftInTrial } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQR, setEditingQR] = useState<QRCode | null>(null);
  const [newUrl, setNewUrl] = useState('');
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
        const codes = await getUserQRCodes(user.id);
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
      const updatedQR = await updateQRCode(editingQR.id, { url: newUrl });
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

  const handleDownload = (qr: QRCode, format: 'png' | 'svg') => {
    // Mock download function
    toast({
      title: `QR Code Downloaded`,
      description: `Your QR code has been downloaded as ${format.toUpperCase()}`,
    });
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your QR codes and subscription</p>
        
        {/* Subscription Status */}
        {isTrialExpired() && !user.hasActiveSubscription && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Your trial has expired</AlertTitle>
            <AlertDescription>
              Your 14-day free trial has ended. Please subscribe to continue using our service.
              <div className="mt-4">
                <Button variant="outline" className="bg-white">
                  Contact Support
                </Button>
              </div>
            </AlertDescription>
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
                      {/* QR Code Display */}
                      <div 
                        className="w-full aspect-square mb-4 flex items-center justify-center border rounded-md p-2" 
                        style={{ backgroundColor: qr.backgroundColor }}
                      >
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
                      </div>
                      
                      <div className="mb-4">
                        <Label className="text-xs text-gray-500">URL</Label>
                        <p className="text-sm truncate mb-2">{qr.url}</p>
                        <Label className="text-xs text-gray-500">Created</Label>
                        <p className="text-sm">{qr.createdAt.toLocaleDateString()}</p>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(qr, 'png')}
                            className="flex-1"
                          >
                            PNG
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(qr, 'svg')}
                            className="flex-1"
                          >
                            SVG
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
