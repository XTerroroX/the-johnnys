
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
      // Find selected services by id
      const chosenServices = services.filter(svc =>
        values.selectedServices.includes(svc.id.toString())
      );

      let totalDuration = 0;
      let totalPrice = 0;
      chosenServices.forEach(svc => {
        totalDuration += svc.duration;
        totalPrice += parseFloat(svc.price);
      });

      const formattedDate = formatBookingDate(selectedDate);
      const time24h = convertTo24Hour(selectedTime);
      const endTime = calculateEndTime(selectedTime, totalDuration);

      // Pick primary service ID as first selected
      const primaryServiceId = chosenServices.length > 0
        ? parseInt(chosenServices[0].id.toString())
        : 1;

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
        throw new Error(error.message || "Failed to create booking");
      }

      toast.success("Booking confirmed! We'll see you soon.");
      methods.reset();
      onCompleted();
    } catch (error: any) {
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
