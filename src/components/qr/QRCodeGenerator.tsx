import { useState, useRef, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { QRCode as QRCodeType, Link, MenuCategory, MenuItem, Variant, VariantOption, QRCode } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { qrCodeApi } from '@/lib/api';
import { Upload, X, Plus, Trash2, Globe, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Send, Download, MapPin, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/context/LanguageContext';
import { Switch } from '@/components/ui/switch';

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
      const svgString = renderToStaticMarkup(
        <QRCodeSVG
          value={url}
          size={284}
          bgColor={bgColor}
          fgColor={color}
          level="H"
          includeMargin={true}
          imageSettings={logoUrl ? {
            src: logoUrl,
            x: undefined,
            y: undefined,
            height: 56,
            width: 56,
            excavate: true,
          } : undefined}
        />
      );

      if (format === 'svg') {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `qr-code.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      } else { // PNG
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const imgUrl = URL.createObjectURL(svgBlob);
        
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                const x = (canvas.width - img.width) / 2;
                const y = (canvas.height - img.height) / 2;
                ctx.drawImage(img, x, y);
                URL.revokeObjectURL(imgUrl);
                resolve();
            };
            img.onerror = (err) => {
                console.error("Failed to load SVG image for canvas drawing", err);
                URL.revokeObjectURL(imgUrl);
                reject(new Error("Failed to load SVG image for canvas drawing"));
            };
            img.src = imgUrl;
        });

        canvas.toBlob((blob) => {
          if (!blob) return;
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `qr-code.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
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
        className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center border rounded-md p-2" 
        style={{ backgroundColor: bgColor }}
      >
        <QRCodeSVG
          value={url}
          size={176}
          bgColor="transparent"
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
      <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDownload('png')}
          className="w-full sm:w-auto py-3 h-12 text-base"
        >
          <Download className="h-4 w-4 mr-2" />
          Download QR Sticker
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDownload('svg')}
          className="w-full sm:w-auto py-3 h-12 text-base"
        >
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </div>
    </div>
  );
};

interface QRCodeFormProps {
  onCreated?: (qrCode: QRCodeType) => void;
  selectedType?: string;
  fromOnboarding?: boolean;
  onAllowOtherTypes?: () => void;
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
    categories: 'Categories',
    addCategory: 'Add Category',
    categoryName: 'Category Name',
    items: 'Items',
    addMenuItem: 'Add Menu Item',
    itemName: 'Item Name',
    description: 'Description',
    price: 'Price',
    removeItem: 'Remove Item',
    createQRCode: 'Create QR Code',
    creating: 'Creating...',
    logo: 'Logo',
    foregroundColor: 'Foreground Color',
    backgroundColor: 'Background Color',
    hero: 'Hero',
    about: 'About',
    services: 'Services',
    gallery: 'Gallery',
    testimonials: 'Testimonials',
    contact: 'Contact',
    footer: 'Footer',
    enterBusinessName: 'Enter Business Name',
    enterTagline: 'Enter Tagline',
    enterDescription: 'Enter Description',
    enterCity: 'Enter City',
    addService: 'Add Service',
    enterServiceName: 'Enter Service Name',
    enterServiceTitle: 'Enter Service Title',
    enterServiceDescription: 'Enter Service Description',
    removeService: 'Remove Service',
    addImage: 'Add Image',
    changeImage: 'Change Image',
    enterImageTitle: 'Enter Image Title',
    enterImageDescription: 'Enter Image Description',
    removeImage: 'Remove Image',
    addTestimonial: 'Add Testimonial',
    enterTestimonialText: 'Enter Testimonial Text',
    enterAuthor: 'Enter Author',
    removeTestimonial: 'Remove Testimonial',
    enterAddress: 'Enter Address',
    enterPhone: 'Enter Phone',
    enterEmail: 'Enter Email',
    cta: 'Call to Action',
    addCta: 'Add CTA',
    enterCtaText: 'Enter CTA Text',
    enterCtaLink: 'Enter CTA Link',
    availability: 'Availability',
    editAvailability: 'Edit Availability',
    hideAvailability: 'Hide Availability',
    orderableMenuToggle: 'Make menu orderable',
    codFormToggle: 'Enable Cash on Delivery form',
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    },
    downloadQRCode: 'Download the QR Code',
    downloadQRCodeSticker: 'Download the QR Code on Ready Sticker',
    products: 'Products',
    addProduct: 'Add Product',
    productName: 'Product Name',
    removeProduct: 'Remove Product',
    changeLogo: 'Change Logo',
    addLogo: 'Add Logo',
    errorCreatingQR: 'Failed to create QR code',
    showOtherTypes: 'Show Other Types',
    menu: 'Menu',
    maxLimitReached: 'You have reached the maximum limit for all QR code types.',
    creatingFirstQR: 'Creating Your First QR Code',
    chosenToCreate: 'You\'ve chosen to create a {type} QR code. Fill out the details below to get started.',
    businessName: 'Business Name',
    myBusiness: 'My Business',
    myProduct: 'My Product',
  },
  ar: {
    success: 'نجح',
    error: 'خطأ',
    basic: 'أساسي',
    advanced: 'متقدم',
    name: 'الاسم',
    myQRCode: 'رمز الاستجابة السريعة الخاص بي',
    type: 'النوع',
    directLink: 'رابط مباشر',
    url: 'الرابط',
    both: 'كلاهما',
    vitrine: 'فيتري',
    enterURL: 'أدخل الرابط',
    links: 'الروابط',
    addLink: 'إضافة رابط',
    selectPlatform: 'اختر المنصة',
    website: 'الموقع الإلكتروني',
    facebook: 'فيسبوك',
    instagram: 'إنستغرام',
    twitter: 'تويتر',
    linkedin: 'لينكد إن',
    youtube: 'يوتيوب',
    tiktok: 'تيك توك',
    whatsapp: 'واتساب',
    telegram: 'تليجرام',
    location: 'الموقع',
    other: 'أخرى',
    categories: 'الفئات',
    addCategory: 'إضافة فئة',
    categoryName: 'اسم الفئة',
    items: 'العناصر',
    addMenuItem: 'إضافة عنصر قائمة',
    itemName: 'اسم العنصر',
    description: 'الوصف',
    price: 'السعر',
    removeItem: 'إزالة العنصر',
    createQRCode: 'إنشاء رمز الاستجابة السريعة',
    creating: 'جاري الإنشاء...',
    logo: 'الشعار',
    foregroundColor: 'لون المقدمة',
    backgroundColor: 'لون الخلفية',
    hero: 'البطل',
    about: 'حول',
    services: 'الخدمات',
    gallery: 'المعرض',
    testimonials: 'التوصيات',
    contact: 'اتصل بنا',
    footer: 'التذييل',
    enterBusinessName: 'أدخل اسم العمل',
    enterTagline: 'أدخل الشعار',
    enterDescription: 'أدخل الوصف',
    enterCity: 'أدخل المدينة',
    addService: 'إضافة خدمة',
    enterServiceName: 'أدخل اسم الخدمة',
    enterServiceTitle: 'أدخل عنوان الخدمة',
    enterServiceDescription: 'أدخل وصف الخدمة',
    removeService: 'إزالة الخدمة',
    addImage: 'إضافة صورة',
    changeImage: 'تغيير الصورة',
    enterImageTitle: 'أدخل عنوان الصورة',
    enterImageDescription: 'أدخل وصف الصورة',
    removeImage: 'إزالة الصورة',
    addTestimonial: 'إضافة توصية',
    enterTestimonialText: 'أدخل نص التوصية',
    enterAuthor: 'أدخل المؤلف',
    removeTestimonial: 'إزالة التوصية',
    enterAddress: 'أدخل العنوان',
    enterPhone: 'أدخل الهاتف',
    enterEmail: 'أدخل البريد الإلكتروني',
    cta: 'دعوة للعمل',
    addCta: 'إضافة دعوة للعمل',
    enterCtaText: 'أدخل نص دعوة العمل',
    enterCtaLink: 'أدخل رابط دعوة العمل',
    availability: 'التوفر',
    editAvailability: 'تعديل التوفر',
    hideAvailability: 'إخفاء التوفر',
    orderableMenuToggle: 'جعل القائمة قابلة للطلب',
    codFormToggle: 'تمكين نموذج الدفع عند الاستلام',
    days: {
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت',
      sunday: 'الأحد'
    },
    downloadQRCode: 'تحميل رمز الاستجابة السريعة',
    downloadQRCodeSticker: 'تحميل رمز الاستجابة السريعة على ملصق جاهز',
    products: 'المنتجات',
    addProduct: 'إضافة منتج',
    productName: 'اسم المنتج',
    removeProduct: 'إزالة المنتج',
    changeLogo: 'تغيير الشعار',
    addLogo: 'إضافة شعار',
    errorCreatingQR: 'فشل إنشاء رمز الاستجابة السريعة',
    showOtherTypes: 'عرض الأنواع الأخرى',
    menu: 'قائمة',
    maxLimitReached: 'لقد وصلت إلى الحد الأقصى لجميع أنواع رموز الاستجابة.',
    creatingFirstQR: 'إنشاء رمز الاستجابة السريعة الأول',
    chosenToCreate: 'لقد اخترت إنشاء {type} QR code. يمكنك الآن ملء تفاصيل الصفحة التالية للبدء.',
    businessName: 'اسم العمل',
    myBusiness: 'اسم العمل',
    myProduct: 'اسم المنتج',
  },
};

