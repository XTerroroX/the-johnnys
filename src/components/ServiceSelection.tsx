
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface Service {
  id: string | number;
  name: string;
  price: string | number;
  duration: number;
}

interface ServiceSelectionProps {
  services: Service[];
}

const formatCurrency = (amount: string | number) =>
  "$" + parseFloat(amount as any).toFixed(2);

const ServiceSelection = ({ services }: ServiceSelectionProps) => {
  const { control, watch } = useFormContext();
  const selectedServiceIds = watch('selectedServices') || [];
  const selectedServiceObjects = services.filter(svc =>
    selectedServiceIds.includes(svc.id.toString())
  );
  const totalPrice = selectedServiceObjects.reduce(
    (sum, svc) => sum + parseFloat(svc.price as any),
    0
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
                    checked={field.value?.includes(service.id.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        field.onChange([...(field.value || []), service.id.toString()]);
                      } else {
                        field.onChange(field.value?.filter((val: string) => val !== service.id.toString()) || []);
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`svc-${service.id}`} className="text-sm cursor-pointer">
                    {service.name} - {formatCurrency(service.price)} ({service.duration} min)
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      {selectedServiceObjects.length > 0 && (
        <p className="text-sm font-medium mt-2">
          Total: {formatCurrency(totalPrice)}
        </p>
      )}
    </>
  );
};

export default ServiceSelection;
