// src/components/BarberStats.tsx
import { useEffect, useState } from 'react';
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
  barberId: string; // Make sure this is the correct type (e.g. UUID as string)
}

const BarberStats = ({ barberId }: BarberStatsProps) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Get current date/time info
        const now = new Date();
        // For monthly stats (earnings, clients, avg. service time)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
        // For upcoming appointments, use the next 7 days
        const nowISOString = now.toISOString();
        const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch bookings for the current month for earnings, clients and avg service time
        const { data: monthlyBookings, error: monthlyError } = await supabase
          .from('bookings')
          .select('customer_email, cost, start_time, end_time')
          .eq('barber_id', barberId)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth);

        if (monthlyError) {
          console.error('Error fetching monthly bookings:', monthlyError);
          setLoading(false);
          return;
        }

        let totalRevenue = 0;
        const clientSet = new Set<string>();
        let totalServiceTime = 0;
        let serviceCount = 0;

        monthlyBookings.forEach((booking: any) => {
          if (booking.cost) {
            totalRevenue += parseFloat(booking.cost);
          }
          if (booking.customer_email) {
            clientSet.add(booking.customer_email);
          }
          if (booking.start_time && booking.end_time) {
            // Parse times (assuming format "HH:MM:SS")
            const [startH, startM, startS] = booking.start_time.split(':').map(Number);
            const [endH, endM, endS] = booking.end_time.split(':').map(Number);
            const startTotal = startH * 60 + startM + startS / 60;
            const endTotal = endH * 60 + endM + endS / 60;
            const duration = endTotal - startTotal;
            if (duration > 0) {
              totalServiceTime += duration;
              serviceCount++;
            }
          }
        });

        const avgServiceTime = serviceCount > 0 ? (totalServiceTime / serviceCount).toFixed(1) : '0';
        const earningsFormatted = `$${totalRevenue.toFixed(2)}`;
        const clientsServed = clientSet.size;

        // Fetch upcoming appointments for the next week
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

        // Build live stats array
        const newStats = [
          {
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
            title: 'Your Earnings',
            value: earningsFormatted,
            description: 'This month',
          },
          {
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            title: 'Clients Served',
            value: clientsServed.toString(),
            description: 'This month',
          },
          {
            icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
            title: 'Appointments',
            value: appointmentsCount.toString(),
            description: 'Upcoming this week',
          },
          {
            icon: <Timer className="h-4 w-4 text-muted-foreground" />,
            title: 'Avg. Service Time',
            value: `${avgServiceTime} min`,
            description: 'Average service duration',
          },
        ];

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching barber stats:', error);
      }
      setLoading(false);
    };

    fetchStats();
  }, [barberId]);

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
