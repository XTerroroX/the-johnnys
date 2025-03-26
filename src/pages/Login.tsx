
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Login successful:', data.user);
      
      // Get the user's role using direct RLS-compliant query
      // Using eq filter ensures we only get the user's own profile due to RLS
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user role:', profileError);
        
        // Attempt to use the function-based approach as fallback
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_current_user_role');
          
        if (roleError) {
          console.error('Error with fallback role fetch:', roleError);
          toast.error("Authentication successful, but there was an issue fetching your role.");
          setIsLoading(false);
          return;
        }
        
        // If we got the role via RPC function, proceed with that
        console.log('User role (from RPC):', roleData);
        redirectBasedOnRole(roleData);
      } else {
        // We successfully got the profile with the role
        console.log('User role (from profiles):', profileData.role);
        toast.success("Login successful!");
        redirectBasedOnRole(profileData.role);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("There was a problem logging in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to redirect based on role
  const redirectBasedOnRole = (role: string) => {
    if (role === 'superadmin') {
      navigate('/admin-dashboard');
    } else if (role === 'barber') {
      navigate('/barber-dashboard');
    } else {
      // Default fallback
      navigate('/');
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="page-container">
          <div className="max-w-md mx-auto glass-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to access your account
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input 
                            placeholder="you@example.com" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
                
                <div className="text-center text-sm text-muted-foreground mt-6">
                  <p>Demo credentials:</p>
                  <p>Admin: admin@thejohnnys.com / password</p>
                  <p>Barber: barber@thejohnnys.com / password</p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Login;
