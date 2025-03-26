
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
import BarberStats from '@/components/BarberStats';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

// Mock data - in a real app, this would come from Supabase filtered by barber ID
const mockAppointments: Appointment[] = [
  {
    id: 1,
    customerName: "James Wilson",
    service: "Premium Experience",
    date: "2023-06-01",
    time: "10:00 AM",
    status: "upcoming"
  },
  {
    id: 2,
    customerName: "Sarah Johnson",
    service: "Hair Coloring",
    date: "2023-06-02",
    time: "9:00 AM",
    status: "upcoming"
  },
  {
    id: 3,
    customerName: "Michael Scott",
    service: "Beard Grooming",
    date: "2023-06-01",
    time: "2:00 PM",
    status: "upcoming"
  },
  {
    id: 4,
    customerName: "David Kim",
    service: "Classic Cut",
    date: "2023-05-30",
    time: "3:00 PM",
    status: "completed"
  },
  {
    id: 5,
    customerName: "Jennifer Lee",
    service: "Premium Experience",
    date: "2023-05-30",
    time: "4:30 PM",
    status: "completed"
  },
  {
    id: 6,
    customerName: "Alex Thompson",
    service: "Beard Grooming",
    date: "2023-05-30",
    time: "5:00 PM",
    status: "cancelled"
  },
];

const BarberDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  });
  
  useEffect(() => {
    // In a real app, fetch data from Supabase
  }, []);
  
  const filteredAppointments = appointments.filter(appointment => 
    appointment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.service.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleLogout = () => {
    // In a real app, sign out with Supabase
    toast.success("Logged out successfully");
    navigate("/login");
  };
  
  const handleMarkAsCompleted = (id: number) => {
    // In a real app, update in Supabase
    setAppointments(appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status: 'completed' as const } : appointment
    ));
    
    toast.success(`Appointment #${id} marked as completed`);
  };
  
  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setAvailability(prev => ({ ...prev, [day]: checked }));
    toast.success(`Availability for ${day} updated`);
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
            <p className="text-sm text-muted-foreground">Welcome, John Smith</p>
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
              
              <BarberStats barberId={1} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 flex flex-col space-y-6">
                    <h3 className="text-lg font-semibold">Today's Appointments</h3>
                    <div className="space-y-4">
                      {appointments
                        .filter(appointment => appointment.status === 'upcoming')
                        .slice(0, 3)
                        .map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div>
                              <p className="font-medium">{appointment.customerName}</p>
                              <p className="text-sm text-muted-foreground">{appointment.service}</p>
                            </div>
                            <span className="text-sm font-medium">{appointment.time}</span>
                          </div>
                        ))}
                      
                      {appointments.filter(appointment => appointment.status === 'upcoming').length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No appointments today.</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 flex flex-col space-y-6">
                    <h3 className="text-lg font-semibold">Weekly Schedule</h3>
                    <div className="space-y-3">
                      {Object.entries(availability).map(([day, isAvailable]) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="capitalize">{day}</span>
                          <span className={isAvailable ? "text-green-600" : "text-red-500"}>
                            {isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
              
              <div className="bg-white dark:bg-slate-950 rounded-lg border mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
                  <div className="space-y-4">
                    {filteredAppointments
                      .filter(appointment => appointment.status === 'upcoming')
                      .map((appointment) => (
                        <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="mb-2 sm:mb-0">
                            <p className="font-medium">{appointment.customerName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.service}</p>
                          </div>
                          <div className="flex flex-col sm:items-end">
                            <p className="text-sm font-medium">{appointment.date}, {appointment.time}</p>
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
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {filteredAppointments.filter(appointment => appointment.status === 'upcoming').length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No upcoming appointments found.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-950 rounded-lg border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Appointment History</h3>
                  <div className="space-y-4">
                    {filteredAppointments
                      .filter(appointment => appointment.status !== 'upcoming')
                      .map((appointment) => (
                        <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="mb-2 sm:mb-0">
                            <p className="font-medium">{appointment.customerName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.service}</p>
                          </div>
                          <div className="flex flex-col sm:items-end">
                            <p className="text-sm font-medium">{appointment.date}, {appointment.time}</p>
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
                    
                    {filteredAppointments.filter(appointment => appointment.status !== 'upcoming').length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No appointment history found.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Availability Tab */}
            <TabsContent value="availability">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Set Your Availability</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-950 rounded-lg border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Weekly Schedule</h3>
                  
                  <div className="space-y-6">
                    {Object.entries(availability).map(([day, isAvailable]) => (
                      <div key={day} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium capitalize">{day}</p>
                          <p className="text-sm text-muted-foreground">9:00 AM - 7:00 PM</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`availability-${day}`}
                            checked={isAvailable}
                            onCheckedChange={(checked) => handleAvailabilityChange(day, checked)}
                          />
                          <Label htmlFor={`availability-${day}`}>
                            {isAvailable ? (
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
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      onClick={() => toast.success("Availability settings saved")}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-950 rounded-lg border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="John Smith" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="john@thejohnnys.com" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue="(555) 123-4567" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input id="specialty" defaultValue="Classic Cuts" />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={() => toast.success("Profile updated successfully")}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-950 rounded-lg border mt-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Change Password</h3>
                  
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
                      <Button onClick={() => toast.success("Password updated successfully")}>
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default BarberDashboard;
