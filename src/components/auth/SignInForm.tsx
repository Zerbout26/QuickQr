
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn('user@example.com', 'password');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with demo account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn('admin@example.com', 'password');
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with admin account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full qr-btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <div className="flex justify-between w-full mt-2">
            <Button 
              variant="outline" 
              className="flex-1 mr-2" 
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Demo User
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleAdminLogin}
              disabled={isLoading}
            >
              Demo Admin
            </Button>
          </div>
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-qr-secondary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignInForm;
