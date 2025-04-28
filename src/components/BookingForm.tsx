
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CustomerInfoFields from './CustomerInfoFields';
import ServiceSelection from './ServiceSelection';
import {
  convertTo24Hour,
  calculateEndTime,
  formatBookingDate
} from '@/utils/bookingUtils';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  selectedServices: z.array(z.string()).nonempty("Please select at least one service."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
  selectedBarber: string | null;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  onCompleted: () => void;
  services: any[]; // List of that barber's services
  isLoadingServices: boolean;
}

const BookingForm = ({
  selectedBarber,
  selectedDate,
  selectedTime,
  onCompleted,
  services,
  isLoadingServices,
}: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<FormValues>({
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
      // Validate barber exists
      const { data: barberExists, error: barberError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', selectedBarber)
        .single();
      
      if (barberError || !barberExists) {
        throw new Error("Selected barber is not available. Please try again.");
      }
      
      // Find selected services by id
      const chosenServices = services.filter(svc =>
        values.selectedServices.includes(svc.id.toString())
      );
      
      if (chosenServices.length === 0) {
        throw new Error("No valid services selected. Please try again.");
      }

      let totalDuration = 0;
      let totalPrice = 0;
      chosenServices.forEach(svc => {
        totalDuration += svc.duration;
        totalPrice += parseFloat(svc.price);
      });

      const formattedDate = formatBookingDate(selectedDate);
      const time24h = convertTo24Hour(selectedTime);
      const endTime = calculateEndTime(selectedTime, totalDuration);

      // First, check if this service exists in the services table
      // If not, we need to create it or find the matching one
      const primaryServiceName = chosenServices.length > 0 ? chosenServices[0].name : null;
      
      if (!primaryServiceName) {
        throw new Error("Could not determine the primary service. Please try again.");
      }
      
      // Find or create a matching service in the services table
      const { data: existingService, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('name', primaryServiceName)
        .single();
      
      let serviceId;
      
      if (serviceError || !existingService) {
        // Create the service if it doesn't exist
        const newService = chosenServices[0];
        const { data: createdService, error: createError } = await supabase
          .from('services')
          .insert({
            name: newService.name,
            price: newService.price,
            duration: newService.duration,
            description: newService.description,
            active: true
          })
          .select()
          .single();
        
        if (createError || !createdService) {
          console.error("Error creating service:", createError);
          throw new Error("Failed to create matching service. Please try again.");
        }
        
        serviceId = createdService.id;
      } else {
        serviceId = existingService.id;
      }
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          barber_id: selectedBarber,
          selected_services: chosenServices.map(svc => ({
            id: svc.id,
            name: svc.name,
            price: svc.price,
            duration: svc.duration
          })),
          service_id: serviceId,
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
        console.error("Booking error:", error);
        throw new Error(error.message || "Failed to create booking");
      }

      toast.success("Booking confirmed! We'll see you soon.");
      methods.reset();
      onCompleted();
    } catch (error: any) {
      console.error("Booking submission error:", error);
      toast.error(error.message || "There was a problem with your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingServices) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Information</h3>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <CustomerInfoFields />
          {/* Service Selection: now only that barber's services */}
          <ServiceSelection services={services} />
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
