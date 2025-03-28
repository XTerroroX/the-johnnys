import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  service: z.string().min(1, {
    message: "Please select a service.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
  selectedBarber: string | null;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  onCompleted: () => void;
}

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
      service: "",
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
      const selectedService = services.find(s => s.id.toString() === values.service);
      const duration = selectedService?.duration || 30;
      
      const time24h = convertTo24Hour(selectedTime);
      
      const [hoursStr, minutesStr] = time24h.split(':');
      let hours = parseInt(hoursStr);
      let minutes = parseInt(minutesStr);
      
      minutes += duration;
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      
      const endTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          barber_id: selectedBarber,
          service_id: parseInt(values.service),
          date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: time24h,
          end_time: endTime,
          customer_name: values.name,
          customer_email: values.email,
          customer_phone: values.phone,
          notes: values.notes || null,
          status: 'confirmed'
        })
        .select()
        .single();
        
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
    const [time, modifier] = time12h.split(' ');
    const [hours, minutes] = time.split(':');
    
    let hourIn24 = parseInt(hours, 10);
    
    if (hours === '12') {
      hourIn24 = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hourIn24 += 12;
    }
    
    return `${hourIn24.toString().padStart(2, '0')}:${minutes}`;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Information</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} - {formatCurrency(service.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
