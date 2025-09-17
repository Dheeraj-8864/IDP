import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DroneScene } from '@/components/3D/DroneScene';
import { Plane, Mail, Lock, User, Shield, Crown, UserCheck, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'superadmin'>('user');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  // Redirect already authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!authLoading && user) {
      switch (user.role) {
        case 'superadmin':
          navigate('/superadmin-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        default:
          navigate('/user-dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render the auth form if user is already authenticated
  if (user) {
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const user = await signIn(email, password);

      // Verify the selected role matches the user's actual role
      if (user.role !== selectedRole) {
        throw new Error(`Access denied. You don't have ${selectedRole} privileges.`);
      }

      toast({
        title: "Success!",
        description: `Welcome back, ${user.name}! Signed in as ${selectedRole}.`,
      });

      // Redirect based on verified role
      switch (user.role) {
        case 'superadmin':
          navigate('/superadmin-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        default:
          navigate('/user-dashboard', { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    try {
      await signUp(name, email, password, phone);

      toast({
        title: "Account created!",
        description: "Your account has been created successfully. You can now sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user': return <UserCheck className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'superadmin': return <Crown className="w-4 h-4" />;
      default: return <UserCheck className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user': return 'text-blue-600';
      case 'admin': return 'text-orange-600';
      case 'superadmin': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-background">
      <DroneScene />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-xl bg-card/80 border-primary/20 shadow-card">
            <CardHeader className="text-center">

              <div className="flex items-center justify-center gap-2 mb-2">
                <Plane className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">DroneHub</span>
              </div>
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Role</Label>
                      <Select value={selectedRole} onValueChange={(value: 'user' | 'admin' | 'superadmin') => setSelectedRole(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                              <span>User</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-orange-600" />
                              <span>Administrator</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="superadmin">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-purple-600" />
                              <span>Super Administrator</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the role that matches your account privileges
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:scale-105 transition-transform"
                      disabled={loading}
                    >
                      <div className="flex items-center gap-2">
                        {getRoleIcon(selectedRole)}
                        {loading ? "Signing in..." : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                      </div>
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          placeholder="Create a password"
                          className="pl-10"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:scale-105 transition-transform"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}