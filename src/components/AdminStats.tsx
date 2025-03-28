// src/components/AdminStats.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';

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

const AdminStats = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        // Query all bookings for the current month, joining the full services record.
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('customer_email, service_id, services(*)')
          .gte('date', startOfMonth)
          .lte('date', endOfMonth);

        if (error) {
          console.error('Error fetching bookings:', error);
          setLoading(false);
          return;
        }

        // Ensure we have an array
        const bookingList = bookings || [];
        let totalRevenue = 0;
        const clientSet = new Set<string>();
        const totalAppointments = bookingList.length;

        // Loop over each booking to calculate revenue and unique clients.
        for (const booking of bookingList) {
          let price = 0;
          // Use the joined services data if available
          if (booking.services && booking.services.price) {
            price = parseFloat(booking.services.price);
          } 
          // (Optional fallback: if price is not available, you can query the services table separately.)
          totalRevenue += price;

          if (booking.customer_email) {
            clientSet.add(booking.customer_email);
          }
        }

        // Calculate the average service value.
        const avgServiceValue =
          totalAppointments > 0 ? (totalRevenue / totalAppointments).toFixed(2) : '0.00';
        const totalRevenueFormatted = `$${totalRevenue.toFixed(2)}`;
        const activeClients = clientSet.size;

        const newStats = [
          {
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
            title: 'Total Revenue',
            value: totalRevenueFormatted,
            description: 'Current Month Revenue',
          },
          {
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            title: 'Active Clients',
            value: activeClients.toString(),
            description: 'Unique clients this month',
          },
          {
            icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
            title: 'Appointments',
            value: totalAppointments.toString(),
            description: 'This month',
          },
          {
            icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
            title: 'Avg. Service Value',
            value: `$${avgServiceValue}`,
            description: 'Average service cost',
          },
        ];

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats([
          {
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
            title: 'Total Revenue',
            value: '$0.00',
            description: 'Current Month Revenue',
          },
          {
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            title: 'Active Clients',
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
            icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
            title: 'Avg. Service Value',
            value: '$0.00',
            description: 'Average service cost',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

export default AdminStats;
