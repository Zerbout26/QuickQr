import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Send, Globe, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { QRCode, QRCodeType } from '@/types';
import { qrCodeApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';

const API_BASE_URL = 'http://localhost:3000/api';

interface QRCodeEditorProps {
  qrCode: QRCode;
  onUpdated: (updatedQRCode: QRCode) => void;
}

interface MenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  availability: Record<string, boolean>;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface Link {
  label: string;
  url: string;
  type: 'website' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp' | 'telegram';
}

const defaultAvailability = {
  sunday: true,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
};

const QRCodeEditor: React.FC<QRCodeEditorProps> = ({ qrCode, onUpdated }) => {
  const [name, setName] = useState(qrCode.name);
  // Fix: Cast to a compatible type, ignoring 'direct' which isn't handled in the UI
  const [type, setType] = useState<'url' | 'menu' | 'both'>(
    qrCode.type === 'direct' ? 'url' : qrCode.type as 'url' | 'menu' | 'both'
  );
  const [links, setLinks] = useState<Link[]>(qrCode.links.map(link => ({ 
    ...link, 
    type: (link.type || 'website') as Link['type']
  })));
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(qrCode.menu?.categories || []);
  const [foregroundColor, setForegroundColor] = useState(qrCode.foregroundColor);
  const [backgroundColor, setBackgroundColor] = useState(qrCode.backgroundColor);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(qrCode.logoUrl);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
        description: "Image must be less than 2MB",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/qrcodes/upload/item-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setLogoUrl(data.imageUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to upload image',
      });
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
      const type = value as Link['type'];
      const label = getPlatformLabel(type);
      newLinks[index] = { 
        ...newLinks[index], 
        type,
        label,
        url: newLinks[index].url || getDefaultUrl(type)
      };
    } else if (field === 'label') {
      // Don't update the label if it's a platform type
      if (!Object.values(platformTypes).includes(newLinks[index].type)) {
        newLinks[index] = { ...newLinks[index], [field]: value };
      }
    } else {
      newLinks[index] = { ...newLinks[index], [field]: value };
    }
    setLinks(newLinks);
  };

  const platformTypes = {
    website: 'website',
    facebook: 'facebook',
    instagram: 'instagram',
    twitter: 'twitter',
    linkedin: 'linkedin',
    youtube: 'youtube',
    whatsapp: 'whatsapp',
    telegram: 'telegram'
  } as const;

  const getDefaultUrl = (type: Link['type']): string => {
    switch (type) {
      case 'facebook': return 'https://facebook.com/';
      case 'instagram': return 'https://instagram.com/';
      case 'twitter': return 'https://twitter.com/';
      case 'linkedin': return 'https://linkedin.com/in/';
      case 'youtube': return 'https://youtube.com/';
      case 'whatsapp': return 'https://wa.me/';
      case 'telegram': return 'https://t.me/';
      case 'website': return 'https://';
      default: return '';
    }
  };

  const getPlatformIcon = (type: Link['type']) => {
    switch (type) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'telegram': return <Send className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
    }
  };

  const getPlatformLabel = (type: string): string => {
    switch (type) {
      case 'facebook': return 'Follow us on Facebook';
      case 'instagram': return 'Follow us on Instagram';
      case 'twitter': return 'Follow us on Twitter';
      case 'linkedin': return 'Connect on LinkedIn';
      case 'youtube': return 'Subscribe on YouTube';
      case 'whatsapp': return 'Chat on WhatsApp';
      case 'telegram': return 'Join our Telegram';
      case 'website': return 'Visit our Website';
      default: return 'Visit Link';
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
      imageUrl: '',
      availability: { ...defaultAvailability },
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

  const handleMenuItemImageUpload = async (categoryIndex: number, itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
        description: "Image must be less than 2MB",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/qrcodes/upload/item-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      updateMenuItem(categoryIndex, itemIndex, 'imageUrl', data.imageUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to upload image',
      });
    }
  };

  const handleItemAvailabilityChange = (categoryIndex: number, itemIndex: number, day: string, checked: boolean) => {
    const newCategories = [...menuCategories];
    newCategories[categoryIndex].items[itemIndex].availability[day] = checked;
    setMenuCategories(newCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fix: Convert links array to proper format rather than stringifying
      const updatedQRCode = await qrCodeApi.update(qrCode.id, {
        name,
        type,
        foregroundColor,
        backgroundColor,
        logoUrl,
        links: links.map(link => ({
          label: link.label,
          url: link.url,
          type: link.type
        })),
        menu: {
          restaurantName: qrCode.menu?.restaurantName || '',
          description: qrCode.menu?.description || '',
          categories: menuCategories.map(category => ({
            name: category.name,
            items: category.items.map(item => ({
              name: item.name,
              description: item.description || '',
              price: Number(item.price) || 0,
              category: category.name,
              imageUrl: item.imageUrl,
              availability: item.availability || defaultAvailability
            }))
          }))
        },
      });

      onUpdated(updatedQRCode);
      toast({
        title: "Success",
        description: "QR code updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update QR code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label>QR Code Logo</Label>
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img src={logoUrl} alt="QR Code Logo" className="w-16 h-16 object-contain border rounded" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {logoUrl ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {(type === 'url' || type === 'both') && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Links</h3>
                  <Button type="button" onClick={addLink} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>

                {links.map((link, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-lg">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Platform</Label>
                        <Select
                          value={link.type}
                          onValueChange={(value) => updateLink(index, 'type', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getPlatformIcon(link.type)}
                                <span>{getPlatformLabel(link.type)}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="website">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <span>Website</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="facebook">
                              <div className="flex items-center gap-2">
                                <Facebook className="h-4 w-4" />
                                <span>Facebook</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="instagram">
                              <div className="flex items-center gap-2">
                                <Instagram className="h-4 w-4" />
                                <span>Instagram</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="twitter">
                              <div className="flex items-center gap-2">
                                <Twitter className="h-4 w-4" />
                                <span>Twitter</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="linkedin">
                              <div className="flex items-center gap-2">
                                <Linkedin className="h-4 w-4" />
                                <span>LinkedIn</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="youtube">
                              <div className="flex items-center gap-2">
                                <Youtube className="h-4 w-4" />
                                <span>YouTube</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="whatsapp">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                <span>WhatsApp</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="telegram">
                              <div className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                <span>Telegram</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Label"
                        value={link.label}
                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                      />
                      <Input
                        placeholder="URL"
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
                  </div>
                ))}
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

                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="space-y-2 border p-2 rounded">
                          <div className="flex items-center gap-4 mb-2">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => handleMenuItemImageUpload(categoryIndex, itemIndex, e as any);
                                input.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {item.imageUrl ? 'Change Image' : 'Add Image'}
                            </Button>
                          </div>
                          <Input
                            placeholder="Item Name"
                            value={item.name}
                            onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Description"
                            value={item.description || ''}
                            onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'description', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'price', parseFloat(e.target.value))}
                          />
                          <div className="space-y-2">
                            <Label>Availability</Label>
                            <div className="grid grid-cols-4 gap-2">
                              {Object.entries(item.availability || defaultAvailability).map(([day, isAvailable]) => (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-${categoryIndex}-${itemIndex}-${day}`}
                                    checked={isAvailable}
                                    onCheckedChange={(checked) => 
                                      handleItemAvailabilityChange(categoryIndex, itemIndex, day, checked === true)
                                    }
                                  />
                                  <label
                                    htmlFor={`edit-${categoryIndex}-${itemIndex}-${day}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                  </label>
                                </div>
                              ))}
                            </div>
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
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="foregroundColor">Foreground Color</Label>
              <Input
                id="foregroundColor"
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update QR Code'}
      </Button>
    </form>
  );
};

export default QRCodeEditor;
