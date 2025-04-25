
export interface Booking {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_id: number;
  barber_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  selected_services?: Array<{
    id: number;
    name: string;
    price: number;
    duration: number;
  }>;
  service: {
    id: number;
    name: string;
    price: number;
    duration: number;
  };
  barber: {
    id: string;
    name: string;
    email: string;
  };
}
