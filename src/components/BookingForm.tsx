import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

/** 
 * Use some multi-select component for services. 
 * Below we demonstrate a simple "checkbox list" approach. 
 * For a real UI, you might use a library like React Select's MultiSelect.
 */

// For this example, each service is { id, name, price, duration }
const fetchServices = async () => {
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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  // Instead of single "service", store an array of service IDs
  selectedServices: z.array(z.string()).nonempty("Please select at least one service."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
  selectedBarber: string | null;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  onCompleted: () => void;
}

const BookingForm = ({ 
  selectedBarber, 
  selectedDate, 
  selectedTime,
  onCompleted 
}: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      selectedServices: [],
      notes: "",
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!selectedBarber || !selectedDate || !selectedTime) {
      toast.error("Please select a barber, date, and time before booking");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // We'll build a detailed list of selected service objects 
      // to store in the new 'selected_services' JSON column
      const chosenServices = services.filter(svc =>
        values.selectedServices.includes(svc.id.toString())
      );

      // Sum durations to figure out the total booking length
      let totalDuration = 0;
      let totalPrice = 0;
      chosenServices.forEach(svc => {
        totalDuration += svc.duration;
        totalPrice += parseFloat(svc.price);
      });

      // Format the date
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Convert selectedTime (e.g. "10:00 AM") to 24-hour for storing
      const time24h = convertTo24Hour(selectedTime);
      
      // Calculate end time: start_time + totalDuration
      const [startH, startM] = time24h.split(':').map(Number);
      let endH = startH;
      let endM = startM + totalDuration;
      endH += Math.floor(endM / 60);
      endM = endM % 60;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
      
      // Insert booking with multiple services in a JSON column
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          barber_id: selectedBarber,
          // We store an array of service objects or IDs in a new "selected_services" JSON column
          selected_services: chosenServices.map(svc => ({
            id: svc.id,
            name: svc.name,
            price: svc.price,
            duration: svc.duration
          })),
          // Optionally store total price, totalDuration, or a single "service_id" if needed
          date: formattedDate,
          start_time: time24h,
          end_time: endTime,
          customer_name: values.name,
          customer_email: values.email,
          customer_phone: values.phone,
          notes: values.notes || null,
          status: 'confirmed'
        })
        .select();
      
      if (error) {
        console.error("Booking error details:", error);
        throw new Error(error.message || "Failed to create booking");
      }
      
      toast.success("Booking confirmed! We'll see you soon.");
      form.reset();
      onCompleted();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "There was a problem with your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const convertTo24Hour = (time12h: string) => {
    // e.g. "10:00 AM" => "10:00"
    const [time, modifier] = time12h.split(' ');
    const [hh, mm] = time.split(':').map(Number);
    let hourIn24 = hh;
    
    if (hh === 12) {
      hourIn24 = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hourIn24 += 12;
    }
    return `${hourIn24.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  };

  // Helper to format price
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate total price for the selected services in real-time
  const selectedServiceObjects = services.filter(svc =>
    form.watch('selectedServices').includes(svc.id.toString())
  );
  const totalPrice = selectedServiceObjects.reduce((sum, svc) => sum + parseFloat(svc.price), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Information</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Multi-Select Services */}
          <FormField
            control={form.control}
            name="selectedServices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Services</FormLabel>
                <div className="space-y-2">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`svc-${service.id}`}
                        value={service.id}
                        // Check if the service ID is in the array
                        checked={field.value.includes(service.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // add
                            field.onChange([...field.value, service.id.toString()]);
                          } else {
                            // remove
                            field.onChange(field.value.filter((val: string) => val !== service.id.toString()));
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`svc-${service.id}`}>
                        {service.name} - {formatCurrency(parseFloat(service.price))} ({service.duration} min)
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display total price for user reference */}
          {selectedServiceObjects.length > 0 && (
            <p className="text-sm font-medium mt-2">
              Total: {formatCurrency(totalPrice)}
            </p>
          )}

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special requests or notes for your barber..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Submit */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !selectedBarber || !selectedDate || !selectedTime}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;
