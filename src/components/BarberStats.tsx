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
  barberId: string; // Ensure this matches your type (usually a UUID as string)
}

const BarberStats = ({ barberId }: BarberStatsProps) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Determine the current month for earnings, clients, and avg service time
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        // Fetch monthly bookings for the current barber
        const { data: monthlyBookings, error: monthlyError } = await supabase
          .from('bookings')
          .select('customer_email, cost, start_time, end_time')
          .eq('barber_id', barberId)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth);

        if (monthlyError) {
          console.error('Error fetching monthly bookings:', monthlyError);
        }

        // Fallback to empty array if no data
        const bookings = monthlyBookings || [];

        let totalRevenue = 0;
        const clientSet = new Set<string>();
        let totalServiceTime = 0;
        let serviceCount = 0;

        bookings.forEach((booking: any) => {
          if (booking.cost) {
            totalRevenue += parseFloat(booking.cost);
          }
          if (booking.customer_email) {
            clientSet.add(booking.customer_email);
          }
          if (booking.start_time && booking.end_time) {
            // Assume time is in "HH:MM:SS" format. Convert to minutes.
            const startParts = booking.start_time.split(':').map(Number);
            const endParts = booking.end_time.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1] + (startParts[2] || 0) / 60;
            const endMinutes = endParts[0] * 60 + endParts[1] + (endParts[2] || 0) / 60;
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

        // Fetch upcoming appointments for the next week
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

        // Build the live stats array
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
            description: 'Average duration',
          },
        ];

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching barber stats:', error);
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
