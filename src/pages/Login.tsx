import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import useAuth from '@/hooks/useAuth';

const Login = () => {
  const { login, managerLogin, loginLoading, loginError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isManagerLogin, setIsManagerLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keyCode: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Get the return path from location state or default to home
  const returnTo = location.state?.returnTo || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo);
    }
  }, [isAuthenticated, navigate, returnTo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isManagerLogin) {
      if (!formData.keyCode.trim()) {
        setError('Please enter your Manager Access Key');
        return;
      }
      const result = await managerLogin({
        key_code: formData.keyCode.trim(),
        password: formData.password
      });
      if (result.success) {
        navigate(returnTo);
      } else {
        setError(result.error || 'Invalid Manager Key');
      }
      return;
    }

    // Basic validation
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      navigate(returnTo);
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {(error || loginError) && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
              {error || loginError}
            </div>
          )}

          {/* Manager Login Toggle */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => {
                setIsManagerLogin(!isManagerLogin);
                setError('');
                setFormData(prev => ({ ...prev, email: '', password: '', keyCode: '' }));
              }}
              className="text-xs text-primary font-medium hover:underline"
            >
              {isManagerLogin ? 'Switch to Standard Login' : 'Login as Manager'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isManagerLogin ? (
              // Manager Login Form
              <div className="space-y-2">
                <label htmlFor="keyCode" className="text-sm font-medium">
                  Manager Access Key
                </label>
                <div className="relative">
                  <Input
                    id="keyCode"
                    name="keyCode"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="MGR-KEY-XXXXXXXX"
                    value={formData.keyCode}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="space-y-2 mt-4">
                  <label htmlFor="manager-password" className="text-sm font-medium">
                    Manager Password
                  </label>
                  <Input
                    id="manager-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <p className="text-xs text-muted-foreground mt-2">Enter the key and password provided by your administrator.</p>
              </div>
            ) : (
              // Standard Login Form
              <>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : (isManagerLogin ? 'Access Dashboard' : 'Sign In')}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="outline"
              type="button"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                // Placeholder for Google OAuth
                alert("To enable Google Login:\n1. Create project in Google Cloud Console\n2. Get Client ID\n3. Configure @react-oauth/google");
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.17s.13-1.51.35-2.17V7.01H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.99l3.66-2.82z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.66 2.82c.87-2.6 3.3-4.45 6.16-4.45z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;