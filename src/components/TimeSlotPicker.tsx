
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TimeSlotPickerProps {
  selectedDate: Date | undefined;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  selectedBarber: string | null;
}

const TimeSlotPicker = ({ 
  selectedDate,
  selectedTime,
  onSelectTime,
  selectedBarber
}: TimeSlotPickerProps) => {
  // In a real app, this would come from Supabase based on the selected date and barber
  const morningSlots = ['9:00 AM', '10:00 AM', '11:00 AM'];
  const afternoonSlots = ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const eveningSlots = ['5:00 PM', '6:00 PM', '7:00 PM'];
  
  // Simulate unavailable slots based on selected barber
  // This would be replaced with actual data from Supabase
  const getUnavailableSlots = (barberId: string | null) => {
    if (!barberId) return [];
    
    // In a real app, query bookings to find unavailable slots
    return [];
  };
  
  const unavailableSlots = getUnavailableSlots(selectedBarber);
  
  const isTimeSlotAvailable = (time: string) => {
    return !unavailableSlots.includes(time);
  };
  
  const handleSelectTime = (time: string) => {
    if (isTimeSlotAvailable(time)) {
      onSelectTime(time);
    }
  };
  
  const renderTimeSlots = (slots: string[], title: string) => {
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              className={cn(
                !isTimeSlotAvailable(time) && "opacity-50 cursor-not-allowed",
                "w-full"
              )}
              disabled={!isTimeSlotAvailable(time) || !selectedBarber || !selectedDate}
              onClick={() => handleSelectTime(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </div>
    );
  };
  
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
        Select a Time - {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
      </h3>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
        {renderTimeSlots(morningSlots, "Morning")}
        {renderTimeSlots(afternoonSlots, "Afternoon")}
        {renderTimeSlots(eveningSlots, "Evening")}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
