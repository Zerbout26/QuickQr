
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, activateUser, deactivateUser } from '@/lib/mockData';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        const allUsers = await getAllUsers();
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
      const updatedUser = await activateUser(userId);
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
      const updatedUser = await deactivateUser(userId);
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

  if (!user || !isAdmin()) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage users and subscriptions</p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.filter(u => u.role === 'user').length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Trials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {users.filter(u => {
                  const now = new Date();
                  return u.role === 'user' && !u.hasActiveSubscription && now <= u.trialEndDate;
                }).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Paying Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {users.filter(u => u.hasActiveSubscription).length}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse-slow">Loading users...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Trial Status</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Admin;
