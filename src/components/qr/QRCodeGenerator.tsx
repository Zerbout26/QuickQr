import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { QRCode as QRCodeType } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { qrCodeApi } from '@/lib/api';
import { Upload, X } from 'lucide-react';

// QR Preview component that shows an actual QR code
const QRPreview = ({ url, color, bgColor, logoUrl }: { url: string; color: string; bgColor: string; logoUrl?: string }) => {
  if (!url) return null;
  
  return (
    <div className="flex justify-center items-center mb-4">
      <div 
        className="w-48 h-48 flex items-center justify-center border rounded-md p-2" 
        style={{ backgroundColor: bgColor }}
      >
        <QRCodeSVG
          value={url}
          size={176}
          bgColor={bgColor}
          fgColor={color}
          level="H"
          includeMargin={false}
          imageSettings={logoUrl ? {
            src: logoUrl,
            x: undefined,
            y: undefined,
            height: 48,
            width: 48,
            excavate: true,
          } : undefined}
        />
      </div>
    </div>
  );
};

interface QRCodeFormProps {
  onCreated?: (qrCode: QRCodeType) => void;
}

const QRCodeGenerator: React.FC<QRCodeFormProps> = ({ onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [foregroundColor, setForegroundColor] = useState('#6366F1');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Logo image must be less than 2MB",
      });
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      let finalUrl = url;
      try {
        new URL(url);
      } catch {
        // If not a valid URL, try prepending https://
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          finalUrl = `https://${url}`;
        }
      }

      const formData = new FormData();
      formData.append('name', name || 'My QR Code');
      formData.append('url', finalUrl);
      formData.append('foregroundColor', foregroundColor);
      formData.append('backgroundColor', backgroundColor);
      
      // If we have a logo file, append it to the form data
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Get token from localStorage
      const token = localStorage.getItem('qr-generator-token');
      if (!token) {
        throw new Error('Please log in to create QR codes');
      }

      console.log('Sending form data:', {
        name: formData.get('name'),
        url: formData.get('url'),
        foregroundColor: formData.get('foregroundColor'),
        backgroundColor: formData.get('backgroundColor'),
        hasLogo: formData.has('logo')
      });

      const response = await fetch('http://localhost:3000/api/qrcodes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create QR code' }));
        throw new Error(errorData.error || 'Failed to create QR code');
      }

      const newQR = await response.json();
      console.log('Received QR code response:', newQR);
      
      toast({
        title: "QR Code Created",
        description: "Your QR code has been created successfully.",
      });
      
      // Reset form
      setName('');
      setUrl('');
      removeLogo();
      
      // Call onCreated callback
      if (onCreated) {
        onCreated(newQR);
      }
    } catch (err) {
      console.error('Error creating QR code:', err);
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

  // Format URL for QR code generation
  const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

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
              
              <div className="space-y-2">
                <Label>Logo (Optional)</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      ref={fileInputRef}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                  
                  {logoPreview && (
                    <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Upload a logo to add to the center of your QR code (max 2MB)
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* QR Preview */}
            {url && (
              <QRPreview 
                url={formattedUrl} 
                color={foregroundColor} 
                bgColor={backgroundColor} 
                logoUrl={logoPreview || undefined} 
              />
            )}
            
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
