
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlockedTime } from '@/types/blocked-time';

export function useBlockedTimes(barberId: string | null) {
  return useQuery({
    queryKey: ['blocked_times', barberId],
    queryFn: async () => {
      if (!barberId) return [];
      
      const { data, error } = await supabase
        .from('blocked_times')
        .select('*')
        .eq('barber_id', barberId)
        .order('start_datetime', { ascending: true });
        
      if (error) {
        console.error('Error fetching blocked times:', error);
        throw error;
      }
      
      return data as BlockedTime[];
    },
    enabled: !!barberId
  });
}
