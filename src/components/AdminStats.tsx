
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarRange, DollarSign, Users, Scissors } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatsProps {
  period?: string;
}

const AdminStats: React.FC<StatsProps> = ({ period = 'month' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(period);
  
  // Calculate date range based on selected period
  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();
    
    if (selectedPeriod === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (selectedPeriod === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };
  
  const { start, end } = getDateRange();
  console.log('Date range for stats:', { start, end, selectedPeriod });
  
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['admin-bookings', start, end],
    queryFn: async () => {
      console.log('Fetching bookings for date range:', start, 'to', end);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:service_id (id, name, price),
          barber:barber_id (id, name, email)
        `)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }
      
      console.log('Fetched bookings:', data);
      return data;
    }
  });
  
  const { data: barbers = [], isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['admin-barbers'],
    queryFn: async () => {
      console.log('Fetching barbers...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['barber', 'superadmin']);
        
      if (error) {
        console.error('Error fetching barbers:', error);
        throw error;
      }
      
      console.log('Fetched barbers:', data);
      return data;
    }
  });
  
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      console.log('Fetching services...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true);
        
      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      console.log('Fetched services:', data);
      return data;
    }
  });
  
  // Process and calculate stats from bookings data
  const calculateStats = () => {
    console.log('Calculating stats with bookings:', bookings);
    
    // Only count confirmed and completed bookings for revenue
    const confirmedBookings = bookings.filter(booking => 
      booking.status === 'confirmed' || booking.status === 'completed'
    );
    console.log('Confirmed bookings:', confirmedBookings);
    
    const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');
    console.log('Cancelled bookings:', cancelledBookings);
    
    // Calculate total revenue considering multiple services per booking
    let totalRevenue = 0;
    confirmedBookings.forEach(booking => {
      console.log('Processing booking for revenue:', booking);
      
      // Check if booking has selected_services array for multiple services
      if (booking.selected_services && Array.isArray(booking.selected_services) && booking.selected_services.length > 0) {
        console.log('Booking has selected_services:', booking.selected_services);
        // Sum up prices from all selected services
        booking.selected_services.forEach((serviceItem: any) => {
          const price = parseFloat(String(serviceItem.price || '0'));
          console.log('Adding service price:', price);
          totalRevenue += price;
        });
      } else if (booking.service && booking.service.price) {
        console.log('Booking has single service:', booking.service);
        // Fallback to single service if selected_services is not available
        const price = parseFloat(String(booking.service.price || '0'));
        console.log('Adding single service price:', price);
        totalRevenue += price;
      }
    });
    
    const stats = {
      totalBookings: confirmedBookings.length,
      totalRevenue,
      cancelRate: bookings.length > 0 ? (cancelledBookings.length / bookings.length) * 100 : 0,
      bookingsPerBarber: barbers.length > 0 ? confirmedBookings.length / barbers.length : 0
    };
    
    console.log('Calculated stats:', stats);
    return stats;
  };
  
  const stats = calculateStats();
  
  const isLoading = isLoadingBookings || isLoadingBarbers || isLoadingServices;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs 
        defaultValue={selectedPeriod} 
        onValueChange={setSelectedPeriod}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <CardDescription>
            View summary statistics for your barbershop
          </CardDescription>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="week" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Bookings" 
              value={stats.totalBookings}
              description={`Past 7 days`}
              icon={<CalendarRange className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Revenue" 
              value={`$${stats.totalRevenue.toFixed(2)}`}
              description={`Past 7 days`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Active Barbers" 
              value={barbers.length}
              description={`${stats.bookingsPerBarber.toFixed(1)} bookings per barber`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Active Services" 
              value={services.length}
              description={`Cancellation rate: ${stats.cancelRate.toFixed(1)}%`}
              icon={<Scissors className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="month" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Bookings" 
              value={stats.totalBookings}
              description={`Past 30 days`}
              icon={<CalendarRange className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Revenue" 
              value={`$${stats.totalRevenue.toFixed(2)}`}
              description={`Past 30 days`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Active Barbers" 
              value={barbers.length}
              description={`${stats.bookingsPerBarber.toFixed(1)} bookings per barber`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Active Services" 
              value={services.length}
              description={`Cancellation rate: ${stats.cancelRate.toFixed(1)}%`}
              icon={<Scissors className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="year" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Bookings" 
              value={stats.totalBookings}
              description={`Past 365 days`}
              icon={<CalendarRange className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Revenue" 
              value={`$${stats.totalRevenue.toFixed(2)}`}
              description={`Past 365 days`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Active Barbers" 
              value={barbers.length}
              description={`${stats.bookingsPerBarber.toFixed(1)} bookings per barber`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard 
              title="Active Services" 
              value={services.length}
              description={`Cancellation rate: ${stats.cancelRate.toFixed(1)}%`}
              icon={<Scissors className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default AdminStats;
