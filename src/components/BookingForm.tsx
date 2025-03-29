
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import CustomerInfoFields from './CustomerInfoFields';
import ServiceSelection from './ServiceSelection';
import { 
  fetchServices, 
  convertTo24Hour, 
  calculateEndTime, 
  formatBookingDate 
} from '@/utils/bookingUtils';

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
    queryFn: () => fetchServices(supabase)
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
      const formattedDate = formatBookingDate(selectedDate);
      
      // Convert selectedTime (e.g. "10:00 AM") to 24-hour for storing
      const time24h = convertTo24Hour(selectedTime);
      
      // Calculate end time
      const endTime = calculateEndTime(selectedTime, totalDuration);

      // Fix: Use the first chosen service's ID as service_id (required field)
      // Get the first chosen service ID or default to 1 if none available
      const primaryServiceId = chosenServices.length > 0 ? parseInt(chosenServices[0].id.toString()) : 1;
      
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
          // Fix: Add the required service_id field
          service_id: primaryServiceId,
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Information</h3>
      
      {/* Fix: Pass the form object directly to FormProvider */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer Information Fields */}
          <CustomerInfoFields />

          {/* Service Selection */}
          <ServiceSelection services={services} />
          
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
      </FormProvider>
    </div>
  );
};

export default BookingForm;
