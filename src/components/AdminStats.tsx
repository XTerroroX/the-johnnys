
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, DollarSign, Users } from 'lucide-react';

const StatCard = ({ 
  icon, 
  title, 
  value, 
  description 
}: { 
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
  // In a real app, this data would come from Supabase
  const stats = [
    {
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      title: "Total Revenue",
      value: "$12,580",
      description: "+20.1% from last month"
    },
    {
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      title: "Active Clients",
      value: "324",
      description: "+7% from last month"
    },
    {
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      title: "Appointments",
      value: "185",
      description: "This month"
    },
    {
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
      title: "Avg. Service Value",
      value: "$45.20",
      description: "+$2.30 from last month"
    }
  ];

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
