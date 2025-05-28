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

const API_BASE_URL = 'https://quickqr-heyg.onrender.com/api';

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
  type: 'website' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp' | 'telegram' | 'tiktok' | 'other';
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

// Translations object
const translations = {
  en: {
    basic: "Basic",
    advanced: "Advanced",
    qrCodeLogo: "QR Code Logo",
    uploadLogo: "Upload Logo",
    changeLogo: "Change Logo",
    links: "Links",
    addLink: "Add Link",
    selectPlatform: "Select platform",
    website: "Website",
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "Twitter",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    other: "Other",
    foregroundColor: "Foreground Color",
    backgroundColor: "Background Color",
    logo: "Logo",
    saving: "Saving...",
    saveChanges: "Save Changes",
    success: "Success",
    error: "Error",
    imageUploaded: "Image uploaded successfully",
    failedToUpload: "Failed to upload image",
    invalidFileType: "Invalid file type",
    pleaseUploadImage: "Please upload an image file (PNG, JPG, etc.)",
    fileTooLarge: "File too large",
    imageMustBeLess: "Image must be less than 2MB",
    url: "URL",
    tiktok: "TikTok"
  },
  ar: {
    basic: "أساسي",
    advanced: "متقدم",
    qrCodeLogo: "شعار رمز QR",
    uploadLogo: "تحميل الشعار",
    changeLogo: "تغيير الشعار",
    links: "الروابط",
    addLink: "إضافة رابط",
    selectPlatform: "اختر المنصة",
    website: "موقع إلكتروني",
    facebook: "فيسبوك",
    instagram: "انستغرام",
    twitter: "تويتر",
    linkedin: "لينكد إن",
    youtube: "يوتيوب",
    whatsapp: "واتساب",
    telegram: "تيليجرام",
    other: "أخرى",
    foregroundColor: "لون المقدمة",
    backgroundColor: "لون الخلفية",
    logo: "الشعار",
    saving: "جاري الحفظ...",
    saveChanges: "حفظ التغييرات",
    success: "نجاح",
    error: "خطأ",
    imageUploaded: "تم تحميل الصورة بنجاح",
    failedToUpload: "فشل تحميل الصورة",
    invalidFileType: "نوع ملف غير صالح",
    pleaseUploadImage: "يرجى تحميل ملف صورة (PNG، JPG، إلخ)",
    fileTooLarge: "الملف كبير جداً",
    imageMustBeLess: "يجب أن يكون حجم الصورة أقل من 2 ميجابايت",
    url: "رابط",
    tiktok: "تيكتوك"
  }
};

