import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2, Filter, Search } from 'lucide-react';

const API_BASE_URL = 'https://quickqr-heyg.onrender.com/api';

interface OrderItem {
  key: string;
  itemName: string;
  categoryName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'delivered';
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  deliveredAt?: string;
  qrCode: {
    id: string;
    name: string;
  };
}

const translations = {
  en: {
    orders: 'Orders',
    orderNumber: 'Order #',
    customer: 'Customer',
    total: 'Total',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    delivered: 'Delivered',
    all: 'All',
    allOrders: 'All Orders',
    search: 'Search orders...',
    searchOrders: 'Search orders...',
    noOrders: 'No orders found',
    noOrdersFound: 'No orders found',
    orderDetails: 'Order Details',
    customerInfo: 'Customer Information',
    orderItems: 'Order Items',
    updateStatus: 'Update Status',
    updateNotes: 'Update Notes',
    save: 'Save',
    cancel: 'Cancel',
    deleteOrder: 'Delete Order',
    deleteConfirm: 'Are you sure you want to delete this order?',
    orderDeleted: 'Order deleted successfully',
    orderUpdated: 'Order updated successfully',
    error: 'Error',
    loading: 'Loading...',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    items: 'items',
    phone: 'Phone',
    address: 'Address',
    quantity: 'Qty',
    price: 'Price',
    subtotal: 'Subtotal',
    notes: 'Notes',
    adminNotes: 'Admin Notes',
    addNotes: 'Add notes...',
    manageOrders: 'Manage and track all orders',
    showing: 'Showing',
    to: 'to',
    results: 'results',
    clearFilters: 'Clear Filters',
  },
  ar: {
    orders: 'الطلبات',
    orderNumber: 'رقم الطلب',
    customer: 'العميل',
    total: 'المجموع',
    status: 'الحالة',
    date: 'التاريخ',
    actions: 'الإجراءات',
    view: 'عرض',
    edit: 'تعديل',
    delete: 'حذف',
    pending: 'في الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
    delivered: 'تم التوصيل',
    all: 'الكل',
    allOrders: 'جميع الطلبات',
    search: 'البحث في الطلبات...',
    searchOrders: 'البحث في الطلبات...',
    noOrders: 'لا توجد طلبات',
    noOrdersFound: 'لا توجد طلبات',
    orderDetails: 'تفاصيل الطلب',
    customerInfo: 'معلومات العميل',
    orderItems: 'عناصر الطلب',
    updateStatus: 'تحديث الحالة',
    updateNotes: 'تحديث الملاحظات',
    save: 'حفظ',
    cancel: 'إلغاء',
    deleteOrder: 'حذف الطلب',
    deleteConfirm: 'هل أنت متأكد من حذف هذا الطلب؟',
    orderDeleted: 'تم حذف الطلب بنجاح',
    orderUpdated: 'تم تحديث الطلب بنجاح',
    error: 'خطأ',
    loading: 'جاري التحميل...',
    previous: 'السابق',
    next: 'التالي',
    page: 'الصفحة',
    of: 'من',
    items: 'عنصر',
    phone: 'الهاتف',
    address: 'العنوان',
    quantity: 'الكمية',
    price: 'السعر',
    subtotal: 'المجموع الفرعي',
    notes: 'ملاحظات',
    adminNotes: 'ملاحظات الإدارة',
    addNotes: 'إضافة ملاحظات...',
    manageOrders: 'إدارة وتتبع جميع الطلبات',
    showing: 'عرض',
    to: 'إلى',
    results: 'نتيجة',
    clearFilters: 'مسح المرشحات',
  }
};

