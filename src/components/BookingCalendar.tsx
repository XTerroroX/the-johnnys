import { useState } from 'react';
import { format, addDays, isToday, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const BookingCalendar = ({ selectedDate, onSelectDate }: BookingCalendarProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const today = startOfDay(new Date());

  // No disabledDates since the shop is open every day.
  // Date selection helper
  const handleDateSelect = (date: Date | undefined) => {
    onSelectDate(date);
    setCalendarOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Select a Date</h3>
        
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              // Only disable past dates.
              disabled={(date) => isBefore(date, today)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Optional Quick Selection Bar (currently showing 7 days starting today) */}
      <div className="relative flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10"
          onClick={() => {
            // Implement date scrolling if desired
          }}
        >
          {/* Left Chevron */}
        </Button>
        
        <div className="flex overflow-x-auto space-x-2 py-2 px-9 no-scrollbar">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(today, i);
            const formattedDate = format(date, 'EEE');
            const dayNumber = format(date, 'd');
            
            return (
              <Button
                key={i}
                variant={selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') 
                  ? "default" 
                  : "outline"
                }
                className="flex-col h-auto min-w-[4rem] py-2"
                onClick={() => onSelectDate(date)}
              >
                <span className="text-xs">{formattedDate}</span>
                <span className="text-lg">{dayNumber}</span>
                {isToday(date) && (
                  <span className="text-xs mt-1 bg-primary/10 px-2 py-0.5 rounded-full">Today</span>
                )}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-10"
          onClick={() => {
            // Implement date scrolling if desired
          }}
        >
          {/* Right Chevron */}
        </Button>
      </div>
    </div>
  );
};

export default BookingCalendar;
