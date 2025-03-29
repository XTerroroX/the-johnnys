
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  LayoutDashboard, 
  LogOut, 
  User,
  Settings,
  X,
  Clock,
  MoreHorizontal,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import BarberStats from '@/components/BarberStats';
import BarberNotifications from '@/components/BarberNotifications';
import ProfileSettings from '@/components/ProfileSettings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';

const BarberDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
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
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (error || !profile || (profile.role !== 'barber' && profile.role !== 'superadmin')) {
        toast.error("You don't have permission to access the barber dashboard");
        navigate("/");
      } else {
        setUserId(session.user.id);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const { 
    data: upcomingBookings = [], 
    isLoading: isLoadingBookings 
  } = useQuery({
    queryKey: ['barberBookings', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:service_id (id, name, price, duration)
        `)
        .eq('barber_id', userId)
        .gte('date', formattedDate)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId
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
      queryClient.invalidateQueries({ queryKey: ['barberBookings'] });
      toast.success("Booking status updated");
    },
    onError: (error) => {
      toast.error(`Error updating booking status: ${error.message}`);
    }
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
            <div className="px-4 mb-6">
              <BarberNotifications barberId={userId} />
            </div>
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
                variant={activeTab === "appointments" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("appointments")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Appointments
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
                <h2 className="text-xl font-bold">Barber Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-4">
                <div className="mb-6">
                  <BarberNotifications barberId={userId} />
                </div>
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
                  variant={activeTab === "appointments" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("appointments");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Appointments
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
                <h1 className="text-2xl font-bold">Barber Dashboard</h1>
              </div>
              
              <BarberStats barberId={userId} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your next scheduled appointments</CardDescription>
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
                  ) : upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingBookings.slice(0, 5).map((booking: any) => (
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
                              <TableCell>{booking.service?.name || 'N/A'}</TableCell>
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
                                    <DropdownMenuItem
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                                      disabled={booking.status === 'completed' || booking.status === 'cancelled'}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Mark Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                      disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                                      className="text-red-600"
                                    >
                                      <X className="mr-2 h-4 w-4" />
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
          
          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Your Appointments</h1>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>Manage your scheduled appointments</CardDescription>
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
                  ) : upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No appointments scheduled.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingBookings.map((booking: any) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{booking.customer_name}</p>
                                  <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                                  {booking.customer_phone && (
                                    <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                                  )}
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
                              <TableCell>
                                <div>
                                  <p>{booking.service?.name || 'N/A'}</p>
                                  {booking.service?.price && (
                                    <p className="text-sm text-muted-foreground">
                                      ${parseFloat(booking.service.price).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
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
                                    <DropdownMenuItem
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                                      disabled={booking.status === 'completed' || booking.status === 'cancelled'}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Mark Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                      disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                                      className="text-red-600"
                                    >
                                      <X className="mr-2 h-4 w-4" />
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
              {userId && <ProfileSettings userId={userId} userRole="barber" />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BarberDashboard;
