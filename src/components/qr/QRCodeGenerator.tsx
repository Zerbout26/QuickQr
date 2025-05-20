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
import { Upload, X, Plus, Trash2, Globe, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Send, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE_URL = 'http://localhost:3000/api';

// QR Preview component that shows an actual QR code
const QRPreview = ({ url, color, bgColor, logoUrl, textAbove, textBelow }: { 
  url: string; 
  color: string; 
  bgColor: string; 
  logoUrl?: string;
  textAbove?: string;
  textBelow?: string;
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (format: 'png' | 'svg') => {
    if (!qrRef.current) return;

    try {
      if (format === 'svg') {
        // Create SVG with text
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "400");
        svg.setAttribute("height", "500");
        svg.setAttribute("viewBox", "0 0 400 500");

        // Add background
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("width", "400");
        rect.setAttribute("height", "500");
        rect.setAttribute("fill", "#FFFFFF");
        svg.appendChild(rect);

        // Add text above
        if (textAbove) {
          const textAboveElement = document.createElementNS(svgNS, "text");
          textAboveElement.setAttribute("x", "200");
          textAboveElement.setAttribute("y", "40");
          textAboveElement.setAttribute("text-anchor", "middle");
          textAboveElement.setAttribute("font-family", "Arial");
          textAboveElement.setAttribute("font-size", "24");
          textAboveElement.setAttribute("font-weight", "bold");
          textAboveElement.setAttribute("fill", "#374151");
          textAboveElement.textContent = textAbove;
          svg.appendChild(textAboveElement);
        }

        // Add QR code
        const qrElement = qrRef.current.querySelector('svg');
        if (qrElement) {
          const qrClone = qrElement.cloneNode(true) as SVGElement;
          qrClone.setAttribute("x", "50");
          qrClone.setAttribute("y", textAbove ? "80" : "100");
          qrClone.setAttribute("width", "300");
          qrClone.setAttribute("height", "300");
          svg.appendChild(qrClone);
        }

        // Add text below
        if (textBelow) {
          const textBelowElement = document.createElementNS(svgNS, "text");
          textBelowElement.setAttribute("x", "200");
          textBelowElement.setAttribute("y", textAbove ? "420" : "440");
          textBelowElement.setAttribute("text-anchor", "middle");
          textBelowElement.setAttribute("font-family", "Arial");
          textBelowElement.setAttribute("font-size", "24");
          textBelowElement.setAttribute("font-weight", "bold");
          textBelowElement.setAttribute("fill", "#374151");
          textBelowElement.textContent = textBelow;
          svg.appendChild(textBelowElement);
        }

        // Add border
        const border = document.createElementNS(svgNS, "rect");
        border.setAttribute("width", "400");
        border.setAttribute("height", "500");
        border.setAttribute("fill", "none");
        border.setAttribute("stroke", "#E5E7EB");
        border.setAttribute("stroke-width", "2");
        svg.appendChild(border);

        // Convert to string and download
        const svgString = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-code.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // PNG download
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 400;
        canvas.height = 500;

        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text above
        if (textAbove) {
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(textAbove, canvas.width / 2, 40);
        }

        // Draw QR code
        const qrElement = qrRef.current.querySelector('svg');
        if (qrElement) {
          const svgData = new XMLSerializer().serializeToString(qrElement);
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
          });
          const qrSize = 300;
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = textAbove ? 80 : 100;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        }

        // Draw text below
        if (textBelow) {
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          const textY = textAbove ? 420 : 440;
          ctx.fillText(textBelow, canvas.width / 2, textY);
        }

        // Add border
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-code.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 'image/png', 1.0);
      }

      toast({
        title: "Success",
        description: `QR code downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download QR code",
      });
    }
  };

  if (!url) return null;
  
  return (
    <div className="flex flex-col items-center mb-4">
      {textAbove && (
        <div className="text-center mb-2 font-medium text-gray-700">
          {textAbove}
        </div>
      )}
      <div 
        ref={qrRef}
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
      {textBelow && (
        <div className="text-center mt-2 font-medium text-gray-700">
          {textBelow}
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDownload('png')}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PNG
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDownload('svg')}
        >
          <Download className="h-4 w-4 mr-2" />
          Download SVG
        </Button>
      </div>
    </div>
  );
};

interface Link {
  label: string;
  url: string;
  type?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'whatsapp' | 'telegram' | 'website' | 'other';
}

interface MenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface QRCodeFormProps {
  onCreated?: (qrCode: QRCodeType) => void;
}

const QRCodeGenerator: React.FC<QRCodeFormProps> = ({ onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState<'url' | 'menu' | 'both' | 'direct'>('url');
  const [directUrl, setDirectUrl] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [foregroundColor, setForegroundColor] = useState('#6366F1');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textAbove, setTextAbove] = useState('Scan me');
  const [textBelow, setTextBelow] = useState('');

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
    setLinks([...links, { label: '', url: '', type: 'website' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof Link, value: string) => {
    const newLinks = [...links];
    if (field === 'type') {
      // Automatically set the label based on the selected type
      const label = getPlatformLabel(value as Link['type']);
      newLinks[index] = { ...newLinks[index], [field]: value as Link['type'], label };
    } else {
      newLinks[index] = { ...newLinks[index], [field]: value };
    }
    setLinks(newLinks);
  };

  const getPlatformLabel = (type: string): string => {
    switch (type) {
      case 'facebook':
        return 'Follow us on Facebook';
      case 'instagram':
        return 'Follow us on Instagram';
      case 'twitter':
        return 'Follow us on Twitter';
      case 'linkedin':
        return 'Connect on LinkedIn';
      case 'youtube':
        return 'Subscribe on YouTube';
      case 'tiktok':
        return 'Follow us on TikTok';
      case 'whatsapp':
        return 'Chat on WhatsApp';
      case 'telegram':
        return 'Join our Telegram';
      case 'website':
        return 'Visit our Website';
      default:
        return 'Visit Link';
    }
  };

  const addCategory = () => {
    setMenuCategories([...menuCategories, { name: '', items: [] }]);
  };

  const removeCategory = (index: number) => {
    setMenuCategories(menuCategories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, name: string) => {
    const newCategories = [...menuCategories];
    newCategories[index] = { ...newCategories[index], name };
    setMenuCategories(newCategories);
  };

  const addMenuItem = (categoryIndex: number) => {
    const newCategories = [...menuCategories];
    newCategories[categoryIndex].items.push({
      name: '',
      description: '',
      price: 0,
      category: newCategories[categoryIndex].name,
    });
    setMenuCategories(newCategories);
  };

  const removeMenuItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...menuCategories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setMenuCategories(newCategories);
  };

  const updateMenuItem = (categoryIndex: number, itemIndex: number, field: keyof MenuItem, value: string | number) => {
    const newCategories = [...menuCategories];
    newCategories[categoryIndex].items[itemIndex] = {
      ...newCategories[categoryIndex].items[itemIndex],
      [field]: value,
    };
    setMenuCategories(newCategories);
  };

  const handleItemImageUpload = async (categoryIndex: number, itemIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
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
        description: "Item image must be less than 2MB",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/qrcodes/upload/item-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const { imageUrl } = await response.json();
      // Use the full URL returned from the server
      updateMenuItem(categoryIndex, itemIndex, 'imageUrl', imageUrl);

      toast({
        title: "Image Uploaded",
        description: "Item image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to upload item image',
      });
    }
  };

  const removeItemImage = (categoryIndex: number, itemIndex: number) => {
    updateMenuItem(categoryIndex, itemIndex, 'imageUrl', '');
  };

  const getLinkIcon = (type?: string) => {
    switch (type) {
      case 'facebook':
        return <Facebook className="h-4 w-4 mr-2" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 mr-2" />;
      case 'twitter':
        return <Twitter className="h-4 w-4 mr-2" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 mr-2" />;
      case 'youtube':
        return <Youtube className="h-4 w-4 mr-2" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 mr-2" />;
      case 'telegram':
        return <Send className="h-4 w-4 mr-2" />;
      default:
        return <Globe className="h-4 w-4 mr-2" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create QR codes');
      return;
    }
    
    if (type === 'direct' && !directUrl) {
      setError('URL is required for direct URL type');
      return;
    }

    if ((type === 'url' || type === 'both') && links.length === 0) {
      setError('At least one link is required for URL type');
      return;
    }

    if ((type === 'menu' || type === 'both') && menuCategories.length === 0) {
      setError('At least one category is required for menu type');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name || 'My QR Code');
      formData.append('type', type);
      formData.append('foregroundColor', foregroundColor);
      formData.append('backgroundColor', backgroundColor);
      
      if (type === 'direct') {
        formData.append('url', directUrl);
      } else if (type === 'url' || type === 'both') {
        formData.append('links', JSON.stringify(links));
      }
      
      if (type === 'menu' || type === 'both') {
        formData.append('menu', JSON.stringify({
          restaurantName: name,
          categories: menuCategories,
        }));
      }
      
      formData.append('textAbove', textAbove);
      formData.append('textBelow', textBelow);
      
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
      setType('url');
      setLinks([]);
      setMenuCategories([]);
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
                  <Label htmlFor="textAbove">Text Above QR Code</Label>
                  <Input
                    id="textAbove"
                    value={textAbove}
                    onChange={(e) => setTextAbove(e.target.value)}
                    placeholder="Enter text to display above QR code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textBelow">Text Below QR Code</Label>
                  <Input
                    id="textBelow"
                    value={textBelow}
                    onChange={(e) => setTextBelow(e.target.value)}
                    placeholder="Enter text to display below QR code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={type === 'url' ? 'default' : 'outline'}
                      onClick={() => setType('url')}
                      className="flex-1"
                    >
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'menu' ? 'default' : 'outline'}
                      onClick={() => setType('menu')}
                      className="flex-1"
                    >
                      Menu
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'both' ? 'default' : 'outline'}
                      onClick={() => setType('both')}
                      className="flex-1"
                    >
                      Both
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'direct' ? 'default' : 'outline'}
                      onClick={() => setType('direct')}
                      className="flex-1"
                    >
                      Direct Link
                    </Button>
                  </div>
                </div>
                {type === 'direct' && (
                  <div className="space-y-2">
                    <Label htmlFor="directUrl">URL</Label>
                    <Input
                      id="directUrl"
                      type="url"
                      value={directUrl}
                      onChange={(e) => setDirectUrl(e.target.value)}
                      placeholder="Enter URL"
                    />
                  </div>
                )}
                {(type === 'url' || type === 'both') && (
                  <div className="space-y-2">
                    <Label>Links</Label>
                    <div className="space-y-2">
                      {links.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <Select
                            value={link.type || 'website'}
                            onValueChange={(value) => updateLink(index, 'type', value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="telegram">Telegram</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
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
                )}
                {(type === 'menu' || type === 'both') && (
                  <div className="space-y-4">
                    {menuCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="space-y-2 border p-4 rounded-lg">
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Category Name"
                            value={category.name}
                            onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeCategory(categoryIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 mt-4">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="space-y-2 border p-2 rounded">
                              <Input
                                placeholder="Item Name"
                                value={item.name}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'name', e.target.value)}
                              />
                              <Textarea
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'description', e.target.value)}
                              />
                              <Input
                                type="number"
                                placeholder="Price"
                                value={item.price}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'price', parseFloat(e.target.value))}
                              />
                              <div className="space-y-2">
                                <Label>Item Image</Label>
                                {item.imageUrl ? (
                                  <div className="relative">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-32 h-32 object-cover rounded-lg"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-2 right-2"
                                      onClick={() => removeItemImage(categoryIndex, itemIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleItemImageUpload(categoryIndex, itemIndex, e)}
                                      className="flex-1"
                                    />
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMenuItem(categoryIndex, itemIndex)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Item
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => addMenuItem(categoryIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Menu Item
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={addCategory}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                )}
                <div className="mt-4">
                  <QRPreview 
                    url={type === 'direct' ? `http://localhost:3000/api/qrcodes/redirect/${encodeURIComponent(directUrl)}` : name ? `http://localhost:3000/api/qrcodes/preview/${name}` : ''}
                    color={foregroundColor}
                    bgColor={backgroundColor}
                    logoUrl={logoPreview || undefined}
                    textAbove={textAbove}
                    textBelow={textBelow}
                  />
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
                    ref={fileInputRef}
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
