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
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = 'http://localhost:3000/api';

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
  const [type, setType] = useState<'url' | 'menu' | 'both'>('url');
  const [links, setLinks] = useState<Link[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create QR codes');
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
      
      if (type === 'url' || type === 'both') {
        formData.append('links', JSON.stringify(links));
      }
      
      if (type === 'menu' || type === 'both') {
        formData.append('menu', JSON.stringify({
          restaurantName: name,
          categories: menuCategories,
        }));
      }
      
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
                  </div>
                </div>
                {(type === 'url' || type === 'both') && (
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
