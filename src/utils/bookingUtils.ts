
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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

// Fetch barber services and create default ones if none exist
export const fetchBarberServicesWithFallback = async (barberId: string | null) => {
  if (!barberId) return [];
  
  // First try to get existing barber services
  const { data: existingServices, error } = await supabase
    .from('barber_services')
    .select('*')
    .eq('barber_id', barberId)
    .eq('active', true);
    
  if (error) {
    console.error('Error fetching barber services:', error);
    throw error;
  }

  // If barber has no services, get default services and create them for this barber
  if (!existingServices || existingServices.length === 0) {
    try {
      // Get default services from services table
      const { data: defaultServices, error: defaultError } = await supabase
        .from('services')
        .select('*')
        .eq('active', true);
      
      if (defaultError || !defaultServices || defaultServices.length === 0) {
        // If no default services, create a basic one
        const basicServices = [
          {
            barber_id: barberId,
            name: "Standard Haircut",
            price: 25.00,
            duration: 30,
            description: "A classic haircut service",
            active: true
          },
          {
            barber_id: barberId,
            name: "Haircut & Beard Trim",
            price: 35.00,
            duration: 45,
            description: "Haircut with beard trimming and styling",
            active: true
          }
        ];

        // Insert basic services
        const { data: createdServices, error: createError } = await supabase
          .from('barber_services')
          .insert(basicServices)
          .select();
          
        if (createError) {
          console.error('Error creating basic services:', createError);
          return [];
        }
          
        return createdServices || [];
      }
      
      // Create barber services based on default services
      const barberServices = defaultServices.map(service => ({
        barber_id: barberId,
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description,
        active: true
      }));
      
      const { data: createdServices, error: createError } = await supabase
        .from('barber_services')
        .insert(barberServices)
        .select();
        
      if (createError) {
        console.error('Error creating services for barber:', createError);
        return [];
      }
      
      return createdServices || [];
    } catch (err) {
      console.error('Error in service creation fallback:', err);
      return [];
    }
  }
  
  return existingServices;
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
