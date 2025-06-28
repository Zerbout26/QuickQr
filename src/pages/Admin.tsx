import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { User, QRCode } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { adminApi, qrCodeApi } from '@/lib/api';
import { Eye, QrCode, Scan, ExternalLink, Menu, ShoppingBag, Building, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trialFilter, setTrialFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userQRCodes, setUserQRCodes] = useState<QRCode[]>([]);
  const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const navigate = useNavigate();

  // Redirect if not an admin
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !isAdmin()) return;
      
      setIsLoading(true);
      try {
        const { data, totalPages, total } = await adminApi.getAllUsers(currentPage, 10, searchTerm);
        setUsers(data);
        setTotalPages(totalPages);
        setTotalUsers(total);
      } catch (error) {
        console.error('Failed to fetch users', error);
        toast({
          variant: "destructive",
          title: "Error loading users",
          description: "There was a problem loading the user data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    const handler = setTimeout(() => {
    fetchUsers();
    }, 500); // Debounce search requests

    return () => {
      clearTimeout(handler);
    };
  }, [user, isAdmin, currentPage, searchTerm]);

  const handleActivateUser = async (userId: string) => {
    try {
      const updatedUser = await adminApi.updateUserStatus(userId, true);
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? updatedUser : u)
      );
      toast({
        title: "User Activated",
        description: "The user has been activated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const updatedUser = await adminApi.updateUserStatus(userId, false);
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? updatedUser : u)
      );
      toast({
        title: "User Deactivated",
        description: "The user has been deactivated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deactivation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleViewQRCodes = async (user: User) => {
    setSelectedUser(user);
    setIsLoadingQRCodes(true);
    setQrModalOpen(true);
    
    try {
      const { data } = await adminApi.getUserQRCodes(user.id, 1, 100);
      setUserQRCodes(data);
    } catch (error) {
      console.error('Failed to fetch user QR codes:', error);
      toast({
        variant: "destructive",
        title: "Error loading QR codes",
        description: "Failed to load user's QR codes.",
      });
    } finally {
      setIsLoadingQRCodes(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setIsDeletingUser(true);
    try {
      const result = await adminApi.deleteUser(user.id);
      
      // Remove user from the list
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
      
      // Update total count
      setTotalUsers(prev => prev - 1);
      
      toast({
        title: "User Deleted",
        description: `Successfully deleted ${user.email} and ${result.deletedUser.qrCodesCount} QR codes.`,
      });
      
      setDeleteUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "An error occurred while deleting the user.",
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Get QR code type icon
  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'menu':
        return <Menu className="w-4 h-4" />;
      case 'products':
        return <ShoppingBag className="w-4 h-4" />;
      case 'vitrine':
        return <Building className="w-4 h-4" />;
      default:
        return <QrCode className="w-4 h-4" />;
    }
  };

  // Get QR code type label
  const getQRTypeLabel = (type: string) => {
    switch (type) {
      case 'menu':
        return 'Menu';
      case 'products':
        return 'Products';
      case 'vitrine':
        return 'Vitrine';
      default:
        return type;
    }
  };

  // Calculate trial status
  const getTrialStatus = (user: User) => {
    const now = new Date();
    if (user.hasActiveSubscription) return 'Subscribed';
    if (now > user.trialEndDate) return 'Expired';
    return 'Active';
  };

  // Calculate days left in trial
  const getDaysLeft = (user: User) => {
    if (user.hasActiveSubscription) return 'N/A';
    
    const now = new Date();
    const endDate = new Date(user.trialEndDate);
    
    if (now > endDate) return '0';
    
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  };

  // Filtered users based on filters (search is now handled by backend)
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filter by account status
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active';
        if (user.isActive !== isActive) return false;
      }
      
      // Filter by trial status
      if (trialFilter !== 'all') {
        const trialStatus = getTrialStatus(user);
        if (trialFilter === 'active' && trialStatus !== 'Active') return false;
        if (trialFilter === 'expired' && trialStatus !== 'Expired') return false;
        if (trialFilter === 'subscribed' && trialStatus !== 'Subscribed') return false;
      }
      
      return true;
    });
  }, [users, statusFilter, trialFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.filter(u => u.role === 'user').length;
    const activeTrials = users.filter(u => {
      const now = new Date();
      return u.role === 'user' && !u.hasActiveSubscription && now <= u.trialEndDate;
    }).length;
    const subscribers = users.filter(u => u.hasActiveSubscription).length;
    const expiredTrials = users.filter(u => {
      const now = new Date();
      return u.role === 'user' && !u.hasActiveSubscription && now > u.trialEndDate;
    }).length;
    
    // QR Code type analytics
    const menuUsers = users.filter(u => u.hasMenu).length;
    const vitrineUsers = users.filter(u => u.hasVitrine).length;
    const productsUsers = users.filter(u => u.hasProducts).length;
    const totalQRCodes = users.reduce((sum, u) => sum + (u.totalQRCodes || 0), 0);
    const totalScans = users.reduce((sum, u) => sum + (u.totalScans || 0), 0);
    
    return { 
      totalUsers, 
      activeTrials, 
      subscribers, 
      expiredTrials,
      menuUsers,
      vitrineUsers,
      productsUsers,
      totalQRCodes,
      totalScans
    };
  }, [users]);

  if (!user || !isAdmin()) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage users and view their QR code interests</p>
        
        <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Trials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.activeTrials}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Paying Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.subscribers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Expired Trials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.expiredTrials}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalQRCodes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalScans}</p>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Type Analytics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Menu className="w-5 h-5" />
                Menu Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.menuUsers}</p>
              <p className="text-sm text-gray-500">
                {stats.totalUsers > 0 ? `${((stats.menuUsers / stats.totalUsers) * 100).toFixed(1)}%` : '0%'} of users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5" />
                Vitrine Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.vitrineUsers}</p>
              <p className="text-sm text-gray-500">
                {stats.totalUsers > 0 ? `${((stats.vitrineUsers / stats.totalUsers) * 100).toFixed(1)}%` : '0%'} of users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Products Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.productsUsers}</p>
              <p className="text-sm text-gray-500">
                {stats.totalUsers > 0 ? `${((stats.productsUsers / stats.totalUsers) * 100).toFixed(1)}%` : '0%'} of users
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management & QR Code Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input 
                  placeholder="Search by email" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Account Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={trialFilter} onValueChange={setTrialFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trial Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active Trial</SelectItem>
                    <SelectItem value="expired">Expired Trial</SelectItem>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse-slow">Loading users...</div>
              </div>
            ) : (
              <>
                <div className="rounded-md border mb-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Trial Status</TableHead>
                        <TableHead>Days Left</TableHead>
                        <TableHead>Account Status</TableHead>
                        <TableHead>QR Code Types</TableHead>
                        <TableHead>Total QR Codes</TableHead>
                        <TableHead>Total Scans</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            No users match your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'outline' : 'default'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  user.hasActiveSubscription 
                                    ? 'outline' 
                                    : getTrialStatus(user) === 'Active' 
                                      ? 'default' 
                                      : 'destructive'
                                }
                              >
                                {getTrialStatus(user)}
                              </Badge>
                            </TableCell>
                            <TableCell>{getDaysLeft(user)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.isActive ? 'default' : 'destructive'}
                                className={user.isActive ? 'bg-green-500' : ''}
                              >
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.hasMenu && (
                                  <Badge variant="outline" className="text-xs">
                                    <Menu className="w-3 h-3 mr-1" />
                                    Menu
                                  </Badge>
                                )}
                                {user.hasVitrine && (
                                  <Badge variant="outline" className="text-xs">
                                    <Building className="w-3 h-3 mr-1" />
                                    Vitrine
                                  </Badge>
                                )}
                                {user.hasProducts && (
                                  <Badge variant="outline" className="text-xs">
                                    <ShoppingBag className="w-3 h-3 mr-1" />
                                    Products
                                  </Badge>
                                )}
                                {!user.hasMenu && !user.hasVitrine && !user.hasProducts && (
                                  <span className="text-gray-400 text-xs">None</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <QrCode className="w-4 h-4 text-gray-500" />
                                <span>{user.totalQRCodes || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-gray-500" />
                                <span>{user.totalScans || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewQRCodes(user)}
                                  className="flex items-center gap-1"
                                >
                                  <Scan className="w-3 h-3" />
                                  Scan QR
                                </Button>
                                {user.role !== 'admin' && (
                                  <>
                                    {user.isActive ? (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleDeactivateUser(user.id)}
                                      >
                                        Deactivate
                                      </Button>
                                    ) : (
                                      <Button 
                                        className="qr-btn-primary" 
                                        size="sm"
                                        onClick={() => handleActivateUser(user.id)}
                                      >
                                        Activate
                                      </Button>
                                    )}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          variant="destructive" 
                                          size="sm"
                                          className="flex items-center gap-1"
                                          onClick={() => setDeleteUser(user)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete <strong>{user.email}</strong>? 
                                            This action will permanently delete:
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                              <li>The user account</li>
                                              <li>All {user.totalQRCodes || 0} QR codes</li>
                                              <li>All associated images and files</li>
                                              <li>All scan data and analytics</li>
                                            </ul>
                                            <p className="mt-2 text-red-600 font-medium">
                                              This action cannot be undone.
                                            </p>
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteUser(user)}
                                            disabled={isDeletingUser}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            {isDeletingUser ? 'Deleting...' : 'Delete User'}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Showing {filteredUsers.length} of {totalUsers} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* QR Codes Modal */}
        <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                QR Codes for {selectedUser?.email}
              </DialogTitle>
              <DialogDescription>
                View and scan user's QR codes to understand their interests
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingQRCodes ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse">Loading QR codes...</div>
              </div>
            ) : userQRCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                This user hasn't created any QR codes yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userQRCodes.map((qr) => (
                  <Card key={qr.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium truncate">
                          {qr.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {getQRTypeIcon(qr.type)}
                          <span className="ml-1">{getQRTypeLabel(qr.type)}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col items-center space-y-3">
                        <div 
                          className="w-32 h-32 flex items-center justify-center border rounded-lg p-2" 
                          style={{ backgroundColor: qr.backgroundColor }}
                        >
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
                        </div>
                        
                        <div className="text-center space-y-1">
                          <p className="text-xs text-gray-600 truncate max-w-full">
                            {qr.url}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{qr.scanCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <QrCode className="w-3 h-3" />
                              <span>{qr.type}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(qr.url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Visit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              navigator.clipboard.writeText(qr.url);
                              toast({
                                title: "URL Copied",
                                description: "QR code URL copied to clipboard",
                              });
                            }}
                          >
                            Copy URL
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Admin;
