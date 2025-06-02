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
import { Checkbox } from '@/components/ui/checkbox';

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
    basic: "Basic",
    advanced: "Advanced",
    name: "Name",
    myQRCode: "My QR Code",
    textAboveQR: "Text Above QR Code",
    enterTextAbove: "Enter text to display above QR code",
    textBelowQR: "Text Below QR Code",
    enterTextBelow: "Enter text to display below QR code",
    type: "Type",
    url: "URL",
    menu: "Menu",
    both: "Both",
    directLink: "Direct Link",
    enterURL: "Enter URL",
    links: "Links",
    selectPlatform: "Select platform",
    website: "Website",
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "Twitter",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    tiktok: "TikTok",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    other: "Other",
    foregroundColor: "Foreground Color",
    backgroundColor: "Background Color",
    logo: "Logo",
    creating: "Creating...",
    createQRCode: "Create QR Code",
    downloadPNG: "Download PNG",
    downloadSVG: "Download SVG",
    success: "Success",
    error: "Error",
    qrCodeDownloaded: "QR code downloaded as",
    failedToDownload: "Failed to download QR code",
    invalidFileType: "Invalid file type",
    pleaseUploadImage: "Please upload an image file (PNG, JPG, etc.)",
    fileTooLarge: "File too large",
    logoImageMustBeLess: "Logo image must be less than 2MB",
    addImage: "Add Image",
    changeImage: "Change Image",
    itemImage: "Item Image",
    categoryName: "Category Name",
    itemName: "Item Name",
    description: "Description",
    price: "Price",
    availability: "Availability",
    days: {
      sunday: "Sunday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday"
    },
    removeItem: "Remove Item",
    addMenuItem: "Add Menu Item",
    addCategory: "Add Category",
    addLink: "Add Link",
    vitrine: "Vitrine",
    enterBusinessName: "Business Name",
    enterTagline: "Tagline",
    enterCtaText: "CTA Text",
    enterCtaLink: "CTA Link",
    enterDescription: "Description",
    enterCity: "City",
    addService: "Add Service",
    enterServiceName: "Service Name",
    enterServiceDescription: "Service Description",
    uploadServiceImage: "Upload Service Image",
    changeServiceImage: "Change Service Image",
    removeService: "Remove Service",
    gallery: "Gallery",
    enterImageTitle: "Image Title",
    enterImageDescription: "Image Description",
    testimonials: "Testimonials",
    addTestimonial: "Add Testimonial",
    enterTestimonialText: "Testimonial Text",
    enterAuthor: "Author",
    enterAddress: "Address",
    enterPhone: "Phone",
    enterEmail: "Email",
    socialMedia: "Social Media",
    enterFacebook: "Facebook URL",
    enterInstagram: "Instagram URL",
    enterTwitter: "Twitter URL",
    enterLinkedin: "LinkedIn URL",
    enterYoutube: "YouTube URL",
    enterTiktok: "TikTok URL",
    enableContactForm: "Enable Contact Form",
    formFields: "Form Fields",
    addField: "Add Field",
    enterFieldName: "Field Name",
    fieldType: "Field Type",
    textField: "Text",
    emailField: "Email",
    phoneField: "Phone",
    textareaField: "Textarea",
    required: "Required",
    footer: "Footer",
    quickLinks: "Quick Links",
    addQuickLink: "Add Quick Link",
    enterQuickLinkLabel: "Label",
    enterQuickLinkUrl: "URL",
    hero: "Hero",
    about: "About",
    services: "Services",
    socialIcons: "Social Icons",
    removeImage: "Remove Image",
    removeTestimonial: "Remove Testimonial",
    contact: "Contact"
  },
  ar: {
    basic: "أساسي",
    advanced: "متقدم",
    name: "الاسم",
    myQRCode: "رمز QR الخاص بي",
    textAboveQR: "نص فوق رمز QR",
    enterTextAbove: "أدخل النص لعرضه فوق رمز QR",
    textBelowQR: "نص تحت رمز QR",
    enterTextBelow: "أدخل النص لعرضه تحت رمز QR",
    type: "النوع",
    url: "رابط",
    menu: "قائمة",
    both: "كلاهما",
    directLink: "رابط مباشر",
    enterURL: "أدخل الرابط",
    links: "الروابط",
    selectPlatform: "اختر المنصة",
    website: "موقع إلكتروني",
    facebook: "فيسبوك",
    instagram: "انستغرام",
    twitter: "تويتر",
    linkedin: "لينكد إن",
    youtube: "يوتيوب",
    tiktok: "تيك توك",
    whatsapp: "واتساب",
    telegram: "تيليجرام",
    other: "أخرى",
    foregroundColor: "لون المقدمة",
    backgroundColor: "لون الخلفية",
    logo: "الشعار",
    creating: "جاري الإنشاء...",
    createQRCode: "إنشاء رمز QR",
    downloadPNG: "تحميل PNG",
    downloadSVG: "تحميل SVG",
    success: "نجاح",
    error: "خطأ",
    qrCodeDownloaded: "تم تحميل رمز QR كملف",
    failedToDownload: "فشل تحميل رمز QR",
    invalidFileType: "نوع ملف غير صالح",
    pleaseUploadImage: "يرجى تحميل ملف صورة (PNG، JPG، إلخ)",
    fileTooLarge: "الملف كبير جداً",
    logoImageMustBeLess: "يجب أن يكون حجم صورة الشعار أقل من 2 ميجابايت",
    addImage: "إضافة صورة",
    changeImage: "تغيير الصورة",
    itemImage: "صورة العنصر",
    categoryName: "اسم الفئة",
    itemName: "اسم العنصر",
    description: "الوصف",
    price: "السعر",
    availability: "التوفر",
    days: {
      sunday: "الأحد",
      monday: "الاثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت"
    },
    removeItem: "حذف العنصر",
    addMenuItem: "إضافة عنصر",
    addCategory: "إضافة فئة",
    addLink: "إضافة رابط",
    vitrine: "فيترين",
    enterBusinessName: "اسم الشركة",
    enterTagline: "العنوان",
    enterCtaText: "نص الإطلاق",
    enterCtaLink: "رابط الإطلاق",
    enterDescription: "الوصف",
    enterCity: "المدينة",
    addService: "إضافة خدمة",
    enterServiceName: "اسم الخدمة",
    enterServiceDescription: "وصف الخدمة",
    uploadServiceImage: "رفع صورة الخدمة",
    changeServiceImage: "تغيير صورة الخدمة",
    removeService: "إزالة الخدمة",
    gallery: "المعرض",
    enterImageTitle: "عنوان الصورة",
    enterImageDescription: "وصف الصورة",
    testimonials: "التعليقات",
    addTestimonial: "إضافة تعليق",
    enterTestimonialText: "نص التعليق",
    enterAuthor: "المؤلف",
    enterAddress: "العنوان",
    enterPhone: "الهاتف",
    enterEmail: "البريد الإلكتروني",
    socialMedia: "الوسائل التواصلية",
    enterFacebook: "رابط فيسبوك",
    enterInstagram: "رابط انستغرام",
    enterTwitter: "رابط تويتر",
    enterLinkedin: "رابط لينكد إن",
    enterYoutube: "رابط يوتيوب",
    enterTiktok: "رابط تيك توك",
    enableContactForm: "تفعيل نموذج الاتصال",
    formFields: "حقول النموذج",
    addField: "إضافة حقل",
    enterFieldName: "اسم الحقل",
    fieldType: "نوع الحقل",
    textField: "نص",
    emailField: "بريد إلكتروني",
    phoneField: "هاتف",
    textareaField: "نص طويل",
    required: "مطلوب",
    footer: "الأسفل",
    quickLinks: "روابط سريعة",
    addQuickLink: "إضافة رابط سريع",
    enterQuickLinkLabel: "التسمية",
    enterQuickLinkUrl: "الرابط",
    hero: "الرئيسية",
    about: "حول",
    services: "الخدمات",
    socialIcons: "أيقونات التواصل الاجتماعي",
    removeImage: "إزالة الصورة",
    removeTestimonial: "إزالة التعليق",
    contact: "اتصل بنا"
  }
};