const QRCodeEditor: React.FC<QRCodeEditorProps> = ({ qrCode, onUpdated }) => {
  const [name, setName] = useState(qrCode.name);
  const [type, setType] = useState<'url' | 'menu' | 'both'>(
    qrCode.type === 'direct' ? 'url' : qrCode.type as 'url' | 'menu' | 'both'
  );
  const allowedTypes = [
    'website', 'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'whatsapp', 'telegram', 'tiktok', 'other'
  ] as const;
  const [links, setLinks] = useState<Link[]>(
    (qrCode.links || []).map(link => ({
      ...link,
      type: allowedTypes.includes(link.type as any) ? link.type as Link['type'] : 'website'
    }))
  );
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(qrCode.menu?.categories || []);
  const [foregroundColor, setForegroundColor] = useState(qrCode.foregroundColor || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(qrCode.backgroundColor || '#FFFFFF');
  const [logoUrl, setLogoUrl] = useState<string | null>(qrCode.logoUrl || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(qrCode.logoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');
  const [tempImages, setTempImages] = useState<{ [key: string]: File }>({});

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
    telegram: 'telegram',
    tiktok: 'tiktok',
    other: 'other'
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
      case 'tiktok': return 'https://tiktok.com/';
      case 'other': return '';
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
      case 'tiktok': return <Globe className="h-4 w-4" />;
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
      case 'tiktok': return 'Follow us on TikTok';
      case 'other': return 'Visit Link';
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

    // Store the file temporarily
    const key = `menu-${categoryIndex}-${itemIndex}`;
    setTempImages(prev => ({ ...prev, [key]: file }));

    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    updateMenuItem(categoryIndex, itemIndex, 'imageUrl', tempUrl);
  };

  const removeItemImage = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...menuCategories];
    newCategories[categoryIndex].items[itemIndex].imageUrl = '';
    setMenuCategories(newCategories);
    
    // Remove from temp images if exists
    const key = `menu-${categoryIndex}-${itemIndex}`;
    setTempImages(prev => {
      const newTempImages = { ...prev };
      delete newTempImages[key];
      return newTempImages;
    });
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
      const formData = new FormData();
      formData.append('name', name);
      formData.append('type', type);
      formData.append('foregroundColor', foregroundColor);
      formData.append('backgroundColor', backgroundColor);
      
      if (type === 'url' || type === 'both') {
        formData.append('links', JSON.stringify(links));
      }
      
      if (type === 'menu' || type === 'both') {
        // First, create the menu data without image URLs
        const menuData = {
          restaurantName: name || 'My Restaurant',
          description: '',
          categories: menuCategories.map((category, categoryIndex) => ({
            name: category.name || 'Unnamed Category',
            items: category.items.map((item, itemIndex) => ({
              name: item.name || 'Unnamed Item',
              description: item.description || '',
              price: Number(item.price) || 0,
              category: category.name || 'Unnamed Category',
              imageUrl: item.imageUrl || '',
              availability: item.availability || defaultAvailability
            }))
          }))
        };

        formData.append('menu', JSON.stringify(menuData));

        // Then, upload each menu item image
        for (const [key, file] of Object.entries(tempImages)) {
          if (file instanceof File) {
            const [_, categoryIndex, itemIndex] = key.split('-').map(Number);
            const uniqueFilename = `${categoryIndex}-${itemIndex}-${Date.now()}-${file.name}`;
            formData.append('menuItemImages', file, uniqueFilename);
          }
        }
      }
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Use fetch directly for file upload
      const response = await fetch(`${API_BASE_URL}/qrcodes/${qrCode.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update QR code');
      }

      const updatedQRCode = await response.json();
      onUpdated(updatedQRCode);
      toast({
        title: "Success",
        description: "QR code updated successfully",
      });
    } catch (error) {
      console.error('Error updating QR code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update QR code',
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
            <TabsTrigger value="basic">{translations[menuLanguage].basic}</TabsTrigger>
            <TabsTrigger value="advanced">{translations[menuLanguage].advanced}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label>{translations[menuLanguage].qrCodeLogo}</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img src={logoPreview} alt="QR Code Logo" className="w-16 h-16 object-contain border rounded" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {logoPreview ? translations[menuLanguage].changeLogo : translations[menuLanguage].uploadLogo}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {(type === 'url' || type === 'both') && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{translations[menuLanguage].links}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLink}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {translations[menuLanguage].addLink}
                  </Button>
                </div>

                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={link.type || 'website'}
                        onValueChange={(value) => updateLink(index, 'type', value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={translations[menuLanguage].selectPlatform} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">{translations[menuLanguage].website}</SelectItem>
                          <SelectItem value="facebook">{translations[menuLanguage].facebook}</SelectItem>
                          <SelectItem value="instagram">{translations[menuLanguage].instagram}</SelectItem>
                          <SelectItem value="twitter">{translations[menuLanguage].twitter}</SelectItem>
                          <SelectItem value="linkedin">{translations[menuLanguage].linkedin}</SelectItem>
                          <SelectItem value="youtube">{translations[menuLanguage].youtube}</SelectItem>
                          <SelectItem value="tiktok">{translations[menuLanguage].tiktok}</SelectItem>
                          <SelectItem value="whatsapp">{translations[menuLanguage].whatsapp}</SelectItem>
                          <SelectItem value="telegram">{translations[menuLanguage].telegram}</SelectItem>
                          <SelectItem value="other">{translations[menuLanguage].other}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder={translations[menuLanguage].url}
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
                            onClick={() => removeItemImage(categoryIndex, itemIndex)}
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
              <Label htmlFor="foregroundColor">{translations[menuLanguage].foregroundColor}</Label>
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
              <Label htmlFor="backgroundColor">{translations[menuLanguage].backgroundColor}</Label>
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
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? translations[menuLanguage].saving : translations[menuLanguage].saveChanges}
        </Button>
      </div>
    </form>
  );
};

export default QRCodeEditor;
