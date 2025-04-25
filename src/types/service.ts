
export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  barber_id?: string; // Add barber_id to associate services with barbers
}
