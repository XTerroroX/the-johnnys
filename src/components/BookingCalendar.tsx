import { useState, useRef } from 'react';
import { format, addDays, isToday, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // No disabledDates as shop is open every day.
  const handleDateSelect = (date: Date | undefined) => {
    onSelectDate(date);
    setCalendarOpen(false);
  };

  // For quick selection scrolling, create a ref for the container.
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -100, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 100, behavior: 'smooth' });
  };

  // Quick selection: generate 14 days starting from today (or adjust as needed)
  const quickSelectionDays = Array.from({ length: 14 }, (_, i) => addDays(today, i));

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
              disabled={(date) => isBefore(date, today)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Quick selection with scrolling */}
      <div className="relative flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-2 py-2 px-9 no-scrollbar"
        >
          {quickSelectionDays.map((date, index) => {
            const formattedDay = format(date, 'EEE');
            const dayNumber = format(date, 'd');
            return (
              <Button
                key={index}
                variant={
                  selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    ? "default"
                    : "outline"
                }
                className="flex-col h-auto min-w-[4rem] py-2"
                onClick={() => onSelectDate(date)}
              >
                <span className="text-xs">{formattedDay}</span>
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
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BookingCalendar;
