
import { useState } from 'react';
import { format, addDays, isToday, isAfter, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const BookingCalendar = ({ selectedDate, onSelectDate }: BookingCalendarProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Generate available dates for the next 14 days
  const today = startOfDay(new Date());
  const twoWeeksFromNow = addDays(today, 14);
  
  // In a real app, you would get this data from Supabase
  const disabledDates = [
    addDays(today, 2),
    addDays(today, 7),
  ];

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
              disabled={(date) => 
                isBefore(date, today) || 
                isAfter(date, twoWeeksFromNow) ||
                disabledDates.some(disabledDate => 
                  format(disabledDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                )
              }
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Date quick selection */}
      <div className="relative flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10"
          onClick={() => {
            // In a real app, implement date scrolling
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex overflow-x-auto space-x-2 py-2 px-9 no-scrollbar">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(today, i);
            const formattedDate = format(date, 'EEE');
            const dayNumber = format(date, 'd');
            const isDisabled = disabledDates.some(
              disabledDate => format(disabledDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            );
            
            return (
              <Button
                key={i}
                variant={selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') 
                  ? "default" 
                  : "outline"
                }
                className={cn(
                  "flex-col h-auto min-w-[4rem] py-2",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={isDisabled}
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
            // In a real app, implement date scrolling
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BookingCalendar;
