import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Clock,
  Search,
  X,
  ChevronDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import BarberStats from '@/components/BarberStats';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import changePassword from '@/components/changePassword';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Availability {
  id: number;
  barber_id: string;
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
}

interface Appointment {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service: {
    id: number;
    name: string;
    price: number;
  };
  service_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
}

const dayOfWeekNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const BarberDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [barberProfile, setBarberProfile] = useState<any>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access the barber dashboard");
        navigate("/login");
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        toast.error("Error fetching profile: " + error.message);
        navigate("/login");
        return;
      }
      
      // Allow superadmins to access this dashboard too.
      if (profile.role !== 'barber' && profile.role !== 'superadmin') {
        toast.error("You don't have permission to access the barber dashboard");
        if (profile.role === 'superadmin') {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
        return;
      }
      
      setBarberProfile(profile);
    };
    
    checkAuth();
  }, [navigate]);
  
  const { 
    data: appointments = [], 
    isLoading: isLoadingAppointments 
  } = useQuery({
    queryKey: ['barber-appointments', barberProfile?.id],
    queryFn: async () => {
      if (!barberProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:service_id (id, name, price, duration)
        `)
        .eq('barber_id', barberProfile.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!barberProfile?.id
  });
  
  const { 
    data: availability = [], 
    isLoading: isLoadingAvailability 
  } = useQuery({
    queryKey: ['barber-availability', barberProfile?.id],
    queryFn: async () => {
      if (!barberProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('barber_availability')
        .select('*')
        .eq('barber_id', barberProfile.id)
        .order('day_of_week');
        
      if (error) throw error;
      return data as Availability[];
    },
    enabled: !!barberProfile?.id
  });
  
  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, is_available, start_time, end_time }: { id: number, is_available: boolean, start_time?: string, end_time?: string }) => {
      const updateData: any = { 
        is_available,
        updated_at: new Date().toISOString()
      };
      
      if (start_time) updateData.start_time = start_time;
      if (end_time) updateData.end_time = end_time;
      
      const { data, error } = await supabase
        .from('barber_availability')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-availability', barberProfile?.id] });
      toast.success("Availability updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating availability: ${error.message}`);
    }
  });
  
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'confirmed' | 'completed' | 'cancelled' }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('barber_id', barberProfile?.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-appointments', barberProfile?.id] });
      toast.success("Appointment status updated");
    },
    onError: (error) => {
      toast.error(`Error updating appointment: ${error.message}`);
    }
  });
  
  const filteredAppointments = appointments.filter(appointment => 
    appointment.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const upcomingAppointments = filteredAppointments.filter(
    appointment => appointment.status === 'confirmed'
  );
  
  const pastAppointments = filteredAppointments.filter(
    appointment => appointment.status === 'completed' || appointment.status === 'cancelled'
  );
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  const handleTimeChange = (availabilityId: number, field: 'start_time' | 'end_time', value: string) => {
    const formattedTime = value + ':00';
    updateAvailabilityMutation.mutate({ 
      id: availabilityId, 
      is_available: true,
      [field]: formattedTime 
    });
  };
  
  const handleAvailabilityChange = (id: number, checked: boolean) => {
    updateAvailabilityMutation.mutate({ id, is_available: checked });
  };
  
  const handleMarkAsCompleted = (id: number) => {
    updateAppointmentStatusMutation.mutate({ id, status: 'completed' });
  };
  
  const handleCancelAppointment = (id: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      updateAppointmentStatusMutation.mutate({ id, status: 'cancelled' });
    }
  };
  
  const handleProfileImageUpdated = (newImageUrl: string) => {
    setBarberProfile({
      ...barberProfile,
      image_url: newImageUrl
    });
    
    queryClient.invalidateQueries({ queryKey: ['barber-profile'] });
    toast.success('Profile image updated successfully');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-slate-950 border-b p-4 flex justify-between items-center">
        <h1 className="font-display font-bold text-xl">Barber Dashboard</h1>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <ChevronDown />}
        </Button>
      </header>
      
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-950 border-b p-4 animate-fade-in">
          <nav className="space-y-2">
            {[
              { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", value: "dashboard" },
              { icon: <Calendar className="h-5 w-5" />, label: "Appointments", value: "appointments" },
              { icon: <Clock className="h-5 w-5" />, label: "Availability", value: "availability" },
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
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="hidden lg:flex flex-col w-64 border-r bg-white dark:bg-slate-950 p-4">
          <div className="text-center p-4 border-b mb-6">
            <h1 className="font-display font-bold text-xl">Barber Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {barberProfile?.name || 'Barber'}</p>
          </div>
          
          <nav className="space-y-2 flex-1">
            {[
              { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", value: "dashboard" },
              { icon: <Calendar className="h-5 w-5" />, label: "Appointments", value: "appointments" },
              { icon: <Clock className="h-5 w-5" />, label: "Availability", value: "availability" },
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
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Your Dashboard</h2>
              </div>
              
              {barberProfile && <BarberStats barberId={barberProfile.id} />}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Appointments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingAppointments ? (
                      <p className="text-center text-muted-foreground py-4">Loading appointments...</p>
                    ) : (
                      <>
                        {appointments
                          .filter(appointment => 
                            appointment.status === 'confirmed' && 
                            appointment.date === format(new Date(), 'yyyy-MM-dd')
                          )
                          .map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                              <div>
                                <p className="font-medium">{appointment.customer_name}</p>
                                <p className="text-sm text-muted-foreground">{appointment.service.name}</p>
                              </div>
                              <span className="text-sm font-medium">{formatTime(appointment.start_time)}</span>
                            </div>
                          ))}
                        
                        {appointments.filter(appointment => 
                          appointment.status === 'confirmed' && 
                          appointment.date === format(new Date(), 'yyyy-MM-dd')
                        ).length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No appointments today.</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoadingAvailability ? (
                      <p className="text-center text-muted-foreground py-4">Loading availability...</p>
                    ) : (
                      <>
                        {availability.map((day) => (
                          <div key={day.id} className="flex items-center justify-between">
                            <span className="capitalize">{dayOfWeekNames[day.day_of_week]}</span>
                            <span className={day.is_available ? "text-green-600" : "text-red-500"}>
                              {day.is_available ? (
                                <span>
                                  {formatTime(day.start_time)} - {formatTime(day.end_time)}
                                </span>
                              ) : (
                                "Unavailable"
                              )}
                            </span>
                          </div>
                        ))}
                        
                        {availability.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No availability set.</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="appointments">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Your Appointments</h2>
                <div className="w-full sm:w-auto relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search appointments..."
                    className="pl-10 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAppointments ? (
                    <p className="text-center text-muted-foreground py-4">Loading appointments...</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="mb-2 sm:mb-0">
                            <p className="font-medium">{appointment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{appointment.service.name}</p>
                          </div>
                          <div className="flex flex-col sm:items-end">
                            <p className="text-sm font-medium">
                              {format(new Date(appointment.date), 'MMMM d, yyyy')}, {formatTime(appointment.start_time)}
                            </p>
                            <div className="flex mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="mr-2"
                                onClick={() => handleMarkAsCompleted(appointment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Completed
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {upcomingAppointments.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No upcoming appointments found.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Appointment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAppointments ? (
                    <p className="text-center text-muted-foreground py-4">Loading appointment history...</p>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="mb-2 sm:mb-0">
                            <p className="font-medium">{appointment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{appointment.service.name}</p>
                          </div>
                          <div className="flex flex-col sm:items-end">
                            <p className="text-sm font-medium">
                              {format(new Date(appointment.date), 'MMMM d, yyyy')}, {formatTime(appointment.start_time)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block
                              ${appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {pastAppointments.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No appointment history found.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {barberProfile ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center mb-6">
                        <ProfileImageUpload
                          userId={barberProfile.id}
                          currentImageUrl={barberProfile.image_url}
                          userName={barberProfile.name}
                          onImageUpdated={handleProfileImageUpdated}
                          size="lg"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={barberProfile.name} readOnly />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" value={barberProfile.email} readOnly />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="specialty">Specialty</Label>
                          <Input id="specialty" value={barberProfile.specialty || 'Not specified'} readOnly />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="joined">Member Since</Label>
                          <Input 
                            id="joined" 
                            value={format(new Date(barberProfile.created_at), 'MMMM d, yyyy')} 
                            readOnly 
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <p className="text-sm text-muted-foreground">
                          To update your profile information, please contact an administrator.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Loading profile information...</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <changePassword />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default BarberDashboard;
