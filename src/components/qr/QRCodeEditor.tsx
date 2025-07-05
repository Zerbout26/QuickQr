import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Send, Globe, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { QRCode, QRCodeType, MenuItem, MenuCategory, Link, Variant, VariantOption } from '@/types';
import { qrCodeApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/LanguageContext';

const API_BASE_URL = 'https://quickqr-heyg.onrender.com/api';

interface QRCodeEditorProps {
  qrCode: QRCode;
  onUpdated: (updatedQRCode: QRCode) => void;
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
    updateFailed: "Failed to update QR code",
    orderableMenuToggle: "Enable Orderable Menu",
    codFormToggle: "Enable COD Form"
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
    updateFailed: "فشل تحديث رمز QR",
    orderableMenuToggle: "تفعيل قائمة الطلبات",
    codFormToggle: "تفعيل نموذج الدفع عند الاستلام"
  }
};

const QRCodeEditor: React.FC<QRCodeEditorProps> = ({ qrCode, onUpdated }) => {
  const { language } = useLanguage();
  type EditorQrType = 'url' | 'menu' | 'vitrine' | 'links' | 'both' | 'products';
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
      type: allowedTypes.includes(link.type as any) ? link.type : 'website'
    }))
  );
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(
    (qrCode.menu?.categories || []).map(category => ({
      ...category,
      items: category.items.map(item => {
        let images = item.images;
        if (!images || images.length === 0) {
          if (item.imageUrl) {
            images = [item.imageUrl];
          } else {
            images = [];
          }
        }
        return { ...item, images };
      })
    }))
  );
  const [products, setProducts] = useState<MenuItem[]>(qrCode.products?.products || []);
  const [foregroundColor, setForegroundColor] = useState(qrCode.foregroundColor || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(qrCode.backgroundColor || '#FFFFFF');
  const [logoUrl, setLogoUrl] = useState<string | null>(qrCode.logoUrl || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(qrCode.logoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImages, setTempImages] = useState<{ [key: string]: File }>({});
  
  // Landing page colors
  const [primaryColor, setPrimaryColor] = useState(qrCode.primaryColor || '#3b82f6');
  const [primaryHoverColor, setPrimaryHoverColor] = useState(qrCode.primaryHoverColor || '#2563eb');
  const [accentColor, setAccentColor] = useState(qrCode.accentColor || '#64748b');
  const [backgroundGradient, setBackgroundGradient] = useState(qrCode.backgroundGradient || 'linear-gradient(to bottom right, #3b82f620, white, #64748b20)');
  const [loadingSpinnerColor, setLoadingSpinnerColor] = useState(qrCode.loadingSpinnerColor || '#3b82f6');
  const [loadingSpinnerBorderColor, setLoadingSpinnerBorderColor] = useState(qrCode.loadingSpinnerBorderColor || 'rgba(59, 130, 246, 0.2)');

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
        services: (existingVitrine.services || []).map(service => {
          let images = service.images;
          const legacyImageUrl = (service as any).imageUrl;
          if (!images || images.length === 0) {
            if (legacyImageUrl) {
              images = [legacyImageUrl];
            } else {
              images = [];
            }
          }
          return { ...service, images };
        }),
        gallery: (existingVitrine.gallery || []).map(item => {
          let images = item.images;
          const legacyImageUrl = (item as any).imageUrl;
          if (!images || images.length === 0) {
            if (legacyImageUrl) {
              images = [legacyImageUrl];
            } else {
              images = [];
            }
          }
          return { ...item, images };
        }),
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
            title: translations[language].invalidFileType,
            description: translations[language].pleaseUploadImage,
        });
        return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        toast({
            variant: "destructive",
            title: translations[language].fileTooLarge,
            description: translations[language].imageMustBeLess,
        });
        return;
    }

    // Store the file temporarily with the correct key format
    const key = `${section}-${index}-${Date.now()}-${file.name}`;
    setTempImages(prev => ({ ...prev, [key]: file }));

    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    
    if (section === 'services') {
      // For services, update the images array
      const currentService = vitrine.services[index];
      const updatedImages = [...(currentService.images || []), tempUrl];
      updateVitrineItem(section, index, 'images', updatedImages);
    } else {
      // For gallery, update the images array
      const currentGalleryItem = vitrine.gallery[index];
      const updatedImages = [...(currentGalleryItem.images || []), tempUrl];
      updateVitrineItem(section, index, 'images', updatedImages);
    }
  };

  const removeVitrineImage = (section: 'services' | 'gallery', index: number) => {
    if (section === 'services') {
      // For services, clear the images array
      updateVitrineItem(section, index, 'images', []);
    } else {
      // For gallery, clear the images array
      updateVitrineItem(section, index, 'images', []);
    }
    
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
        title: translations[language].invalidFileType,
        description: translations[language].pleaseUploadImage,
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: translations[language].fileTooLarge,
        description: translations[language].imageMustBeLess,
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
    setLinks([...links, { label: '', url: '', type: 'website' as const }]);
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
      if (!Object.values(platformTypes).includes(newLinks[index].type as any)) {
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

  const getPlatformLabel = (type: Link['type']): string => {
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
      images: [],
      availability: { ...defaultAvailability },
    });
    setMenuCategories(newCategories);
  };

  const removeMenuItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...menuCategories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setMenuCategories(newCategories);
  };

  const updateMenuItem = (categoryIndex: number, itemIndex: number, field: keyof MenuItem, value: string | number | Variant[] | string[]) => {
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

  const handleItemAvailabilityChange = (categoryIndex: number, itemIndex: number, day: string, checked: boolean) => {
    const newCategories = [...menuCategories];
    newCategories[categoryIndex].items[itemIndex].availability[day] = checked;
    setMenuCategories(newCategories);
  };

  // Products management functions
  const addProduct = () => {
    setProducts([...products, {
      name: '',
      description: '',
      price: 0,
      images: [],
      availability: { ...defaultAvailability },
    }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (
    index: number,
    field: keyof MenuItem,
    value: string | number | Variant[] | string[]
  ) => {
    const newProducts = [...products];
    const product = newProducts[index];
    let processedValue = value;
    if (field === 'price') {
      processedValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(processedValue as number)) {
        processedValue = 0;
      }
    }
    newProducts[index] = {
      ...product,
      [field]: processedValue,
    };
    setProducts(newProducts);
  };

  const handleProductAvailabilityChange = (index: number, day: string, checked: boolean) => {
    const updatedProducts = [...products];
    updatedProducts[index].availability[day] = checked;
    setProducts(updatedProducts);
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

  // Add state for menuOrderable
  const [menuOrderable, setMenuOrderable] = useState(qrCode.menu?.orderable ?? false);
  const [codFormEnabled, setCodFormEnabled] = useState(qrCode.menu?.codFormEnabled ?? false);

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
        formData.append('loadingSpinnerColor', loadingSpinnerColor);
        formData.append('loadingSpinnerBorderColor', loadingSpinnerBorderColor);

        if (type === 'url' || type === 'both') {
            formData.append('links', JSON.stringify(links));
        }

        if (type === 'menu' || type === 'both') {
            // Create a copy of menu data, preserving existing Cloudinary URLs
            const cleanedCategories = menuCategories.map(category => ({
                ...category,
                items: category.items.map(item => ({
                    ...item,
                    // Keep existing Cloudinary URLs, only clear blob URLs
                    images: item.images?.filter(img => !img.startsWith('blob:')) || []
                }))
            }));

            formData.append('menu', JSON.stringify({
                categories: cleanedCategories,
                orderable: menuOrderable,
                codFormEnabled: codFormEnabled
            }));

            // Handle menu item images
            for (const [key, file] of Object.entries(tempImages)) {
                if (file instanceof File && key.startsWith('menu-')) {
                    const [_, categoryIndex, itemIndex, imageIndex] = key.split('-').map(Number);
                    const uniqueFilename = `menu-${categoryIndex}-${itemIndex}-${imageIndex}-${Date.now()}-${file.name}`;
                    formData.append('menuItemImages', file, uniqueFilename);
                }
            }
        }

        if (type === 'products') {
            // Create a copy of products data, preserving existing Cloudinary URLs
            const cleanedProducts = products.map(product => ({
                ...product,
                // Keep existing Cloudinary URLs, only clear blob URLs
                images: product.images?.filter(img => !img.startsWith('blob:')) || []
            }));

            formData.append('products', JSON.stringify({
                storeName: name || 'My Product Store',
                description: '',
                products: cleanedProducts,
                orderable: true,
                codFormEnabled: true
            }));

            // Handle product images
            for (const [key, file] of Object.entries(tempImages)) {
                if (file instanceof File && key.startsWith('product-')) {
                    const [_, productIndex, imageIndex] = key.split('-').map(Number);
                    const uniqueFilename = `product-${productIndex}-${imageIndex}-${Date.now()}-${file.name}`;
                    formData.append('productImages', file, uniqueFilename);
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
                        images: service.images?.filter(img => !img.startsWith('blob:')) || []
                    })),
                    gallery: vitrine.gallery.map(item => ({
                        ...item,
                        // Keep existing Cloudinary URLs, only clear blob URLs
                        images: item.images?.filter(img => !img.startsWith('blob:')) || []
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
            title: translations[language].success,
            description: translations[language].qrCodeUpdated,
        });
    } catch (error) {
        console.error('Error updating QR code:', error);
        toast({
            variant: "destructive",
            title: translations[language].error,
            description: error instanceof Error ? error.message : translations[language].updateFailed,
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
                value={cta.type}
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
    <div className="w-full p-2 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-medium">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 px-4 py-3 text-base"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="type" className="text-base font-medium">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as EditorQrType)}>
              <SelectTrigger className="h-12 px-4 py-3 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">Direct URL</SelectItem>
                <SelectItem value="menu">Menu</SelectItem>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="vitrine">Vitrine</SelectItem>
                <SelectItem value="links">Links</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="basic" className="text-base">{translations[language].basic}</TabsTrigger>
              <TabsTrigger value="advanced" className="text-base">{translations[language].advanced}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">{translations[language].qrCodeLogo}</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {logoPreview && (
                    <img src={logoPreview} alt="QR Code Logo" className="w-16 h-16 object-contain border rounded" />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto py-3 h-12 text-base"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? translations[language].changeLogo : translations[language].uploadLogo}
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="text-lg font-medium">{translations[language].links}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLink}
                      className="w-full sm:w-auto py-3 h-12 text-base"
                    >
                      <Plus className="h-4 w-4" />
                      {translations[language].addLink}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {links.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2">
                        <Select
                          value={link.type}
                          onValueChange={(value) => updateLink(index, 'type', value)}
                        >
                          <SelectTrigger className="w-full sm:w-[180px] h-12">
                            <SelectValue placeholder={translations[language].selectPlatform} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="website">{translations[language].website}</SelectItem>
                            <SelectItem value="facebook">{translations[language].facebook}</SelectItem>
                            <SelectItem value="instagram">{translations[language].instagram}</SelectItem>
                            <SelectItem value="twitter">{translations[language].twitter}</SelectItem>
                            <SelectItem value="linkedin">{translations[language].linkedin}</SelectItem>
                            <SelectItem value="youtube">{translations[language].youtube}</SelectItem>
                            <SelectItem value="tiktok">{translations[language].tiktok}</SelectItem>
                            <SelectItem value="whatsapp">{translations[language].whatsapp}</SelectItem>
                            <SelectItem value="telegram">{translations[language].telegram}</SelectItem>
                            <SelectItem value="other">{translations[language].other}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder={translations[language].url}
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          className="flex-1 h-12 px-4 py-3"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeLink(index)}
                          className="h-12 w-12"
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
                  {/* Menu Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={menuOrderable}
                        onCheckedChange={setMenuOrderable}
                        id="orderable-menu-toggle"
                      />
                      <Label htmlFor="orderable-menu-toggle" className="text-base">{translations[language].orderableMenuToggle}</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={codFormEnabled}
                        onCheckedChange={setCodFormEnabled}
                        id="cod-form-toggle"
                      />
                      <Label htmlFor="cod-form-toggle" className="text-base">{translations[language].codFormToggle}</Label>
                    </div>
                  </div>

                  {/* Menu Categories */}
                  <div className="space-y-4">
                    {menuCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="space-y-3 border p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <Input
                            placeholder="Category Name"
                            value={category.name}
                            onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                            className="flex-1 h-12 px-4 py-3"
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeCategory(categoryIndex)}
                            className="h-12 w-12"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-3 mt-4">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="space-y-3 border p-3 rounded">
                              <Input
                                placeholder="Item Name"
                                value={item.name}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'name', e.target.value)}
                                className="h-12 px-4 py-3"
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                              />
                              <Input
                                placeholder="Description"
                                value={item.description || ''}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'description', e.target.value)}
                                className="h-12 px-4 py-3"
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                              />
                              <Input
                                placeholder="Price"
                                type="number"
                                value={item.price}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'price', e.target.value)}
                                className="h-12 px-4 py-3"
                              />
                              
                              {/* Image Upload Section */}
                              <div className="space-y-2">
                                <Label className="text-base font-medium">Images</Label>
                                <div className="flex gap-2 flex-wrap mb-2">
                                  {(item.images || []).map((imgUrl, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <img src={imgUrl} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                                      <button
                                        type="button"
                                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-xs text-red-500 opacity-80 group-hover:opacity-100"
                                        onClick={() => {
                                          const newImages = [...(item.images || [])];
                                          newImages.splice(imgIdx, 1);
                                          updateMenuItem(categoryIndex, itemIndex, 'images', newImages);
                                          
                                          // Remove corresponding file from tempImages
                                          const key = `menu-${categoryIndex}-${itemIndex}-${imgIdx}`;
                                          if (tempImages[key]) {
                                            const newTempImages = { ...tempImages };
                                            delete newTempImages[key];
                                            setTempImages(newTempImages);
                                          }
                                        }}
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.multiple = true;
                                      input.onchange = (e) => {
                                        const files = Array.from((e.target as HTMLInputElement).files || []);
                                        const newImages = [...(item.images || [])];
                                        files.forEach((file, fileIndex) => {
                                          // Store file in tempImages for upload
                                          const key = `menu-${categoryIndex}-${itemIndex}-${newImages.length + fileIndex}`;
                                          setTempImages(prev => ({ ...prev, [key]: file }));
                                          // Create temporary URL for preview
                                          const url = URL.createObjectURL(file);
                                          newImages.push(url);
                                        });
                                        updateMenuItem(categoryIndex, itemIndex, 'images', newImages);
                                      };
                                      input.click();
                                    }}
                                    className="h-12 px-4 py-3"
                                  >
                                    + Add Image
                                  </Button>
                                </div>
                              </div>
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMenuItem(categoryIndex, itemIndex)}
                                className="w-full sm:w-auto py-3 h-12"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Item
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full py-4 h-14"
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
                      className="w-full py-4 h-14"
                      onClick={addCategory}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </div>
              )}

              {type === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="text-lg font-semibold">Product Showcase</h3>
                    <p className="text-sm text-gray-600">E-commerce enabled by default</p>
                  </div>
                  
                  {products.map((product, productIndex) => (
                    <div key={productIndex} className="space-y-3 border p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                        <div className="space-y-2 w-full">
                          <Label className="text-base font-medium">Images</Label>
                          <div className="flex gap-2 flex-wrap mb-2">
                            {(product.images || []).map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="relative group">
                                <img src={imgUrl} alt={product.name} className="w-16 h-16 object-cover rounded border" />
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-xs text-red-500 opacity-80 group-hover:opacity-100"
                                  onClick={() => {
                                    const newImages = [...(product.images || [])];
                                    newImages.splice(imgIdx, 1);
                                    updateProduct(productIndex, 'images', newImages);
                                    
                                    // Remove corresponding file from tempImages
                                    const key = `product-${productIndex}-${imgIdx}`;
                                    if (tempImages[key]) {
                                      const newTempImages = { ...tempImages };
                                      delete newTempImages[key];
                                      setTempImages(newTempImages);
                                    }
                                  }}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.multiple = true;
                                input.onchange = (e) => {
                                  const files = Array.from((e.target as HTMLInputElement).files || []);
                                  const newImages = [...(product.images || [])];
                                  files.forEach((file, fileIndex) => {
                                    // Store file in tempImages for upload
                                    const key = `product-${productIndex}-${newImages.length + fileIndex}`;
                                    setTempImages(prev => ({ ...prev, [key]: file }));
                                    // Create temporary URL for preview
                                    const url = URL.createObjectURL(file);
                                    newImages.push(url);
                                  });
                                  updateProduct(productIndex, 'images', newImages);
                                };
                                input.click();
                              }}
                              className="h-12 px-4 py-3"
                            >
                              + Add Image
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Input
                        placeholder="Product Name"
                        value={product.name}
                        onChange={(e) => updateProduct(productIndex, 'name', e.target.value)}
                        className="h-12 px-4 py-3"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      />
                      <Input
                        placeholder="Description"
                        value={product.description || ''}
                        onChange={(e) => updateProduct(productIndex, 'description', e.target.value)}
                        className="h-12 px-4 py-3"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      />
                      <Input
                        placeholder="Price"
                        type="number"
                        value={product.price}
                        onChange={(e) => updateProduct(productIndex, 'price', e.target.value)}
                        className="h-12 px-4 py-3"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(productIndex)}
                        className="w-full sm:w-auto py-3 h-12"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Product
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-4 h-14"
                    onClick={addProduct}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </div>
              )}

              {type === 'vitrine' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="text-lg font-semibold">Vitrine</h3>
                    <p className="text-sm text-gray-600">Business showcase page</p>
                  </div>
                  
                  {/* Hero Section */}
                  {renderHeroSection()}

                  {/* About Section */}
                  <div className="space-y-4 border p-4 rounded-lg">
                    <h3 className="text-lg font-medium">About Section</h3>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={vitrine.about.description}
                        onChange={(e) => updateVitrineSection('about', { ...vitrine.about, description: e.target.value })}
                        placeholder="Enter business description"
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
                        onClick={() => addVitrineItem('services', { name: '', description: '', images: [] })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                    {vitrine.services.map((service, index) => (
                      <div key={index} className="space-y-2 border p-3 rounded">
                        <div className="flex justify-between items-center">
                          <Label>Service {index + 1}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeVitrineItem('services', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={service.name}
                          onChange={(e) => updateVitrineItem('services', index, 'name', e.target.value)}
                          placeholder="Service name"
                        />
                        <Input
                          value={service.description}
                          onChange={(e) => updateVitrineItem('services', index, 'description', e.target.value)}
                          placeholder="Service description"
                        />
                        <div className="flex items-center gap-2">
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
                            Upload Image
                          </Button>
                          {service.images && service.images.length > 0 && (
                            <img src={service.images[0]} alt={service.name} className="w-16 h-16 object-cover rounded" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gallery Section */}
                  <div className="space-y-4 border p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Gallery</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addVitrineItem('gallery', { title: '', description: '', images: [] })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Gallery Item
                      </Button>
                    </div>
                    {vitrine.gallery.map((galleryItem, index) => (
                      <div key={index} className="space-y-2 border p-3 rounded">
                        <div className="flex justify-between items-center">
                          <Label>Gallery Item {index + 1}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeVitrineItem('gallery', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={galleryItem.title}
                          onChange={(e) => updateVitrineItem('gallery', index, 'title', e.target.value)}
                          placeholder="Gallery item title"
                        />
                        <Input
                          value={galleryItem.description}
                          onChange={(e) => updateVitrineItem('gallery', index, 'description', e.target.value)}
                          placeholder="Gallery item description"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.multiple = true;
                              input.onchange = (e) => {
                                const files = Array.from((e.target as HTMLInputElement).files || []);
                                const newImages = [...(galleryItem.images || [])];
                                files.forEach((file, fileIndex) => {
                                  // Store file in tempImages for upload
                                  const key = `gallery-${index}-${newImages.length + fileIndex}`;
                                  setTempImages(prev => ({ ...prev, [key]: file }));
                                  // Create temporary URL for preview
                                  const url = URL.createObjectURL(file);
                                  newImages.push(url);
                                });
                                updateVitrineItem('gallery', index, 'images', newImages);
                              };
                              input.click();
                            }}
                          >
                            Upload Images
                          </Button>
                          <div className="flex gap-2 flex-wrap">
                            {(galleryItem.images || []).map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="relative group">
                                <img src={imgUrl} alt={galleryItem.title} className="w-16 h-16 object-cover rounded border" />
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-xs text-red-500 opacity-80 group-hover:opacity-100"
                                  onClick={() => {
                                    const newImages = [...(galleryItem.images || [])];
                                    newImages.splice(imgIdx, 1);
                                    updateVitrineItem('gallery', index, 'images', newImages);
                                  }}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
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
                        value={vitrine.contact.address}
                        onChange={(e) => updateVitrineSection('contact', { ...vitrine.contact, address: e.target.value })}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>

                  {/* Social Media Section */}
                  <div className="space-y-4 border p-4 rounded-lg">
                    <h3 className="text-lg font-medium">Social Media</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Facebook</Label>
                        <Input
                          value={vitrine.contact.socialMedia.facebook}
                          onChange={(e) => updateVitrineSection('contact', { 
                            ...vitrine.contact, 
                            socialMedia: { ...vitrine.contact.socialMedia, facebook: e.target.value }
                          })}
                          placeholder="Facebook URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Instagram</Label>
                        <Input
                          value={vitrine.contact.socialMedia.instagram}
                          onChange={(e) => updateVitrineSection('contact', { 
                            ...vitrine.contact, 
                            socialMedia: { ...vitrine.contact.socialMedia, instagram: e.target.value }
                          })}
                          placeholder="Instagram URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Twitter</Label>
                        <Input
                          value={vitrine.contact.socialMedia.twitter}
                          onChange={(e) => updateVitrineSection('contact', { 
                            ...vitrine.contact, 
                            socialMedia: { ...vitrine.contact.socialMedia, twitter: e.target.value }
                          })}
                          placeholder="Twitter URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input
                          value={vitrine.contact.socialMedia.linkedin}
                          onChange={(e) => updateVitrineSection('contact', { 
                            ...vitrine.contact, 
                            socialMedia: { ...vitrine.contact.socialMedia, linkedin: e.target.value }
                          })}
                          placeholder="LinkedIn URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>YouTube</Label>
                        <Input
                          value={vitrine.contact.socialMedia.youtube}
                          onChange={(e) => updateVitrineSection('contact', { 
                            ...vitrine.contact, 
                            socialMedia: { ...vitrine.contact.socialMedia, youtube: e.target.value }
                          })}
                          placeholder="YouTube URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>TikTok</Label>
                        <Input
                          value={vitrine.contact.socialMedia.tiktok}
                          onChange={(e) => updateVitrineSection('contact', { 
                            ...vitrine.contact, 
                            socialMedia: { ...vitrine.contact.socialMedia, tiktok: e.target.value }
                          })}
                          placeholder="TikTok URL"
                        />
                      </div>
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
                    {vitrine.testimonials.map((testimonial, index) => (
                      <div key={index} className="space-y-2 border p-3 rounded">
                        <div className="flex justify-between items-center">
                          <Label>Testimonial {index + 1}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeVitrineItem('testimonials', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={testimonial.text}
                          onChange={(e) => updateVitrineItem('testimonials', index, 'text', e.target.value)}
                          placeholder="Testimonial text"
                        />
                        <Input
                          value={testimonial.author}
                          onChange={(e) => updateVitrineItem('testimonials', index, 'author', e.target.value)}
                          placeholder="Author name"
                        />
                        <Input
                          value={testimonial.city}
                          onChange={(e) => updateVitrineItem('testimonials', index, 'city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Footer Section */}
                  <div className="space-y-4 border p-4 rounded-lg">
                    <h3 className="text-lg font-medium">Footer</h3>
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input
                        value={vitrine.footer.businessName}
                        onChange={(e) => updateVitrineSection('footer', { ...vitrine.footer, businessName: e.target.value })}
                        placeholder="Business name for footer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Copyright</Label>
                      <Input
                        value={vitrine.footer.copyright}
                        onChange={(e) => updateVitrineSection('footer', { ...vitrine.footer, copyright: e.target.value })}
                        placeholder="Copyright text"
                      />
                    </div>
                    
                    {/* Footer Social Media */}
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Footer Social Media</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Facebook</Label>
                          <Input
                            value={vitrine.footer.socialIcons.facebook}
                            onChange={(e) => updateVitrineSection('footer', { 
                              ...vitrine.footer, 
                              socialIcons: { ...vitrine.footer.socialIcons, facebook: e.target.value }
                            })}
                            placeholder="Facebook URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Instagram</Label>
                          <Input
                            value={vitrine.footer.socialIcons.instagram}
                            onChange={(e) => updateVitrineSection('footer', { 
                              ...vitrine.footer, 
                              socialIcons: { ...vitrine.footer.socialIcons, instagram: e.target.value }
                            })}
                            placeholder="Instagram URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Twitter</Label>
                          <Input
                            value={vitrine.footer.socialIcons.twitter}
                            onChange={(e) => updateVitrineSection('footer', { 
                              ...vitrine.footer, 
                              socialIcons: { ...vitrine.footer.socialIcons, twitter: e.target.value }
                            })}
                            placeholder="Twitter URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>LinkedIn</Label>
                          <Input
                            value={vitrine.footer.socialIcons.linkedin}
                            onChange={(e) => updateVitrineSection('footer', { 
                              ...vitrine.footer, 
                              socialIcons: { ...vitrine.footer.socialIcons, linkedin: e.target.value }
                            })}
                            placeholder="LinkedIn URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>YouTube</Label>
                          <Input
                            value={vitrine.footer.socialIcons.youtube}
                            onChange={(e) => updateVitrineSection('footer', { 
                              ...vitrine.footer, 
                              socialIcons: { ...vitrine.footer.socialIcons, youtube: e.target.value }
                            })}
                            placeholder="YouTube URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>TikTok</Label>
                          <Input
                            value={vitrine.footer.socialIcons.tiktok}
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
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="foregroundColor" className="text-base font-medium">{translations[language].foregroundColor}</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="foregroundColor"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-full sm:w-20 h-12"
                  />
                  <Input
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1 h-12 px-4 py-3"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="backgroundColor" className="text-base font-medium">{translations[language].backgroundColor}</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full sm:w-20 h-12"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 h-12 px-4 py-3"
                  />
                </div>
              </div>
              
              {/* Landing Page Colors */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Landing Page Colors</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-base font-medium">Primary Color</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full sm:w-20 h-12"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 h-12 px-4 py-3"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryHoverColor" className="text-base font-medium">Primary Hover Color</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="primaryHoverColor"
                        type="color"
                        value={primaryHoverColor}
                        onChange={(e) => setPrimaryHoverColor(e.target.value)}
                        className="w-full sm:w-20 h-12"
                      />
                      <Input
                        value={primaryHoverColor}
                        onChange={(e) => setPrimaryHoverColor(e.target.value)}
                        className="flex-1 h-12 px-4 py-3"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accentColor" className="text-base font-medium">Accent Color</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full sm:w-20 h-12"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 h-12 px-4 py-3"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Background Gradient</Label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm text-gray-600 mb-2">
                        The background gradient is automatically generated based on your Primary and Accent colors.
                      </p>
                      <div 
                        className="w-full h-8 rounded border"
                        style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}25 0%, ${primaryColor}15 20%, white 50%, ${accentColor}15 80%, ${accentColor}25 100%)`
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loadingSpinnerColor" className="text-base font-medium">Loading Spinner Color</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="loadingSpinnerColor"
                        type="color"
                        value={loadingSpinnerColor}
                        onChange={(e) => setLoadingSpinnerColor(e.target.value)}
                        className="w-full sm:w-20 h-12"
                      />
                      <Input
                        value={loadingSpinnerColor}
                        onChange={(e) => setLoadingSpinnerColor(e.target.value)}
                        className="flex-1 h-12 px-4 py-3"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loadingSpinnerBorderColor" className="text-base font-medium">Loading Spinner Border Color</Label>
                    <Input
                      id="loadingSpinnerBorderColor"
                      value={loadingSpinnerBorderColor}
                      onChange={(e) => setLoadingSpinnerBorderColor(e.target.value)}
                      placeholder="rgba(139, 92, 246, 0.2)"
                      className="h-12 px-4 py-3"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto py-4 h-14 text-base">
            {isLoading ? translations[language].saving : translations[language].saveChanges}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QRCodeEditor;
