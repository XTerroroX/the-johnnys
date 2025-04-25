
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:service_id (id, name, price, duration),
          barber:barber_id (id, name, email)
        `)
        .order('date', { ascending: false });
      
      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }
      
      return data as unknown as Booking[];
    }
  });
}
