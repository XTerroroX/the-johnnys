
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBarbers() {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'barber')
        .order('name');
      
      if (error) {
        console.error("Error fetching barbers:", error);
        throw error;
      }
      
      console.log("Fetched barbers:", data);
      return data || [];
    },
    retry: 2,
    retryDelay: 1000
  });
}
