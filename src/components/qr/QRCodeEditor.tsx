import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Send, Globe, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { QRCode, QRCodeType, MenuItem, MenuCategory, Link } from '@/types';
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
    tiktok: "TikTok",
    qrCodeUpdated: "QR code updated successfully",
    updateFailed: "Failed to update QR code"
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
    tiktok: "تيكتوك",
    qrCodeUpdated: "تم تحديث رمز QR بنجاح",
    updateFailed: "فشل تحديث رمز QR"
  }
};

const QRCodeEditor: React.FC<QRCodeEditorProps> = ({ qrCode, onUpdated }) => {
  type EditorQrType = 'url' | 'menu' | 'vitrine' | 'links' | 'both';
  const [name, setName] = useState(qrCode.name);
  const [type, setType] = useState<EditorQrType>(
    qrCode.type === 'direct' ? 'url' : (qrCode.type as EditorQrType)
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
  
  // Landing page colors
  const [primaryColor, setPrimaryColor] = useState(qrCode.primaryColor || '#8b5cf6');
  const [primaryHoverColor, setPrimaryHoverColor] = useState(qrCode.primaryHoverColor || '#7c3aed');
  const [accentColor, setAccentColor] = useState(qrCode.accentColor || '#ec4899');
  const [backgroundGradient, setBackgroundGradient] = useState(qrCode.backgroundGradient || 'linear-gradient(to bottom right, #8b5cf620, white, #ec489920)');
  const [loadingSpinnerColor, setLoadingSpinnerColor] = useState(qrCode.loadingSpinnerColor || '#8b5cf6');
  const [loadingSpinnerBorderColor, setLoadingSpinnerBorderColor] = useState(qrCode.loadingSpinnerBorderColor || 'rgba(139, 92, 246, 0.2)');

  // Vitrine state
  const [vitrine, setVitrine] = useState(() => {
    if (qrCode.vitrine) {
      // Convert old format to new format if needed
      const existingVitrine = qrCode.vitrine;
      const oldFormatHero = existingVitrine.hero as any; // Type assertion for old format
      return {
        hero: {
          businessName: existingVitrine.hero?.businessName || '',
          tagline: existingVitrine.hero?.tagline || '',
          ctas: existingVitrine.hero?.ctas || 
                (oldFormatHero?.cta ? [{
                  text: oldFormatHero.cta.text || '',
                  link: oldFormatHero.cta.link || '',
                  type: 'primary'
                }] : [{
                  text: '',
                  link: '',
                  type: 'primary'
                }])
        },
        about: {
          description: existingVitrine.about?.description || '',
          city: existingVitrine.about?.city || ''
        },
        services: existingVitrine.services || [],
        gallery: existingVitrine.gallery || [],
        testimonials: existingVitrine.testimonials || [],
        contact: {
          phone: existingVitrine.contact?.phone || '',
          email: existingVitrine.contact?.email || '',
          address: existingVitrine.contact?.address || '',
          socialMedia: {
            facebook: existingVitrine.contact?.socialMedia?.facebook || '',
            instagram: existingVitrine.contact?.socialMedia?.instagram || '',
            twitter: existingVitrine.contact?.socialMedia?.twitter || '',
            linkedin: existingVitrine.contact?.socialMedia?.linkedin || '',
            youtube: existingVitrine.contact?.socialMedia?.youtube || '',
            tiktok: existingVitrine.contact?.socialMedia?.tiktok || ''
          }
        },
        footer: {
          copyright: existingVitrine.footer?.copyright || '',
          businessName: existingVitrine.footer?.businessName || '',
          quickLinks: existingVitrine.footer?.quickLinks || [],
          socialIcons: {
            facebook: existingVitrine.footer?.socialIcons?.facebook || '',
            instagram: existingVitrine.footer?.socialIcons?.instagram || '',
            twitter: existingVitrine.footer?.socialIcons?.twitter || '',
            linkedin: existingVitrine.footer?.socialIcons?.linkedin || '',
            youtube: existingVitrine.footer?.socialIcons?.youtube || '',
            tiktok: existingVitrine.footer?.socialIcons?.tiktok || ''
          }
        }
      };
    }
    return {
      hero: {
        businessName: '',
        tagline: '',
        ctas: [{
          text: '',
          link: '',
          type: 'primary'
        }]
      },
      about: {
        description: '',
        city: ''
      },
      services: [],
      gallery: [],
      testimonials: [],
      contact: {
        phone: '',
        email: '',
        address: '',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
          youtube: '',
          tiktok: ''
        }
      },
      footer: {
        copyright: '',
        businessName: '',
        quickLinks: [],
        socialIcons: {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
          youtube: '',
          tiktok: ''
        }
      }
    };
  });

  // Vitrine handlers
  const updateVitrineSection = (section: keyof typeof vitrine, value: any) => {
    setVitrine(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const addVitrineItem = (section: 'services' | 'gallery' | 'testimonials', item: any) => {
    setVitrine(prev => ({
      ...prev,
      [section]: [...prev[section], item]
    }));
  };

  const removeVitrineItem = (section: 'services' | 'gallery' | 'testimonials', index: number) => {
    setVitrine(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const updateVitrineItem = (section: 'services' | 'gallery' | 'testimonials', index: number, field: string, value: any) => {
    setVitrine(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleVitrineImageUpload = async (section: 'services' | 'gallery', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
        toast({
            variant: "destructive",
            title: translations[menuLanguage].invalidFileType,
            description: translations[menuLanguage].pleaseUploadImage,
        });
        return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        toast({
            variant: "destructive",
            title: translations[menuLanguage].fileTooLarge,
            description: translations[menuLanguage].imageMustBeLess,
        });
        return;
    }

    // Store the file temporarily with the correct key format
    const key = `${section}-${index}-${Date.now()}-${file.name}`;
    setTempImages(prev => ({ ...prev, [key]: file }));

    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    updateVitrineItem(section, index, 'imageUrl', tempUrl);
  };

  const removeVitrineImage = (section: 'services' | 'gallery', index: number) => {
    updateVitrineItem(section, index, 'imageUrl', '');
    
    // Remove from temp images if exists
    const key = `${section}-${index}`;
    setTempImages(prev => {
        const newTempImages = { ...prev };
        delete newTempImages[key];
        return newTempImages;
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: translations[menuLanguage].invalidFileType,
        description: translations[menuLanguage].pleaseUploadImage,
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: translations[menuLanguage].fileTooLarge,
        description: translations[menuLanguage].imageMustBeLess,
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
    const item = newCategories[categoryIndex].items[itemIndex];

    let processedValue = value;
    if (field === 'price') {
      processedValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(processedValue as number)) {
        processedValue = 0;
      }
    }

    newCategories[categoryIndex].items[itemIndex] = {
      ...item,
      [field]: processedValue,
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
        title: translations[menuLanguage].invalidFileType,
        description: translations[menuLanguage].pleaseUploadImage,
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: translations[menuLanguage].fileTooLarge,
        description: translations[menuLanguage].imageMustBeLess,
      });
      return;
    }

    // Store the file temporarily with a unique key
    const key = `menu-${categoryIndex}-${itemIndex}-${Date.now()}`;
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

  // Add CTA handler
  const addCTA = () => {
    setVitrine(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        ctas: [...prev.hero.ctas, { text: '', link: '', type: 'website' }]
      }
    }));
  };

  // Remove CTA handler
  const removeCTA = (index: number) => {
    setVitrine(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        ctas: prev.hero.ctas.filter((_, i) => i !== index)
      }
    }));
  };

  // Update CTA handler
  const updateCTA = (index: number, field: 'text' | 'link' | 'type', value: string) => {
    setVitrine(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        ctas: prev.hero.ctas.map((cta, i) => 
          i === index ? { ...cta, [field]: value } : cta
        )
      }
    }));
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
        formData.append('primaryColor', primaryColor);
        formData.append('primaryHoverColor', primaryHoverColor);
        formData.append('accentColor', accentColor);
        formData.append('backgroundGradient', backgroundGradient);
        formData.append('loadingSpinnerColor', loadingSpinnerColor);
        formData.append('loadingSpinnerBorderColor', loadingSpinnerBorderColor);

        if (type === 'url' || type === 'both') {
            formData.append('links', JSON.stringify(links));
        }

        if (type === 'menu' || type === 'both') {
            formData.append('menu', JSON.stringify({
                categories: menuCategories
            }));

            // Handle menu item images
            for (const [key, file] of Object.entries(tempImages)) {
                if (file instanceof File) {
                    const [_, categoryIndex, itemIndex] = key.split('-').map(Number);
                    const uniqueFilename = `${categoryIndex}-${itemIndex}-${Date.now()}-${file.name}`;
                    formData.append('menuItemImages', file, uniqueFilename);
                }
            }
        }

        if (type === 'vitrine') {
            // Only append vitrine data if it's not empty
            if (vitrine && Object.keys(vitrine).length > 0) {
                // Create a copy of vitrine data
                const cleanedVitrine = {
                    ...vitrine,
                    services: vitrine.services.map(service => ({
                        ...service,
                        // Keep existing Cloudinary URLs, only clear blob URLs
                        imageUrl: service.imageUrl?.startsWith('blob:') ? '' : service.imageUrl
                    })),
                    gallery: vitrine.gallery.map(item => ({
                        ...item,
                        // Keep existing Cloudinary URLs, only clear blob URLs
                        imageUrl: item.imageUrl?.startsWith('blob:') ? '' : item.imageUrl
                    }))
                };
                
                formData.append('vitrine', JSON.stringify(cleanedVitrine));

                // Handle vitrine images with correct key format
                for (const [key, file] of Object.entries(tempImages)) {
                    if (file instanceof File) {
                        formData.append('vitrineImages', file, key);
                    }
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
            title: translations[menuLanguage].success,
            description: translations[menuLanguage].qrCodeUpdated,
        });
    } catch (error) {
        console.error('Error updating QR code:', error);
        toast({
            variant: "destructive",
            title: translations[menuLanguage].error,
            description: error instanceof Error ? error.message : translations[menuLanguage].updateFailed,
        });
    } finally {
        setIsLoading(false);
    }
};

  const renderHeroSection = () => (
    <div className="space-y-4 border p-4 rounded-lg">
      <h3 className="text-lg font-medium">Hero Section</h3>
      <div className="space-y-2">
        <Label>Business Name</Label>
        <Input
          value={vitrine.hero.businessName}
          onChange={(e) => updateVitrineSection('hero', { ...vitrine.hero, businessName: e.target.value })}
          placeholder="Enter business name"
        />
      </div>
      <div className="space-y-2">
        <Label>Tagline</Label>
        <Input
          value={vitrine.hero.tagline}
          onChange={(e) => updateVitrineSection('hero', { ...vitrine.hero, tagline: e.target.value })}
          placeholder="Enter tagline"
        />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Call to Action Buttons</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCTA}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add CTA
          </Button>
        </div>
        {vitrine.hero.ctas.map((cta, index) => (
          <div key={index} className="space-y-2 border p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <Label>CTA {index + 1}</Label>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeCTA(index)}
                disabled={vitrine.hero.ctas.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={cta.text}
              onChange={(e) => updateCTA(index, 'text', e.target.value)}
              placeholder="Enter CTA text"
            />
            <div className="flex gap-2">
              <Select
                value={cta.type || 'website'}
                onValueChange={(value) => updateCTA(index, 'type', value)}
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
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={cta.link}
                onChange={(e) => updateCTA(index, 'link', e.target.value)}
                placeholder="Enter CTA link"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
            <Button
              type="button"
              variant={type === 'vitrine' ? 'default' : 'outline'}
              onClick={() => setType('vitrine')}
              className="flex-1"
            >
              Vitrine
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
                            placeholder="Price"
                            type="number"
                            value={item.price}
                            onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'price', e.target.value)}
                          />
                          <div className="space-y-1">
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

            {type === 'vitrine' && (
              <div className="space-y-6">
                {renderHeroSection()}

                {/* About Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <h3 className="text-lg font-medium">About Section</h3>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea
                      value={vitrine.about.description}
                      onChange={(e) => updateVitrineSection('about', { ...vitrine.about, description: e.target.value })}
                      placeholder="Enter description"
                      className="w-full min-h-[100px] p-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={vitrine.about.city}
                      onChange={(e) => updateVitrineSection('about', { ...vitrine.about, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                </div>

                {/* Services Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Services</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addVitrineItem('services', { name: '', description: '', imageUrl: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {vitrine.services.map((service, index) => (
                      <div key={index} className="space-y-2 border p-4 rounded">
                        <div className="flex items-center gap-4 mb-2">
                          {service.imageUrl && (
                            <img src={service.imageUrl} alt={service.name} className="w-16 h-16 object-cover rounded" />
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => handleVitrineImageUpload('services', index, e as any);
                              input.click();
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {service.imageUrl ? 'Change Image' : 'Add Image'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeVitrineImage('services', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Service Name"
                          value={service.name}
                          onChange={(e) => updateVitrineItem('services', index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Description"
                          value={service.description || ''}
                          onChange={(e) => updateVitrineItem('services', index, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gallery Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Gallery</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addVitrineItem('gallery', { imageUrl: '', title: '', description: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {vitrine.gallery.map((item, index) => (
                      <div key={index} className="space-y-2 border p-4 rounded">
                        <div className="flex items-center gap-4 mb-2">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded" />
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => handleVitrineImageUpload('gallery', index, e as any);
                              input.click();
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {item.imageUrl ? 'Change Image' : 'Add Image'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeVitrineImage('gallery', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Title"
                          value={item.title || ''}
                          onChange={(e) => updateVitrineItem('gallery', index, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="Description"
                          value={item.description || ''}
                          onChange={(e) => updateVitrineItem('gallery', index, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Testimonials</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addVitrineItem('testimonials', { text: '', author: '', city: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Testimonial
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {vitrine.testimonials.map((testimonial, index) => (
                      <div key={index} className="space-y-2 border p-4 rounded">
                        <textarea
                          placeholder="Testimonial Text"
                          value={testimonial.text}
                          onChange={(e) => updateVitrineItem('testimonials', index, 'text', e.target.value)}
                          className="w-full min-h-[100px] p-2 border rounded-md"
                        />
                        <Input
                          placeholder="Author Name"
                          value={testimonial.author}
                          onChange={(e) => updateVitrineItem('testimonials', index, 'author', e.target.value)}
                        />
                        <Input
                          placeholder="City"
                          value={testimonial.city || ''}
                          onChange={(e) => updateVitrineItem('testimonials', index, 'city', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeVitrineItem('testimonials', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={vitrine.contact.phone}
                      onChange={(e) => updateVitrineSection('contact', { ...vitrine.contact, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={vitrine.contact.email}
                      onChange={(e) => updateVitrineSection('contact', { ...vitrine.contact, email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={vitrine.contact.address || ''}
                      onChange={(e) => updateVitrineSection('contact', { ...vitrine.contact, address: e.target.value })}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Social Media</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={vitrine.contact.socialMedia.facebook || ''}
                        onChange={(e) => updateVitrineSection('contact', {
                          ...vitrine.contact,
                          socialMedia: { ...vitrine.contact.socialMedia, facebook: e.target.value }
                        })}
                        placeholder="Facebook URL"
                      />
                      <Input
                        value={vitrine.contact.socialMedia.instagram || ''}
                        onChange={(e) => updateVitrineSection('contact', {
                          ...vitrine.contact,
                          socialMedia: { ...vitrine.contact.socialMedia, instagram: e.target.value }
                        })}
                        placeholder="Instagram URL"
                      />
                      <Input
                        value={vitrine.contact.socialMedia.twitter || ''}
                        onChange={(e) => updateVitrineSection('contact', {
                          ...vitrine.contact,
                          socialMedia: { ...vitrine.contact.socialMedia, twitter: e.target.value }
                        })}
                        placeholder="Twitter URL"
                      />
                      <Input
                        value={vitrine.contact.socialMedia.linkedin || ''}
                        onChange={(e) => updateVitrineSection('contact', {
                          ...vitrine.contact,
                          socialMedia: { ...vitrine.contact.socialMedia, linkedin: e.target.value }
                        })}
                        placeholder="LinkedIn URL"
                      />
                      <Input
                        value={vitrine.contact.socialMedia.youtube || ''}
                        onChange={(e) => updateVitrineSection('contact', {
                          ...vitrine.contact,
                          socialMedia: { ...vitrine.contact.socialMedia, youtube: e.target.value }
                        })}
                        placeholder="YouTube URL"
                      />
                      <Input
                        value={vitrine.contact.socialMedia.tiktok || ''}
                        onChange={(e) => updateVitrineSection('contact', {
                          ...vitrine.contact,
                          socialMedia: { ...vitrine.contact.socialMedia, tiktok: e.target.value }
                        })}
                        placeholder="TikTok URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <h3 className="text-lg font-medium">Footer</h3>
                  <div className="space-y-2">
                    <Label>Copyright Text</Label>
                    <Input
                      value={vitrine.footer.copyright}
                      onChange={(e) => updateVitrineSection('footer', { ...vitrine.footer, copyright: e.target.value })}
                      placeholder="Enter copyright text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input
                      value={vitrine.footer.businessName}
                      onChange={(e) => updateVitrineSection('footer', { ...vitrine.footer, businessName: e.target.value })}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quick Links</Label>
                    <div className="space-y-2">
                      {vitrine.footer.quickLinks.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Link Label"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...vitrine.footer.quickLinks];
                              newLinks[index] = { ...link, label: e.target.value };
                              updateVitrineSection('footer', { ...vitrine.footer, quickLinks: newLinks });
                            }}
                          />
                          <Input
                            placeholder="Link URL"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...vitrine.footer.quickLinks];
                              newLinks[index] = { ...link, url: e.target.value };
                              updateVitrineSection('footer', { ...vitrine.footer, quickLinks: newLinks });
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newLinks = vitrine.footer.quickLinks.filter((_, i) => i !== index);
                              updateVitrineSection('footer', { ...vitrine.footer, quickLinks: newLinks });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newLinks = [...vitrine.footer.quickLinks, { label: '', url: '' }];
                          updateVitrineSection('footer', { ...vitrine.footer, quickLinks: newLinks });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Quick Link
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Social Media Icons</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={vitrine.footer.socialIcons.facebook || ''}
                        onChange={(e) => updateVitrineSection('footer', {
                          ...vitrine.footer,
                          socialIcons: { ...vitrine.footer.socialIcons, facebook: e.target.value }
                        })}
                        placeholder="Facebook URL"
                      />
                      <Input
                        value={vitrine.footer.socialIcons.instagram || ''}
                        onChange={(e) => updateVitrineSection('footer', {
                          ...vitrine.footer,
                          socialIcons: { ...vitrine.footer.socialIcons, instagram: e.target.value }
                        })}
                        placeholder="Instagram URL"
                      />
                      <Input
                        value={vitrine.footer.socialIcons.twitter || ''}
                        onChange={(e) => updateVitrineSection('footer', {
                          ...vitrine.footer,
                          socialIcons: { ...vitrine.footer.socialIcons, twitter: e.target.value }
                        })}
                        placeholder="Twitter URL"
                      />
                      <Input
                        value={vitrine.footer.socialIcons.linkedin || ''}
                        onChange={(e) => updateVitrineSection('footer', {
                          ...vitrine.footer,
                          socialIcons: { ...vitrine.footer.socialIcons, linkedin: e.target.value }
                        })}
                        placeholder="LinkedIn URL"
                      />
                      <Input
                        value={vitrine.footer.socialIcons.youtube || ''}
                        onChange={(e) => updateVitrineSection('footer', {
                          ...vitrine.footer,
                          socialIcons: { ...vitrine.footer.socialIcons, youtube: e.target.value }
                        })}
                        placeholder="YouTube URL"
                      />
                      <Input
                        value={vitrine.footer.socialIcons.tiktok || ''}
                        onChange={(e) => updateVitrineSection('footer', {
                          ...vitrine.footer,
                          socialIcons: { ...vitrine.footer.socialIcons, tiktok: e.target.value }
                        })}
                        placeholder="TikTok URL"
                      />
                    </div>
                  </div>
                </div>
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
            
            {/* Landing Page Colors */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Landing Page Colors</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primaryHoverColor">Primary Hover Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryHoverColor"
                      type="color"
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backgroundGradient">Background Gradient</Label>
                  <Input
                    id="backgroundGradient"
                    value={backgroundGradient}
                    onChange={(e) => setBackgroundGradient(e.target.value)}
                    placeholder="linear-gradient(to bottom right, #8b5cf620, white, #ec489920)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loadingSpinnerColor">Loading Spinner Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="loadingSpinnerColor"
                      type="color"
                      value={loadingSpinnerColor}
                      onChange={(e) => setLoadingSpinnerColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={loadingSpinnerColor}
                      onChange={(e) => setLoadingSpinnerColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loadingSpinnerBorderColor">Loading Spinner Border Color</Label>
                  <Input
                    id="loadingSpinnerBorderColor"
                    value={loadingSpinnerBorderColor}
                    onChange={(e) => setLoadingSpinnerBorderColor(e.target.value)}
                    placeholder="rgba(139, 92, 246, 0.2)"
                  />
                </div>
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
