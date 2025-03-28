// src/components/AdminStats.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, DollarSign, Users } from 'lucide-react';

const StatCard = ({ icon, title, value, description }: { 
  icon: React.ReactNode, 
  title: string, 
  value: string, 
  description: string 
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
        // Determine the current month's range
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        // Query bookings for the current month and join the services table for price info.
        // Note: Adjust the join key to match your Supabase relationship name (here assumed to be "services").
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`customer_email, services(price)`)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth);

        if (error) {
          console.error('Error fetching bookings:', error);
          setLoading(false);
          return;
        }

        // Ensure we work with an array even if no bookings are returned
        const bookingsArray = bookings || [];

        let totalRevenue = 0;
        const clientSet = new Set<string>();
        const totalAppointments = bookingsArray.length;

        bookingsArray.forEach((booking: any) => {
          if (booking.services && booking.services.price) {
            totalRevenue += parseFloat(booking.services.price);
          }
          if (booking.customer_email) {
            clientSet.add(booking.customer_email);
          }
        });

        const avgServiceValue = totalAppointments > 0 ? (totalRevenue / totalAppointments).toFixed(2) : '0.00';
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
            description: 'Total appointments this month',
          },
          {
            icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
            title: 'Avg. Service Value',
            value: `$${avgServiceValue}`,
            description: 'Average service cost',
          },
        ];

        setStats(newStats);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        // Set fallback stat values in case of error.
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
            description: 'Total appointments this month',
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
