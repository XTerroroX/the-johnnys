
import { format } from 'date-fns';

export const fetchServices = async (supabase: any) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name');
    
  if (error) {
    console.error('Error fetching services:', error);
    throw new Error('Failed to fetch services');
  }
  
  return data || [];
};

export const convertTo24Hour = (time12h: string) => {
  // e.g. "10:00 AM" => "10:00"
  const [time, modifier] = time12h.split(' ');
  const [hh, mm] = time.split(':').map(Number);
  let hourIn24 = hh;
  
  if (hh === 12) {
    hourIn24 = modifier === 'PM' ? 12 : 0;
  } else if (modifier === 'PM') {
    hourIn24 += 12;
  }
  return `${hourIn24.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
};

// Helper to format price
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const calculateEndTime = (startTime: string, totalDuration: number) => {
  const time24h = convertTo24Hour(startTime);
  
  // Calculate end time: start_time + totalDuration
  const [startH, startM] = time24h.split(':').map(Number);
  let endH = startH;
  let endM = startM + totalDuration;
  endH += Math.floor(endM / 60);
  endM = endM % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};

export const formatBookingDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};
