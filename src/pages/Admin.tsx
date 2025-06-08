import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/api';
import { Eye } from 'lucide-react';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trialFilter, setTrialFilter] = useState<string>('all');
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
        const allUsers = await adminApi.getAllUsers();
        setUsers(allUsers);
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
    
    fetchUsers();
  }, [user, isAdmin]);

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

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filter by search term
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      
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
  }, [users, searchTerm, statusFilter, trialFilter]);

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
    
    return { totalUsers, activeTrials, subscribers, expiredTrials };
  }, [users]);

  if (!user || !isAdmin()) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage users and subscriptions</p>
        
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
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
                <div className="rounded-md border mb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Trial Status</TableHead>
                        <TableHead>Days Left</TableHead>
                        <TableHead>Account Status</TableHead>
                        <TableHead>Total Visits</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
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
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-gray-500" />
                                <span>{user.totalVisits || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.role !== 'admin' && (
                                user.isActive ? (
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
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="text-sm text-gray-500">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Admin;
