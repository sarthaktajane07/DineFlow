import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ChefHat, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('staff');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const validate = () => {
        const newErrors = {};
        try {
            emailSchema.parse(email);
        }
        catch (e) {
            newErrors.email = 'Invalid email address';
        }
        try {
            passwordSchema.parse(password);
        }
        catch (e) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate())
            return;
        setLoading(true);
        if (isLogin) {
            const { error } = await signIn(email, password);
            if (error) {
                toast({
                    title: 'Login Failed',
                    description: error.message === 'Invalid login credentials'
                        ? 'Invalid email or password. Please try again.'
                        : error.message,
                    variant: 'destructive',
                });
            }
            else {
                toast({
                    title: 'Welcome back!',
                    description: 'Successfully logged in.',
                });
                navigate('/dashboard/manager');
            }
        }
        else {
            const { error } = await signUp(email, password, fullName, role);
            if (error) {
                toast({
                    title: 'Sign Up Failed',
                    description: error.message.includes('already registered')
                        ? 'This email is already registered. Please login instead.'
                        : error.message,
                    variant: 'destructive',
                });
            }
            else {
                toast({
                    title: 'Account Created!',
                    description: 'Welcome to DineFlow. You can now login.',
                });
                navigate('/dashboard/manager');
            }
        }
        setLoading(false);
    };
    return (<div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <ChefHat className="w-10 h-10 text-primary"/>
          <span className="font-display text-3xl font-bold text-primary-foreground">DineFlow</span>
        </Link>

        <Card className="shadow-card border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin
            ? 'Sign in to access your dashboard'
            : 'Get started with DineFlow today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (<div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" required={!isLogin}/>
                </div>)}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
        }} placeholder="you@restaurant.com" className={errors.email ? 'border-destructive' : ''}/>
                {errors.email && (<p className="text-xs text-destructive">{errors.email}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
        }} placeholder="••••••••" className={errors.password ? 'border-destructive' : ''}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
                {errors.password && (<p className="text-xs text-destructive">{errors.password}</p>)}
              </div>

              {!isLogin && (<div className="space-y-2">
                  <Label>Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['manager', 'host', 'staff'].map((r) => (<button key={r} type="button" onClick={() => setRole(r)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${role === r
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:border-primary/50'}`}>
                        {r}
                      </button>))}
                  </div>
                </div>)}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button type="button" onClick={() => {
            setIsLogin(!isLogin);
            setErrors({});
        }} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
