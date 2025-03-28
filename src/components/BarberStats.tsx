// src/components/BarberStats.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Timer, Users } from 'lucide-react';

const StatCard = ({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface BarberStatsProps {
  barberId: string; // Assuming barberId is a UUID string
}

const BarberStats = ({ barberId }: BarberStatsProps) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch stats from Supabase
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // Fetch monthly bookings for this barber with joined services data (price & duration)
      const { data: monthlyBookings, error: monthlyError } = await supabase
        .from('bookings')
        .select(`customer_email, start_time, end_time, services(price,duration)`)
        .eq('barber_id', barberId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      if (monthlyError) {
        console.error('Error fetching monthly bookings:', monthlyError);
      }
      const bookings = monthlyBookings || [];

      let totalRevenue = 0;
      const clientSet = new Set<string>();
      let totalServiceTime = 0;
      let serviceCount = 0;

      bookings.forEach((booking: any) => {
        // Sum revenue from the joined services.price (if available)
        const price = booking?.services?.price ? parseFloat(booking.services.price) : 0;
        totalRevenue += price;
        if (booking.customer_email) {
          clientSet.add(booking.customer_email);
        }
        // Use joined services.duration if available; else calculate from start_time/end_time
        if (booking?.services?.duration) {
          totalServiceTime += parseInt(booking.services.duration, 10);
          serviceCount++;
        } else if (booking.start_time && booking.end_time) {
          const parseTime = (timeStr: string) => {
            const parts = timeStr.split(':').map(Number);
            return parts[0] * 60 + parts[1] + (parts[2] ? parts[2] / 60 : 0);
          };
          const startMinutes = parseTime(booking.start_time);
          const endMinutes = parseTime(booking.end_time);
          const duration = endMinutes - startMinutes;
          if (duration > 0) {
            totalServiceTime += duration;
            serviceCount++;
          }
        }
      });

      const avgServiceTime = serviceCount > 0 ? (totalServiceTime / serviceCount).toFixed(1) : '0';
      const earningsFormatted = `$${totalRevenue.toFixed(2)}`;
      const clientsServed = clientSet.size;

      // Fetch upcoming appointments for the next 7 days
      const nowISOString = now.toISOString();
      const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: upcomingBookings, error: upcomingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('barber_id', barberId)
        .gte('date', nowISOString)
        .lte('date', endOfWeek);

      if (upcomingError) {
        console.error('Error fetching upcoming bookings:', upcomingError);
      }
      const appointmentsCount = upcomingBookings ? upcomingBookings.length : 0;

      // Build the stats array
      const newStats = [
        {
          icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
          title: 'Your Earnings',
          value: earningsFormatted,
          description: 'Total earnings this month',
        },
        {
          icon: <Users className="h-4 w-4 text-muted-foreground" />,
          title: 'Clients Served',
          value: clientsServed.toString(),
          description: 'Unique clients this month',
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          title: 'Appointments',
          value: bookings.length.toString(),
          description: 'This month',
        },
        {
          icon: <Timer className="h-4 w-4 text-muted-foreground" />,
          title: 'Avg. Service Time',
          value: `${avgServiceTime} min`,
          description: 'Average duration of services',
        },
      ];

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching barber stats:', error);
      setStats([
        {
          icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
          title: 'Your Earnings',
          value: '$0.00',
          description: 'Total earnings this month',
        },
        {
          icon: <Users className="h-4 w-4 text-muted-foreground" />,
          title: 'Clients Served',
          value: '0',
          description: 'Unique clients this month',
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          title: 'Appointments',
          value: '0',
          description: 'This month',
        },
        {
          icon: <Timer className="h-4 w-4 text-muted-foreground" />,
          title: 'Avg. Service Time',
          value: '0 min',
          description: 'Average duration of services',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [barberId]);

  // Set up real-time subscription using supabase.channel (v2 API)
  useEffect(() => {
    if (!barberId) return;
    // Initial fetch of stats
    fetchStats();

    // Create a new realtime channel for bookings for this barber
    const channel = supabase
      .channel('bookings-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `barber_id=eq.${barberId}`,
        },
        (payload) => {
          console.log('New booking inserted, updating stats...', payload);
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `barber_id=eq.${barberId}`,
        },
        (payload) => {
          console.log('Booking updated, updating stats...', payload);
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [barberId, fetchStats]);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          description={stat.description}
        />
      ))}
    </div>
  );
};

export default BarberStats;
