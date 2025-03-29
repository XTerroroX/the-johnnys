
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Switch 
} from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface BarberAvailabilityProps {
  barberId: string;
}

interface DayAvailability {
  id: number;
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
}

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// Generate time options in 30 min intervals
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const hourDisplay = hour.toString().padStart(2, '0');
      const minuteDisplay = minute.toString().padStart(2, '0');
      options.push(`${hourDisplay}:${minuteDisplay}:00`);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

// Format time for display
const formatTimeForDisplay = (time: string) => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const amPm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${amPm}`;
};

const BarberAvailability = ({ barberId }: BarberAvailabilityProps) => {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('barber_availability')
          .select('*')
          .eq('barber_id', barberId)
          .order('day_of_week', { ascending: true });
        
        if (error) throw error;
        
        setAvailability(data || []);
      } catch (error: any) {
        console.error('Error fetching availability:', error);
        toast.error('Failed to load availability settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailability();
  }, [barberId]);

  const handleToggleAvailability = (dayOfWeek: number, isAvailable: boolean) => {
    setAvailability(prev => 
      prev.map(day => 
        day.day_of_week === dayOfWeek 
          ? { ...day, is_available: isAvailable } 
          : day
      )
    );
    setHasChanges(true);
  };

  const handleTimeChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev => 
      prev.map(day => 
        day.day_of_week === dayOfWeek 
          ? { ...day, [field]: value } 
          : day
      )
    );
    setHasChanges(true);
  };

  const saveAvailability = async () => {
    try {
      setIsSaving(true);
      
      for (const day of availability) {
        const { error } = await supabase
          .from('barber_availability')
          .update({
            is_available: day.is_available,
            start_time: day.start_time,
            end_time: day.end_time
          })
          .eq('barber_id', barberId)
          .eq('day_of_week', day.day_of_week);
          
        if (error) throw error;
      }
      
      toast.success('Availability settings saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {daysOfWeek.map(day => {
        const dayData = availability.find(a => a.day_of_week === day.value);
        if (!dayData) return null;
        
        return (
          <Card key={day.value} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="font-medium">{day.label}</div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={dayData.is_available} 
                    onCheckedChange={(checked) => handleToggleAvailability(day.value, checked)}
                  />
                  <span className="text-sm">{dayData.is_available ? 'Available' : 'Unavailable'}</span>
                </div>
                
                <Select
                  disabled={!dayData.is_available}
                  value={dayData.start_time}
                  onValueChange={(value) => handleTimeChange(day.value, 'start_time', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTimeForDisplay(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  disabled={!dayData.is_available}
                  value={dayData.end_time}
                  onValueChange={(value) => handleTimeChange(day.value, 'end_time', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTimeForDisplay(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <div className="flex justify-end">
        <Button 
          onClick={saveAvailability} 
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Availability'
          )}
        </Button>
      </div>
    </div>
  );
};

export default BarberAvailability;
