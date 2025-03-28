import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient'; // adjust the import path as needed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, DollarSign, Users } from 'lucide-react';

const StatCard = ({ icon, title, value, description }) => (
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Determine start and end dates for the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      // Set to the last day of the month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // Query bookings for the current month with a join on the services table to fetch the cost
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('customer_email, services ( cost )')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      if (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
        return;
      }

      // Calculate the stats
      let totalRevenue = 0;
      const clientSet = new Set();
      const totalAppointments = bookings.length;

      bookings.forEach(booking => {
        if (booking.services && booking.services.cost) {
          totalRevenue += parseFloat(booking.services.cost);
        }
        if (booking.customer_email) {
          clientSet.add(booking.customer_email);
        }
      });

      const avgServiceValue =
        totalAppointments > 0 ? (totalRevenue / totalAppointments).toFixed(2) : 0;
      const totalRevenueFormatted = `$${totalRevenue.toFixed(2)}`;
      const activeClients = clientSet.size;

      const newStats = [
        {
          icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
          title: 'Total Revenue',
          value: totalRevenueFormatted,
          description: 'Current Month Revenue'
        },
        {
          icon: <Users className="h-4 w-4 text-muted-foreground" />,
          title: 'Active Clients',
          value: activeClients.toString(),
          description: 'Unique clients this month'
        },
        {
          icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
          title: 'Appointments',
          value: totalAppointments.toString(),
          description: 'This month'
        },
        {
          icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
          title: 'Avg. Service Value',
          value: `$${avgServiceValue}`,
          description: 'Average service cost'
        }
      ];

      setStats(newStats);
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats && stats.map((stat, index) => (
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
