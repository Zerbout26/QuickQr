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
import { Upload, X, Plus, Trash2, Globe, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Send, Download, MapPin } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/context/LanguageContext';

const API_BASE_URL = 'https://quickqr-heyg.onrender.com/api';

const defaultAvailability = {
  sunday: true,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
};

// QR Preview component that shows an actual QR code
const QRPreview = ({ url, color, bgColor, logoUrl }: { 
  url: string; 
  color: string; 
  bgColor: string; 
  logoUrl?: string;
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (format: 'png' | 'svg') => {
    if (!qrRef.current) return;

    try {
      if (format === 'svg') {
        // Create SVG with text
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "300");
        svg.setAttribute("height", "300");
        svg.setAttribute("viewBox", "0 0 300 300");

        // Add background
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("width", "300");
        rect.setAttribute("height", "300");
        rect.setAttribute("fill", "#FFFFFF");
        svg.appendChild(rect);

        // Add QR code
        const qrElement = qrRef.current.querySelector('svg');
        if (qrElement) {
          const qrClone = qrElement.cloneNode(true) as SVGElement;
          qrClone.setAttribute("x", "0");
          qrClone.setAttribute("y", "0");
          qrClone.setAttribute("width", "300");
          qrClone.setAttribute("height", "300");
          svg.appendChild(qrClone);
        }

        // Add border
        const border = document.createElementNS(svgNS, "rect");
        border.setAttribute("width", "300");
        border.setAttribute("height", "300");
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

        canvas.width = 300;
        canvas.height = 300;

        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
          const qrY = 0;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
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
  type: string;
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

interface QRCodeFormProps {
  onCreated?: (qrCode: QRCodeType) => void;
}

// Translations object
const translations = {
  en: {
    success: 'Success',
    error: 'Error',
    basic: 'Basic',
    advanced: 'Advanced',
    name: 'Name',
    myQRCode: 'My QR Code',
    type: 'Type',
    directLink: 'Direct Link',
    url: 'URL',
    both: 'Both',
    vitrine: 'Vitrine',
    enterURL: 'Enter URL',
    links: 'Links',
    addLink: 'Add Link',
    selectPlatform: 'Select Platform',
    website: 'Website',
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    location: 'Location',
    other: 'Other',
    categoryName: 'Category Name',
    itemName: 'Item Name',
    description: 'Description',
    price: 'Price',
    itemImage: 'Item Image',
    addImage: 'Add Image',
    changeImage: 'Change Image',
    availability: 'Availability',
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },
    removeItem: 'Remove Item',
    addMenuItem: 'Add Menu Item',
    addCategory: 'Add Category',
    hero: 'Hero',
    enterBusinessName: 'Enter Business Name',
    enterTagline: 'Enter Tagline',
    cta: 'Call to Action',
    addCta: 'Add CTA',
    enterCtaText: 'Enter CTA Text',
    enterCtaLink: 'Enter CTA Link',
    removeCta: 'Remove CTA',
    about: 'About',
    enterDescription: 'Enter Description',
    enterCity: 'Enter City',
    services: 'Services',
    addService: 'Add Service',
    enterServiceName: 'Enter Service Name',
    enterServiceDescription: 'Enter Service Description',
    enterImageTitle: 'Enter Image Title',
    enterImageDescription: 'Enter Image Description',
    removeService: 'Remove Service',
    gallery: 'Gallery',
    removeImage: 'Remove Image',
    testimonials: 'Testimonials',
    addTestimonial: 'Add Testimonial',
    enterTestimonialText: 'Enter Testimonial Text',
    enterAuthor: 'Enter Author',
    removeTestimonial: 'Remove Testimonial',
    contact: 'Contact',
    enterAddress: 'Enter Address',
    enterPhone: 'Enter Phone',
    enterEmail: 'Enter Email',
    socialMedia: 'Social Media',
    enterFacebook: 'Enter Facebook URL',
    enterInstagram: 'Enter Instagram URL',
    enterTwitter: 'Enter Twitter URL',
    enterLinkedin: 'Enter LinkedIn URL',
    enterYoutube: 'Enter YouTube URL',
    enterTiktok: 'Enter TikTok URL',
    enableContactForm: 'Enable Contact Form',
    formFields: 'Form Fields',
    addField: 'Add Field',
    enterFieldName: 'Enter Field Name',
    fieldType: 'Field Type',
    textField: 'Text Field',
    emailField: 'Email Field',
    phoneField: 'Phone Field',
    textareaField: 'Textarea Field',
    required: 'Required',
    footer: 'Footer',
    quickLinks: 'Quick Links',
    addQuickLink: 'Add Quick Link',
    enterQuickLinkLabel: 'Enter Quick Link Label',
    enterQuickLinkUrl: 'Enter Quick Link URL',
    socialIcons: 'Social Icons',
    foregroundColor: 'Foreground Color',
    backgroundColor: 'Background Color',
    logo: 'Logo',
    createQRCode: 'Create QR Code',
    updateQRCode: 'Update QR Code',
    creating: 'Creating...',
  },
  ar: {
    success: 'نجاح',
    error: 'خطأ',
    basic: 'أساسي',
    advanced: 'متقدم',
    name: 'الاسم',
    myQRCode: 'رمز الاستجابة السريعة الخاص بي',
    type: 'النوع',
    directLink: 'رابط مباشر',
    url: 'رابط',
    both: 'قائمة',
    vitrine: 'فترينة',
    enterURL: 'أدخل الرابط',
    links: 'الروابط',
    addLink: 'إضافة رابط',
    selectPlatform: 'اختر المنصة',
    website: 'موقع إلكتروني',
    facebook: 'فيسبوك',
    instagram: 'انستغرام',
    twitter: 'تويتر',
    linkedin: 'لينكد إن',
    youtube: 'يوتيوب',
    tiktok: 'تيك توك',
    whatsapp: 'واتساب',
    telegram: 'تيليجرام',
    location: 'موقع',
    other: 'آخر',
    categoryName: 'اسم الفئة',
    itemName: 'اسم العنصر',
    description: 'الوصف',
    price: 'السعر',
    itemImage: 'صورة العنصر',
    addImage: 'إضافة صورة',
    changeImage: 'تغيير الصورة',
    availability: 'التوفر',
    days: {
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت',
      sunday: 'الأحد',
    },
    removeItem: 'إزالة العنصر',
    addMenuItem: 'إضافة عنصر قائمة',
    addCategory: 'إضافة فئة',
    hero: 'البطل',
    enterBusinessName: 'أدخل اسم العمل',
    enterTagline: 'أدخل الشعار',
    cta: 'دعوة للعمل',
    addCta: 'إضافة CTA',
    enterCtaText: 'أدخل نص CTA',
    enterCtaLink: 'أدخل رابط CTA',
    removeCta: 'إزالة CTA',
    about: 'حول',
    enterDescription: 'أدخل الوصف',
    enterCity: 'أدخل المدينة',
    services: 'الخدمات',
    addService: 'إضافة خدمة',
    enterServiceName: 'أدخل اسم الخدمة',
    enterServiceDescription: 'أدخل وصف الخدمة',
    enterImageTitle: 'أدخل عنوان الصورة',
    enterImageDescription: 'أدخل وصف الصورة',
    removeService: 'إزالة الخدمة',
    gallery: 'المعرض',
    removeImage: 'إزالة الصورة',
    testimonials: 'الشهادات',
    addTestimonial: 'إضافة شهادة',
    enterTestimonialText: 'أدخل نص الشهادة',
    enterAuthor: 'أدخل المؤلف',
    removeTestimonial: 'إزالة الشهادة',
    contact: 'الاتصال',
    enterAddress: 'أدخل العنوان',
    enterPhone: 'أدخل الهاتف',
    enterEmail: 'أدخل البريد الإلكتروني',
    footer: 'التذييل',
    foregroundColor: 'لون المقدمة',
    backgroundColor: 'لون الخلفية',
    logo: 'الشعار',
    createQRCode: 'إنشاء رمز الاستجابة السريعة',
    updateQRCode: 'تحديث رمز الاستجابة السريعة',
    creating: 'جاري الإنشاء...',
  },
};

const QRCodeGenerator: React.FC<QRCodeFormProps> = ({ onCreated }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [type, setType] = useState('url');
  const [directUrl, setDirectUrl] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [vitrine, setVitrine] = useState({
    hero: {
      businessName: '',
      logo: '',
      tagline: '',
      ctas: [{
        text: 'Contact Us',
        link: '',
        type: 'website'
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
      address: '',
      phone: '',
      email: '',
    },
    footer: {
      copyright: `© ${new Date().getFullYear()}`,
      businessName: '',
    }
  });
  const [foregroundColor, setForegroundColor] = useState('#6366F1');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImages, setTempImages] = useState<{ [key: string]: File }>({});

  const resetForm = () => {
    setName('');
    setType('url');
    setDirectUrl('');
    setLinks([]);
    setMenuCategories([]);
    setForegroundColor('#6366F1');
    setBackgroundColor('#FFFFFF');
    setLogoFile(null);
    setLogoPreview(null);
    setTempImages({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      case 'facebook': return 'Follow us on Facebook';
      case 'instagram': return 'Follow us on Instagram';
      case 'twitter': return 'Follow us on Twitter';
      case 'linkedin': return 'Connect on LinkedIn';
      case 'youtube': return 'Subscribe on YouTube';
      case 'whatsapp': return 'Chat on WhatsApp';
      case 'telegram': return 'Join our Telegram';
      case 'website': return 'Visit our Website';
      case 'tiktok': return 'Follow us on TikTok';
      case 'location': return 'Find our Location';
      case 'other': return 'Visit Link';
      default: return 'Visit Link';
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
      case 'location': return <MapPin className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
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
    const updatedMenu = { ...menuCategories[categoryIndex] };
    updatedMenu.items[itemIndex].availability[day] = checked;
    setMenuCategories(prev => prev.map((category, index) => index === categoryIndex ? updatedMenu : category));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
              availability: {
                sunday: item.availability?.sunday ?? true,
                monday: item.availability?.monday ?? true,
                tuesday: item.availability?.tuesday ?? true,
                wednesday: item.availability?.wednesday ?? true,
                thursday: item.availability?.thursday ?? true,
                friday: item.availability?.friday ?? true,
                saturday: item.availability?.saturday ?? true
              }
            }))
          }))
        };

        // Validate menu data
        if (!menuData.restaurantName || menuData.categories.length === 0) {
          throw new Error('Please provide a restaurant name and at least one category with items');
        }

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

      if (type === 'vitrine') {
        // Validate vitrine data
        if (!vitrine.hero.businessName) {
          throw new Error('Business name is required');
        }
        if (!vitrine.about.description) {
          throw new Error('About description is required');
        }
        if (!vitrine.contact.email) {
          throw new Error('Contact email is required');
        }
        if (!vitrine.footer.businessName) {
          throw new Error('Footer business name is required');
        }

        // Ensure all required fields are present
        const validatedVitrine = {
          hero: {
            businessName: vitrine.hero.businessName,
            logo: vitrine.hero.logo || '',
            tagline: vitrine.hero.tagline || '',
            ctas: vitrine.hero.ctas.map(cta => ({
              text: cta.text || 'Contact Us',
              link: cta.link || '',
              type: cta.type || 'website'
            }))
          },
          about: {
            description: vitrine.about.description,
            city: vitrine.about.city || ''
          },
          services: vitrine.services.map(service => ({
            name: service.name || '',
            description: service.description || '',
            imageUrl: '', // Reset imageUrl as it will be updated after Cloudinary upload
            title: service.title || '',
            imageDescription: service.imageDescription || ''
          })),
          gallery: vitrine.gallery.map(item => ({
            imageUrl: item.imageUrl || '',
            title: item.title || '',
            description: item.description || ''
          })),
          testimonials: vitrine.testimonials.map(testimonial => ({
            text: testimonial.text || '',
            author: testimonial.author || '',
            city: testimonial.city || ''
          })),
          contact: {
            address: vitrine.contact.address || '',
            phone: vitrine.contact.phone || '',
            email: vitrine.contact.email,
          },
          footer: {
            copyright: vitrine.footer.copyright || `© ${new Date().getFullYear()}`,
            businessName: vitrine.footer.businessName,
          }
        };

        formData.append('vitrine', JSON.stringify(validatedVitrine));

        // Upload vitrine images
        for (const [key, file] of Object.entries(tempImages)) {
          if (file instanceof File) {
            const [section, index] = key.split('-');
            const uniqueFilename = `${section}-${index}-${Date.now()}-${file.name}`;
            formData.append('vitrineImages', file, uniqueFilename);
          }
        }
      }

      // Handle logo upload
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Use fetch directly for file upload
      const response = await fetch(`${API_BASE_URL}/qrcodes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create QR code');
      }

      const createdQRCode = await response.json();
      onCreated(createdQRCode);
      resetForm();
      toast({
        title: translations[language].success,
        description: "QR code created successfully",
      });
    } catch (error: any) {
      console.error('Error creating QR code:', error);
      setError(error.message || 'Failed to create QR code');
      toast({
        variant: "destructive",
        title: translations[language].error,
        description: error.message || 'Failed to create QR code',
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
              <TabsTrigger value="basic">{translations[language].basic}</TabsTrigger>
              <TabsTrigger value="advanced">{translations[language].advanced}</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{translations[language].name}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={translations[language].myQRCode}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{translations[language].type}</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant={type === 'direct' ? 'default' : 'outline'}
                      onClick={() => setType('direct')}
                      className="flex-1"
                    >
                      {translations[language].directLink}
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'url' ? 'default' : 'outline'}
                      onClick={() => setType('url')}
                      className="flex-1"
                    >
                      {translations[language].url}
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'both' ? 'default' : 'outline'}
                      onClick={() => setType('both')}
                      className="flex-1"
                    >
                      {translations[language].both}
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'vitrine' ? 'default' : 'outline'}
                      onClick={() => setType('vitrine')}
                      className="flex-1"
                    >
                      {translations[language].vitrine}
                    </Button>
                  </div>
                </div>
                {type === 'direct' && (
                  <div className="space-y-2">
                    <Label htmlFor="directUrl">{translations[language].url}</Label>
                    <Input
                      id="directUrl"
                      type="url"
                      value={directUrl}
                      onChange={(e) => setDirectUrl(e.target.value)}
                      placeholder={translations[language].enterURL}
                    />
                  </div>
                )}
                {(type === 'url' || type === 'both') && (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <Label>{translations[language].links}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLink}
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4" />
                        {translations[language].addLink}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {links.map((link, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2">
                          <Select
                            value={link.type || 'website'}
                            onValueChange={(value) => updateLink(index, 'type', value)}
                          >
                            <SelectTrigger className="w-full sm:w-[180px]">
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
                              <SelectItem value="location">{translations[language].location}</SelectItem>
                              <SelectItem value="other">{translations[language].other}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder={translations[language].url}
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            className="flex-1"
                          />
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
                            placeholder={translations[language].categoryName}
                            value={category.name}
                            onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
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
                                placeholder={translations[language].itemName}
                                value={item.name}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'name', e.target.value)}
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                              />
                              <Textarea
                                placeholder={translations[language].description}
                                value={item.description}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'description', e.target.value)}
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                              />
                              <Input
                                type="number"
                                placeholder={translations[language].price}
                                value={item.price}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'price', parseFloat(e.target.value))}
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                              />
                              <div className="space-y-2">
                                <Label>{translations[language].itemImage}</Label>
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
                                    {item.imageUrl ? translations[language].changeImage : translations[language].addImage}
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>{translations[language].availability}</Label>
                                <div className="grid grid-cols-4 gap-2">
                                  {Object.entries(item.availability || defaultAvailability).map(([day, isAvailable]) => (
                                    <div key={day} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`new-${categoryIndex}-${itemIndex}-${day}`}
                                        checked={isAvailable}
                                        onCheckedChange={(checked) => 
                                          handleItemAvailabilityChange(categoryIndex, itemIndex, day, checked === true)
                                        }
                                      />
                                      <label
                                        htmlFor={`new-${categoryIndex}-${itemIndex}-${day}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {translations[language].days[day as keyof typeof translations.en.days]}
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
                                {translations[language].removeItem}
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
                            {translations[language].addMenuItem}
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
                      {translations[language].addCategory}
                    </Button>
                  </div>
                )}
                {type === 'vitrine' && (
                  <div className="space-y-4">
                    {/* Hero Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{translations[language].hero}</h3>
                      <div className="space-y-2">
                        <Input
                          placeholder={translations[language].enterBusinessName}
                          value={vitrine.hero.businessName}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            hero: { ...vitrine.hero, businessName: e.target.value }
                          })}
                        />
                        <Input
                          placeholder={translations[language].enterTagline}
                          value={vitrine.hero.tagline}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            hero: { ...vitrine.hero, tagline: e.target.value }
                          })}
                        />
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>{translations[language].cta}</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setVitrine({
                                ...vitrine,
                                hero: {
                                  ...vitrine.hero,
                                  ctas: [...vitrine.hero.ctas, { text: '', link: '', type: 'website' }]
                                }
                              })}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {translations[language].addCta}
                            </Button>
                          </div>
                          {vitrine.hero.ctas.map((cta, index) => (
                            <div key={index} className="space-y-2 border p-2 rounded">
                              <Input
                                placeholder={translations[language].enterCtaText}
                                value={cta.text}
                                onChange={(e) => {
                                  const newCtas = [...vitrine.hero.ctas];
                                  newCtas[index] = { ...cta, text: e.target.value };
                                  setVitrine({
                                    ...vitrine,
                                    hero: { ...vitrine.hero, ctas: newCtas }
                                  });
                                }}
                              />
                              <div className="flex gap-2">
                                <Select
                                  value={cta.type || 'website'}
                                  onValueChange={(value) => {
                                    const newCtas = [...vitrine.hero.ctas];
                                    newCtas[index] = { ...cta, type: value };
                                    setVitrine({
                                      ...vitrine,
                                      hero: { ...vitrine.hero, ctas: newCtas }
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-[180px]">
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
                                    <SelectItem value="location">{translations[language].location}</SelectItem>
                                    <SelectItem value="other">{translations[language].other}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder={translations[language].enterCtaLink}
                                  value={cta.link}
                                  onChange={(e) => {
                                    const newCtas = [...vitrine.hero.ctas];
                                    newCtas[index] = { ...cta, link: e.target.value };
                                    setVitrine({
                                      ...vitrine,
                                      hero: { ...vitrine.hero, ctas: newCtas }
                                    });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newCtas = vitrine.hero.ctas.filter((_, i) => i !== index);
                                    setVitrine({
                                      ...vitrine,
                                      hero: { ...vitrine.hero, ctas: newCtas }
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{translations[language].about}</h3>
                      <div className="space-y-2">
                        <Textarea
                          placeholder={translations[language].enterDescription}
                          value={vitrine.about.description}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            about: { ...vitrine.about, description: e.target.value }
                          })}
                        />
                        <Input
                          placeholder={translations[language].enterCity}
                          value={vitrine.about.city}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            about: { ...vitrine.about, city: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    {/* Services Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{translations[language].services}</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setVitrine({
                            ...vitrine,
                            services: [...vitrine.services, { name: '', description: '', imageUrl: '', title: '', imageDescription: '' }]
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {translations[language].addService}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {vitrine.services.map((service, index) => (
                          <div key={index} className="space-y-2 border p-2 rounded">
                            <Input
                              placeholder={translations[language].enterServiceName}
                              value={service.name}
                              onChange={(e) => {
                                const newServices = [...vitrine.services];
                                newServices[index] = { ...service, name: e.target.value };
                                setVitrine({ ...vitrine, services: newServices });
                              }}
                            />
                            <Textarea
                              placeholder={translations[language].enterServiceDescription}
                              value={service.description}
                              onChange={(e) => {
                                const newServices = [...vitrine.services];
                                newServices[index] = { ...service, description: e.target.value };
                                setVitrine({ ...vitrine, services: newServices });
                              }}
                            />
                            <Input
                              placeholder={translations[language].enterImageTitle}
                              value={service.title}
                              onChange={(e) => {
                                const newServices = [...vitrine.services];
                                newServices[index] = { ...service, title: e.target.value };
                                setVitrine({ ...vitrine, services: newServices });
                              }}
                            />
                            <Textarea
                              placeholder={translations[language].enterImageDescription}
                              value={service.imageDescription}
                              onChange={(e) => {
                                const newServices = [...vitrine.services];
                                newServices[index] = { ...service, imageDescription: e.target.value };
                                setVitrine({ ...vitrine, services: newServices });
                              }}
                            />
                            <div className="flex items-center gap-4">
                              {service.imageUrl && (
                                <div className="relative w-24 h-24">
                                  <img
                                    src={service.imageUrl}
                                    alt={service.name}
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = 'https://via.placeholder.com/144?text=No+Image';
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => {
                                      const newServices = [...vitrine.services];
                                      newServices[index] = { ...service, imageUrl: '' };
                                      setVitrine({ ...vitrine, services: newServices });
                                      // Remove from tempImages if exists
                                      const key = `service-${index}`;
                                      if (tempImages[key]) {
                                        const newTempImages = { ...tempImages };
                                        delete newTempImages[key];
                                        setTempImages(newTempImages);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      const key = `service-${index}`;
                                      setTempImages(prev => ({ ...prev, [key]: file }));
                                      const tempUrl = URL.createObjectURL(file);
                                      const newServices = [...vitrine.services];
                                      newServices[index] = { ...service, imageUrl: tempUrl };
                                      setVitrine({ ...vitrine, services: newServices });
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {service.imageUrl ? translations[language].changeImage : translations[language].addImage}
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newServices = vitrine.services.filter((_, i) => i !== index);
                                setVitrine({ ...vitrine, services: newServices });
                                // Remove from tempImages if exists
                                const key = `service-${index}`;
                                if (tempImages[key]) {
                                  const newTempImages = { ...tempImages };
                                  delete newTempImages[key];
                                  setTempImages(newTempImages);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {translations[language].removeService}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gallery Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{translations[language].gallery}</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setVitrine({
                            ...vitrine,
                            gallery: [...vitrine.gallery, { imageUrl: '', title: '', description: '' }]
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {translations[language].addImage}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {vitrine.gallery.map((item, index) => (
                          <div key={index} className="space-y-2 border p-2 rounded">
                            <Input
                              placeholder={translations[language].enterImageTitle}
                              value={item.title}
                              onChange={(e) => {
                                const newGallery = [...vitrine.gallery];
                                newGallery[index] = { ...item, title: e.target.value };
                                setVitrine({ ...vitrine, gallery: newGallery });
                              }}
                            />
                            <Textarea
                              placeholder={translations[language].enterImageDescription}
                              value={item.description}
                              onChange={(e) => {
                                const newGallery = [...vitrine.gallery];
                                newGallery[index] = { ...item, description: e.target.value };
                                setVitrine({ ...vitrine, gallery: newGallery });
                              }}
                            />
                            <div className="flex items-center gap-4">
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
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      const key = `gallery-${index}`;
                                      setTempImages(prev => ({ ...prev, [key]: file }));
                                      const tempUrl = URL.createObjectURL(file);
                                      const newGallery = [...vitrine.gallery];
                                      newGallery[index] = { ...item, imageUrl: tempUrl };
                                      setVitrine({ ...vitrine, gallery: newGallery });
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {item.imageUrl ? translations[language].changeImage : translations[language].addImage}
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newGallery = vitrine.gallery.filter((_, i) => i !== index);
                                setVitrine({ ...vitrine, gallery: newGallery });
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {translations[language].removeImage}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Testimonials Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{translations[language].testimonials}</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setVitrine({
                            ...vitrine,
                            testimonials: [...vitrine.testimonials, { text: '', author: '', city: '' }]
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {translations[language].addTestimonial}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {vitrine.testimonials.map((testimonial, index) => (
                          <div key={index} className="space-y-2 border p-2 rounded">
                            <Textarea
                              placeholder={translations[language].enterTestimonialText}
                              value={testimonial.text}
                              onChange={(e) => {
                                const newTestimonials = [...vitrine.testimonials];
                                newTestimonials[index] = { ...testimonial, text: e.target.value };
                                setVitrine({ ...vitrine, testimonials: newTestimonials });
                              }}
                            />
                            <Input
                              placeholder={translations[language].enterAuthor}
                              value={testimonial.author}
                              onChange={(e) => {
                                const newTestimonials = [...vitrine.testimonials];
                                newTestimonials[index] = { ...testimonial, author: e.target.value };
                                setVitrine({ ...vitrine, testimonials: newTestimonials });
                              }}
                            />
                            <Input
                              placeholder={translations[language].enterCity}
                              value={testimonial.city}
                              onChange={(e) => {
                                const newTestimonials = [...vitrine.testimonials];
                                newTestimonials[index] = { ...testimonial, city: e.target.value };
                                setVitrine({ ...vitrine, testimonials: newTestimonials });
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newTestimonials = vitrine.testimonials.filter((_, i) => i !== index);
                                setVitrine({ ...vitrine, testimonials: newTestimonials });
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {translations[language].removeTestimonial}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{translations[language].contact}</h3>
                      <div className="space-y-2">
                        <Input
                          placeholder={translations[language].enterAddress}
                          value={vitrine.contact.address}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            contact: { ...vitrine.contact, address: e.target.value }
                          })}
                        />
                        <Input
                          placeholder={translations[language].enterPhone}
                          value={vitrine.contact.phone}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            contact: { ...vitrine.contact, phone: e.target.value }
                          })}
                        />
                        <Input
                          placeholder={translations[language].enterEmail}
                          type="email"
                          value={vitrine.contact.email}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            contact: { ...vitrine.contact, email: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{translations[language].footer}</h3>
                      <div className="space-y-2">
                        <Input
                          placeholder={translations[language].enterBusinessName}
                          value={vitrine.footer.businessName}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            footer: { ...vitrine.footer, businessName: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <QRPreview 
                    url={type === 'direct' ? `https://quickqr-heyg.onrender.com/api/qrcodes/redirect/${encodeURIComponent(directUrl)}` : name ? `https://qrcreator.xyz/landing/preview` : ''}
                    color={foregroundColor}
                    bgColor={backgroundColor}
                    logoUrl={logoPreview || undefined}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foregroundColor">{translations[language].foregroundColor}</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="foregroundColor"
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-full sm:w-20"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">{translations[language].backgroundColor}</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full sm:w-20"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">{translations[language].logo}</Label>
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
          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? translations[language].creating : translations[language].createQRCode}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
