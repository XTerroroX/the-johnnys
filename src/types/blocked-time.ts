
export interface BlockedTime {
  id: string;
  barber_id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
