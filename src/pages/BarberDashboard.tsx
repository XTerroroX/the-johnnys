
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
  
  // Check if user is authenticated and has barber role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access the barber dashboard");
        navigate("/login");
        return;
      }
      
      // Fetch barber profile
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
      
      if (profile.role !== 'barber') {
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
  
  // Fetch barber's appointments
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
  
  // Fetch barber's availability
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
  
  // Update availability mutation
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
  
  // Update appointment status mutation
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'confirmed' | 'completed' | 'cancelled' }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('barber_id', barberProfile?.id) // Security check: ensure barber can only update their own appointments
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
  
  // Filtering appointments
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
  
  // Format time for display (from HH:MM:SS to HH:MM AM/PM)
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // Extract hours and minutes from the time string
    const [hours, minutes] = timeString.split(':').map(Number);
    // Format with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Handle time input changes
  const handleTimeChange = (availabilityId: number, field: 'start_time' | 'end_time', value: string) => {
    // Add seconds to make it compatible with Postgres time format
    const formattedTime = value + ':00';
    updateAvailabilityMutation.mutate({ 
      id: availabilityId, 
      is_available: true, // If changing time, assume day is available
      [field]: formattedTime 
    });
  };
  
  // Handle availability toggle
  const handleAvailabilityChange = (id: number, checked: boolean) => {
    updateAvailabilityMutation.mutate({ id, is_available: checked });
  };
  
  // Handle marking appointment as completed
  const handleMarkAsCompleted = (id: number) => {
    updateAppointmentStatusMutation.mutate({ id, status: 'completed' });
  };
  
  // Handle appointment cancellation
  const handleCancelAppointment = (id: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      updateAppointmentStatusMutation.mutate({ id, status: 'cancelled' });
    }
  };
  
  // Logout handler
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
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-slate-950 border-b p-4 flex justify-between items-center">
        <h1 className="font-display font-bold text-xl">Barber Dashboard</h1>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <ChevronDown />}
        </Button>
      </header>
      
      {/* Mobile Menu */}
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
        {/* Sidebar - Desktop */}
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
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab */}
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
            
            {/* Appointments Tab */}
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
            
            {/* Availability Tab */}
            <TabsContent value="availability">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Set Your Availability</h2>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    Set the days and times when you are available for appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAvailability ? (
                    <p className="text-center text-muted-foreground py-4">Loading your availability settings...</p>
                  ) : (
                    <div className="space-y-6">
                      {availability.map((day) => (
                        <div key={day.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="mb-4 sm:mb-0">
                            <p className="font-medium capitalize">{dayOfWeekNames[day.day_of_week]}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`availability-${day.id}`}
                                checked={day.is_available}
                                onCheckedChange={(checked) => handleAvailabilityChange(day.id, checked)}
                              />
                              <Label htmlFor={`availability-${day.id}`}>
                                {day.is_available ? (
                                  <span className="text-green-600 dark:text-green-400 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Available
                                  </span>
                                ) : (
                                  <span className="text-red-500 dark:text-red-400 flex items-center">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Unavailable
                                  </span>
                                )}
                              </Label>
                            </div>
                            
                            {day.is_available && (
                              <div className="flex items-center gap-2">
                                <div>
                                  <Label htmlFor={`start-time-${day.id}`} className="text-sm">Start</Label>
                                  <Input
                                    id={`start-time-${day.id}`}
                                    type="time"
                                    value={day.start_time.substring(0, 5)}
                                    onChange={(e) => handleTimeChange(day.id, 'start_time', e.target.value)}
                                    className="w-32"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`end-time-${day.id}`} className="text-sm">End</Label>
                                  <Input
                                    id={`end-time-${day.id}`}
                                    type="time"
                                    value={day.end_time.substring(0, 5)}
                                    onChange={(e) => handleTimeChange(day.id, 'end_time', e.target.value)}
                                    className="w-32"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Settings Tab */}
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
                    <div className="space-y-4">
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={() => toast.success("This feature will be available soon")}>
                        Update Password
                      </Button>
                    </div>
                  </div>
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
