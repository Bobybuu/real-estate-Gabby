import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Mail, Lock, User, Phone, Building2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Define proper types for user roles
type UserRole = 'buyer' | 'seller' | 'agent' | 'admin' | 'management_client';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { login, register, user, isAuthenticated } = useAuth();

  const [loginData, setLoginData] = useState({ 
    username: '', 
    password: '' 
  });
  
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    user_type: 'buyer' as UserRole,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user.user_type);
    }
  }, [isAuthenticated, user, navigate]);

  const redirectUser = (userType: string) => {
    switch (userType) {
      case 'seller':
      case 'agent':
        navigate('/dashboard/seller');
        break;
      case 'admin':
        navigate('/dashboard/admin');
        break;
      case 'management_client':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(loginData);
      // The redirect will happen automatically via the useEffect above
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      // Error message is already shown by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!signupData.username || !signupData.email || !signupData.password || !signupData.first_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate passwords match
    if (signupData.password !== signupData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (signupData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        password_confirm: signupData.password_confirm,
        first_name: signupData.first_name,
        last_name: signupData.last_name || '', // Ensure last_name is always a string
        user_type: signupData.user_type,
        phone_number: signupData.phone_number,
      };

      console.log('Sending registration data:', userData);
      await register(userData);
      
      // The redirect will happen automatically via the useEffect above
      toast.success('Registration successful!');
    } catch (error: any) {
      console.error('Signup error:', error);
      // Error message is already shown by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    // Map frontend roles to backend user types
    const userTypeMap: { [key: string]: UserRole } = {
      'user': 'buyer',
      'agent': 'seller' 
    };
    
    const userType = userTypeMap[role] || 'buyer';
    
    setSignupData({ 
      ...signupData, 
      user_type: userType
    });
  };

  // Get the display value for the radio group
  const getRadioGroupValue = () => {
    return signupData.user_type === 'buyer' ? 'user' : 'agent';
  };

  // Reset form when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'login') {
      setLoginData({ username: '', password: '' });
    } else {
      setSignupData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        password: '',
        password_confirm: '',
        user_type: 'buyer',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <Home className="h-8 w-8" />
            PristinePrimier
          </Link>
          <p className="text-muted-foreground">Your trusted real estate partner</p>
        </div>

        {/* Auth Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="johndoe"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    <a href="#" className="text-teal hover:underline">
                      Forgot password?
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join PristinePrimier to start your real estate journey</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signup-first-name">First Name *</Label>
                      <Input
                        id="signup-first-name"
                        type="text"
                        placeholder="John"
                        value={signupData.first_name}
                        onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-last-name">Last Name</Label>
                      <Input
                        id="signup-last-name"
                        type="text"
                        placeholder="Doe"
                        value={signupData.last_name}
                        onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-username">Username *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="johndoe"
                        value={signupData.username}
                        onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="john@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="0722123456"
                        value={signupData.phone_number}
                        onChange={(e) => setSignupData({ ...signupData, phone_number: e.target.value })}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <Label>Account Type</Label>
                    <RadioGroup
                      value={getRadioGroupValue()}
                      onValueChange={handleRoleChange}
                      className="grid grid-cols-2 gap-4 mt-2"
                      disabled={loading}
                    >
                      <div>
                        <RadioGroupItem value="user" id="role-user" className="peer sr-only" />
                        <Label
                          htmlFor="role-user"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-background p-4 hover:bg-secondary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                        >
                          <UserCircle className="mb-2 h-6 w-6" />
                          <div className="text-center">
                            <div className="font-semibold">Buyer/Renter</div>
                            <div className="text-xs text-muted-foreground">Find properties</div>
                          </div>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="agent" id="role-agent" className="peer sr-only" />
                        <Label
                          htmlFor="role-agent"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-background p-4 hover:bg-secondary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                        >
                          <Building2 className="mb-2 h-6 w-6" />
                          <div className="text-center">
                            <div className="font-semibold">Seller/Agent</div>
                            <div className="text-xs text-muted-foreground">List properties</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="pl-10"
                        required
                        disabled={loading}
                        minLength={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters long</p>
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.password_confirm}
                        onChange={(e) => setSignupData({ ...signupData, password_confirm: e.target.value })}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className="text-teal hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-teal hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-base">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;