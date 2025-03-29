// src/pages/Booking.tsx (or wherever your Booking component is located)
import { useState, useEffect } from 'react';
import { Check, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingCalendar from '@/components/BookingCalendar';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import BookingForm from '@/components/BookingForm';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useQuery } from '@tanstack/react-query';


type Barber = Tables<'profiles'>;

const fetchBarbers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['barber', 'superadmin']);
    
  if (error) {
    console.error('Error fetching barbers:', error);
    throw new Error('Failed to fetch barbers');
  }
  
  return data || [];
};

const Booking = () => {
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  const { data: barbers = [], isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: fetchBarbers
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    // Reset time when date changes
    if (selectedDate) {
      setSelectedTime(null);
    }
  }, [selectedDate]);

  const resetBooking = () => {
    setSelectedBarber(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setBookingComplete(false);
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="page-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="mb-4">Book Your Appointment</h1>
              <p className="text-muted-foreground">
                Select your preferred barber, date, and time to book your appointment.
              </p>
            </div>

            {bookingComplete ? (
              // Booking confirmation
              <div className="text-center py-16 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your appointment has been scheduled. We've sent a confirmation email with all the details.
                </p>
                <Button onClick={resetBooking}>Book Another Appointment</Button>
              </div>
            ) : (
              // Booking flow
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-10">
                  {/* Barber Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Choose Your Barber</h3>
                    {isLoadingBarbers ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="glass-card p-4 animate-pulse">
                            <div className="w-full aspect-square rounded-full bg-slate-200 dark:bg-slate-700 mb-4"></div>
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : barbers.length === 0 ? (
                      <div className="text-center py-6 border border-dashed rounded-md border-slate-200 dark:border-slate-700">
                        <p className="text-muted-foreground">No barbers available at the moment.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {barbers.map((barber) => (
                          <button
                            key={barber.id}
                            className={cn(
                              "glass-card p-4 text-left transition-all",
                              selectedBarber === barber.id 
                                ? "ring-2 ring-primary" 
                                : "hover:shadow-md"
                            )}
                            onClick={() => setSelectedBarber(barber.id)}
                          >
                            <div className="w-full aspect-square rounded-full overflow-hidden mb-4">
                              {barber.image_url ? (
                                <img 
                                  src={barber.image_url} 
                                  alt={barber.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                  {barber.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              )}
                            </div>
                            <h4 className="font-semibold">{barber.name}</h4>

                            {/* Removed the line that displayed "Barber" or specialty: 
                                <p className="text-sm text-muted-foreground">{barber.specialty || 'Barber'}</p> 
                            */}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Calendar */}
                  <BookingCalendar 
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                  
                  {/* Time Selection */}
                  <TimeSlotPicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                    selectedBarber={selectedBarber}
                  />
                </div>
                
                {/* Right Column - Booking Summary & Form */}
                <div className="glass-card p-6 h-fit sticky top-24">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                    
                    {selectedBarber && (
                      <div className="flex items-center py-2 border-b">
                        <div className="font-medium">Barber:</div>
                        <div className="ml-auto">
                          {barbers.find(b => b.id === selectedBarber)?.name || ''}
                        </div>
                      </div>
                    )}
                    
                    {selectedDate && (
                      <div className="flex items-center py-2 border-b">
                        <div className="font-medium">Date:</div>
                        <div className="ml-auto">
                          {format(selectedDate, 'MMMM d, yyyy')}
                        </div>
                      </div>
                    )}
                    
                    {selectedTime && (
                      <div className="flex items-center py-2 border-b">
                        <div className="font-medium">Time:</div>
                        <div className="ml-auto">{selectedTime}</div>
                      </div>
                    )}
                    
                    {(!selectedBarber || !selectedDate || !selectedTime) && (
                      <div className="flex items-center justify-center py-4 text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Select options to complete booking</span>
                      </div>
                    )}
                  </div>
                  
                  <BookingForm 
                    selectedBarber={selectedBarber}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onCompleted={() => setBookingComplete(true)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Booking;
