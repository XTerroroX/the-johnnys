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
  MoreHorizontal
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

interface Booking {
  id: number;
  customerName: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}

// Mock data - in a real app, this would come from Supabase
const mockBookings: Booking[] = [
  {
    id: 1,
    customerName: "James Wilson",
    service: "Premium Experience",
    barber: "John Smith",
    date: "2023-06-01",
    time: "10:00 AM",
    status: "confirmed"
  },
  {
    id: 2,
    customerName: "Robert Chen",
    service: "Classic Cut",
    barber: "David Johnson",
    date: "2023-06-01",
    time: "11:30 AM",
    status: "confirmed"
  },
  {
    id: 3,
    customerName: "Michael Scott",
    service: "Beard Grooming",
    barber: "Michael Williams",
    date: "2023-06-01",
    time: "2:00 PM",
    status: "confirmed"
  },
  {
    id: 4,
    customerName: "Sarah Johnson",
    service: "Hair Coloring",
    barber: "John Smith",
    date: "2023-06-02",
    time: "9:00 AM",
    status: "confirmed"
  },
  {
    id: 5,
    customerName: "Emma Davis",
    service: "Skin Fade",
    barber: "David Johnson",
    date: "2023-06-02",
    time: "10:00 AM",
    status: "confirmed"
  },
  {
    id: 6,
    customerName: "Carlos Rodriguez",
    service: "Hot Towel Shave",
    barber: "Michael Williams",
    date: "2023-06-02",
    time: "1:00 PM",
    status: "confirmed"
  },
  {
    id: 7,
    customerName: "David Kim",
    service: "Classic Cut",
    barber: "John Smith",
    date: "2023-05-30",
    time: "3:00 PM",
    status: "completed"
  },
  {
    id: 8,
    customerName: "Jennifer Lee",
    service: "Premium Experience",
    barber: "David Johnson",
    date: "2023-05-30",
    time: "4:30 PM",
    status: "completed"
  },
  {
    id: 9,
    customerName: "Alex Thompson",
    service: "Beard Grooming",
    barber: "Michael Williams",
    date: "2023-05-30",
    time: "5:00 PM",
    status: "cancelled"
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // In a real app, fetch data from Supabase
  }, []);
  
  const filteredBookings = bookings.filter(booking => 
    booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.barber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleLogout = () => {
    // In a real app, sign out with Supabase
    toast.success("Logged out successfully");
    navigate("/login");
  };
  
  const handleUpdateStatus = (id: number, status: 'confirmed' | 'completed' | 'cancelled') => {
    // In a real app, update in Supabase
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    ));
    
    toast.success(`Booking #${id} status updated to ${status}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-slate-950 border-b p-4 flex justify-between items-center">
        <h1 className="font-display font-bold text-xl">Admin Dashboard</h1>
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
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar - Desktop */}
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
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="barbers">Barbers</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              </div>
              
              <AdminStats />
              
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex flex-col space-y-6">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <div className="space-y-4">
                    {mockBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">Booked {booking.service} with {booking.barber}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{booking.date}, {booking.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Bookings Tab */}
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
              
              <div className="rounded-lg border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium">Customer</th>
                        <th className="px-4 py-3 text-left font-medium">Service</th>
                        <th className="px-4 py-3 text-left font-medium">Barber</th>
                        <th className="px-4 py-3 text-left font-medium">Date & Time</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border-b last:border-0">
                          <td className="px-4 py-3">{booking.customerName}</td>
                          <td className="px-4 py-3">{booking.service}</td>
                          <td className="px-4 py-3">{booking.barber}</td>
                          <td className="px-4 py-3">{booking.date}, {booking.time}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                              ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'confirmed')}>
                                  Mark as Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'completed')}>
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'cancelled')}>
                                  Cancel Booking
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                      
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                            No bookings found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            {/* Other Tabs */}
            <TabsContent value="services">
              <div className="p-8 text-center bg-white dark:bg-slate-950 rounded-lg border">
                <ListChecks className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Manage Services</h3>
                <p className="text-muted-foreground mb-4">
                  Add, edit, and manage the services offered at your barber shop.
                </p>
                <p className="text-sm text-muted-foreground">
                  This interface would be connected to the Supabase backend to manage services.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="barbers">
              <div className="p-8 text-center bg-white dark:bg-slate-950 rounded-lg border">
                <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Manage Barbers</h3>
                <p className="text-muted-foreground mb-4">
                  Add, edit, and manage your barber staff and their schedules.
                </p>
                <p className="text-sm text-muted-foreground">
                  This interface would be connected to the Supabase backend to manage barber accounts.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="p-8 text-center bg-white dark:bg-slate-950 rounded-lg border">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Admin Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Configure shop hours, notifications, and other system settings.
                </p>
                <p className="text-sm text-muted-foreground">
                  This interface would be connected to the Supabase backend to manage site configuration.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
