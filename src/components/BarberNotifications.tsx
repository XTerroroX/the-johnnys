
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bell, Check, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Notification {
  id: string;
  created_at: string;
  is_read: boolean;
  booking: {
    id: number;
    customer_name: string;
    date: string;
    start_time: string;
    service: {
      name: string;
    };
  };
}

interface BarberNotificationsProps {
  barberId: string;
}

const BarberNotifications = ({ barberId }: BarberNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('booking_notifications')
        .select(`
          id,
          created_at,
          is_read,
          booking:bookings(
            id,
            customer_name,
            date,
            start_time,
            service:services(name)
          )
        `)
        .eq('barber_id', barberId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('booking_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('booking_notifications')
        .update({ is_read: true })
        .eq('barber_id', barberId)
        .eq('is_read', false);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Set up a subscription to listen for new notifications
  useEffect(() => {
    if (!barberId) return;
    
    fetchNotifications();
    
    // Subscribe to realtime updates for new notifications
    const channel = supabase
      .channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'booking_notifications',
          filter: `barber_id=eq.${barberId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          fetchNotifications(); // Refetch to get the joined data
          toast.info('You have a new booking!');
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [barberId]);

  // When popover opens, refetch notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const formatNotificationTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        New Booking from {notification.booking.customer_name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.booking.service.name} on {format(new Date(notification.booking.date), 'MMM d, yyyy')} at {format(new Date(`2000-01-01T${notification.booking.start_time}`), 'h:mm a')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default BarberNotifications;
