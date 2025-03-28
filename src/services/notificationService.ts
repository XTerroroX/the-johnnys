
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for handling booking notifications
 */
export const notificationService = {
  /**
   * Mark a notification as read
   * @param notificationId The ID of the notification to mark as read
   */
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('booking_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
      return false;
    }
  },

  /**
   * Mark all notifications for a barber as read
   * @param barberId The ID of the barber
   */
  async markAllAsRead(barberId: string) {
    try {
      const { error } = await supabase
        .from('booking_notifications')
        .update({ is_read: true })
        .eq('barber_id', barberId)
        .eq('is_read', false);

      if (error) throw error;
      toast.success('All notifications marked as read');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
      return false;
    }
  },

  /**
   * Fetch notifications for a barber
   * @param barberId The ID of the barber
   */
  async fetchNotifications(barberId: string) {
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
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      return [];
    }
  }
};
