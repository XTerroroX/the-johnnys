
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBarberServices(barberId: string) {
  return useQuery({
    queryKey: ["barber_services", barberId],
    queryFn: async () => {
      if (!barberId) return [];
      const { data, error } = await supabase
        .from("barber_services")
        .select("*")
        .eq("barber_id", barberId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!barberId,
  });
}
