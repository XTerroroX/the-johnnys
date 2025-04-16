
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBarbers() {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      // Updated query to fetch both barber and superadmin profiles
      // This ensures we display all users that should appear in the barbers list
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['barber', 'superadmin'])
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
