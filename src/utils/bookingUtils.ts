
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

// Ensure consistent conversion of 12-hour format to 24-hour format
export const convertTo24Hour = (time12h: string) => {
  // e.g. "10:00 AM" => "10:00:00"
  if (!time12h) return '';
  
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  // Handle 12 AM/PM edge cases
  if (hours === 12) {
    hours = modifier === 'PM' ? 12 : 0;
  } else if (modifier === 'PM') {
    hours += 12;
  }
  
  // Return in "HH:MM:SS" format with padded zeros
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

// Helper to format price
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Calculate end time based on start time and duration
export const calculateEndTime = (startTime: string, totalDuration: number) => {
  if (!startTime) return '';
  
  const time24h = convertTo24Hour(startTime);
  
  // Calculate end time: start_time + totalDuration (in minutes)
  const [startH, startM] = time24h.split(':').map(Number);
  let endH = startH;
  let endM = startM + totalDuration;
  
  // Handle minute overflow
  endH += Math.floor(endM / 60);
  endM = endM % 60;
  
  // Handle hour overflow (past midnight)
  endH = endH % 24;
  
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;
};

// Format date for database storage
export const formatBookingDate = (date: Date) => {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
};
