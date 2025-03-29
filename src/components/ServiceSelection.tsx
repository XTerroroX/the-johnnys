
import { Controller, useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { formatCurrency } from '@/utils/bookingUtils';

interface Service {
  id: string;
  name: string;
  price: string;
  duration: number;
}

interface ServiceSelectionProps {
  services: Service[];
}

const ServiceSelection = ({ services }: ServiceSelectionProps) => {
  const { control, watch } = useFormContext();
  
  // Calculate total price for the selected services in real-time
  const selectedServiceObjects = services.filter(svc => 
    watch('selectedServices').includes(svc.id.toString())
  );
  const totalPrice = selectedServiceObjects.reduce(
    (sum, svc) => sum + parseFloat(svc.price), 0
  );

  return (
    <>
      <FormField
        control={control}
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
                    value={service.id.toString()}
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
    </>
  );
};

export default ServiceSelection;
