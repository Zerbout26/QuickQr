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
import { Upload, X, Plus, Trash2 } from 'lucide-react';

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

interface Link {
  label: string;
  url: string;
}

interface QRCodeFormProps {
  onCreated?: (qrCode: QRCodeType) => void;
}

const QRCodeGenerator: React.FC<QRCodeFormProps> = ({ onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
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

  const addLink = () => {
    setLinks([...links, { label: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof Link, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create QR codes');
      return;
    }
    
    if (links.length === 0) {
      setError('At least one link is required');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name || 'My QR Code');
      formData.append('foregroundColor', foregroundColor);
      formData.append('backgroundColor', backgroundColor);
      formData.append('links', JSON.stringify(links));
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const token = localStorage.getItem('qr-generator-token');
      if (!token) {
        throw new Error('Please log in to create QR codes');
      }

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
      if (onCreated) {
        onCreated(newQR);
      }

      // Reset form
      setName('');
      setLinks([]);
      setForegroundColor('#6366F1');
      setBackgroundColor('#FFFFFF');
      setLogoFile(null);
      setLogoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "QR Code Created",
        description: "Your QR code has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating QR code:', error);
      setError(error instanceof Error ? error.message : 'Failed to create QR code');
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create QR code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My QR Code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Links</Label>
                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Button Label"
                          value={link.label}
                          onChange={(e) => updateLink(index, 'label', e.target.value)}
                        />
                        <Input
                          placeholder="URL"
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeLink(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={addLink}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foregroundColor">Foreground Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="foregroundColor"
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create QR Code'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