const Orders = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const t = translations[language];

  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
    const interval = setInterval(() => {
      fetchOrders();
      fetchOrderStats();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [page, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ordersPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { searchTerm })
      });

      const apiUrl = `${API_BASE_URL}/orders?${params}`;
      const token = localStorage.getItem('qr-generator-token');
      
      console.log('Fetching orders from:', apiUrl);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('User:', user);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch orders: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Orders data:', data);
      
      setOrders(data.data || data.orders || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / ordersPerPage));
      setTotalOrders(data.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: t.error,
        description: `Failed to fetch orders: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('qr-generator-token');
      const response = await fetch(`${API_BASE_URL}/orders/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setOrderStats(data);
    } catch (error) {
      setOrderStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        },
        body: JSON.stringify({ status, adminNotes: notes })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const result = await response.json();
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: result.order.status, adminNotes: result.order.adminNotes } : order
      ));
      
      toast({
        title: t.orderUpdated,
        description: "Order status updated successfully"
      });
      
      setSelectedOrder(null);
      setEditingStatus('');
      setEditingNotes('');
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        variant: "destructive",
        title: t.error,
        description: "Failed to update order"
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders(orders.filter(order => order.id !== orderId));
      setDeleteConfirmOrder(null);
      toast({
        title: t.orderDeleted,
        description: "Order deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        variant: "destructive",
        title: t.error,
        description: "Failed to delete order"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setPage(1);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t.loading}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">{statsLoading ? '...' : orderStats?.totalOrders ?? 0}</span>
              <span className="text-gray-600 mt-1 text-sm font-medium">{t.orders}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-yellow-500">{statsLoading ? '...' : (orderStats?.stats?.find((s:any) => s.order_status === 'pending')?.count ?? 0)}</span>
              <span className="text-gray-600 mt-1 text-sm font-medium">{t.pending}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-500">{statsLoading ? '...' : (orderStats?.stats?.find((s:any) => s.order_status === 'confirmed')?.count ?? 0)}</span>
              <span className="text-gray-600 mt-1 text-sm font-medium">{t.confirmed}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-green-600">{statsLoading ? '...' : (orderStats?.stats?.find((s:any) => s.order_status === 'delivered')?.count ?? 0)}</span>
              <span className="text-gray-600 mt-1 text-sm font-medium">{t.delivered}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-red-500">{statsLoading ? '...' : (orderStats?.stats?.find((s:any) => s.order_status === 'cancelled')?.count ?? 0)}</span>
              <span className="text-gray-600 mt-1 text-sm font-medium">{t.cancelled}</span>
            </div>
          </div>
          {/* Optionally show total revenue */}
          {orderStats?.totalRevenue !== undefined && (
            <div className="mt-4 text-center text-lg font-semibold text-gray-700">
              {t.total}: <span className="text-green-700">{orderStats.totalRevenue} DZD</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.orders}</h1>
            <p className="text-gray-600 mt-2">
              {language === 'ar' ? 'إدارة الطلبات الواردة وتتبع حالة الطلبات' : 'Manage incoming orders and track order status'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.search}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t.searchOrders}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.status}</label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allOrders}</SelectItem>
                  <SelectItem value="pending">{t.pending}</SelectItem>
                  <SelectItem value="confirmed">{t.confirmed}</SelectItem>
                  <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                  <SelectItem value="delivered">{t.delivered}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                {t.clearFilters}
              </Button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">{t.noOrders}</p>
                <p className="text-gray-400 mt-2">
                  {language === 'ar' ? 'لا توجد طلبات بعد. ستظهر هنا عندما يتلقى عملاؤك طلبات جديدة.' : 'No orders yet. They will appear here when customers place new orders.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        #
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t.customer}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t.phone}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t.total}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t.status}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t.date}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className="font-medium text-gray-900">{(page - 1) * ordersPerPage + index + 1}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className="text-gray-900">{order.customerInfo.name}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className="text-gray-900">{order.customerInfo.phone}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className="font-medium text-gray-900">{order.totalAmount} DZD</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <Badge className={getStatusColor(order.status)}>
                              {t[order.status as keyof typeof t]}
                            </Badge>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className="text-gray-900">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className={`flex gap-2 ${language === 'ar' ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`}>
                            {/* Quick Status Icon Buttons */}
                            {order.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                  title={t.confirmed}
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  title={t.cancelled}
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </Button>
                              </>
                            )}
                            
                            {order.status === 'confirmed' && (
                              <Button 
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                title={t.delivered}
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                              </Button>
                            )}

                            {order.status === 'delivered' && (
                              <Button 
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                disabled
                                title={t.delivered}
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </Button>
                            )}

                            {/* View Details Button */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                                  onClick={() => setSelectedOrder(order)}
                                  title={t.view}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{t.orderDetails}</DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-6">
                                    {/* Customer Info */}
                                    <div>
                                      <h4 className="font-semibold mb-2">{t.customerInfo}</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <p><strong>{t.customer}:</strong> {selectedOrder.customerInfo.name}</p>
                                        <p><strong>{t.phone}:</strong> {selectedOrder.customerInfo.phone}</p>
                                        <p><strong>{t.address}:</strong> {selectedOrder.customerInfo.address}</p>
                                      </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                      <h4 className="font-semibold mb-2">{t.orderItems}</h4>
                                      <div className="space-y-2">
                                        {selectedOrder.items.map((item, index) => (
                                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <div>
                                              <p className="font-medium">{item.itemName}</p>
                                              <p className="text-sm text-gray-600">{item.categoryName}</p>
                                            </div>
                                            <div className="text-right">
                                              <p>{item.quantity} x {item.price} DZD</p>
                                              <p className="font-semibold">{item.quantity * item.price} DZD</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="mt-4 pt-4 border-t">
                                        <div className="flex justify-between font-bold">
                                          <span>{t.total}:</span>
                                          <span>{selectedOrder.totalAmount} DZD</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                      <h4 className="font-semibold mb-2">{t.adminNotes}</h4>
                                      <Textarea
                                        placeholder={t.addNotes}
                                        value={editingNotes}
                                        onChange={(e) => setEditingNotes(e.target.value)}
                                        rows={3}
                                      />
                                      <Button 
                                        className="mt-2"
                                        onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status, editingNotes)}
                                      >
                                        {t.save}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Delete Button */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setDeleteConfirmOrder(order)}
                                  title={t.delete}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              {deleteConfirmOrder && (
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{t.deleteOrder}</DialogTitle>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <p>{t.deleteConfirm}</p>
                                    <p className="mt-2 font-medium">
                                      {language === 'ar' ? 'رقم الطلب:' : 'Order:'} {deleteConfirmOrder.orderNumber}
                                    </p>
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setDeleteConfirmOrder(null)}>
                                      {t.cancel}
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => deleteOrder(deleteConfirmOrder.id)}
                                    >
                                      {t.delete}
                                    </Button>
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {t.previous}
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {t.next}
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t.showing} <span className="font-medium">{(page - 1) * ordersPerPage + 1}</span> {t.to}{' '}
                  <span className="font-medium">
                    {Math.min(page * ordersPerPage, totalOrders)}
                  </span>{' '}
                  {t.of} <span className="font-medium">{totalOrders}</span> {t.results}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders; 