const QRCodeGenerator: React.FC<QRCodeFormProps> = ({ onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [type, setType] = useState<'url' | 'menu' | 'both' | 'direct' | 'vitrine'>('url');
  const [directUrl, setDirectUrl] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [vitrine, setVitrine] = useState({
    hero: {
      businessName: '',
      logo: '',
      tagline: '',
      cta: {
        text: 'Contact Us',
        link: ''
      }
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
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        youtube: '',
        tiktok: ''
      },
      contactForm: {
        enabled: false,
        fields: []
      }
    },
    footer: {
      copyright: `© ${new Date().getFullYear()}`,
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
  });
  const [foregroundColor, setForegroundColor] = useState('#6366F1');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textAbove, setTextAbove] = useState('Scan me');
  const [textBelow, setTextBelow] = useState('');
  const [tempImages, setTempImages] = useState<{ [key: string]: File }>({});
  const [menuLanguage, setMenuLanguage] = useState<'en' | 'ar'>('en');

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
    setTextAbove('Scan me');
    setTextBelow('');
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
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name || 'My QR Code');
      formData.append('type', type);
      formData.append('foregroundColor', foregroundColor);
      formData.append('backgroundColor', backgroundColor);
      formData.append('textAbove', textAbove);
      formData.append('textBelow', textBelow);
      
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
            cta: {
              text: vitrine.hero.cta.text || 'Contact Us',
              link: vitrine.hero.cta.link || ''
            }
          },
          about: {
            description: vitrine.about.description,
            city: vitrine.about.city || ''
          },
          services: vitrine.services.map(service => ({
            name: service.name || '',
            description: service.description || '',
            imageUrl: service.imageUrl || ''
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
            socialMedia: {
              facebook: vitrine.contact.socialMedia.facebook || '',
              instagram: vitrine.contact.socialMedia.instagram || '',
              twitter: vitrine.contact.socialMedia.twitter || '',
              linkedin: vitrine.contact.socialMedia.linkedin || '',
              youtube: vitrine.contact.socialMedia.youtube || '',
              tiktok: vitrine.contact.socialMedia.tiktok || ''
            },
            contactForm: {
              enabled: vitrine.contact.contactForm?.enabled || false,
              fields: (vitrine.contact.contactForm?.fields || []).map(field => ({
                name: field.name || '',
                type: field.type || 'text',
                required: field.required || false
              }))
            }
          },
          footer: {
            copyright: vitrine.footer.copyright || `© ${new Date().getFullYear()}`,
            businessName: vitrine.footer.businessName,
            quickLinks: vitrine.footer.quickLinks.map(link => ({
              label: link.label || '',
              url: link.url || '',
              type: link.type || 'link'
            })),
            socialIcons: {
              facebook: vitrine.footer.socialIcons.facebook || '',
              instagram: vitrine.footer.socialIcons.instagram || '',
              twitter: vitrine.footer.socialIcons.twitter || '',
              linkedin: vitrine.footer.socialIcons.linkedin || '',
              youtube: vitrine.footer.socialIcons.youtube || '',
              tiktok: vitrine.footer.socialIcons.tiktok || ''
            }
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
        title: translations[menuLanguage].success,
        description: "QR code created successfully",
      });
    } catch (error: any) {
      console.error('Error creating QR code:', error);
      setError(error.message || 'Failed to create QR code');
      toast({
        variant: "destructive",
        title: translations[menuLanguage].error,
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
              <TabsTrigger value="basic">{translations[menuLanguage].basic}</TabsTrigger>
              <TabsTrigger value="advanced">{translations[menuLanguage].advanced}</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{translations[menuLanguage].name}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={translations[menuLanguage].myQRCode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textAbove">{translations[menuLanguage].textAboveQR}</Label>
                  <Input
                    id="textAbove"
                    value={textAbove}
                    onChange={(e) => setTextAbove(e.target.value)}
                    placeholder={translations[menuLanguage].enterTextAbove}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textBelow">{translations[menuLanguage].textBelowQR}</Label>
                  <Input
                    id="textBelow"
                    value={textBelow}
                    onChange={(e) => setTextBelow(e.target.value)}
                    placeholder={translations[menuLanguage].enterTextBelow}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations[menuLanguage].type}</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={type === 'url' ? 'default' : 'outline'}
                      onClick={() => setType('url')}
                      className="flex-1"
                    >
                      {translations[menuLanguage].url}
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'menu' ? 'default' : 'outline'}
                      onClick={() => setType('menu')}
                      className="flex-1"
                    >
                      {translations[menuLanguage].menu}
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'both' ? 'default' : 'outline'}
                      onClick={() => setType('both')}
                      className="flex-1"
                    >
                      {translations[menuLanguage].both}
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'direct' ? 'default' : 'outline'}
                      onClick={() => setType('direct')}
                      className="flex-1"
                    >
                      {translations[menuLanguage].directLink}
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'vitrine' ? 'default' : 'outline'}
                      onClick={() => setType('vitrine')}
                      className="flex-1"
                    >
                      {translations[menuLanguage].vitrine}
                    </Button>
                  </div>
                </div>
                {type === 'direct' && (
                  <div className="space-y-2">
                    <Label htmlFor="directUrl">{translations[menuLanguage].url}</Label>
                    <Input
                      id="directUrl"
                      type="url"
                      value={directUrl}
                      onChange={(e) => setDirectUrl(e.target.value)}
                      placeholder={translations[menuLanguage].enterURL}
                    />
                  </div>
                )}
                {(type === 'url' || type === 'both') && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>{translations[menuLanguage].links}</Label>
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(type === 'menu' || type === 'both') && (
                  <div className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMenuLanguage(menuLanguage === 'en' ? 'ar' : 'en')}
                        className="flex items-center gap-2"
                      >
                        {menuLanguage === 'en' ? 'العربية' : 'English'}
                      </Button>
                    </div>
                    {menuCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="space-y-2 border p-4 rounded-lg">
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder={translations[menuLanguage].categoryName}
                            value={category.name}
                            onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                            dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
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
                                placeholder={translations[menuLanguage].itemName}
                                value={item.name}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'name', e.target.value)}
                                dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
                              />
                              <Textarea
                                placeholder={translations[menuLanguage].description}
                                value={item.description}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'description', e.target.value)}
                                dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
                              />
                              <Input
                                type="number"
                                placeholder={translations[menuLanguage].price}
                                value={item.price}
                                onChange={(e) => updateMenuItem(categoryIndex, itemIndex, 'price', parseFloat(e.target.value))}
                                dir={menuLanguage === 'ar' ? 'rtl' : 'ltr'}
                              />
                              <div className="space-y-2">
                                <Label>{translations[menuLanguage].itemImage}</Label>
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
                                    {item.imageUrl ? translations[menuLanguage].changeImage : translations[menuLanguage].addImage}
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>{translations[menuLanguage].availability}</Label>
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
                                        {translations[menuLanguage].days[day as keyof typeof translations.en.days]}
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
                                {translations[menuLanguage].removeItem}
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
                            {translations[menuLanguage].addMenuItem}
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
                      {translations[menuLanguage].addCategory}
                    </Button>
                  </div>
                )}
                {type === 'vitrine' && (
                  <div className="space-y-4">
                    {/* Hero Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{translations[menuLanguage].hero}</h3>
                      <div className="space-y-2">
                        <Input
                          placeholder={translations[menuLanguage].enterBusinessName}
                          value={vitrine.hero.businessName}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            hero: { ...vitrine.hero, businessName: e.target.value }
                          })}
                        />
                        <Input
                          placeholder={translations[menuLanguage].enterTagline}
                          value={vitrine.hero.tagline}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            hero: { ...vitrine.hero, tagline: e.target.value }
                          })}
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder={translations[menuLanguage].enterCtaText}
                            value={vitrine.hero.cta.text}
                            onChange={(e) => setVitrine({
                              ...vitrine,
                              hero: { ...vitrine.hero, cta: { ...vitrine.hero.cta, text: e.target.value } }
                            })}
                          />
                          <Input
                            placeholder={translations[menuLanguage].enterCtaLink}
                            value={vitrine.hero.cta.link}
                            onChange={(e) => setVitrine({
                              ...vitrine,
                              hero: { ...vitrine.hero, cta: { ...vitrine.hero.cta, link: e.target.value } }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{translations[menuLanguage].about}</h3>
                      <div className="space-y-2">
                        <Textarea
                          placeholder={translations[menuLanguage].enterDescription}
                          value={vitrine.about.description}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            about: { ...vitrine.about, description: e.target.value }
                          })}
                        />
                        <Input
                          placeholder={translations[menuLanguage].enterCity}
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
                        <h3 className="text-lg font-semibold">{translations[menuLanguage].services}</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setVitrine({
                            ...vitrine,
                            services: [...vitrine.services, { name: '', description: '', imageUrl: '' }]
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {translations[menuLanguage].addService}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {vitrine.services.map((service, index) => (
                          <div key={index} className="space-y-2 border p-2 rounded">
                            <Input
                              placeholder={translations[menuLanguage].enterServiceName}
                              value={service.name}
                              onChange={(e) => {
                                const newServices = [...vitrine.services];
                                newServices[index] = { ...service, name: e.target.value };
                                setVitrine({ ...vitrine, services: newServices });
                              }}
                            />
                            <Textarea
                              placeholder={translations[menuLanguage].enterServiceDescription}
                              value={service.description}
                              onChange={(e) => {
                                const newServices = [...vitrine.services];
                                newServices[index] = { ...service, description: e.target.value };
                                setVitrine({ ...vitrine, services: newServices });
                              }}
                            />
                            <div className="flex items-center gap-4">
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
                                {service.imageUrl ? translations[menuLanguage].changeImage : translations[menuLanguage].uploadServiceImage}
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newServices = vitrine.services.filter((_, i) => i !== index);
                                setVitrine({ ...vitrine, services: newServices });
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {translations[menuLanguage].removeService}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gallery Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{translations[menuLanguage].gallery}</h3>
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
                          {translations[menuLanguage].addImage}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {vitrine.gallery.map((item, index) => (
                          <div key={index} className="space-y-2 border p-2 rounded">
                            <Input
                              placeholder={translations[menuLanguage].enterImageTitle}
                              value={item.title}
                              onChange={(e) => {
                                const newGallery = [...vitrine.gallery];
                                newGallery[index] = { ...item, title: e.target.value };
                                setVitrine({ ...vitrine, gallery: newGallery });
                              }}
                            />
                            <Textarea
                              placeholder={translations[menuLanguage].enterImageDescription}
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
                                {item.imageUrl ? translations[menuLanguage].changeImage : translations[menuLanguage].addImage}
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
                              {translations[menuLanguage].removeImage}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Testimonials Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{translations[menuLanguage].testimonials}</h3>
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
                          {translations[menuLanguage].addTestimonial}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {vitrine.testimonials.map((testimonial, index) => (
                          <div key={index} className="space-y-2 border p-2 rounded">
                            <Textarea
                              placeholder={translations[menuLanguage].enterTestimonialText}
                              value={testimonial.text}
                              onChange={(e) => {
                                const newTestimonials = [...vitrine.testimonials];
                                newTestimonials[index] = { ...testimonial, text: e.target.value };
                                setVitrine({ ...vitrine, testimonials: newTestimonials });
                              }}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterAuthor}
                              value={testimonial.author}
                              onChange={(e) => {
                                const newTestimonials = [...vitrine.testimonials];
                                newTestimonials[index] = { ...testimonial, author: e.target.value };
                                setVitrine({ ...vitrine, testimonials: newTestimonials });
                              }}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterCity}
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
                              {translations[menuLanguage].removeTestimonial}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{translations[menuLanguage].contact}</h3>
                      <div className="space-y-2">
                        <Input
                          placeholder={translations[menuLanguage].enterAddress}
                          value={vitrine.contact.address}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            contact: { ...vitrine.contact, address: e.target.value }
                          })}
                        />
                        <Input
                          placeholder={translations[menuLanguage].enterPhone}
                          value={vitrine.contact.phone}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            contact: { ...vitrine.contact, phone: e.target.value }
                          })}
                        />
                        <Input
                          placeholder={translations[menuLanguage].enterEmail}
                          type="email"
                          value={vitrine.contact.email}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            contact: { ...vitrine.contact, email: e.target.value }
                          })}
                        />
                        <div className="space-y-2">
                          <h4 className="font-medium">{translations[menuLanguage].socialMedia}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder={translations[menuLanguage].enterFacebook}
                              value={vitrine.contact.socialMedia.facebook}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                contact: {
                                  ...vitrine.contact,
                                  socialMedia: { ...vitrine.contact.socialMedia, facebook: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterInstagram}
                              value={vitrine.contact.socialMedia.instagram}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                contact: {
                                  ...vitrine.contact,
                                  socialMedia: { ...vitrine.contact.socialMedia, instagram: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterTwitter}
                              value={vitrine.contact.socialMedia.twitter}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                contact: {
                                  ...vitrine.contact,
                                  socialMedia: { ...vitrine.contact.socialMedia, twitter: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterLinkedin}
                              value={vitrine.contact.socialMedia.linkedin}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                contact: {
                                  ...vitrine.contact,
                                  socialMedia: { ...vitrine.contact.socialMedia, linkedin: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterYoutube}
                              value={vitrine.contact.socialMedia.youtube}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                contact: {
                                  ...vitrine.contact,
                                  socialMedia: { ...vitrine.contact.socialMedia, youtube: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterTiktok}
                              value={vitrine.contact.socialMedia.tiktok}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                contact: {
                                  ...vitrine.contact,
                                  socialMedia: { ...vitrine.contact.socialMedia, tiktok: e.target.value }
                                }
                              })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="contactForm"
                              checked={vitrine.contact.contactForm?.enabled}
                              onCheckedChange={(checked) => setVitrine({
                                ...vitrine,
                                contact: {
                                  ...vitrine.contact,
                                  contactForm: {
                                    ...vitrine.contact.contactForm,
                                    enabled: checked === true
                                  }
                                }
                              })}
                            />
                            <label htmlFor="contactForm" className="text-sm font-medium">
                              {translations[menuLanguage].enableContactForm}
                            </label>
                          </div>
                          {vitrine.contact.contactForm?.enabled && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">{translations[menuLanguage].formFields}</h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setVitrine({
                                    ...vitrine,
                                    contact: {
                                      ...vitrine.contact,
                                      contactForm: {
                                        ...vitrine.contact.contactForm,
                                        fields: [
                                          ...(vitrine.contact.contactForm?.fields || []),
                                          { name: '', type: 'text', required: false }
                                        ]
                                      }
                                    }
                                  })}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  {translations[menuLanguage].addField}
                                </Button>
                              </div>
                              {vitrine.contact.contactForm?.fields.map((field, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    placeholder={translations[menuLanguage].enterFieldName}
                                    value={field.name}
                                    onChange={(e) => {
                                      const newFields = [...(vitrine.contact.contactForm?.fields || [])];
                                      newFields[index] = { ...field, name: e.target.value };
                                      setVitrine({
                                        ...vitrine,
                                        contact: {
                                          ...vitrine.contact,
                                          contactForm: {
                                            ...vitrine.contact.contactForm,
                                            fields: newFields
                                          }
                                        }
                                      });
                                    }}
                                  />
                                  <Select
                                    value={field.type}
                                    onValueChange={(value) => {
                                      const newFields = [...(vitrine.contact.contactForm?.fields || [])];
                                      newFields[index] = { ...field, type: value as any };
                                      setVitrine({
                                        ...vitrine,
                                        contact: {
                                          ...vitrine.contact,
                                          contactForm: {
                                            ...vitrine.contact.contactForm,
                                            fields: newFields
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder={translations[menuLanguage].fieldType} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">{translations[menuLanguage].textField}</SelectItem>
                                      <SelectItem value="email">{translations[menuLanguage].emailField}</SelectItem>
                                      <SelectItem value="phone">{translations[menuLanguage].phoneField}</SelectItem>
                                      <SelectItem value="textarea">{translations[menuLanguage].textareaField}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`required-${index}`}
                                      checked={field.required}
                                      onCheckedChange={(checked) => {
                                        const newFields = [...(vitrine.contact.contactForm?.fields || [])];
                                        newFields[index] = { ...field, required: checked === true };
                                        setVitrine({
                                          ...vitrine,
                                          contact: {
                                            ...vitrine.contact,
                                            contactForm: {
                                              ...vitrine.contact.contactForm,
                                              fields: newFields
                                            }
                                          }
                                        });
                                      }}
                                    />
                                    <label htmlFor={`required-${index}`} className="text-sm">
                                      {translations[menuLanguage].required}
                                    </label>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      const newFields = vitrine.contact.contactForm?.fields.filter((_, i) => i !== index);
                                      setVitrine({
                                        ...vitrine,
                                        contact: {
                                          ...vitrine.contact,
                                          contactForm: {
                                            ...vitrine.contact.contactForm,
                                            fields: newFields || []
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="space-y-2 border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{translations[menuLanguage].footer}</h3>
                      <div className="space-y-2">
                        <Input
                          placeholder={translations[menuLanguage].enterBusinessName}
                          value={vitrine.footer.businessName}
                          onChange={(e) => setVitrine({
                            ...vitrine,
                            footer: { ...vitrine.footer, businessName: e.target.value }
                          })}
                        />
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{translations[menuLanguage].quickLinks}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setVitrine({
                                ...vitrine,
                                footer: {
                                  ...vitrine.footer,
                                  quickLinks: [...vitrine.footer.quickLinks, { label: '', url: '', type: 'link' }]
                                }
                              })}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {translations[menuLanguage].addQuickLink}
                            </Button>
                          </div>
                          {vitrine.footer.quickLinks.map((link, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder={translations[menuLanguage].enterQuickLinkLabel}
                                value={link.label}
                                onChange={(e) => {
                                  const newLinks = [...vitrine.footer.quickLinks];
                                  newLinks[index] = { ...link, label: e.target.value };
                                  setVitrine({
                                    ...vitrine,
                                    footer: { ...vitrine.footer, quickLinks: newLinks }
                                  });
                                }}
                              />
                              <Input
                                placeholder={translations[menuLanguage].enterQuickLinkUrl}
                                value={link.url}
                                onChange={(e) => {
                                  const newLinks = [...vitrine.footer.quickLinks];
                                  newLinks[index] = { ...link, url: e.target.value };
                                  setVitrine({
                                    ...vitrine,
                                    footer: { ...vitrine.footer, quickLinks: newLinks }
                                  });
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newLinks = vitrine.footer.quickLinks.filter((_, i) => i !== index);
                                  setVitrine({
                                    ...vitrine,
                                    footer: { ...vitrine.footer, quickLinks: newLinks }
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">{translations[menuLanguage].socialIcons}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder={translations[menuLanguage].enterFacebook}
                              value={vitrine.footer.socialIcons.facebook}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                footer: {
                                  ...vitrine.footer,
                                  socialIcons: { ...vitrine.footer.socialIcons, facebook: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterInstagram}
                              value={vitrine.footer.socialIcons.instagram}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                footer: {
                                  ...vitrine.footer,
                                  socialIcons: { ...vitrine.footer.socialIcons, instagram: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterTwitter}
                              value={vitrine.footer.socialIcons.twitter}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                footer: {
                                  ...vitrine.footer,
                                  socialIcons: { ...vitrine.footer.socialIcons, twitter: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterLinkedin}
                              value={vitrine.footer.socialIcons.linkedin}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                footer: {
                                  ...vitrine.footer,
                                  socialIcons: { ...vitrine.footer.socialIcons, linkedin: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterYoutube}
                              value={vitrine.footer.socialIcons.youtube}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                footer: {
                                  ...vitrine.footer,
                                  socialIcons: { ...vitrine.footer.socialIcons, youtube: e.target.value }
                                }
                              })}
                            />
                            <Input
                              placeholder={translations[menuLanguage].enterTiktok}
                              value={vitrine.footer.socialIcons.tiktok}
                              onChange={(e) => setVitrine({
                                ...vitrine,
                                footer: {
                                  ...vitrine.footer,
                                  socialIcons: { ...vitrine.footer.socialIcons, tiktok: e.target.value }
                                }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <QRPreview 
                    url={type === 'direct' ? `https://quickqr-heyg.onrender.com/api/qrcodes/redirect/${encodeURIComponent(directUrl)}` : name ? `https://warm-pithivier-90ecdb.netlify.app/landing/${id}` : ''}
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
                <div className="space-y-2">
                  <Label htmlFor="logo">{translations[menuLanguage].logo}</Label>
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
              {isLoading ? translations[menuLanguage].creating : translations[menuLanguage].createQRCode}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
