
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

const barbers = [
  { id: 1, name: "John Smith", specialty: "Classic Cuts", image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
  { id: 2, name: "David Johnson", specialty: "Modern Styles", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
  { id: 3, name: "Michael Williams", specialty: "Beard Specialist", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
];

const Booking = () => {
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  
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
                            <img 
                              src={barber.image} 
                              alt={barber.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-semibold">{barber.name}</h4>
                          <p className="text-sm text-muted-foreground">{barber.specialty}</p>
                        </button>
                      ))}
                    </div>
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
                          {barbers.find(b => b.id === selectedBarber)?.name}
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
