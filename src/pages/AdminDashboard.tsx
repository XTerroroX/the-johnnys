import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  LayoutDashboard, 
  UserPlus, 
  Settings, 
  LogOut, 
  Scissors, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import AdminStats from '@/components/AdminStats';
import ProfileSettings from '@/components/ProfileSettings';
import { ServicesTab } from '@/components/admin/ServicesTab';
import { BarbersTab } from '@/components/admin/BarbersTab';
import { BookingsTab } from '@/components/admin/BookingsTab';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Service } from '@/types/service';
import { Barber } from '@/types/barber';
import Navbar from '@/components/Navbar';
import { 
  Search,
  X,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileNavigation } from '@/components/admin/MobileNavigation';

const serviceFormSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  duration: z.coerce.number().min(5, { message: "Duration must be at least 5 minutes." }),
  active: z.boolean().default(true),
});

const barberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  specialty: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const barberEditFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  specialty: z.string().optional(),
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [isDeleteServiceDialogOpen, setIsDeleteServiceDialogOpen] = useState(false);
  const [isDeleteBarberDialogOpen, setIsDeleteBarberDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isBarberDialogOpen, setIsBarberDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [barberFilter, setBarberFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to access the admin dashboard");
        navigate("/login");
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (error || !profile || profile.role !== 'superadmin') {
        toast.error("You don't have permission to access the admin dashboard");
        navigate("/");
      } else {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, [navigate]);
  
  const createServiceMutation = useMutation({
    mutationFn: async (newService: z.infer<typeof serviceFormSchema>) => {
      const serviceToCreate = {
        name: newService.name,
        description: newService.description || null,
        price: newService.price,
        duration: newService.duration,
        active: newService.active
      };
      const { data, error } = await supabase
        .from('services')
        .insert([serviceToCreate])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Service created successfully");
      setIsServiceDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error creating service: ${error.message}`);
    }
  });
  
  const updateServiceMutation = useMutation({
    mutationFn: async (service: Service) => {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          active: service.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', service.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Service updated successfully");
      setIsServiceDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error updating service: ${error.message}`);
    }
  });
  
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Service deleted successfully");
      setIsDeleteServiceDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error deleting service: ${error.message}`);
    }
  });
  
  const createBarberMutation = useMutation({
    mutationFn: async (newBarber: z.infer<typeof barberFormSchema>) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newBarber.email,
        password: newBarber.password,
        options: {
          data: {
            name: newBarber.name,
          }
        }
      });
      if (authError) throw authError;
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      toast.success("Barber account created successfully");
      setIsBarberDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error creating barber account: ${error.message}`);
    }
  });
  
  const updateBarberMutation = useMutation({
    mutationFn: async (barber: Partial<Barber>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: barber.name,
          email: barber.email,
          specialty: barber.specialty,
          updated_at: new Date().toISOString()
        })
        .eq('id', barber.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      toast.success("Barber updated successfully");
      setIsBarberDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error updating barber: ${error.message}`);
    }
  });
  
  const deleteBarberMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch('/api/deleteUser', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      toast.success("Barber deleted successfully");
      setIsDeleteBarberDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error deleting barber: ${error.message}`);
    }
  });
  
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'confirmed' | 'completed' | 'cancelled' }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success("Booking status updated");
    },
    onError: (error) => {
      toast.error(`Error updating booking status: ${error.message}`);
    }
  });
  
  const serviceForm = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 30,
      active: true
    }
  });
  
  const barberForm = useForm<z.infer<typeof barberFormSchema>>({
    resolver: zodResolver(barberFormSchema),
    defaultValues: {
      name: "",
      email: "",
      specialty: "",
      password: ""
    }
  });
  
  const barberEditForm = useForm<z.infer<typeof barberEditFormSchema>>({
    resolver: zodResolver(barberEditFormSchema),
    defaultValues: {
      name: "",
      email: "",
      specialty: ""
    }
  });
  
  const handleAddNewService = () => {
    setSelectedService(null);
    serviceForm.reset({
      name: "",
      description: "",
      price: 0,
      duration: 30,
      active: true
    });
    setIsServiceDialogOpen(true);
  };
  
  const handleEditService = (service: Service) => {
    setSelectedService(service);
    serviceForm.reset({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      active: service.active
    });
    setIsServiceDialogOpen(true);
  };
  
  const handleAddNewBarber = () => {
    setSelectedBarber(null);
    barberForm.reset({
      name: "",
      email: "",
      specialty: "",
      password: ""
    });
    setIsBarberDialogOpen(true);
  };
  
  const handleEditBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    barberEditForm.reset({
      name: barber.name,
      email: barber.email,
      specialty: barber.specialty || ""
    });
    setIsBarberDialogOpen(true);
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Error signing out: ${error.message}`);
    } else {
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };
  
  if (!userId) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Navbar />
      </div>
      
      <MobileNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <div className="flex h-screen pt-[var(--navbar-height)]">
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 pt-[var(--navbar-height)] bg-sidebar-background border-r border-sidebar-border">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-3 space-y-1">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "barbers" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("barbers")}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Barbers
              </Button>
              <Button
                variant={activeTab === "bookings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("bookings")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Bookings
              </Button>
              <Button
                variant={activeTab === "profile" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-5 w-5" />
                My Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-[var(--navbar-height)]">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              </div>
              <AdminStats />
            </div>
          )}

          {activeTab === "barbers" && (
            <BarbersTab
              onAddNewBarber={handleAddNewBarber}
              onEditBarber={handleEditBarber}
              selectedBarber={selectedBarber}
              isBarberDialogOpen={isBarberDialogOpen}
              setIsBarberDialogOpen={setIsBarberDialogOpen}
              isDeleteBarberDialogOpen={isDeleteBarberDialogOpen}
              setIsDeleteBarberDialogOpen={setIsDeleteBarberDialogOpen}
              barberForm={barberForm}
              barberEditForm={barberEditForm}
              deleteBarberMutation={deleteBarberMutation}
            />
          )}

          {activeTab === "bookings" && (
            <BookingsTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              barberFilter={barberFilter}
              setBarberFilter={setBarberFilter}
              serviceFilter={serviceFilter}
              setServiceFilter={setServiceFilter}
              updateBookingStatusMutation={updateBookingStatusMutation}
            />
          )}

          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">My Profile</h1>
              </div>
              {userId && <ProfileSettings userId={userId} userRole="superadmin" />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
