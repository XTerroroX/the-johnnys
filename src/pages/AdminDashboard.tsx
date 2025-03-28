import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  LayoutDashboard, 
  UserPlus, 
  Settings, 
  LogOut, 
  Scissors, 
  ListChecks,
  Search,
  X,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Save,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStats from '@/components/AdminStats';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Barber {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Booking {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_id: number;
  barber_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  service: {
    id: number;
    name: string;
    price: number;
    duration: number;
  };
  barber: {
    id: string;
    name: string;
    email: string;
  };
}

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
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const { 
    data: services = [], 
    isLoading: isLoadingServices,
    error: servicesError
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Service[];
    }
  });
  
  const { 
    data: barbers = [], 
    isLoading: isLoadingBarbers,
    error: barbersError
  } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'barber')
        .order('name');
        
      if (error) throw error;
      return data as Barber[];
    }
  });
  
  const { 
    data: bookings = [], 
    isLoading: isLoadingBookings,
    error: bookingsError
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:service_id (id, name, price, duration),
          barber:barber_id (id, name, email)
        `)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as unknown as Booking[];
    }
  });
  
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
  
  const onServiceSubmit = (values: z.infer<typeof serviceFormSchema>) => {
    if (selectedService) {
      updateServiceMutation.mutate({
        ...selectedService,
        ...values
      });
    } else {
      createServiceMutation.mutate(values);
    }
  };
  
  const onBarberSubmit = (values: z.infer<typeof barberFormSchema>) => {
    createBarberMutation.mutate(values);
  };
  
  const onBarberEditSubmit = (values: z.infer<typeof barberEditFormSchema>) => {
    if (selectedBarber) {
      updateBarberMutation.mutate({
        ...selectedBarber,
        ...values
      });
    }
  };
  
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.barber.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDate = !dateFilter || booking.date === dateFilter;
    const matchesBarber = !barberFilter || booking.barber_id === barberFilter;
    const matchesService = !serviceFilter || booking.service_id === parseInt(serviceFilter);
    
    return matchesSearch && matchesDate && matchesBarber && matchesService;
  });
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(`Error signing out: ${error.message}`);
    } else {
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };
  
  useEffect(() => {
    if (servicesError) toast.error("Error loading services: " + (servicesError as Error).message);
    if (barbersError) toast.error("Error loading barbers: " + (barbersError as Error).message);
    if (bookingsError) toast.error("Error loading bookings: " + (bookingsError as Error).message);
  }, [servicesError, barbersError, bookingsError]);

  return (
    <>
    <Navbar /> 
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-slate-950 border-b p-4 flex justify-between items-center">
        <h1 className="font-display font-bold text-xl">Admin Dashboard</h1>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <ChevronDown />}
        </Button>
      </header>
      
      <div className="lg:hidden bg-white dark:bg-slate-950 border-b p-4 animate-fade-in">
        <nav className="space-y-2">
          {[
            { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", value: "dashboard" },
            { icon: <Calendar className="h-5 w-5" />, label: "Bookings", value: "bookings" },
            { icon: <Scissors className="h-5 w-5" />, label: "Services", value: "services" },
            { icon: <UserPlus className="h-5 w-5" />, label: "Barbers", value: "barbers" },
            { icon: <Settings className="h-5 w-5" />, label: "Settings", value: "settings" },
          ].map((item) => (
            <Button
              key={item.value}
              variant={activeTab === item.value ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab(item.value);
                setMobileMenuOpen(false);
              }}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Logout</span>
          </Button>
        </nav>
      </div>
      
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="hidden lg:flex flex-col w-64 border-r bg-white dark:bg-slate-950 p-4">
          <div className="text-center p-4 border-b mb-6">
            <h1 className="font-display font-bold text-xl">Admin Dashboard</h1>
          </div>
          
          <nav className="space-y-2 flex-1">
            {[
              { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", value: "dashboard" },
              { icon: <Calendar className="h-5 w-5" />, label: "Bookings", value: "bookings" },
              { icon: <Scissors className="h-5 w-5" />, label: "Services", value: "services" },
              { icon: <UserPlus className="h-5 w-5" />, label: "Barbers", value: "barbers" },
              { icon: <Settings className="h-5 w-5" />, label: "Settings", value: "settings" },
            ].map((item) => (
              <Button
                key={item.value}
                variant={activeTab === item.value ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.value)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </nav>
          
          <div className="mt-auto pt-6 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </aside>
        
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="barbers">Barbers</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              </div>
              
              <AdminStats />
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex flex-col space-y-6">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{booking.customer_name}</p>
                          <p className="text-sm text-muted-foreground">Booked {booking.service.name} with {booking.barber.name}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{booking.date}, {booking.start_time}</span>
                      </div>
                    ))}
                    
                    {bookings.length === 0 && !isLoadingBookings && (
                      <div className="text-center py-6 text-muted-foreground">
                        No recent bookings found.
                      </div>
                    )}
                    
                    {isLoadingBookings && (
                      <div className="text-center py-6 text-muted-foreground">
                        Loading recent bookings...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="bookings">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
                <div className="w-full sm:w-auto relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search bookings..."
                    className="pl-10 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label htmlFor="date-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Filter by Date
                  </label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label htmlFor="barber-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Filter by Barber
                  </label>
                  <select
                    id="barber-filter"
                    value={barberFilter}
                    onChange={(e) => setBarberFilter(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 mt-1"
                  >
                    <option value="">All Barbers</option>
                    {barbers.map((barber) => (
                      <option key={barber.id} value={barber.id}>{barber.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="service-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Filter by Service
                  </label>
                  <select
                    id="service-filter"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 mt-1"
                  >
                    <option value="">All Services</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id.toString()}>{service.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Barber</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="font-medium">{booking.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{booking.customer_email}</div>
                          </TableCell>
                          <TableCell>{booking.service?.name || "Unknown Service"}</TableCell>
                          <TableCell>{booking.barber?.name || "Unknown Barber"}</TableCell>
                          <TableCell>
                            {booking.date}, {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                              ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                  disabled={booking.status === 'confirmed'}
                                >
                                  Mark as Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                                  disabled={booking.status === 'completed'}
                                >
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                  disabled={booking.status === 'cancelled'}
                                >
                                  Cancel Booking
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredBookings.length === 0 && !isLoadingBookings && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No bookings found.
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {isLoadingBookings && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Loading bookings...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="services">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Services</h2>
                <Button onClick={handleAddNewService}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Service
                </Button>
              </div>
              
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <Card key={service.id} className={!service.active ? "opacity-70" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{service.name}</span>
                        {!service.active && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{service.description || "No description provided"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-base font-medium">
                        <span>Price:</span>
                        <span>${service.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>Duration:</span>
                        <span>{service.duration} minutes</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedService(service);
                          setIsDeleteServiceDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {services.length === 0 && !isLoadingServices && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No services found. Click "Add New Service" to create one.
                  </div>
                )}
                
                {isLoadingServices && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    Loading services...
                  </div>
                )}
              </div>
              
              <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{selectedService ? "Edit Service" : "Add New Service"}</DialogTitle>
                    <DialogDescription>
                      {selectedService 
                        ? "Update the service details below." 
                        : "Fill in the details to create a new service."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...serviceForm}>
                    <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={serviceForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={serviceForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={serviceForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="0" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={serviceForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (min)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="5" step="5" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={serviceForm.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Make this service available for booking
                              </FormDescription>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-primary"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsServiceDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {selectedService ? "Update Service" : "Create Service"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <AlertDialog
                open={isDeleteServiceDialogOpen}
                onOpenChange={setIsDeleteServiceDialogOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the service "{selectedService?.name}". 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => selectedService && deleteServiceMutation.mutate(selectedService.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
            
            <TabsContent value="barbers">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Barbers</h2>
                <Button onClick={handleAddNewBarber}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Barber
                </Button>
              </div>
              
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {barbers.map((barber) => (
                  <Card key={barber.id}>
                    <CardHeader>
                      <CardTitle>{barber.name}</CardTitle>
                      <CardDescription>{barber.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <span className="font-medium">Specialty: </span>
                        <span>{barber.specialty || "Not specified"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        <p>Since {new Date(barber.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditBarber(barber)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedBarber(barber);
                          setIsDeleteBarberDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {barbers.length === 0 && !isLoadingBarbers && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No barbers found. Click "Add New Barber" to create one.
                  </div>
                )}
                
                {isLoadingBarbers && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    Loading barbers...
                  </div>
                )}
              </div>
              
              <Dialog open={isBarberDialogOpen && !selectedBarber} onOpenChange={(open) => {
                if (!open) setIsBarberDialogOpen(false);
              }}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Barber</DialogTitle>
                    <DialogDescription>
                      Create a new barber account. This will also create a login for the barber.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...barberForm}>
                    <form onSubmit={barberForm.handleSubmit(onBarberSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={barberForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={barberForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={barberForm.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialty (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={barberForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              The barber will use this password to log in
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsBarberDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create Barber
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isBarberDialogOpen && !!selectedBarber} onOpenChange={(open) => {
                if (!open) setIsBarberDialogOpen(false);
              }}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Barber</DialogTitle>
                    <DialogDescription>
                      Update the barber's information.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...barberEditForm}>
                    <form onSubmit={barberEditForm.handleSubmit(onBarberEditSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={barberEditForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={barberEditForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={barberEditForm.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialty (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsBarberDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Update Barber
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <AlertDialog
                open={isDeleteBarberDialogOpen}
                onOpenChange={setIsDeleteBarberDialogOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the barber account for "{selectedBarber?.name}". 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => selectedBarber && deleteBarberMutation.mutate(selectedBarber.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="p-8 text-center bg-white dark:bg-slate-950 rounded-lg border">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Admin Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Configure shop hours, notifications, and other system settings.
                </p>
                <p className="text-sm text-muted-foreground">
                  Settings functionality will be implemented in a future update.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
