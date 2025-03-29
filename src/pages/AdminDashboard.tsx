// src/pages/AdminDashboard.tsx
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
  AlertTriangle,
  User
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
import ProfileSettings from '@/components/ProfileSettings';
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
  
  // Skip rendering until we have authenticated the user
  if (!userId) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Navbar />
      </div>
      
      <div className="flex h-screen pt-[var(--navbar-height)]">
        {/* Sidebar */}
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
                variant={activeTab === "services" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("services")}
              >
                <Scissors className="mr-2 h-5 w-5" />
                Services
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

        {/* Mobile menu button - shown on small screens */}
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
              >
                <path
                  d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm">
            <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-slate-900 shadow-xl p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Admin Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-4">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("dashboard");
                    setMobileMenuOpen(false);
                  }}
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === "services" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("services");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Scissors className="mr-2 h-5 w-5" />
                  Services
                </Button>
                <Button
                  variant={activeTab === "barbers" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("barbers");
                    setMobileMenuOpen(false);
                  }}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Barbers
                </Button>
                <Button
                  variant={activeTab === "bookings" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("bookings");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Bookings
                </Button>
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("profile");
                    setMobileMenuOpen(false);
                  }}
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
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-[var(--navbar-height)]">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              </div>
              
              <AdminStats />
            </div>
          )}
          
          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Services Management</h1>
                <Button onClick={handleAddNewService}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Service
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>All Services</CardTitle>
                  <CardDescription>Manage barbershop services, pricing, and availability.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingServices ? (
                    <div className="flex justify-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
                      </div>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No services found. Add your first service to get started.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {services.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell className="font-medium">{service.name}</TableCell>
                              <TableCell>{service.description}</TableCell>
                              <TableCell>${service.price.toFixed(2)}</TableCell>
                              <TableCell>{service.duration} min</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {service.active ? 'Active' : 'Inactive'}
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
                                    <DropdownMenuItem onClick={() => handleEditService(service)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedService(service);
                                        setIsDeleteServiceDialogOpen(true);
                                      }}
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Barbers Tab */}
          {activeTab === "barbers" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Barbers Management</h1>
                <Button onClick={handleAddNewBarber}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Barber
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>All Barbers</CardTitle>
                  <CardDescription>Manage barber accounts and their information.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBarbers ? (
                    <div className="flex justify-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
                      </div>
                    </div>
                  ) : barbers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No barbers found. Add your first barber to get started.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {barbers.map((barber) => (
                            <TableRow key={barber.id}>
                              <TableCell className="font-medium">{barber.name}</TableCell>
                              <TableCell>{barber.email}</TableCell>
                              <TableCell>{barber.specialty || '-'}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditBarber(barber)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedBarber(barber);
                                        setIsDeleteBarberDialogOpen(true);
                                      }}
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Bookings Management</h1>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date-filter" className="block text-sm font-medium mb-1">
                    Filter by Date
                  </label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="barber-filter" className="block text-sm font-medium mb-1">
                    Filter by Barber
                  </label>
                  <select
                    id="barber-filter"
                    value={barberFilter}
                    onChange={(e) => setBarberFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">All Barbers</option>
                    {barbers.map((barber) => (
                      <option key={barber.id} value={barber.id}>
                        {barber.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="service-filter" className="block text-sm font-medium mb-1">
                    Filter by Service
                  </label>
                  <select
                    id="service-filter"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">All Services</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>View and manage customer bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBookings ? (
                    <div className="flex justify-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
                      </div>
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No bookings match your search criteria.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Barber</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{booking.customer_name}</p>
                                  <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p>{new Date(booking.date).toLocaleDateString()}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{booking.service.name}</TableCell>
                              <TableCell>{booking.barber.name}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs 
                                    ${booking.status === 'confirmed' && 'bg-blue-100 text-blue-800'}
                                    ${booking.status === 'completed' && 'bg-green-100 text-green-800'}
                                    ${booking.status === 'cancelled' && 'bg-red-100 text-red-800'}
                                  `}
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
                                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                      disabled={booking.status === 'confirmed'}
                                    >
                                      Confirm
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                                      disabled={booking.status === 'completed'}
                                    >
                                      Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                      disabled={booking.status === 'cancelled'}
                                      className="text-red-600"
                                    >
                                      Cancel
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold">My Profile</h1>
              {userId && <ProfileSettings userId={userId} userRole="superadmin" />}
            </div>
          )}
        </main>
      </div>
      
      {/* Service Dialog */}
      <Dialog
        open={isServiceDialogOpen}
        onOpenChange={setIsServiceDialogOpen}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {selectedService 
                ? 'Update the service details below.'
                : 'Fill out the service details below.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
              <FormField
                control={serviceForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Classic Haircut" {...field} />
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
                      <Textarea 
                        placeholder="Enter a brief description of the service"
                        {...field}
                        value={field.value || ''}
                      />
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
                        <Input type="number" step="0.01" {...field} />
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
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="m-0">Active</FormLabel>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsServiceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedService ? 'Save Changes' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Barber Dialog */}
      <Dialog
        open={isBarberDialogOpen}
        onOpenChange={setIsBarberDialogOpen}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedBarber ? 'Edit Barber' : 'Add New Barber'}</DialogTitle>
            <DialogDescription>
              {selectedBarber 
                ? 'Update the barber details below.'
                : 'Fill out the barber details below to create an account.'}
            </DialogDescription>
          </DialogHeader>
          {selectedBarber ? (
            <Form {...barberEditForm}>
              <form onSubmit={barberEditForm.handleSubmit(onBarberEditSubmit)} className="space-y-4">
                <FormField
                  control={barberEditForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                        <Input type="email" placeholder="john@example.com" {...field} />
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
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Classic Cuts, Beard Styling" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsBarberDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <Form {...barberForm}>
              <form onSubmit={barberForm.handleSubmit(onBarberSubmit)} className="space-y-4">
                <FormField
                  control={barberForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                        <Input type="email" placeholder="john@example.com" {...field} />
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
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Classic Cuts, Beard Styling" {...field} />
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
                      <FormLabel>Initial Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        The barber will be able to change this after logging in.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsBarberDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Barber Account
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Service Confirmation */}
      <AlertDialog
        open={isDeleteServiceDialogOpen}
        onOpenChange={setIsDeleteServiceDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedService && deleteServiceMutation.mutate(selectedService.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Barber Confirmation */}
      <AlertDialog
        open={isDeleteBarberDialogOpen}
        onOpenChange={setIsDeleteBarberDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Barber Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for "{selectedBarber?.name}"? This action cannot be undone. All associated data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedBarber && deleteBarberMutation.mutate(selectedBarber.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
