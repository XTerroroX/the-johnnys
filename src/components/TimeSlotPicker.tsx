import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useBlockedTimes } from '@/hooks/useBlockedTimes';

const MORNING_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM'];
const AFTERNOON_SLOTS = ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
const EVENING_SLOTS = ['5:00 PM', '6:00 PM', '7:00 PM'];

interface TimeSlotPickerProps {
  selectedDate: Date | undefined;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  selectedBarber: string | null;
}

interface BookingSlot {
  time: string;
  isAvailable: boolean;
}

const TimeSlotPicker = ({ 
  selectedDate,
  selectedTime,
  onSelectTime,
  selectedBarber
}: TimeSlotPickerProps) => {
  const [availableSlots, setAvailableSlots] = useState<Record<string, BookingSlot[]>>({
    morning: MORNING_SLOTS.map(time => ({ time, isAvailable: true })),
    afternoon: AFTERNOON_SLOTS.map(time => ({ time, isAvailable: true })),
    evening: EVENING_SLOTS.map(time => ({ time, isAvailable: true }))
  });
  
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    let hourIn24 = parseInt(hours, 10);
    if (hours === '12') {
      hourIn24 = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hourIn24 += 12;
    }
    return `${hourIn24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  };
  
  const fetchBarberAvailability = async () => {
    if (!selectedBarber || !selectedDate) return null;

    const dayOfWeek = selectedDate.getDay();

    const { data, error } = await supabase
      .from('barber_availability')
      .select('*')
      .eq('barber_id', selectedBarber)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (error) {
      console.log("Availability fetch error or no record found:", error);
      return { is_available: true, start_time: '09:00:00', end_time: '17:00:00' };
    }

    return data;
  };
  
  const fetchExistingBookings = async () => {
    if (!selectedBarber || !selectedDate) return [];
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('barber_id', selectedBarber)
      .eq('date', formattedDate)
      .neq('status', 'cancelled');
      
    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
    
    return data || [];
  };
  
  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['barberAvailability', selectedBarber, selectedDate],
    queryFn: fetchBarberAvailability,
    enabled: !!selectedBarber && !!selectedDate
  });
  
  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['barberBookings', selectedBarber, selectedDate],
    queryFn: fetchExistingBookings,
    enabled: !!selectedBarber && !!selectedDate
  });
  
  const { data: blockedTimes = [] } = useBlockedTimes(selectedBarber);
  
  useEffect(() => {
    if (!selectedDate || !selectedBarber) return;
    
    if (availabilityData && !availabilityData.is_available) {
      const allUnavailable = {
        morning: MORNING_SLOTS.map(time => ({ time, isAvailable: false })),
        afternoon: AFTERNOON_SLOTS.map(time => ({ time, isAvailable: false })),
        evening: EVENING_SLOTS.map(time => ({ time, isAvailable: false }))
      };
      setAvailableSlots(allUnavailable);
      if (selectedTime) {
        onSelectTime('');
        toast.error("The barber is not available on this day. Please select another date.");
      }
      return;
    }
    
    const availableHoursStart = availabilityData?.start_time || '09:00:00';
    const availableHoursEnd = availabilityData?.end_time || '17:00:00';
    
    const updatedMorningSlots = MORNING_SLOTS.map(time => ({ time, isAvailable: true }));
    const updatedAfternoonSlots = AFTERNOON_SLOTS.map(time => ({ time, isAvailable: true }));
    const updatedEveningSlots = EVENING_SLOTS.map(time => ({ time, isAvailable: true }));
    
    const allSlots = [...updatedMorningSlots, ...updatedAfternoonSlots, ...updatedEveningSlots];
    allSlots.forEach(slot => {
      const slotTime24h = convertTo24Hour(slot.time);
      if (slotTime24h < availableHoursStart || slotTime24h >= availableHoursEnd) {
        slot.isAvailable = false;
      }
    });
    
    if (bookingsData) {
      bookingsData.forEach(booking => {
        allSlots.forEach(slot => {
          const slotTime24h = convertTo24Hour(slot.time);
          if (slotTime24h === booking.start_time) {
            slot.isAvailable = false;
          }
        });
      });
    }
    
    if (blockedTimes) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      blockedTimes.forEach(block => {
        const blockDate = format(new Date(block.start_datetime), 'yyyy-MM-dd');
        if (blockDate === selectedDateStr) {
          if (block.all_day) {
            allSlots.forEach(slot => {
              slot.isAvailable = false;
            });
          } else {
            const blockStart = format(new Date(block.start_datetime), 'HH:mm:ss');
            const blockEnd = format(new Date(block.end_datetime), 'HH:mm:ss');
            
            allSlots.forEach(slot => {
              const slotTime24h = convertTo24Hour(slot.time);
              if (slotTime24h >= blockStart && slotTime24h < blockEnd) {
                slot.isAvailable = false;
              }
            });
          }
        }
      });
    }
    
    setAvailableSlots({
      morning: allSlots.filter(slot => MORNING_SLOTS.includes(slot.time)),
      afternoon: allSlots.filter(slot => AFTERNOON_SLOTS.includes(slot.time)),
      evening: allSlots.filter(slot => EVENING_SLOTS.includes(slot.time))
    });
    
    if (selectedTime) {
      const currentSlot = allSlots.find(slot => slot.time === selectedTime);
      if (currentSlot && !currentSlot.isAvailable) {
        onSelectTime('');
        toast.warning("Your selected time is no longer available. Please select another time.");
      }
    }
  }, [selectedDate, selectedBarber, availabilityData, bookingsData, blockedTimes, selectedTime, onSelectTime]);
  
  const handleSelectTime = (time: string) => {
    onSelectTime(time);
  };
  
  const renderTimeSlots = (slots: BookingSlot[], title: string) => {
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <Button
              key={slot.time}
              variant={selectedTime === slot.time ? "default" : "outline"}
              className={cn(
                !slot.isAvailable && "opacity-50 cursor-not-allowed",
                "w-full"
              )}
              disabled={!slot.isAvailable || !selectedBarber || !selectedDate || isLoadingAvailability || isLoadingBookings}
              onClick={() => handleSelectTime(slot.time)}
            >
              {slot.time}
            </Button>
          ))}
        </div>
      </div>
    );
  };
  
  if (isLoadingAvailability || isLoadingBookings) {
    return (
      <div className="flex justify-center items-center py-6 border border-dashed rounded-md border-slate-200 dark:border-slate-700">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <p className="text-muted-foreground">Loading available time slots...</p>
      </div>
    );
  }
  
  if (!selectedDate) {
    return (
      <div className="text-center py-6 border border-dashed rounded-md border-slate-200 dark:border-slate-700">
        <p className="text-muted-foreground">Please select a date first</p>
      </div>
    );
  }
  
  if (!selectedBarber) {
    return (
      <div className="text-center py-6 border border-dashed rounded-md border-slate-200 dark:border-slate-700">
        <p className="text-muted-foreground">Please select a barber first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Select a Time - {format(selectedDate, 'MMMM d, yyyy')}
      </h3>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
        {renderTimeSlots(availableSlots.morning, "Morning")}
        {renderTimeSlots(availableSlots.afternoon, "Afternoon")}
        {renderTimeSlots(availableSlots.evening, "Evening")}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
