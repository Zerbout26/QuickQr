import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2, Filter, Search } from 'lucide-react';

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
    search: 'Search orders...',
    noOrders: 'No orders found',
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
    search: 'البحث في الطلبات...',
    noOrders: 'لا توجد طلبات',
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
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState<string>('');

  const t = translations[language];

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { searchTerm })
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://quickqr-heyg.onrender.com'}/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.data);
      setTotalPages(data.totalPages);
      setTotalOrders(data.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: t.error,
        description: "Failed to fetch orders"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://quickqr-heyg.onrender.com'}/api/orders/${orderId}/status`, {
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
    if (!confirm(t.deleteConfirm)) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://quickqr-heyg.onrender.com'}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-generator-token')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders(orders.filter(order => order.id !== orderId));
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
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t.orders}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t.all}</SelectItem>
            <SelectItem value="pending">{t.pending}</SelectItem>
            <SelectItem value="confirmed">{t.confirmed}</SelectItem>
            <SelectItem value="cancelled">{t.cancelled}</SelectItem>
            <SelectItem value="delivered">{t.delivered}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">{t.noOrders}</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{order.orderNumber}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {t[order.status as keyof typeof t]}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>{t.customer}:</strong> {order.customerInfo.name}</p>
                      <p><strong>{t.total}:</strong> {order.totalAmount} DZD</p>
                      <p><strong>{t.date}:</strong> {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t.view}
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

                            {/* Status Update */}
                            <div>
                              <h4 className="font-semibold mb-2">{t.updateStatus}</h4>
                              <div className="flex gap-2">
                                <Select value={editingStatus} onValueChange={setEditingStatus}>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder={t.status} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">{t.pending}</SelectItem>
                                    <SelectItem value="confirmed">{t.confirmed}</SelectItem>
                                    <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                                    <SelectItem value="delivered">{t.delivered}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  onClick={() => updateOrderStatus(selectedOrder.id, editingStatus)}
                                  disabled={!editingStatus}
                                >
                                  {t.save}
                                </Button>
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
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteOrder(order.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.delete}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            {t.page} {page} {t.of} {totalPages} ({totalOrders} {t.items})
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t.previous}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              {t.next}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 