const QRCodeGenerator: React.FC<QRCodeFormProps> = ({ onCreated, selectedType, fromOnboarding, onAllowOtherTypes }) => {
  const { user, refreshUserProfile } = useAuth();
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const getInitialType = () => {
    if (selectedType) return selectedType;
    // Default to menu if no selectedType is provided
    return 'menu';
  };
  const [type, setType] = useState<string>(getInitialType());
  const [directUrl, setDirectUrl] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
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
  const [showBrandingSettings, setShowBrandingSettings] = useState(false);
  const [menuOrderable, setMenuOrderable] = useState(false);
  const [codFormEnabled, setCodFormEnabled] = useState(false);
  
  // Landing page colors
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [primaryHoverColor, setPrimaryHoverColor] = useState('#7c3aed');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [loadingSpinnerColor, setLoadingSpinnerColor] = useState('#8b5cf6');
  const [loadingSpinnerBorderColor, setLoadingSpinnerBorderColor] = useState('rgba(139, 92, 246, 0.2)');

  const [editingAvailability, setEditingAvailability] = useState<{ [key: string]: boolean }>({});

  const [showOtherTypes, setShowOtherTypes] = useState(false);
  const [userQRCodes, setUserQRCodes] = useState<QRCode[]>([]);
  const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(false);

  // If selectedType changes, update type
  useEffect(() => {
    if (selectedType) setType(selectedType);
  }, [selectedType]);

  // Initialize showOtherTypes from sessionStorage
  useEffect(() => {
    const showOtherTypesFlag = sessionStorage.getItem('showOtherTypes');
    if (showOtherTypesFlag === 'true') {
      setShowOtherTypes(true);
    } else if (fromOnboarding) {
      // If coming from onboarding, show only the selected type initially
      setShowOtherTypes(false);
    }
  }, [fromOnboarding]);

  // Set defaults for products type (e-commerce)
  useEffect(() => {
    if (type === 'products') {
      setMenuOrderable(true);
      setCodFormEnabled(true);
    }
  }, [type]);

  // Fetch user's QR codes to check limits
  const fetchUserQRCodes = async () => {
    if (!user) return;
    setIsLoadingQRCodes(true);
    try {
      const { data } = await qrCodeApi.getAll(1, 100, ''); // Get all QR codes
      setUserQRCodes(data);
    } catch (error) {
      console.error('Failed to fetch user QR codes:', error);
    } finally {
      setIsLoadingQRCodes(false);
    }
  };

  useEffect(() => {
    fetchUserQRCodes();
  }, [user]);

  // Calculate current QR code counts
  const currentMenuCount = userQRCodes.filter(qr => qr.type === 'menu').length;
  const currentVitrineCount = userQRCodes.filter(qr => qr.type === 'vitrine').length;
  const currentProductsCount = userQRCodes.filter(qr => qr.type === 'products').length;

  // Check if user can create more of each type
  const canCreateMenu = currentMenuCount < 1;
  const canCreateVitrine = currentVitrineCount < 1;
  const canCreateProducts = currentProductsCount < 10;

  const resetForm = () => {
    setName('');
    setType('menu');
    setDirectUrl('');
    setLinks([]);
    setMenuCategories([]);
    setProducts([]);
    setForegroundColor('#6366F1');
    setBackgroundColor('#FFFFFF');
    setLogoFile(null);
    setLogoPreview(null);
    setTempImages({});
    // Reset landing page colors
    setPrimaryColor('#8b5cf6');
    setPrimaryHoverColor('#7c3aed');
    setAccentColor('#ec4899');
    setLoadingSpinnerColor('#8b5cf6');
    setLoadingSpinnerBorderColor('rgba(139, 92, 246, 0.2)');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMenuOrderable(false);
    setCodFormEnabled(false);
    setEditingAvailability({});
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
    if (type !== 'both') setType('both');
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

  const updateMenuItem = (
    categoryIndex: number,
    itemIndex: number,
    field: keyof MenuItem,
    value: string | number | Variant[] | string[]
  ) => {
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
    const updatedMenu = { ...menuCategories[categoryIndex] };
    updatedMenu.items[itemIndex].availability[day] = checked;
    setMenuCategories(prev => prev.map((category, index) => index === categoryIndex ? updatedMenu : category));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name || 'My QR Code');
      formData.append('type', type);
      formData.append('foregroundColor', foregroundColor);
      formData.append('backgroundColor', backgroundColor);
      
      // Add landing page colors
      formData.append('primaryColor', primaryColor);
      formData.append('primaryHoverColor', primaryHoverColor);
      formData.append('accentColor', accentColor);
      formData.append('loadingSpinnerColor', loadingSpinnerColor);
      formData.append('loadingSpinnerBorderColor', loadingSpinnerBorderColor);
      
      if (type === 'direct') {
        formData.append('url', directUrl);
      } else if (type === 'url' || type === 'both') {
        formData.append('links', JSON.stringify(links));
      }
      
      if (type === 'menu' || type === 'both') {
        const menuData = {
          restaurantName: name || 'My Restaurant',
          description: '',
          categories: menuCategories,
          orderable: menuOrderable,
          codFormEnabled: codFormEnabled
        };
        formData.append('menu', JSON.stringify(menuData));

        // Then, upload each menu item image
        for (const [key, file] of Object.entries(tempImages)) {
          if (file instanceof File && key.startsWith('menu-')) {
            const [_, categoryIndex, itemIndex, imageIndex] = key.split('-').map(Number);
            const uniqueFilename = `menu-${categoryIndex}-${itemIndex}-${imageIndex}-${Date.now()}-${file.name}`;
            formData.append('menuItemImages', file, uniqueFilename);
          }
        }
      }

      if (type === 'products') {
        const productsData = {
          storeName: name || 'My Product Store',
          description: '',
          products: products,
          orderable: menuOrderable,
          codFormEnabled: codFormEnabled
        };
        formData.append('products', JSON.stringify(productsData));

        // Upload each product image
        for (const [key, file] of Object.entries(tempImages)) {
          if (file instanceof File && key.startsWith('product-')) {
            const [_, productIndex, imageIndex] = key.split('-').map(Number);
            const uniqueFilename = `product-${productIndex}-${imageIndex}-${Date.now()}-${file.name}`;
            formData.append('productImages', file, uniqueFilename);
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
            images: [],
            title: service.title || '',
            imageDescription: service.imageDescription || ''
          })),
          gallery: vitrine.gallery.map(item => ({
            images: [],
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
      toast({
        title: "QR Code Created",
        description: fromOnboarding 
          ? "Congratulations! Your first QR code has been created successfully. You can now share it with your customers."
          : "Your new QR code has been created successfully.",
      });
      
      if (onCreated) {
        onCreated(createdQRCode);
      }
      
      if (refreshUserProfile) await refreshUserProfile();
      
      // If coming from onboarding, clear the flag after successful creation
      if (fromOnboarding && onAllowOtherTypes) {
        onAllowOtherTypes();
      }
      
      // Clear showOtherTypes flag after successful creation
      sessionStorage.removeItem('showOtherTypes');
      setShowOtherTypes(false);
      
      resetForm();
    } catch (error: any) {
      console.error('Error creating QR code:', error);
      setError(translations[language].errorCreatingQR);
      toast({
        variant: "destructive",
        title: translations[language].error,
        description: error.message || translations[language].errorCreatingQR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full p-1 sm:p-4">
      <CardContent className="pt-2 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {fromOnboarding && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm sm:text-base">1</span>
                    </div>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      {translations[language].creatingFirstQR}
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1">
                      {translations[language].chosenToCreate.replace('{type}', translations[language][type])}
                    </p>
                  </div>
                </div>
                {/* {onAllowOtherTypes && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowOtherTypes(true);
                      sessionStorage.setItem('showOtherTypes', 'true');
                      if (onAllowOtherTypes) onAllowOtherTypes();
                    }}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100 mt-2 sm:mt-0 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    {translations[language].showOtherTypes}
                  </Button>
                )} */}
              </div>
            </div>
          )}
          
          {/* Basic Information */}
          <div className="space-y-2 sm:space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm sm:text-base font-medium">
                {type === 'menu' || selectedType === 'menu' ? translations[language].businessName : 
                 type === 'products' || selectedType === 'products' ? translations[language].productName : 
                 translations[language].name}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  type === 'menu' || selectedType === 'menu' ? translations[language].myBusiness : 
                  type === 'products' || selectedType === 'products' ? translations[language].myProduct : 
                  translations[language].myQRCode
                }
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-sm sm:text-base px-3 py-2 h-10 sm:h-12"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">{translations[language].logo}</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                {logoPreview && (
                  <img src={logoPreview} alt="QR Code Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain border rounded" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto py-2 sm:py-3 h-10 sm:h-12 text-xs sm:text-sm"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logoPreview && (
                  <Button type="button" variant="destructive" size="icon" onClick={removeLogo} className="h-10 w-10 sm:h-12 sm:w-12">
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
            
            {/* QR Type Selector as Buttons */}
            {(!selectedType && user) ? (
              <div className="mb-2">
                <Label htmlFor="type" className="text-sm sm:text-base font-medium">Type</Label>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-1">
                  {/* Show available options based on current limits for new users */}
                  {canCreateProducts && (
                    <Button
                      type="button"
                      variant={type === 'products' ? 'default' : 'outline'}
                      onClick={() => setType('products')}
                      className="flex-1 text-sm sm:text-base py-2 sm:py-3 h-10 sm:h-12"
                    >
                      {translations[language].products} ({currentProductsCount}/10)
                    </Button>
                  )}
                  {canCreateMenu && (
                    <Button
                      type="button"
                      variant={type === 'menu' ? 'default' : 'outline'}
                      onClick={() => setType('menu')}
                      className="flex-1 text-sm sm:text-base py-2 sm:py-3 h-10 sm:h-12"
                    >
                      {translations[language].menu}
                    </Button>
                  )}
                  {canCreateVitrine && (
                    <Button
                      type="button"
                      variant={type === 'vitrine' ? 'default' : 'outline'}
                      onClick={() => setType('vitrine')}
                      className="flex-1 text-sm sm:text-base py-2 sm:py-3 h-10 sm:h-12"
                    >
                      {translations[language].vitrine}
                    </Button>
                  )}
                  {/* Show message if no options available */}
                  {!canCreateMenu && !canCreateProducts && !canCreateVitrine && (
                    <div className="text-center text-gray-500 py-2 text-sm">
                      {translations[language].maxLimitReached}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            {type === 'direct' && (
              <div className="space-y-1">
                <Label htmlFor="directUrl" className="text-sm sm:text-base font-medium">{translations[language].url}</Label>
                <Input
                  id="directUrl"
                  type="url"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  placeholder={translations[language].enterURL}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-sm sm:text-base px-3 py-2 h-10 sm:h-12"
                />
              </div>
            )}
            {(type === 'menu' || selectedType === 'menu') && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                  <Label className="text-sm sm:text-base font-medium">{translations[language].links}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLink}
                    className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    {translations[language].addLink}
                  </Button>
                </div>
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Select
                        value={link.type || 'website'}
                        onValueChange={(value) => updateLink(index, 'type', value)}
                      >
                        <SelectTrigger className="w-full sm:w-[160px] h-10 sm:h-12 text-xs sm:text-sm">
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
                        className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeLink(index)}
                        className="h-10 w-10 sm:h-12 sm:w-12"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(type === 'menu' || type === 'both') && (
                <div className="space-y-3">
                {/* Orderable and COD Form Toggles */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Switch
                      checked={menuOrderable}
                      onCheckedChange={setMenuOrderable}
                      id="orderable-menu-toggle"
                    />
                    <Label htmlFor="orderable-menu-toggle" className="text-sm sm:text-base">{translations[language].orderableMenuToggle} (Optional)</Label>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Switch
                      checked={codFormEnabled}
                      onCheckedChange={setCodFormEnabled}
                      id="cod-form-toggle"
                    />
                    <Label htmlFor="cod-form-toggle" className="text-sm sm:text-base">{translations[language].codFormToggle} (Optional)</Label>
                  </div>
                </div>
                
                {/* Menu Categories */}
                <div className="space-y-3">
                  {menuCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-2 border p-3 sm:p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center">
                        <Input
                          placeholder={translations[language].categoryName}
                          value={category.name}
                          onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                          className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeCategory(categoryIndex)}
                          className="h-10 w-10 sm:h-12 sm:w-12"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 mt-3">
                        {category.items.map((item, itemIndex) => {
                          const availKey = `${categoryIndex}-${itemIndex}`;
                          return (
                            <div key={itemIndex} className="space-y-2 border p-2 sm:p-3 rounded">
                              <Input
                                placeholder={translations[language].itemName}
                                value={item.name}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'name', e.target.value)}
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                                className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                              />
                              <Textarea
                                placeholder={translations[language].description}
                                value={item.description}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'description', e.target.value)}
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                                className="min-h-[60px] sm:min-h-[80px] px-3 py-2 text-xs sm:text-sm"
                              />
                              <Input
                                placeholder={translations[language].price}
                                type="number"
                                value={item.price}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'price', e.target.value)}
                                className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingAvailability(prev => ({ ...prev, [availKey]: !prev[availKey] }))}
                                className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                              >
                                {editingAvailability[availKey] ? translations[language].hideAvailability || 'Hide Availability' : translations[language].editAvailability || 'Edit Availability'}
                              </Button>
                              {editingAvailability[availKey] && (
                                <div className="space-y-2">
                                  <Label className="text-sm sm:text-base font-medium">{translations[language].availability}</Label>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                    {Object.entries(item.availability || defaultAvailability).map(([day, isAvailable]) => (
                                      <div key={day} className="flex items-center space-x-1 sm:space-x-2">
                                        <Checkbox
                                          id={`new-${categoryIndex}-${itemIndex}-${day}`}
                                          checked={isAvailable}
                                          onCheckedChange={(checked) => 
                                            handleItemAvailabilityChange(categoryIndex, itemIndex, day, checked === true)
                                          }
                                        />
                                        <label
                                          htmlFor={`new-${categoryIndex}-${itemIndex}-${day}`}
                                          className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {translations[language].days[day as keyof typeof translations.en.days]}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="space-y-1 sm:space-y-2">
                                <Label className="text-sm sm:text-base font-medium">Images</Label>
                                <div className="flex gap-1 sm:gap-2 flex-wrap mb-1 sm:mb-2">
                                  {(item.images || []).map((imgUrl, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <img src={imgUrl} alt={item.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border" />
                                      <button
                                        type="button"
                                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white border border-gray-300 rounded-full p-0.5 sm:p-1 text-xs text-red-500 opacity-80 group-hover:opacity-100"
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
                                    className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                                  >
                                    + Add Image
                                  </Button>
                                </div>
                              </div>
                              {/* Variants Section */}
                              <div className="space-y-1 sm:space-y-2">
                                <Label className="text-sm sm:text-base font-medium">Variants</Label>
                                {(item.variants || []).map((variant, variantIdx) => (
                                  <div key={variantIdx} className="border rounded p-2 sm:p-3 mb-1 sm:mb-2">
                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center mb-1 sm:mb-2">
                                      <Input
                                        value={variant.name}
                                        onChange={e => {
                                          const newVariants = [...(item.variants || [])];
                                          newVariants[variantIdx].name = e.target.value;
                                          updateMenuItem(categoryIndex, itemIndex, 'variants', newVariants);
                                        }}
                                        placeholder="Variant name (e.g. Size, Color)"
                                        className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                          const newVariants = [...(item.variants || [])];
                                          newVariants.splice(variantIdx, 1);
                                          updateMenuItem(categoryIndex, itemIndex, 'variants', newVariants);
                                        }}
                                        className="h-10 w-10 sm:h-12 sm:w-12"
                                      >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </div>
                                    {/* Variant Options */}
                                    <div className="space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                                      {(variant.options || []).map((option, optionIdx) => (
                                        <div key={optionIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                          <Input
                                            value={option.name}
                                            onChange={e => {
                                              const newVariants = [...(item.variants || [])];
                                              newVariants[variantIdx].options[optionIdx].name = e.target.value;
                                              updateMenuItem(categoryIndex, itemIndex, 'variants', newVariants);
                                            }}
                                            placeholder="Option (e.g. Small, Red)"
                                            className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                                          />
                                          <Input
                                            type="number"
                                            value={option.price ?? ''}
                                            onChange={e => {
                                              const newVariants = [...(item.variants || [])];
                                              newVariants[variantIdx].options[optionIdx].price = e.target.value ? parseFloat(e.target.value) : undefined;
                                              updateMenuItem(categoryIndex, itemIndex, 'variants', newVariants);
                                            }}
                                            placeholder="Price adj."
                                            className="w-full sm:w-20 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => {
                                              const newVariants = [...(item.variants || [])];
                                              newVariants[variantIdx].options.splice(optionIdx, 1);
                                              updateMenuItem(categoryIndex, itemIndex, 'variants', newVariants);
                                            }}
                                            className="h-10 w-10 sm:h-12 sm:w-12"
                                          >
                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newVariants = [...(item.variants || [])];
                                          newVariants[variantIdx].options.push({ name: '' });
                                          updateMenuItem(categoryIndex, itemIndex, 'variants', newVariants);
                                        }}
                                        className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                                      >
                                        + Add Option
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newVariants = [...(item.variants || [])];
                                    newVariants.push({ name: '', options: [] });
                                    updateMenuItem(categoryIndex, itemIndex, 'variants', newVariants);
                                  }}
                                  className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                                >
                                  + Add Variant
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMenuItem(categoryIndex, itemIndex)}
                                className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                {translations[language].removeItem}
                              </Button>
                            </div>
                          );
                        })}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full py-3 h-12 sm:h-14 text-sm sm:text-base"
                          onClick={() => addMenuItem(categoryIndex)}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {translations[language].addMenuItem}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-3 h-12 sm:h-14 text-sm sm:text-base"
                    onClick={addCategory}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {translations[language].addCategory}
                  </Button>
                </div>
              </div>
            )}
            {(type === 'products' || selectedType === 'products') && (
              <div className="space-y-3">
                {/* Products Section */}
                  <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                    <Label className="text-sm sm:text-base font-medium">{translations[language].products}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addProduct}
                      disabled={products.length >= 1}
                      className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      {products.length === 0 ? translations[language].addProduct : '1 Product Maximum'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {products.map((product, index) => {
                      const availKey = `product-${index}`;
                      return (
                        <div key={index} className="space-y-2 border p-2 sm:p-3 rounded">
                    <Input
                            placeholder={translations[language].productName}
                            value={product.name}
                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                          />
                          <Textarea
                            placeholder={translations[language].description}
                            value={product.description}
                            onChange={(e) => updateProduct(index, 'description', e.target.value)}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            className="min-h-[60px] sm:min-h-[80px] px-3 py-2 text-xs sm:text-sm"
                    />
                    <Input
                            placeholder={translations[language].price}
                            type="number"
                            value={product.price}
                            onChange={(e) => updateProduct(index, 'price', e.target.value)}
                            className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                          />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                            onClick={() => setEditingAvailability(prev => ({ ...prev, [availKey]: !prev[availKey] }))}
                            className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                          >
                            {editingAvailability[availKey] ? translations[language].hideAvailability || 'Hide Availability' : translations[language].editAvailability || 'Edit Availability'}
                          </Button>
                          {editingAvailability[availKey] && (
                            <div className="space-y-2">
                              <Label className="text-sm sm:text-base font-medium">{translations[language].availability}</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                {Object.entries(product.availability || defaultAvailability).map(([day, isAvailable]) => (
                                  <div key={day} className="flex items-center space-x-1 sm:space-x-2">
                                    <Checkbox
                                      id={`product-${index}-${day}`}
                                      checked={isAvailable}
                                      onCheckedChange={(checked) => 
                                        handleProductAvailabilityChange(index, day, checked === true)
                                      }
                                    />
                                    <label
                                      htmlFor={`product-${index}-${day}`}
                                      className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {translations[language].days[day as keyof typeof translations.en.days]}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="space-y-1 sm:space-y-2">
                            <Label className="text-sm sm:text-base font-medium">Images</Label>
                            <div className="flex gap-1 sm:gap-2 flex-wrap mb-1 sm:mb-2">
                              {(product.images || []).map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="relative group">
                                  <img src={imgUrl} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border" />
                                  <button
                                    type="button"
                                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white border border-gray-300 rounded-full p-0.5 sm:p-1 text-xs text-red-500 opacity-80 group-hover:opacity-100"
                                    onClick={() => {
                                      const newImages = [...(product.images || [])];
                                      newImages.splice(imgIdx, 1);
                                      updateProduct(index, 'images', newImages);
                                      
                                      // Remove corresponding file from tempImages
                                      const key = `product-${index}-${imgIdx}`;
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
                                      const key = `product-${index}-${newImages.length + fileIndex}`;
                                      setTempImages(prev => ({ ...prev, [key]: file }));
                                      // Create temporary URL for preview
                                      const url = URL.createObjectURL(file);
                                      newImages.push(url);
                                    });
                                    updateProduct(index, 'images', newImages);
                                  };
                                  input.click();
                                }}
                                className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                              >
                                + Add Image
                        </Button>
                      </div>
                          </div>
                          {/* Variants Section */}
                          <div className="space-y-1 sm:space-y-2">
                            <Label className="text-sm sm:text-base font-medium">Variants</Label>
                            {(product.variants || []).map((variant, variantIdx) => (
                              <div key={variantIdx} className="border rounded p-2 sm:p-3 mb-1 sm:mb-2">
                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center mb-1 sm:mb-2">
                          <Input
                                    value={variant.name}
                                    onChange={e => {
                                      const newVariants = [...(product.variants || [])];
                                      newVariants[variantIdx].name = e.target.value;
                                      updateProduct(index, 'variants', newVariants);
                                    }}
                                    placeholder="Variant name (e.g. Size, Color)"
                                    className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                      const newVariants = [...(product.variants || [])];
                                      newVariants.splice(variantIdx, 1);
                                      updateProduct(index, 'variants', newVariants);
                                    }}
                                    className="h-10 w-10 sm:h-12 sm:w-12"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                                {/* Variant Options */}
                                <div className="space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                                  {(variant.options || []).map((option, optionIdx) => (
                                    <div key={optionIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <Input
                                        value={option.name}
                                        onChange={e => {
                                          const newVariants = [...(product.variants || [])];
                                          newVariants[variantIdx].options[optionIdx].name = e.target.value;
                                          updateProduct(index, 'variants', newVariants);
                                        }}
                                        placeholder="Option (e.g. Small, Red)"
                                        className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                                      />
                                      <Input
                                        type="number"
                                        value={option.price ?? ''}
                                        onChange={e => {
                                          const newVariants = [...(product.variants || [])];
                                          newVariants[variantIdx].options[optionIdx].price = e.target.value ? parseFloat(e.target.value) : undefined;
                                          updateProduct(index, 'variants', newVariants);
                                        }}
                                        placeholder="Price adj."
                                        className="w-full sm:w-20 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                            />
                            <Button
                              type="button"
                                        variant="destructive"
                              size="icon"
                              onClick={() => {
                                          const newVariants = [...(product.variants || [])];
                                          newVariants[variantIdx].options.splice(optionIdx, 1);
                                          updateProduct(index, 'variants', newVariants);
                                        }}
                                        className="h-10 w-10 sm:h-12 sm:w-12"
                                      >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newVariants = [...(product.variants || [])];
                                      newVariants[variantIdx].options.push({ name: '' });
                                      updateProduct(index, 'variants', newVariants);
                                    }}
                                    className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                                  >
                                    + Add Option
                            </Button>
                          </div>
                        </div>
                      ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newVariants = [...(product.variants || [])];
                                newVariants.push({ name: '', options: [] });
                                updateProduct(index, 'variants', newVariants);
                              }}
                              className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                            >
                              + Add Variant
                            </Button>
                    </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProduct(index)}
                            className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {translations[language].removeProduct}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {(type === 'vitrine' || selectedType === 'vitrine') && (
              <div className="space-y-3">
                {/* Hero Section */}
                <div className="space-y-2 border p-2 sm:p-3 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold">{translations[language].hero}</h3>
                  <div className="space-y-2">
                    <Input
                      placeholder={translations[language].enterBusinessName}
                      value={vitrine.hero.businessName}
                      onChange={(e) => setVitrine({
                        ...vitrine,
                        hero: { ...vitrine.hero, businessName: e.target.value }
                      })}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                    />
                    <Input
                      placeholder={translations[language].enterTagline}
                      value={vitrine.hero.tagline}
                      onChange={(e) => setVitrine({
                        ...vitrine,
                        hero: { ...vitrine.hero, tagline: e.target.value }
                      })}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                    />
                    <div className="flex items-center gap-2 sm:gap-3">
                      {vitrine.hero.logo && (
                        <img src={vitrine.hero.logo} alt="Business Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain border rounded" />
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
                              setTempImages(prev => ({ ...prev, 'hero-logo': file }));
                              const tempUrl = URL.createObjectURL(file);
                              setVitrine({
                                ...vitrine,
                                hero: { ...vitrine.hero, logo: tempUrl }
                              });
                            }
                          };
                          input.click();
                        }}
                        className="py-2 h-10 sm:h-12 text-xs sm:text-sm"
                      >
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {vitrine.hero.logo ? translations[language].changeLogo : translations[language].addLogo}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-2 border p-2 sm:p-3 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold">{translations[language].about}</h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder={translations[language].enterDescription}
                      value={vitrine.about.description}
                      onChange={(e) => setVitrine({
                        ...vitrine,
                        about: { ...vitrine.about, description: e.target.value }
                      })}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      className="min-h-[60px] sm:min-h-[80px] px-3 py-2 text-xs sm:text-sm"
                    />
                    <Input
                      placeholder={translations[language].enterCity}
                      value={vitrine.about.city}
                      onChange={(e) => setVitrine({
                        ...vitrine,
                        about: { ...vitrine.about, city: e.target.value }
                      })}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Services Section */}
                <div className="space-y-2 border p-2 sm:p-3 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                    <h3 className="text-sm sm:text-base font-semibold">{translations[language].services}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVitrine({
                        ...vitrine,
                        services: [...vitrine.services, { name: '', title: '', imageDescription: '', images: [] }]
                      })}
                      className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {translations[language].addService}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {vitrine.services.map((service, index) => (
                      <div key={index} className="space-y-2 border p-2 sm:p-3 rounded">
                        <Input
                          placeholder={translations[language].enterServiceName}
                          value={service.name}
                          onChange={(e) => {
                            const newServices = [...vitrine.services];
                            newServices[index] = { ...service, name: e.target.value };
                            setVitrine({ ...vitrine, services: newServices });
                          }}
                          className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <Input
                          placeholder={translations[language].enterServiceTitle}
                          value={service.title}
                          onChange={(e) => {
                            const newServices = [...vitrine.services];
                            newServices[index] = { ...service, title: e.target.value };
                            setVitrine({ ...vitrine, services: newServices });
                          }}
                          className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <Textarea
                          placeholder={translations[language].enterImageDescription}
                          value={service.imageDescription}
                          onChange={(e) => {
                            const newServices = [...vitrine.services];
                            newServices[index] = { ...service, imageDescription: e.target.value };
                            setVitrine({ ...vitrine, services: newServices });
                          }}
                          className="min-h-[60px] sm:min-h-[80px] px-3 py-2 text-xs sm:text-sm"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <div className="flex items-center gap-2 sm:gap-3">
                          {service.images.length > 0 && (
                            <img src={service.images[0]} alt={service.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
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
                                  newServices[index] = { ...service, images: [tempUrl] };
                                  setVitrine({ ...vitrine, services: newServices });
                                }
                              };
                              input.click();
                            }}
                            className="py-2 h-10 sm:h-12 text-xs sm:text-sm"
                          >
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {service.images.length > 0 ? translations[language].changeImage : translations[language].addImage}
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
                          className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {translations[language].removeService}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gallery Section */}
                <div className="space-y-2 border p-2 sm:p-3 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                    <h3 className="text-sm sm:text-base font-semibold">{translations[language].gallery}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVitrine({
                        ...vitrine,
                        gallery: [...vitrine.gallery, { images: [], title: '', description: '' }]
                      })}
                      className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {translations[language].addImage}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {vitrine.gallery.map((item, index) => (
                      <div key={index} className="space-y-2 border p-2 sm:p-3 rounded">
                        <Input
                          placeholder={translations[language].enterImageTitle}
                          value={item.title}
                          onChange={(e) => {
                            const newGallery = [...vitrine.gallery];
                            newGallery[index] = { ...item, title: e.target.value };
                            setVitrine({ ...vitrine, gallery: newGallery });
                          }}
                          className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <Textarea
                          placeholder={translations[language].enterImageDescription}
                          value={item.description}
                          onChange={(e) => {
                            const newGallery = [...vitrine.gallery];
                            newGallery[index] = { ...item, description: e.target.value };
                            setVitrine({ ...vitrine, gallery: newGallery });
                          }}
                          className="min-h-[60px] sm:min-h-[80px] px-3 py-2 text-xs sm:text-sm"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <div className="flex items-center gap-2 sm:gap-3">
                          {item.images.length > 0 && (
                            <img src={item.images[0]} alt={item.title} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
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
                                  newGallery[index] = { ...item, images: [tempUrl] };
                                  setVitrine({ ...vitrine, gallery: newGallery });
                                }
                              };
                              input.click();
                            }}
                            className="py-2 h-10 sm:h-12 text-xs sm:text-sm"
                          >
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {item.images.length > 0 ? translations[language].changeImage : translations[language].addImage}
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
                          className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {translations[language].removeImage}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials Section */}
                <div className="space-y-2 border p-2 sm:p-3 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                    <h3 className="text-sm sm:text-base font-semibold">{translations[language].testimonials}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVitrine({
                        ...vitrine,
                        testimonials: [...vitrine.testimonials, { text: '', author: '', city: '' }]
                      })}
                      className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {translations[language].addTestimonial}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {vitrine.testimonials.map((testimonial, index) => (
                      <div key={index} className="space-y-2 border p-2 sm:p-3 rounded">
                        <Textarea
                          placeholder={translations[language].enterTestimonialText}
                          value={testimonial.text}
                          onChange={(e) => {
                            const newTestimonials = [...vitrine.testimonials];
                            newTestimonials[index] = { ...testimonial, text: e.target.value };
                            setVitrine({ ...vitrine, testimonials: newTestimonials });
                          }}
                          className="min-h-[60px] sm:min-h-[80px] px-3 py-2 text-xs sm:text-sm"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <Input
                          placeholder={translations[language].enterAuthor}
                          value={testimonial.author}
                          onChange={(e) => {
                            const newTestimonials = [...vitrine.testimonials];
                            newTestimonials[index] = { ...testimonial, author: e.target.value };
                            setVitrine({ ...vitrine, testimonials: newTestimonials });
                          }}
                          className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <Input
                          placeholder={translations[language].enterCity}
                          value={testimonial.city}
                          onChange={(e) => {
                            const newTestimonials = [...vitrine.testimonials];
                            newTestimonials[index] = { ...testimonial, city: e.target.value };
                            setVitrine({ ...vitrine, testimonials: newTestimonials });
                          }}
                          className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newTestimonials = vitrine.testimonials.filter((_, i) => i !== index);
                            setVitrine({ ...vitrine, testimonials: newTestimonials });
                          }}
                          className="w-full sm:w-auto py-2 h-10 sm:h-12 text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {translations[language].removeTestimonial}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-2 border p-2 sm:p-3 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold">{translations[language].contact}</h3>
                  <div className="space-y-2">
                    <Input
                      placeholder={translations[language].enterAddress}
                      value={vitrine.contact.address}
                      onChange={(e) => setVitrine({
                        ...vitrine,
                        contact: { ...vitrine.contact, address: e.target.value }
                      })}
                      className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <Input
                      placeholder={translations[language].enterPhone}
                      value={vitrine.contact.phone}
                      onChange={(e) => setVitrine({
                        ...vitrine,
                        contact: { ...vitrine.contact, phone: e.target.value }
                      })}
                      className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <Input
                      placeholder={translations[language].enterEmail}
                      type="email"
                      value={vitrine.contact.email}
                      onChange={(e) => setVitrine({
                        ...vitrine,
                        contact: { ...vitrine.contact, email: e.target.value }
                      })}
                      className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>

                {/* Footer Section */}
                <div className="space-y-2 border p-2 sm:p-3 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold">{translations[language].footer}</h3>
                  <div className="space-y-2">
                    <Input
                      placeholder={translations[language].enterBusinessName}
                      value={vitrine.footer.businessName}
                      onChange={(e) => setVitrine({
                        ...vitrine,
                        footer: { ...vitrine.footer, businessName: e.target.value }
                      })}
                      className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="mt-3 sm:mt-4">
              <QRPreview 
                url={type === 'direct' ? `https://quickqr-heyg.onrender.com/api/qrcodes/redirect/${encodeURIComponent(directUrl)}` : name ? `https://qrcreator.xyz/landing/preview` : ''}
                color={foregroundColor}
                bgColor={backgroundColor}
                logoUrl={logoPreview || undefined}
              />
            </div>
          </div>
          {/* Branding & Appearance Toggle Button */}
          <div className="mt-4 sm:mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBrandingSettings(!showBrandingSettings)}
              className="w-full flex items-center justify-between py-3 sm:py-4 h-12 sm:h-14"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm sm:text-base">Branding & Appearance</span>
              </div>
              {showBrandingSettings ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Branding & Appearance Section */}
          {showBrandingSettings && (
            <div className="mt-3 sm:mt-4 border rounded-lg p-3 sm:p-4 bg-gray-50">
              <div className="space-y-3 sm:space-y-4">
                {/* QR Code Colors */}
            <div className="space-y-2">
                  <Label htmlFor="foregroundColor" className="text-sm sm:text-base font-medium">{translations[language].foregroundColor}</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="foregroundColor"
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-full sm:w-20 h-10 sm:h-12"
                />
                <Input
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                />
              </div>
            </div>
                
            <div className="space-y-2">
                  <Label htmlFor="backgroundColor" className="text-sm sm:text-base font-medium">{translations[language].backgroundColor}</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full sm:w-20 h-10 sm:h-12"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                />
              </div>
            </div>
            
            {/* Landing Page Colors */}
                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">Landing Page Colors</h3>
              
                  <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                      <Label htmlFor="primaryColor" className="text-sm sm:text-base font-medium">Primary Color</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-full sm:w-20 h-10 sm:h-12"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                      <Label htmlFor="primaryHoverColor" className="text-sm sm:text-base font-medium">Primary Hover Color</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="primaryHoverColor"
                      type="color"
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                          className="w-full sm:w-20 h-10 sm:h-12"
                    />
                    <Input
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                          className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                      <Label htmlFor="accentColor" className="text-sm sm:text-base font-medium">Accent Color</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                          className="w-full sm:w-20 h-10 sm:h-12"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-medium">Background Gradient</Label>
                      <div className="p-2 sm:p-3 bg-gray-50 rounded-md border">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          The background gradient is automatically generated based on your Primary and Accent colors.
                        </p>
                        <div 
                          className="w-full h-6 sm:h-8 rounded border"
                          style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}25 0%, ${primaryColor}15 20%, white 50%, ${accentColor}15 80%, ${accentColor}25 100%)`
                          }}
                        ></div>
                      </div>
                </div>
                
                <div className="space-y-2">
                      <Label htmlFor="loadingSpinnerColor" className="text-sm sm:text-base font-medium">Loading Spinner Color</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="loadingSpinnerColor"
                      type="color"
                      value={loadingSpinnerColor}
                      onChange={(e) => setLoadingSpinnerColor(e.target.value)}
                          className="w-full sm:w-20 h-10 sm:h-12"
                    />
                    <Input
                      value={loadingSpinnerColor}
                      onChange={(e) => setLoadingSpinnerColor(e.target.value)}
                          className="flex-1 h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                      <Label htmlFor="loadingSpinnerBorderColor" className="text-sm sm:text-base font-medium">Loading Spinner Border Color</Label>
                  <Input
                    id="loadingSpinnerBorderColor"
                    value={loadingSpinnerBorderColor}
                    onChange={(e) => setLoadingSpinnerBorderColor(e.target.value)}
                    placeholder="rgba(139, 92, 246, 0.2)"
                        className="h-10 sm:h-12 px-3 py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
            </div>
          </div>
          )}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2">
            <Button 
              type="submit" 
              className="w-full sm:w-auto text-sm sm:text-base py-3 sm:py-4 h-12 sm:h-14"
              disabled={isLoading || (!canCreateMenu && !canCreateProducts && !canCreateVitrine)}
            >
              {isLoading ? translations[language].creating : translations[language].createQRCode}
            </Button>
          </div>
          {error && <div className="text-red-500 mt-2 text-sm sm:text-base">{error}</div>}
        </form>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
