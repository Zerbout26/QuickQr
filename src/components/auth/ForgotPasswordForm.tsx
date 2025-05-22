import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.verifyEmail(email);
      if (response.exists) {
        setIsEmailVerified(true);
        toast({
          title: "Email verified",
          description: "Please enter your new password.",
        });
      } else {
        setError('No account found with this email address');
        toast({
          variant: "destructive",
          title: "Error",
          description: "No account found with this email address",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify email');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.error || 'Failed to verify email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ email, newPassword, confirmPassword });
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      navigate('/signin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.error || 'Failed to update password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {isEmailVerified 
            ? "Enter your new password below"
            : "Enter your email address to reset your password"
          }
        </CardDescription>
      </CardHeader>
      {!isEmailVerified ? (
        <form onSubmit={handleEmailSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="your@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
            <div className="text-center mt-4 text-sm text-gray-500">
              Remember your password?{' '}
              <Link to="/signin" className="text-qr-secondary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword"
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword"
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default ForgotPasswordForm; 