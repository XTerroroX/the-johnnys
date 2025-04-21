
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateBarberService(barberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form: any) => {
      const { error } = await supabase
        .from("barber_services")
        .update({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          duration: Number(form.duration),
          active: form.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", form.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barber_services", barberId] });
    },
  });
}
