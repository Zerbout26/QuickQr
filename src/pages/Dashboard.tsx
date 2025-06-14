import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import QRCodeGenerator from '@/components/qr/QRCodeGenerator';
import { useAuth } from '@/context/AuthContext';
import { QRCode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Plus, Calendar, CheckCircle, AlertCircle, Globe
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
    downloadPNG: "Download PNG",
    downloadSVG: "Download SVG",
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
    activeSubscription: "Active Subscription"
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
    downloadPNG: "تحميل PNG",
    downloadSVG: "تحميل SVG",
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
    activeSubscription: "اشتراك نشط"
  }
};

const Dashboard = () => {
  const { user, isTrialExpired, isTrialActive, daysLeftInTrial } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQR, setEditingQR] = useState<QRCode | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [previewQR, setPreviewQR] = useState<QRCode | null>(null);
  const [deleteConfirmQR, setDeleteConfirmQR] = useState<QRCode | null>(null);
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();

  // Function to fetch QR codes
  const fetchQRCodes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const codes = await qrCodeApi.getAll();
      setQrCodes(codes);
    } catch (error) {
      console.error('Failed to fetch QR codes', error);
      toast({
        variant: "destructive",
        title: "Error loading QR codes",
        description: "There was a problem loading your QR codes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  // Initial fetch
  useEffect(() => {
    fetchQRCodes();
  }, [user]);

  const handleQRCreated = (newQR: QRCode) => {
    setQrCodes(prev => [newQR, ...prev]);
    toast({
      title: "QR Code Created",
      description: "Your new QR code has been created successfully.",
    });
  };

  const handleEditQR = (qr: QRCode) => {
    setEditingQR(qr);
    setNewUrl(qr.url);
  };

  const handleUpdateQR = async () => {
    if (!editingQR) return;
    
    try {
      // Prepare the update data
      const updateData = {
        name: editingQR.name,
        type: editingQR.type,
        url: newUrl,
        foregroundColor: editingQR.foregroundColor,
        backgroundColor: editingQR.backgroundColor,
        links: editingQR.links || [],
        menu: editingQR.menu || { restaurantName: '', description: '', categories: [] }
      };

      console.log('Updating QR code with data:', updateData); // Debug log
      
      const updatedQR = await qrCodeApi.update(editingQR.id, updateData);
      console.log('Update response:', updatedQR); // Debug log
      
      setQrCodes(prev => prev.map(qr => qr.id === updatedQR.id ? updatedQR : qr));
      setEditingQR(null);
      setNewUrl('');
      
      toast({
        title: "QR Code Updated",
        description: "Your QR code has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update QR code:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your QR code. Please try again.",
      });
    }
  };

  const handleDeleteQR = async (qrId: string) => {
    try {
      await qrCodeApi.delete(qrId);
      setQrCodes(prev => prev.filter(qr => qr.id !== qrId));
      setDeleteConfirmQR(null);
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
        // Professional design configuration
        const design = {
          width: 1000,
          height: 1400,
          qrSize: 600,
          logoSize: 140,
          // Neutral color palette
          bgGradient: ['#f5f5f0', '#e8e8e0'],  // Beige gradient
          primaryColor: '#4a4a4a',             // Dark gray
          secondaryColor: '#8b7355',           // Taupe
          accentColor: '#a78a6f',              // Light brown
          qrBgColor: '#ffffff',
          qrFgColor: '#2a2a2a',                // Dark gray
          textColor: '#4a4a4a',                // Dark gray
          buttonTextColor: '#ffffff',          // White
          // Typography
          arabicFont: "'Tajawal', sans-serif",
          englishFont: "'Inter', sans-serif",
          // Spacing & effects
          padding: 80,
          textMargin: 60,
          cornerSize: 70,
          frameWidth: 20,
          buttonPadding: '20px 40px',
          buttonRadius: '50px',
          shadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
          borderRadii: {
            outer: '20px',
            inner: '15px',
            corners: '10px'
          },
          watermarkSize: '24px'  // Larger watermark
        };
    
        if (format === 'svg') {
          // QR code only PNG download
          container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.width = `${design.qrSize + design.frameWidth * 2}px`;
          container.style.height = `${design.qrSize + design.frameWidth * 2}px`;
          document.body.appendChild(container);
    
          let logoImage: HTMLImageElement | undefined;
          if (qr.logoUrl) {
            try {
              logoImage = await preloadLogo(qr.logoUrl);
            } catch (error) {
              console.warn('Failed to preload logo:', error);
            }
          }
    
          // Render QR code to canvas
          const qrContainer = document.createElement('div');
          container.appendChild(qrContainer);
          
          const root = ReactDOM.createRoot(qrContainer);
          root.render(
            <QRCodeCanvas
              value={qr.url}
              size={design.qrSize}
              bgColor={design.qrBgColor}
              fgColor={design.qrFgColor}
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
    
          // Create final QR code only PNG
          await new Promise<void>((resolve) => {
            setTimeout(async () => {
              const canvas = document.createElement('canvas');
              canvas.width = design.qrSize + design.frameWidth * 2;
              canvas.height = design.qrSize + design.frameWidth * 2;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                // Draw frame background
                ctx.fillStyle = design.qrBgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw frame border
                ctx.strokeStyle = design.secondaryColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                
                // Draw frame corners
                ctx.strokeStyle = design.secondaryColor;
                ctx.lineWidth = 4;
                
                // Top-left corner
                ctx.beginPath();
                ctx.moveTo(0, design.cornerSize);
                ctx.lineTo(0, 0);
                ctx.lineTo(design.cornerSize, 0);
                ctx.stroke();
                
                // Top-right corner
                ctx.beginPath();
                ctx.moveTo(canvas.width - design.cornerSize, 0);
                ctx.lineTo(canvas.width, 0);
                ctx.lineTo(canvas.width, design.cornerSize);
                ctx.stroke();
                
                // Bottom-left corner
                ctx.beginPath();
                ctx.moveTo(0, canvas.height - design.cornerSize);
                ctx.lineTo(0, canvas.height);
                ctx.lineTo(design.cornerSize, canvas.height);
                ctx.stroke();
                
                // Bottom-right corner
                ctx.beginPath();
                ctx.moveTo(canvas.width - design.cornerSize, canvas.height);
                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(canvas.width, canvas.height - design.cornerSize);
                ctx.stroke();
    
                // Draw QR code
                const qrCanvas = qrContainer.querySelector('canvas');
                if (qrCanvas) {
                  ctx.drawImage(qrCanvas, design.frameWidth, design.frameWidth, design.qrSize, design.qrSize);
                }
                
                // Convert to PNG and download
                const pngUrl = canvas.toDataURL('image/png', 1.0);
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `${qr.name.toLowerCase().replace(/\s+/g, '-')}_qr-code.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
              }
              resolve();
            }, 200);
          });
    
        } else {
          // Full design PNG download
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
    
          // Render QR code to canvas
          const qrContainer = document.createElement('div');
          container.appendChild(qrContainer);
          
          const root = ReactDOM.createRoot(qrContainer);
          root.render(
            <QRCodeCanvas
              value={qr.url}
              size={design.qrSize}
              bgColor={design.qrBgColor}
              fgColor={design.qrFgColor}
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
    
          // Create final full design canvas
          await new Promise<void>((resolve) => {
            setTimeout(async () => {
              const canvas = document.createElement('canvas');
              canvas.width = design.width;
              canvas.height = design.height;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                // Draw gradient background
                const gradient = ctx.createLinearGradient(
                  0, 0, 
                  canvas.width, canvas.height
                );
                gradient.addColorStop(0, design.bgGradient[0]);
                gradient.addColorStop(1, design.bgGradient[1]);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                // Initialize QR code position variables
                let qrX = 0;
                let qrY = 0;

                // Draw QR code name at the top
                ctx.font = `700 48px ${design.englishFont}`;
                ctx.fillStyle = design.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const nameY = design.padding + 40;
                ctx.fillText(qr.name, canvas.width / 2, nameY);

                // Draw Arabic CTA
                const arabicCTA = {
                  x: canvas.width / 2,
                  y: nameY + 100, // Adjusted to account for the name
                  width: canvas.width * 0.9,
                  height: 120
                };
                
                // CTA background
                ctx.beginPath();
                ctx.roundRect(
                  arabicCTA.x - arabicCTA.width/2,
                  arabicCTA.y - arabicCTA.height/2,
                  arabicCTA.width,
                  arabicCTA.height,
                  [design.borderRadii.inner, design.borderRadii.inner, design.borderRadii.inner, design.borderRadii.inner]
                );
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
                
                // Arabic text
                ctx.font = `700 42px ${design.arabicFont}`;
                ctx.fillStyle = design.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Arabic text needs RTL handling
                const arabicText = '✨ امسح الكود الآن واكتشف المحتوى الحصري ✨';
                ctx.save();
                ctx.textAlign = 'center';
                ctx.direction = 'rtl';
                ctx.fillText(arabicText, arabicCTA.x, arabicCTA.y);
                ctx.restore();
    
                // Draw QR code with modern frame
                const qrCanvas = qrContainer.querySelector('canvas');
                if (qrCanvas) {
                  qrX = (canvas.width - design.qrSize) / 2;
                  qrY = arabicCTA.y + arabicCTA.height/2 + design.textMargin;
                  
                  // Draw frame with rounded corners
                  ctx.beginPath();
                  ctx.roundRect(
                    qrX - design.frameWidth,
                    qrY - design.frameWidth,
                    design.qrSize + design.frameWidth * 2,
                    design.qrSize + design.frameWidth * 2,
                    [design.borderRadii.inner, design.borderRadii.inner, design.borderRadii.inner, design.borderRadii.inner]
                  );
                  ctx.fillStyle = design.qrBgColor;
                  ctx.shadowColor = `rgba(0, 0, 0, 0.1)`;
                  ctx.shadowBlur = 20;
                  ctx.shadowOffsetY = 10;
                  ctx.fill();
                  ctx.shadowColor = 'transparent';
                  
                  // Frame border
                  ctx.strokeStyle = design.secondaryColor;
                  ctx.lineWidth = 2;
                  ctx.stroke();
                  
                  // Draw frame corners
                  ctx.strokeStyle = design.secondaryColor;
                  ctx.lineWidth = 4;
                  
                  // Top-left corner
                  ctx.beginPath();
                  ctx.moveTo(qrX - design.frameWidth, qrY + design.cornerSize);
                  ctx.lineTo(qrX - design.frameWidth, qrY - design.frameWidth);
                  ctx.lineTo(qrX + design.cornerSize, qrY - design.frameWidth);
                  ctx.stroke();
                  
                  // Top-right corner
                  ctx.beginPath();
                  ctx.moveTo(qrX + design.qrSize + design.frameWidth - design.cornerSize, qrY - design.frameWidth);
                  ctx.lineTo(qrX + design.qrSize + design.frameWidth, qrY - design.frameWidth);
                  ctx.lineTo(qrX + design.qrSize + design.frameWidth, qrY + design.cornerSize);
                  ctx.stroke();
                  
                  // Bottom-left corner
                  ctx.beginPath();
                  ctx.moveTo(qrX - design.frameWidth, qrY + design.qrSize + design.frameWidth - design.cornerSize);
                  ctx.lineTo(qrX - design.frameWidth, qrY + design.qrSize + design.frameWidth);
                  ctx.lineTo(qrX + design.cornerSize, qrY + design.qrSize + design.frameWidth);
                  ctx.stroke();
                  
                  // Bottom-right corner
                  ctx.beginPath();
                  ctx.moveTo(qrX + design.qrSize + design.frameWidth - design.cornerSize, qrY + design.qrSize + design.frameWidth);
                  ctx.lineTo(qrX + design.qrSize + design.frameWidth, qrY + design.qrSize + design.frameWidth);
                  ctx.lineTo(qrX + design.qrSize + design.frameWidth, qrY + design.qrSize + design.frameWidth - design.cornerSize);
                  ctx.stroke();

                  // Draw QR code
                  ctx.drawImage(qrCanvas, qrX, qrY, design.qrSize, design.qrSize);
                }
    
                // Draw English CTA button
                const englishButton = {
                  x: canvas.width / 2,
                  y: qrY + design.qrSize + design.frameWidth * 2 + design.textMargin + 60,
                  width: canvas.width * 0.8,
                  height: 100
                };
                
                // Button background
                ctx.beginPath();
                ctx.roundRect(
                  englishButton.x - englishButton.width/2,
                  englishButton.y - englishButton.height/2,
                  englishButton.width,
                  englishButton.height,
                  [design.buttonRadius, design.buttonRadius, design.buttonRadius, design.buttonRadius]
                );
                ctx.fillStyle = design.secondaryColor;
                ctx.shadowColor = `rgba(0, 0, 0, 0.2)`;
                ctx.shadowBlur = 15;
                ctx.shadowOffsetY = 5;
                ctx.fill();
                ctx.shadowColor = 'transparent';
                
                // Button text
                ctx.font = `700 38px ${design.englishFont}`;
                ctx.fillStyle = design.buttonTextColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✨ Scan now to explore exclusive content ✨', englishButton.x, englishButton.y);
    
                // Draw watermark
                const watermark = {
                  x: canvas.width / 2,
                  y: canvas.height - design.padding,
                  width: 420,  // Wider for better fit
                  height: 70   // Taller for bigger text
                };
                
                // Watermark background
                ctx.beginPath();
                ctx.roundRect(
                  watermark.x - watermark.width/2,
                  watermark.y - watermark.height/2,
                  watermark.width,
                  watermark.height,
                  [35, 35, 35, 35]
                );
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
                
                // Draw watermark icon
                ctx.beginPath();
                ctx.arc(watermark.x - watermark.width/2 + 60, watermark.y, 14, 0, Math.PI * 2);
                ctx.strokeStyle = design.primaryColor;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(watermark.x - watermark.width/2 + 60, watermark.y - 14);
                ctx.lineTo(watermark.x - watermark.width/2 + 60, watermark.y + 14);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(watermark.x - watermark.width/2 + 60, watermark.y - 14);
                ctx.lineTo(watermark.x - watermark.width/2 + 74, watermark.y - 4);
                ctx.stroke();
                
                // Draw "Powered by" text
                ctx.font = `400 24px ${design.englishFont}`;
                ctx.fillStyle = design.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Powered by', canvas.width / 2, canvas.height - 60);

                // Draw URL
                ctx.font = `700 28px ${design.englishFont}`;
                ctx.fillStyle = design.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('quickqr.app', canvas.width / 2, canvas.height - 20);
              }
              
              // Convert to PNG and download
              const pngUrl = canvas.toDataURL('image/png', 1.0);
              const downloadLink = document.createElement('a');
              downloadLink.href = pngUrl;
              downloadLink.download = `${qr.name.toLowerCase().replace(/\s+/g, '-')}_professional-qr.png`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              resolve();
            }, 200);
          });
        }
    
        toast({
          title: format === 'svg' ? 'QR Code Downloaded' : 'Professional QR Code Downloaded',
          description: `Your QR code has been downloaded as ${format === 'svg' ? 'QR code only' : 'professional design'}`,
        });
      } catch (error) {
        console.error('Download failed:', error);
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "There was a problem generating your QR code.",
        });
      } finally {
        // Clean up
        if (svgElement?.parentNode) svgElement.parentNode.removeChild(svgElement);
        if (container?.parentNode) container.parentNode.removeChild(container);
      }
    };
    
    downloadWithLogo();
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className={`container mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {translations[language].dashboard}
          </h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/create')}>
              {translations[language].createNewQR}
            </Button>
          </div>
        </div>
        {/* Header with welcome message */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 font-cairo">
                <span className="text-primary">{translations[language].welcome}</span>
                <span>, {user.name || user.email.split('@')[0]}</span>
              </h1>
              <p className="text-gray-600 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {translations[language].dashboardDescription}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {translations[language].language}
              </Button>
              <img 
                src="/algeria-flag-icon.png" 
                alt="Algeria"
                className="w-8 h-8 rounded shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Subscription status badges */}
          <div className="flex flex-wrap gap-4 mt-4">
            {isTrialActive() && (
              <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {translations[language].trial}: {daysLeftInTrial()} {translations[language].daysLeft}
              </div>
            )}
            {isTrialExpired() && !user.hasActiveSubscription && (
              <div className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {translations[language].trialExpired}
              </div>
            )}
            {user.hasActiveSubscription && (
              <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {translations[language].activeSubscription}
              </div>
            )}
          </div>
        </div>
        
        {/* Account Status Alerts */}
        {!user.isActive && (
          <Alert variant="destructive" className="mb-8 animate-fade-in shadow-sm border-primary/20 bg-primary/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <AlertTitle className="text-lg mb-2 flex items-center gap-2 font-cairo">
                  <AlertCircle className="w-5 h-5" /> Account Not Activated
                </AlertTitle>
                <AlertDescription className="text-base">
                  Your account is pending activation. Please complete the payment process to activate your account.
                </AlertDescription>
              </div>
              <Button 
                onClick={() => navigate('/payment-instructions')} 
                className="bg-white hover:bg-gray-50 text-primary border-primary/20 hover:border-primary/40 min-w-[200px] h-12 text-base font-medium"
              >
                View Payment Instructions
              </Button>
            </div>
          </Alert>
        )}
        
        {isTrialExpired() && !user.hasActiveSubscription && (
          <Alert variant="destructive" className="mb-8 animate-fade-in shadow-sm border-primary/20 bg-primary/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <AlertTitle className="text-lg mb-2 flex items-center gap-2 font-cairo">
                  <AlertCircle className="w-5 h-5" /> Your trial has expired
                </AlertTitle>
                <AlertDescription className="text-base">
                  Your 14-day free trial has ended. Please subscribe to continue using our service.
                </AlertDescription>
              </div>
              <Button 
                onClick={() => navigate('/payment-instructions')} 
                className="bg-white hover:bg-gray-50 text-primary border-primary/20 hover:border-primary/40 min-w-[200px] h-12 text-base font-medium"
              >
                View Payment Instructions
              </Button>
            </div>
          </Alert>
        )}
        
        {isTrialActive() && (
          <Alert className="mb-8 border-primary/30 bg-primary/5 shadow-sm animate-fade-in">
            <AlertTitle className="flex items-center gap-2 font-cairo">
              <Calendar className="w-5 h-5 text-primary" /> Free Trial Active
            </AlertTitle>
            <AlertDescription>
              You have {daysLeftInTrial()} days left in your free trial. Enjoy full access to all features!
            </AlertDescription>
          </Alert>
        )}
        
        {user.hasActiveSubscription && (
          <Alert className="mb-8 border-secondary/30 bg-secondary/5 shadow-sm animate-fade-in">
            <AlertTitle className="flex items-center gap-2 font-cairo">
              <CheckCircle className="w-5 h-5 text-secondary" /> Active Subscription
            </AlertTitle>
            <AlertDescription>
              Thank you for your subscription! You have full access to all QRCreator features.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Main tabs navigation */}
        <Tabs defaultValue="create" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 p-1 rounded-xl bg-gray-100">
            <TabsTrigger value="create" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> {translations[language].createNewQR}
              </div>
            </TabsTrigger>
            <TabsTrigger value="manage" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-secondary data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" /> {translations[language].myQRCodes}
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* QR Code Creation Tab */}
          <TabsContent value="create" className="py-8 px-1">
            <div className="algerian-card p-6 animate-fade-in">
              <QRCodeGenerator onCreated={handleQRCreated} />
            </div>
          </TabsContent>
          
          {/* QR Code Management Tab */}
          <TabsContent value="manage" className="py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold font-cairo">{translations[language].myQRCodes}</h2>
              <Button 
                onClick={() => document.querySelector('[data-value="create"]')?.dispatchEvent(new Event('click'))}
                className="dz-button flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> {translations[language].createNewQR}
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500">{translations[language].loading}</p>
                </div>
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-16 border rounded-xl shadow-sm bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 font-cairo">{translations[language].noQRCodes}</h3>
                  <p className="text-gray-500 max-w-md mx-auto">You haven't created any QR codes yet. {translations[language].createNewQR} to get started.</p>
                  <Button 
                    onClick={() => document.querySelector('[data-value="create"]')?.dispatchEvent(new Event('click'))}
                    variant="outline" 
                    className="mt-3 border-primary text-primary hover:bg-primary/5"
                  >
                    {translations[language].createNewQR}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrCodes.map((qr) => (
                  <Card key={qr.id} className="algerian-card shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-2 dz-card-header rounded-t-xl">
                      <CardTitle className="text-lg flex items-center justify-between font-cairo">
                        <span className="truncate">{qr.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-white/50 rounded-full flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {qr.scanCount || 0}
                          </span>
                          <span className="text-xs px-2 py-1 bg-white/50 rounded-full">{qr.type}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {/* QR Code Display */}
                      <div 
                        className="w-full aspect-square mb-4 flex items-center justify-center border rounded-lg p-3 relative shadow-inner" 
                        style={{ backgroundColor: qr.backgroundColor }}
                        data-qr-id={qr.id}
                      >
                        {!user?.isActive && (
                          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center rounded-lg pointer-events-none z-10">
                            <div className="text-center bg-white/20 backdrop-blur-md rounded-lg p-3">
                              <Lock className="w-6 h-6 text-gray-600 mb-2 mx-auto" />
                              <p className="text-gray-700 text-sm font-medium">{translations[language].previewMode}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col items-center">
                          {qr.textAbove && (
                            <div className="text-center mb-2 font-medium text-gray-700">
                              {qr.textAbove}
                            </div>
                          )}
                          <QRCodeSVG
                            value={qr.url}
                            size={160}
                            bgColor={qr.backgroundColor}
                            fgColor={qr.foregroundColor}
                            level="H"
                            includeMargin={false}
                            imageSettings={qr.logoUrl ? {
                              src: qr.logoUrl,
                              height: 40,
                              width: 40,
                              excavate: true,
                            } : undefined}
                          />
                          {qr.textBelow && (
                            <div className="text-center mt-2 font-medium text-gray-700">
                              {qr.textBelow}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4 space-y-2">
                        <div>
                          <Label className="text-xs text-gray-500">{translations[language].url}</Label>
                          <div className="flex items-center gap-1">
                            <p className="text-sm truncate font-medium">{qr.url}</p>
                            <a 
                              href={qr.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">{translations[language].created}</Label>
                          <p className="text-sm">{new Date(qr.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/qrcodes/${qr.id}/edit`)}
                            className="w-full hover:bg-gray-50 font-cairo"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1.5" /> {translations[language].edit}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEditQR(qr)} className="w-full hover:bg-gray-50 font-cairo">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> {translations[language].edit}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-cairo">{translations[language].editQRCodeURL}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="newUrl">{translations[language].newURL}</Label>
                                  <Input
                                    id="newUrl"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    placeholder={translations[language].enterNewURL}
                                    className="border-primary/20 focus:border-primary"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setEditingQR(null)}>
                                    {translations[language].cancel}
                                  </Button>
                                  <Button onClick={handleUpdateQR} className="dz-button">
                                    {translations[language].updateURL}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(qr, 'png')}
                            className="w-full hover:bg-gray-50 font-cairo"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" /> {translations[language].downloadPNG}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(qr, 'svg')}
                            className="w-full hover:bg-gray-50 font-cairo"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" /> {translations[language].downloadSVG}
                          </Button>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-cairo"
                              onClick={() => setDeleteConfirmQR(qr)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                              {translations[language].deleteQRCode}
                            </Button>
                          </DialogTrigger>
                          {deleteConfirmQR && (
                            <DialogContent aria-describedby="delete-dialog-description">
                              <DialogHeader>
                                <DialogTitle className="font-cairo">{translations[language].confirmDeletion}</DialogTitle>
                                <DialogDescription id="delete-dialog-description">
                                  {translations[language].thisActionCannotBeUndone}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p>{translations[language].areYouSureYouWantToDelete} "{deleteConfirmQR.name}"?</p>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setDeleteConfirmQR(null)}>
                                  {translations[language].cancel}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleDeleteQR(deleteConfirmQR.id)}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewQR} onOpenChange={() => setPreviewQR(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-cairo">{translations[language].qrCodePreview}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {previewQR && (
              <div className="flex flex-col items-center">
                <div 
                  className="w-64 h-64 mb-4 flex items-center justify-center border rounded-lg p-2 relative shadow-inner" 
                  style={{ backgroundColor: previewQR.backgroundColor }}
                >
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center bg-white/20 backdrop-blur-md rounded-lg p-4">
                      <Lock className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-gray-700 font-medium">{translations[language].previewMode}</p>
                    </div>
                  </div>
                  <QRCodeSVG
                    value={previewQR.url}
                    size={240}
                    bgColor={previewQR.backgroundColor}
                    fgColor={previewQR.foregroundColor}
                    level="H"
                    includeMargin={false}
                    imageSettings={previewQR.logoUrl ? {
                      src: previewQR.logoUrl,
                      height: 60,
                      width: 60,
                      excavate: true,
                    } : undefined}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {translations[language].activateAccountToDownloadHighResolutionQR}
                </p>
                <Button 
                  onClick={() => navigate('/payment-instructions')}
                  className="dz-button flex items-center gap-2"
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
