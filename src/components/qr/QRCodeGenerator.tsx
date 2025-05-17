
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { createQRCode } from '@/lib/mockData';
import { QRCode } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock QR code image for preview
const QRPreview = ({ url, color, bgColor }: { url: string; color: string; bgColor: string }) => {
  return (
    <div className="flex justify-center items-center mb-4">
      <div 
        className="w-48 h-48 flex items-center justify-center border rounded-md" 
        style={{ backgroundColor: bgColor }}
      >
        <div className="text-sm text-center text-gray-400">
          QR Code Preview<br/>
          (Mock: {url})
          <div className="w-28 h-28 mt-2 mx-auto border-2" style={{ borderColor: color }}></div>
        </div>
      </div>
    </div>
  );
};

interface QRCodeFormProps {
  onCreated?: (qrCode: QRCode) => void;
}

const QRCodeGenerator: React.FC<QRCodeFormProps> = ({ onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [foregroundColor, setForegroundColor] = useState('#6366F1');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create QR codes');
      return;
    }
    
    if (!url) {
      setError('URL is required');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Validate URL format
      try {
        new URL(url);
      } catch {
        // If not a valid URL, try prepending https://
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          setUrl(`https://${url}`);
        }
      }
      
      const newQRCode = await createQRCode({
        userId: user.id,
        name: name || 'My QR Code',
        url,
        foregroundColor,
        backgroundColor
      });
      
      toast({
        title: "QR Code Created",
        description: "Your QR code has been created successfully.",
      });
      
      // Reset form
      setName('');
      setUrl('');
      
      // Call onCreated callback
      if (onCreated) {
        onCreated(newQRCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QR code');
      toast({
        variant: "destructive",
        title: "Failed to create QR code",
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="pt-6">
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">QR Code Name (Optional)</Label>
                <Input 
                  id="name"
                  placeholder="My Website" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url"
                  placeholder="https://example.com" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
            </TabsContent>
            
            <TabsContent value="customize" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="foreground">Foreground Color</Label>
                <div className="flex space-x-2 items-center">
                  <input
                    id="foreground"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-10 h-10 rounded-md overflow-hidden"
                  />
                  <Input 
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="background">Background Color</Label>
                <div className="flex space-x-2 items-center">
                  <input
                    id="background"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded-md overflow-hidden"
                  />
                  <Input 
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* QR Preview */}
            {url && <QRPreview url={url} color={foregroundColor} bgColor={backgroundColor} />}
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="qr-btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create QR Code'}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
