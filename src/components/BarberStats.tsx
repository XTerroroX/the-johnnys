
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Timer, Users } from 'lucide-react';

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

interface BarberStatsProps {
  barberId: number;
}

const BarberStats = ({ barberId }: BarberStatsProps) => {
  // In a real app, this data would come from Supabase filtered by barberId
  const stats = [
    {
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      title: "Your Earnings",
      value: "$3,240",
      description: "+12.5% from last month"
    },
    {
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      title: "Clients Served",
      value: "86",
      description: "This month"
    },
    {
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      title: "Appointments",
      value: "42",
      description: "Upcoming this week"
    },
    {
      icon: <Timer className="h-4 w-4 text-muted-foreground" />,
      title: "Avg. Service Time",
      value: "38 min",
      description: "-2 min from last month"
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

export default BarberStats;
