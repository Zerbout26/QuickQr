import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import QRCodeGenerator from '@/components/qr/QRCodeGenerator';
import QRCodeEditor from '@/components/qr/QRCodeEditor';
import { useAuth } from '@/context/AuthContext';
import { QRCode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import ReactDOM from 'react-dom/client';
import { qrCodeApi } from '@/lib/api';
import { 
  Lock, Download, Eye, Edit, Trash2, ExternalLink, 
  Plus, Calendar, CheckCircle, AlertCircle, Globe, Copy
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Translations object
const translations = {
  en: {
    dashboard: "Dashboard",
    createNewQR: "Create New QR Code",
    myQRCodes: "My QR Codes",
    noQRCodes: "No QR codes found. Create your first QR code!",
    name: "Name",
    type: "Type",
    created: "Created",
    actions: "Actions",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    download: "Download",
    downloadPNG: "Download QR Sticker",
    downloadSVG: "Download QR Code",
    success: "Success",
    error: "Error",
    qrCodeDeleted: "QR code deleted successfully",
    failedToDelete: "Failed to delete QR code",
    confirmDelete: "Are you sure you want to delete this QR code?",
    cancel: "Cancel",
    deleteQRCode: "Delete QR Code",
    loading: "Loading...",
    noResults: "No results found",
    search: "Search",
    filter: "Filter",
    all: "All",
    url: "URL",
    menu: "Menu",
    both: "Qr Menu",
    direct: "Direct Link",
    sortBy: "Sort by",
    newest: "Newest",
    oldest: "Oldest",
    nameAZ: "Name (A-Z)",
    nameZA: "Name (Z-A)",
    typeAZ: "Type (A-Z)",
    typeZA: "Type (Z-A)",
    createdNewest: "Created (Newest)",
    createdOldest: "Created (Oldest)",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    archived: "Archived",
    dateRange: "Date Range",
    from: "From",
    to: "To",
    apply: "Apply",
    reset: "Reset",
    export: "Export",
    import: "Import",
    bulkActions: "Bulk Actions",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    bulkDelete: "Delete Selected",
    bulkExport: "Export Selected",
    bulkArchive: "Archive Selected",
    bulkActivate: "Activate Selected",
    bulkDeactivate: "Deactivate Selected",
    bulkMove: "Move Selected",
    bulkCopy: "Copy Selected",
    bulkEdit: "Edit Selected",
    bulkShare: "Share Selected",
    bulkDownload: "Download Selected",
    bulkPrint: "Print Selected",
    bulkEmail: "Email Selected",
    bulkSMS: "SMS Selected",
    bulkWhatsApp: "WhatsApp Selected",
    bulkTelegram: "Telegram Selected",
    bulkFacebook: "Facebook Selected",
    bulkInstagram: "Instagram Selected",
    bulkTwitter: "Twitter Selected",
    bulkLinkedIn: "LinkedIn Selected",
    bulkYouTube: "YouTube Selected",
    bulkTikTok: "TikTok Selected",
    bulkWebsite: "Website Selected",
    bulkOther: "Other Selected",
    bulkCustom: "Custom Selected",
    bulkNone: "None Selected",
    bulkAll: "All Selected",
    bulkSome: "Some Selected",
    bulkNoneSelected: "No items selected",
    bulkSomeSelected: "items selected",
    bulkAllSelected: "All items selected",
    bulkActionSuccess: "Bulk action completed successfully",
    bulkActionError: "Failed to complete bulk action",
    bulkActionConfirm: "Are you sure you want to perform this bulk action?",
    bulkActionCancel: "Cancel",
    bulkActionProcessing: "Processing...",
    bulkActionComplete: "Complete",
    bulkActionFailed: "Failed",
    bulkActionPartial: "Partial",
    bulkActionNone: "None",
    bulkActionSome: "Some",
    bulkActionAll: "All",
    bulkActionCustom: "Custom",
    previewMode: "Preview Mode",
    editQRCodeURL: "Edit QR Code URL",
    newURL: "New URL",
    enterNewURL: "Enter new URL",
    updateURL: "Update URL",
    confirmDeletion: "Confirm Deletion",
    thisActionCannotBeUndone: "This action cannot be undone. This will permanently delete your QR code and all associated data.",
    areYouSureYouWantToDelete: "Are you sure you want to delete",
    qrCodePreview: "QR Code Preview",
    activateAccountToDownloadHighResolutionQR: "Activate your account to download high-resolution QR codes",
    activateAccount: "Activate Account",
    welcome: "Hello",
    dashboardDescription: "Manage your QR codes and subscription from your personalized dashboard",
    trial: "Trial",
    daysLeft: "days left",
    trialExpired: "Trial expired",
    activeSubscription: "Active Subscription",
    language: "Language",
    previous: "Previous",
    next: "Next",
    copyLink: "Copy Link",
    linkCopied: "Link copied to clipboard!"
  },
  ar: {
    dashboard: "لوحة التحكم",
    createNewQR: "إنشاء رمز QR جديد",
    myQRCodes: "رموز QR الخاصة بي",
    noQRCodes: "لم يتم العثور على رموز QR. قم بإنشاء أول رمز QR!",
    name: "الاسم",
    type: "النوع",
    created: "تاريخ الإنشاء",
    actions: "الإجراءات",
    view: "عرض",
    edit: "تعديل",
    delete: "حذف",
    download: "تحميل",
    downloadPNG: "تحميل ملصق QR",
    downloadSVG: "تحميل رمز QR",
    success: "نجاح",
    error: "خطأ",
    qrCodeDeleted: "تم حذف رمز QR بنجاح",
    failedToDelete: "فشل حذف رمز QR",
    confirmDelete: "هل أنت متأكد أنك تريد حذف رمز QR هذا؟",
    cancel: "إلغاء",
    deleteQRCode: "حذف رمز QR",
    loading: "جاري التحميل...",
    noResults: "لم يتم العثور على نتائج",
    search: "بحث",
    filter: "تصفية",
    all: "الكل",
    url: "رابط",
    menu: "قائمة",
    both: "رمز قائمة",
    direct: "رابط مباشر",
    sortBy: "ترتيب حسب",
    newest: "الأحدث",
    oldest: "الأقدم",
    nameAZ: "الاسم (أ-ي)",
    nameZA: "الاسم (ي-أ)",
    typeAZ: "النوع (أ-ي)",
    typeZA: "النوع (ي-أ)",
    createdNewest: "تاريخ الإنشاء (الأحدث)",
    createdOldest: "تاريخ الإنشاء (الأقدم)",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    archived: "مؤرشف",
    dateRange: "نطاق التاريخ",
    from: "من",
    to: "إلى",
    apply: "تطبيق",
    reset: "إعادة تعيين",
    export: "تصدير",
    import: "استيراد",
    bulkActions: "إجراءات متعددة",
    selectAll: "تحديد الكل",
    deselectAll: "إلغاء تحديد الكل",
    bulkDelete: "حذف المحدد",
    bulkExport: "تصدير المحدد",
    bulkArchive: "أرشفة المحدد",
    bulkActivate: "تفعيل المحدد",
    bulkDeactivate: "إلغاء تفعيل المحدد",
    bulkMove: "نقل المحدد",
    bulkCopy: "نسخ المحدد",
    bulkEdit: "تعديل المحدد",
    bulkShare: "مشاركة المحدد",
    bulkDownload: "تحميل المحدد",
    bulkPrint: "طباعة المحدد",
    bulkEmail: "بريد إلكتروني للمحدد",
    bulkSMS: "رسالة نصية للمحدد",
    bulkWhatsApp: "واتساب للمحدد",
    bulkTelegram: "تيليجرام للمحدد",
    bulkFacebook: "فيسبوك للمحدد",
    bulkInstagram: "انستغرام للمحدد",
    bulkTwitter: "تويتر للمحدد",
    bulkLinkedIn: "لينكد إن للمحدد",
    bulkYouTube: "يوتيوب للمحدد",
    bulkTikTok: "تيك توك للمحدد",
    bulkWebsite: "موقع إلكتروني للمحدد",
    bulkOther: "أخرى للمحدد",
    bulkCustom: "مخصص للمحدد",
    bulkNone: "لا شيء محدد",
    bulkAll: "الكل محدد",
    bulkSome: "بعض محدد",
    bulkNoneSelected: "لم يتم تحديد أي عناصر",
    bulkSomeSelected: "عناصر محددة",
    bulkAllSelected: "تم تحديد جميع العناصر",
    bulkActionSuccess: "تم إكمال الإجراء المتعدد بنجاح",
    bulkActionError: "فشل إكمال الإجراء المتعدد",
    bulkActionConfirm: "هل أنت متأكد أنك تريد تنفيذ هذا الإجراء المتعدد؟",
    bulkActionCancel: "إلغاء",
    bulkActionProcessing: "جاري المعالجة...",
    bulkActionComplete: "مكتمل",
    bulkActionFailed: "فشل",
    bulkActionPartial: "جزئي",
    bulkActionNone: "لا شيء",
    bulkActionSome: "بعض",
    bulkActionAll: "الكل",
    bulkActionCustom: "مخصص",
    previewMode: "وضع المعاينة",
    editQRCodeURL: "تعديل رابط رمز QR",
    newURL: "رابط جديد",
    enterNewURL: "أدخل الرابط الجديد",
    updateURL: "تحديث الرابط",
    confirmDeletion: "تأكيد الحذف",
    thisActionCannotBeUndone: "لا يمكن التراجع عن هذا الإجراء. سيتم حذف رمز QR وجميع البيانات المرتبطة به بشكل دائم.",
    areYouSureYouWantToDelete: "هل أنت متأكد أنك تريد حذف",
    qrCodePreview: "معاينة رمز QR",
    activateAccountToDownloadHighResolutionQR: "قم بتفعيل حسابك لتنزيل رموز QR عالية الدقة",
    activateAccount: "تفعيل الحساب",
    welcome: "مرحبا",
    dashboardDescription: "إدارة كودات QR الخاصة بك واشتراكك من لوحة التحكم الشخصية",
    trial: "تجريبي",
    daysLeft: "يتبقى",
    trialExpired: "انتهى التجريبي",
    activeSubscription: "اشتراك نشط",
    language: "اللغة",
    previous: "السابق",
    next: "التالي",
    copyLink: "نسخ الرابط",
    linkCopied: "تم نسخ الرابط إلى الملف الملحق!"
  }
};

const Dashboard = () => {
  const { user, logout, loading: authLoading, isTrialActive, isTrialExpired, daysLeftInTrial, refreshUserProfile } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQRCodes, setTotalQRCodes] = useState(0);
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedType = queryParams.get('type');
  const openGenerator = queryParams.get('openGenerator');
  const onboardingParam = queryParams.get('onboarding');
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('manage');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fromOnboarding, setFromOnboarding] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQRCode, setEditingQRCode] = useState<QRCode | null>(null);
  const [deleteConfirmQR, setDeleteConfirmQR] = useState<QRCode | null>(null);
  const [previewQR, setPreviewQR] = useState<QRCode | null>(null);

  // Check if user is coming from onboarding
  useEffect(() => {
    const onboardingFlag = sessionStorage.getItem('fromOnboarding');
    if (onboardingFlag === 'true') {
      setFromOnboarding(true);
      // Don't clear the flag automatically - let user decide when to see other types
    }
  }, []);

  // Function to allow user to see other types
  const allowOtherTypes = () => {
    setFromOnboarding(false);
    sessionStorage.removeItem('fromOnboarding');
  };

  // Handle openGenerator parameter to automatically open the generator tab
  useEffect(() => {
    if (openGenerator === 'true') {
      setActiveTab('create');
      // Clear the URL parameters after setting the tab, but preserve selectedType
      const newUrl = selectedType ? `/dashboard?type=${selectedType}` : '/dashboard';
      navigate(newUrl, { replace: true });
    }
  }, [openGenerator, navigate, selectedType]);

  const fetchQRCodes = async (page: number, search: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, total, totalPages } = await qrCodeApi.getAll(page, 5, search);
      setQrCodes(data);
      setTotalQRCodes(total);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Failed to fetch QR codes", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load your QR codes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const handler = setTimeout(() => {
        fetchQRCodes(currentPage, searchTerm);
      }, 500); // Debounce search

      return () => clearTimeout(handler);
    }
  }, [user, currentPage, searchTerm]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  // Check if user has any QR codes and redirect to onboarding if not
  useEffect(() => {
    if (user && !isLoading && qrCodes.length === 0 && totalQRCodes === 0) {
      // User has no QR codes, redirect to onboarding
      navigate('/dashboard?onboarding=true');
    }
  }, [user, isLoading, qrCodes.length, totalQRCodes, navigate]);

  // Handle onboarding parameter
  useEffect(() => {
    if (onboardingParam === 'true') {
      setShowOnboarding(true);
      setActiveTab('create');
      // Clear the URL parameter
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingParam, navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleQRCreated = (newQR: QRCode) => {
    setQrCodes(prev => [newQR, ...prev]);
    setShowOnboarding(false); // Clear onboarding state when QR is created
    setActiveTab('manage'); // Redirect to "My QR Codes" tab
    toast({
      title: "QR Code Created",
      description: "Your new QR code has been created successfully.",
    });
  };

  const handleEditQR = (qr: QRCode) => {
    setEditingQRCode(qr);
    setEditDialogOpen(true);
  };

  const handleQRCodeUpdated = (updatedQR: QRCode) => {
    setQrCodes(prev => prev.map(qr => qr.id === updatedQR.id ? updatedQR : qr));
    setEditDialogOpen(false);
    setEditingQRCode(null);
    toast({
      title: "QR Code Updated",
      description: "Your QR code has been updated successfully.",
    });
  };

  const handleDeleteQR = async (qrId: string) => {
    try {
      await qrCodeApi.delete(qrId);
      setQrCodes(prev => prev.filter(qr => qr.id !== qrId));
      setDeleteConfirmQR(null);
      if (refreshUserProfile) await refreshUserProfile();
      toast({
        title: "QR Code Deleted",
        description: "Your QR code has been deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete QR code', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was a problem deleting your QR code.",
      });
    }
  };

  const handlePreview = (qr: QRCode) => {
    setPreviewQR(qr);
  };

  const handleCopyLink = async (qr: QRCode) => {
    try {
      await navigator.clipboard.writeText(qr.url);
      toast({
        title: translations[language].success,
        description: translations[language].linkCopied,
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        variant: "destructive",
        title: translations[language].error,
        description: "Failed to copy link to clipboard",
      });
    }
  };

  const handleDownload = (qr: QRCode, format: 'png' | 'svg') => {
    if (!user?.isActive) {
      toast({
        variant: "destructive",
        title: "Account Not Activated",
        description: "Please activate your account to download QR codes.",
      });
      return;
    }

    const preloadLogo = (logoUrl: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Add timestamp to URL to prevent caching
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${logoUrl}?t=${timestamp}`;
        
        img.onload = () => {
          // Create a canvas to draw the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);
          
          // Create a new image from the canvas
          const newImg = new Image();
          newImg.src = canvas.toDataURL('image/png');
          newImg.onload = () => resolve(newImg);
          newImg.onerror = reject;
        };
        
        img.onerror = () => {
          // If CORS fails, try without crossOrigin
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = reject;
          fallbackImg.src = urlWithTimestamp;
        };
        
        img.src = urlWithTimestamp;
      });
    };
    const downloadWithLogo = async () => {
      let svgElement: HTMLDivElement | null = null;
      let container: HTMLDivElement | null = null;
    
      try {
        // Design configuration
        const design = {
          width: 1000,
          height: 1400,
          qrSize: 600,
          logoSize: 140,
          // Color palette
          bgGradient: ['#f8fafc', '#e2e8f0'],
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          accentColor: '#93c5fd',
          qrBgColor: '#ffffff',
          qrFgColor: '#1e3a8a',
          textColor: '#1e293b',
          buttonTextColor: '#ffffff',
          // Typography
          arabicFont: "'Tajawal', sans-serif",
          englishFont: "'Inter', sans-serif",
          // Spacing & effects
          padding: 80,
          textMargin: 40,
          cornerSize: 60,
          frameWidth: 15,
          buttonRadius: '12px',
          borderRadii: {
            outer: '20px',
            inner: '15px'
          },
          watermarkSize: '22px',
          // Camera frame settings
          cameraFrameColor: '#3b82f6',
          cameraFrameWidth: 12,
          cameraFrameRadius: 25,
          cameraCornerLength: 40,
          cameraCornerWidth: 6,
          // Scanner effect
          scannerColor: 'rgba(59, 130, 246, 0.5)',
          scannerHeight: 20,
          scannerSpeed: 2
        };
    
        if (format === 'svg') {
          // Create SVG with QR code
          container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.width = `${design.qrSize}px`;
          container.style.height = `${design.qrSize}px`;
          document.body.appendChild(container);
    
          let logoImage: HTMLImageElement | undefined;
          if (qr.logoUrl) {
            try {
              logoImage = await preloadLogo(qr.logoUrl);
            } catch (error) {
              console.warn('Failed to preload logo:', error);
            }
          }
    
          // Render QR code
          const qrContainer = document.createElement('div');
          container.appendChild(qrContainer);
          
          const root = ReactDOM.createRoot(qrContainer);
          root.render(
            <QRCodeSVG
              value={qr.url}
              size={design.qrSize}
              bgColor={qr.backgroundColor || design.qrBgColor}
              fgColor={qr.foregroundColor || design.qrFgColor}
              level="H"
              includeMargin={true}
              imageSettings={logoImage ? {
                src: logoImage.src,
                height: design.logoSize,
                width: design.logoSize,
                excavate: true,
              } : undefined}
            />
          );
    
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              const qrSvg = qrContainer.querySelector('svg');
              if (qrSvg) {
                // Convert SVG to PNG
                const canvas = document.createElement('canvas');
                // Add extra padding for borders
                const padding = 40;
                canvas.width = design.qrSize + (padding * 2);
                canvas.height = design.qrSize + (padding * 2);
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                  // Fill background
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);

                  // Create a temporary image from the SVG
                  const img = new Image();
                  const svgString = new XMLSerializer().serializeToString(qrSvg);
                  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                  const url = URL.createObjectURL(svgBlob);
                  
                  img.onload = () => {
                    // Draw the image on canvas with padding
                    ctx.drawImage(img, padding, padding, design.qrSize, design.qrSize);
                    
                    // Add border
                    ctx.strokeStyle = '#E5E7EB';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(padding - 2, padding - 2, design.qrSize + 4, design.qrSize + 4);
                    
                    // Convert to PNG and download
                    const pngUrl = canvas.toDataURL('image/png', 1.0);
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `${qr.name.toLowerCase().replace(/\s+/g, '-')}_qr-code.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(url);
              resolve();
                  };
                  
                  img.src = url;
                }
              }
            }, 200);
          });
        } else {
          // Full design with camera frame and effects
          container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.width = `${design.width}px`;
          container.style.height = `${design.height}px`;
          document.body.appendChild(container);
    
          let logoImage: HTMLImageElement | undefined;
          if (qr.logoUrl) {
            try {
              logoImage = await preloadLogo(qr.logoUrl);
            } catch (error) {
              console.warn('Failed to preload logo:', error);
            }
          }
    
          // Render QR code
          const qrContainer = document.createElement('div');
          container.appendChild(qrContainer);
          
          const root = ReactDOM.createRoot(qrContainer);
          root.render(
            <QRCodeCanvas
              value={qr.url}
              size={design.qrSize}
              bgColor={qr.backgroundColor || design.qrBgColor}
              fgColor={qr.foregroundColor || design.qrFgColor}
              level="H"
              includeMargin={false}
              imageSettings={logoImage ? {
                src: logoImage.src,
                height: design.logoSize,
                width: design.logoSize,
                excavate: true,
              } : undefined}
            />
          );
    
          await new Promise<void>((resolve) => {
            setTimeout(async () => {
              const canvas = document.createElement('canvas');
              canvas.width = design.width;
              canvas.height = design.height;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                // Draw gradient background
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, design.bgGradient[0]);
                gradient.addColorStop(1, design.bgGradient[1]);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                // Initialize QR code position variables at the top level
                let qrX = 0;
                let qrY = 0;

                // Draw QR code name
                ctx.font = `700 42px ${design.englishFont}`;
                ctx.fillStyle = design.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const nameY = design.padding + 60;
                ctx.fillText(qr.name, canvas.width / 2, nameY);
    
                // Draw Arabic CTA
                const arabicCTA = {
                  x: canvas.width / 2,
                  y: nameY + 120,
                  width: canvas.width * 0.8,
                  height: 140
                };
    
                ctx.font = `700 38px ${design.arabicFont}`;
                ctx.fillStyle = design.textColor;
                const arabicLine1 = '✨ امسح الكود الآن';
                const arabicLine2 = 'واكتشف المحتوى الحصري ✨';
    
                ctx.save();
                ctx.textAlign = 'center';
                ctx.direction = 'rtl';
                ctx.fillText(arabicLine1, arabicCTA.x, arabicCTA.y - 20);
                ctx.fillText(arabicLine2, arabicCTA.x, arabicCTA.y + 25);
                ctx.restore();
    
                // Draw QR code with camera frame
                const qrCanvas = qrContainer.querySelector('canvas');
                if (qrCanvas) {
                  // Update QR code position variables
                  qrX = (canvas.width - design.qrSize) / 2;
                  qrY = arabicCTA.y + arabicCTA.height + design.textMargin;
                  
                  // Draw camera frame background
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                  ctx.beginPath();
                  ctx.roundRect(
                    qrX - design.cameraFrameWidth,
                    qrY - design.cameraFrameWidth,
                    design.qrSize + design.cameraFrameWidth * 2,
                    design.qrSize + design.cameraFrameWidth * 2,
                    [design.cameraFrameRadius]
                  );
                  ctx.fill();
                  
                  // Draw camera frame border
                  ctx.strokeStyle = design.cameraFrameColor;
                  ctx.lineWidth = design.cameraFrameWidth;
                  ctx.stroke();
                  
                  // Draw camera corners
                  ctx.strokeStyle = design.primaryColor;
                  ctx.lineWidth = design.cameraCornerWidth;
                  
                  // Top-left corner
                  ctx.beginPath();
                  ctx.moveTo(qrX - design.cameraFrameWidth/2, qrY - design.cameraFrameWidth/2 + design.cameraCornerLength);
                  ctx.lineTo(qrX - design.cameraFrameWidth/2, qrY - design.cameraFrameWidth/2);
                  ctx.lineTo(qrX - design.cameraFrameWidth/2 + design.cameraCornerLength, qrY - design.cameraFrameWidth/2);
                  ctx.stroke();
                  
                  // Top-right corner
                  ctx.beginPath();
                  ctx.moveTo(qrX + design.qrSize + design.cameraFrameWidth/2 - design.cameraCornerLength, qrY - design.cameraFrameWidth/2);
                  ctx.lineTo(qrX + design.qrSize + design.cameraFrameWidth/2, qrY - design.cameraFrameWidth/2);
                  ctx.lineTo(qrX + design.qrSize + design.cameraFrameWidth/2, qrY - design.cameraFrameWidth/2 + design.cameraCornerLength);
                  ctx.stroke();
                  
                  // Bottom-left corner
                  ctx.beginPath();
                  ctx.moveTo(qrX - design.cameraFrameWidth/2, qrY + design.qrSize + design.cameraFrameWidth/2 - design.cameraCornerLength);
                  ctx.lineTo(qrX - design.cameraFrameWidth/2, qrY + design.qrSize + design.cameraFrameWidth/2);
                  ctx.lineTo(qrX - design.cameraFrameWidth/2 + design.cameraCornerLength, qrY + design.qrSize + design.cameraFrameWidth/2);
                  ctx.stroke();
                  
                  // Bottom-right corner
                  ctx.beginPath();
                  ctx.moveTo(qrX + design.qrSize + design.cameraFrameWidth/2 - design.cameraCornerLength, qrY + design.qrSize + design.cameraFrameWidth/2);
                  ctx.lineTo(qrX + design.qrSize + design.cameraFrameWidth/2, qrY + design.qrSize + design.cameraFrameWidth/2);
                  ctx.lineTo(qrX + design.qrSize + design.cameraFrameWidth/2, qrY + design.qrSize + design.cameraFrameWidth/2 - design.cameraCornerLength);
                  ctx.stroke();
    
                  // Draw QR code
                  ctx.drawImage(qrCanvas, qrX, qrY, design.qrSize, design.qrSize);
    
                  // Add scanner animation
                  const scannerY = qrY + (Date.now() / 100 * design.scannerSpeed) % design.qrSize;
                  ctx.beginPath();
                  ctx.moveTo(qrX, scannerY);
                  ctx.lineTo(qrX + design.qrSize, scannerY);
                  ctx.strokeStyle = design.scannerColor;
                  ctx.lineWidth = design.scannerHeight;
                  ctx.stroke();
                }
    
                // Draw English CTA
                const englishY = qrY + design.qrSize + design.textMargin + 60;
                ctx.font = `700 36px ${design.englishFont}`;
                ctx.fillStyle = design.textColor;
                const englishLine1 = '✨ Scan now to';
                const englishLine2 = 'explore exclusive content ✨';
                ctx.fillText(englishLine1, canvas.width / 2, englishY - 20);
                ctx.fillText(englishLine2, canvas.width / 2, englishY + 25);
    
                // Watermark
                const watermarkY = canvas.height - design.padding - 40;
                ctx.font = `400 ${design.watermarkSize} ${design.englishFont}`;
                ctx.fillStyle = design.textColor;
                ctx.fillText('Powered by', canvas.width / 2, watermarkY - 10);
                ctx.font = `600 ${design.watermarkSize} ${design.englishFont}`;
                ctx.fillStyle = design.primaryColor;
                ctx.fillText('www.qrcreator.xyz', canvas.width / 2, watermarkY + 25);
              }
              
              // Download
              const pngUrl = canvas.toDataURL('image/png', 1.0);
              const downloadLink = document.createElement('a');
              downloadLink.href = pngUrl;
              downloadLink.download = `${qr.name.toLowerCase().replace(/\s+/g, '-')}_qr-design.png`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              resolve();
            }, 200);
          });
        }
    
        toast({
          title: 'QR Code Downloaded',
          description: 'Your QR code has been downloaded successfully',
        });
      } catch (error) {
        console.error('Download failed:', error);
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "There was a problem generating your QR code.",
        });
      } finally {
        if (svgElement?.parentNode) svgElement.parentNode.removeChild(svgElement);
        if (container?.parentNode) container.parentNode.removeChild(container);
      }
    };
    downloadWithLogo();
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className={`container mx-auto px-4 py-4 sm:py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header with welcome message - Mobile optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 font-cairo">
                <span className="text-primary">{translations[language].welcome}</span>
                <span>, {user.name || user.email.split('@')[0]}</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {translations[language].dashboardDescription}
              </p>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4">
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{translations[language].language}</span>
              </Button>
              <img 
                src="/algeria-flag-icon.png" 
                alt="Algeria"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Subscription status badges - Mobile optimized */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-4">
            {isTrialActive() && (
              <div className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-1.5">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" /> {translations[language].trial}: {daysLeftInTrial()} {translations[language].daysLeft}
              </div>
            )}
            {isTrialExpired() && !user.hasActiveSubscription && (
              <div className="text-xs sm:text-sm text-red-600 bg-red-100 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-1.5">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /> {translations[language].trialExpired}
              </div>
            )}
            {user.hasActiveSubscription && (
              <div className="text-xs sm:text-sm text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-1.5">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> {translations[language].activeSubscription}
              </div>
            )}
          </div>
        </div>
        
        {/* Account Status Alerts - Mobile optimized */}
        {!user.isActive && (
          <Alert variant="destructive" className="mb-6 sm:mb-8 animate-fade-in shadow-sm border-primary/20 bg-primary/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <AlertTitle className="text-base sm:text-lg mb-2 flex items-center gap-2 font-cairo">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Account Not Activated
                </AlertTitle>
                <AlertDescription className="text-sm sm:text-base">
                  Your account is pending activation. Please complete the payment process to activate your account.
                </AlertDescription>
              </div>
              <Button 
                onClick={() => navigate('/payment-instructions')} 
                className="bg-white hover:bg-gray-50 text-primary border-primary/20 hover:border-primary/40 w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base font-medium"
              >
                View Payment Instructions
              </Button>
            </div>
          </Alert>
        )}
        
        {isTrialExpired() && !user.hasActiveSubscription && (
          <Alert variant="destructive" className="mb-6 sm:mb-8 animate-fade-in shadow-sm border-primary/20 bg-primary/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <AlertTitle className="text-base sm:text-lg mb-2 flex items-center gap-2 font-cairo">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Your trial has expired
                </AlertTitle>
                <AlertDescription className="text-sm sm:text-base">
                  Your 14-day free trial has ended. Please subscribe to continue using our service.
                </AlertDescription>
              </div>
              <Button 
                onClick={() => navigate('/payment-instructions')} 
                className="bg-white hover:bg-gray-50 text-primary border-primary/20 hover:border-primary/40 w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base font-medium"
              >
                View Payment Instructions
              </Button>
            </div>
          </Alert>
        )}
        
        {isTrialActive() && (
          <Alert className="mb-6 sm:mb-8 border-primary/30 bg-primary/5 shadow-sm animate-fade-in">
            <AlertTitle className="flex items-center gap-2 font-cairo text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Free Trial Active
            </AlertTitle>
            <AlertDescription className="text-sm sm:text-base">
              You have {daysLeftInTrial()} days left in your free trial. Enjoy full access to all features!
            </AlertDescription>
          </Alert>
        )}
        
        {user.hasActiveSubscription && (
          <Alert className="mb-6 sm:mb-8 border-secondary/30 bg-secondary/5 shadow-sm animate-fade-in">
            <AlertTitle className="flex items-center gap-2 font-cairo text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" /> Active Subscription
            </AlertTitle>
            <AlertDescription className="text-sm sm:text-base">
              Thank you for your subscription! You have full access to all QRCreator features.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Main tabs navigation - Mobile optimized */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'create' | 'manage')} defaultValue="manage" className="mb-6 sm:mb-8">
          <TabsList className="grid w-full max-w-md mx-auto sm:mx-0 grid-cols-2 p-1 rounded-xl bg-gray-100">
            <TabsTrigger value="create" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-sm sm:text-base">
              <div className="flex items-center gap-1 sm:gap-2">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">{translations[language].createNewQR}</span>
                <span className="sm:hidden">Create</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="manage" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-secondary data-[state=active]:shadow-sm text-sm sm:text-base">
              <div className="flex items-center gap-1 sm:gap-2">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">{translations[language].myQRCodes}</span>
                <span className="sm:hidden">Manage</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* QR Code Creation Tab */}
          <TabsContent value="create" className="py-4 sm:py-8 px-1">
            <div className="algerian-card p-4 sm:p-6 animate-fade-in">
              <QRCodeGenerator 
                selectedType={selectedType} 
                onCreated={handleQRCreated} 
                fromOnboarding={fromOnboarding || showOnboarding}
                onAllowOtherTypes={allowOtherTypes}
              />
            </div>
          </TabsContent>
          
          {/* QR Code Management Tab */}
          <TabsContent value="manage" className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold font-cairo text-center sm:text-left">{translations[language].myQRCodes}</h2>
              <Button 
                onClick={() => {
                  setActiveTab('create');
                  // Set showOtherTypes flag when coming from My QR Codes section
                  sessionStorage.setItem('showOtherTypes', 'true');
                }}
                className="dz-button flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" /> {translations[language].createNewQR}
              </Button>
            </div>
            
            <div className="mb-4">
              <Input
                placeholder="Search QR Codes by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full sm:max-w-sm"
              />
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-12 sm:py-16 border-2 border-dashed rounded-lg">
                <p className="text-base sm:text-lg font-medium text-gray-700">{translations[language].noQRCodes}</p>
                <p className="text-sm sm:text-base text-gray-500 mt-2">{translations[language].createNewQR} to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {qrCodes.map((qr) => (
                  <Card key={qr.id} className="algerian-card shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-2 dz-card-header rounded-t-xl">
                      <CardTitle className="text-base sm:text-lg flex items-center justify-between font-cairo">
                        <span className="truncate">{qr.name}</span>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs px-1.5 sm:px-2 py-1 bg-white/50 rounded-full flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">{qr.scanCount || 0}</span>
                            <span className="sm:hidden">{qr.scanCount || 0}</span>
                          </span>
                          <span className="text-xs px-1.5 sm:px-2 py-1 bg-white/50 rounded-full">{qr.type}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {/* QR Code Display */}
                      <div 
                        className="w-full aspect-square mb-4 flex items-center justify-center border rounded-lg p-2 sm:p-3 relative shadow-inner" 
                        style={{ backgroundColor: qr.backgroundColor }}
                        data-qr-id={qr.id}
                      >
                        {!user?.isActive && (
                          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center rounded-lg pointer-events-none z-10">
                            <div className="text-center bg-white/20 backdrop-blur-md rounded-lg p-2 sm:p-3">
                              <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600 mb-1 sm:mb-2 mx-auto" />
                              <p className="text-gray-700 text-xs sm:text-sm font-medium">{translations[language].previewMode}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col items-center">
                          {qr.textAbove && (
                            <div className="text-center mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                              {qr.textAbove}
                            </div>
                          )}
                          <QRCodeSVG
                            value={qr.url}
                            size={120}
                            bgColor={qr.backgroundColor}
                            fgColor={qr.foregroundColor}
                            level="H"
                            includeMargin={false}
                            imageSettings={qr.logoUrl ? {
                              src: qr.logoUrl,
                              height: 30,
                              width: 30,
                              excavate: true,
                            } : undefined}
                          />
                          {qr.textBelow && (
                            <div className="text-center mt-2 font-medium text-gray-700 text-xs sm:text-sm">
                              {qr.textBelow}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4 space-y-2">
                        <div>
                          <Label className="text-xs text-gray-500">{translations[language].url}</Label>
                          <div className="flex items-center gap-1">
                            <p className="text-xs sm:text-sm truncate font-medium">{qr.url}</p>
                            <a 
                              href={qr.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary hover:text-primary/80 flex-shrink-0"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </a>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">{translations[language].created}</Label>
                          <p className="text-xs sm:text-sm">{new Date(qr.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditQR(qr)}
                            className="w-full hover:bg-gray-50 font-cairo text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" /> {translations[language].edit}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCopyLink(qr)}
                            className="w-full hover:bg-gray-50 font-cairo text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" /> {translations[language].copyLink}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(qr, 'png')}
                            className="w-full hover:bg-gray-50 font-cairo text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" /> {translations[language].downloadPNG}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(qr, 'svg')}
                            className="w-full hover:bg-gray-50 font-cairo text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" /> {translations[language].downloadSVG}
                          </Button>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-cairo text-xs sm:text-sm h-8 sm:h-9"
                              onClick={() => setDeleteConfirmQR(qr)}
                            >
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                              {translations[language].deleteQRCode}
                            </Button>
                          </DialogTrigger>
                          {deleteConfirmQR && (
                            <DialogContent aria-describedby="delete-dialog-description" className="max-w-sm sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="font-cairo text-base sm:text-lg">{translations[language].confirmDeletion}</DialogTitle>
                                <DialogDescription id="delete-dialog-description" className="text-sm sm:text-base">
                                  {translations[language].thisActionCannotBeUndone}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p className="text-sm sm:text-base">{translations[language].areYouSureYouWantToDelete} "{deleteConfirmQR.name}"?</p>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
                                <Button variant="outline" onClick={() => setDeleteConfirmQR(null)} className="w-full sm:w-auto">
                                  {translations[language].cancel}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleDeleteQR(deleteConfirmQR.id)}
                                  className="w-full sm:w-auto"
                                >
                                  {translations[language].delete}
                                </Button>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {qrCodes.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                  Showing {qrCodes.length} of {totalQRCodes} QR Codes
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {translations[language].previous}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {translations[language].next}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit QR Code Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {language === 'ar' ? 'تعديل رمز QR' : 'Edit QR Code'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'قم بتحديث محتوى ومظهر رمز QR الخاص بك' : 'Update your QR code content and appearance'}
            </DialogDescription>
          </DialogHeader>
          {editingQRCode && (
            <div className="py-4">
              <QRCodeEditor 
                qrCode={editingQRCode} 
                onUpdated={handleQRCodeUpdated} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewQR} onOpenChange={() => setPreviewQR(null)}>
        <DialogContent className="max-w-sm sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-cairo text-base sm:text-lg">{translations[language].qrCodePreview}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {previewQR && (
              <div className="flex flex-col items-center">
                <div 
                  className="w-48 h-48 sm:w-64 sm:h-64 mb-4 flex items-center justify-center border rounded-lg p-2 relative shadow-inner" 
                  style={{ backgroundColor: previewQR.backgroundColor }}
                >
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center bg-white/20 backdrop-blur-md rounded-lg p-3 sm:p-4">
                      <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 mb-2" />
                      <p className="text-gray-700 font-medium text-sm sm:text-base">{translations[language].previewMode}</p>
                    </div>
                  </div>
                  <QRCodeSVG
                    value={previewQR.url}
                    size={180}
                    bgColor={previewQR.backgroundColor}
                    fgColor={previewQR.foregroundColor}
                    level="H"
                    includeMargin={false}
                    imageSettings={previewQR.logoUrl ? {
                      src: previewQR.logoUrl,
                      height: 45,
                      width: 45,
                      excavate: true,
                    } : undefined}
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center">
                  {translations[language].activateAccountToDownloadHighResolutionQR}
                </p>
                <Button 
                  onClick={() => navigate('/payment-instructions')}
                  className="dz-button flex items-center gap-2 w-full sm:w-auto"
                >
                  <CheckCircle className="w-4 h-4" /> {translations[language].activateAccount}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Dashboard;
