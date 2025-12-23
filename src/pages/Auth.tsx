import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Wrench, User, Building2, ArrowLeft, Mail, Lock, UserCircle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'signin');
  const [userType, setUserType] = useState<'customer' | 'garage'>(
    (searchParams.get('type') as 'customer' | 'garage') || 'customer'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const validateForm = (isSignUp: boolean) => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    if (isSignUp) {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.name = e.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    
    if (error) {
      toast({
        title: 'Sign In Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName, userType);
    setIsSubmitting(false);
    
    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'This email is already registered. Please sign in instead.';
      }
      toast({
        title: 'Sign Up Failed',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account Created!',
        description: 'Welcome to RoadAssist. You can now access your dashboard.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity mb-12">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
              <Wrench className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary-foreground">RoadAssist</span>
          </div>
          
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            {activeTab === 'signin' ? 'Welcome Back!' : 'Join Our Network'}
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            {activeTab === 'signin' 
              ? 'Sign in to access your dashboard and manage your requests.'
              : 'Create an account to connect with garages or offer your services.'}
          </p>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="text-3xl font-bold text-primary-foreground">500+</div>
            <div className="text-sm text-primary-foreground/70">Verified Garages</div>
          </div>
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="text-3xl font-bold text-primary-foreground">10K+</div>
            <div className="text-sm text-primary-foreground/70">Happy Customers</div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">RoadAssist</span>
              </div>
              <CardTitle className="text-2xl">
                {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'signin' 
                  ? 'Enter your credentials to access your account'
                  : 'Fill in your details to get started'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* User Type Selection */}
                    <div className="space-y-2">
                      <Label>I am a</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setUserType('customer')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            userType === 'customer' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <User className={`w-6 h-6 mx-auto mb-2 ${userType === 'customer' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className={`text-sm font-medium ${userType === 'customer' ? 'text-primary' : 'text-foreground'}`}>
                            Vehicle Owner
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserType('garage')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            userType === 'garage' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Building2 className={`w-6 h-6 mx-auto mb-2 ${userType === 'garage' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className={`text-sm font-medium ${userType === 'garage' ? 'text-primary' : 'text-foreground'}`}>
                            Garage Owner
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
