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
  barberId: string; // assuming barberId is a UUID string
}

const BarberStats = ({ barberId }: BarberStatsProps) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const now = new Date();

        // For monthly stats: from the first day to the last day of the current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        // Fetch monthly bookings for the given barber.
        // Join the services table to get the service price and duration.
        const { data: monthlyBookings, error: monthlyError } = await supabase
          .from('bookings')
          .select(`customer_email, start_time, end_time, services(price,duration)`)
          .eq('barber_id', barberId)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth);

        if (monthlyError) {
          console.error('Error fetching monthly bookings:', monthlyError);
          setLoading(false);
          return;
        }

        // Use an empty array if no bookings are returned
        const bookings = monthlyBookings || [];

        let totalRevenue = 0;
        const clientSet = new Set<string>();
        let totalServiceTime = 0;
        let serviceCount = 0;

        bookings.forEach((booking: any) => {
          // Sum up the revenue using the price from the joined services record
          if (booking.services && booking.services.price) {
            totalRevenue += parseFloat(booking.services.price);
          }
          // Count unique clients
          if (booking.customer_email) {
            clientSet.add(booking.customer_email);
          }
          // Sum service durations using the duration from the services table.
          // We assume duration is stored as an integer (minutes)
          if (booking.services && booking.services.duration) {
            totalServiceTime += parseInt(booking.services.duration, 10);
            serviceCount++;
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
            description: 'Total cost from appointments this month',
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
            value: appointmentsCount.toString(),
            description: 'Upcoming in the next week',
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
        // Fallback: Render stat boxes with zeros if an error occurs.
        setStats([
          {
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
            title: 'Your Earnings',
            value: '$0.00',
            description: 'Total cost from appointments this month',
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
            description: 'Upcoming in the next week',
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
    };

    fetchStats();
  }, [barberId]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {loading ? (
        <div>Loading stats...</div>
      ) : (
        stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        ))
      )}
    </div>
  );
};

export default BarberStats;
