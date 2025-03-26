
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  className?: string;
}

const ServiceCard = ({ 
  name, 
  price, 
  description, 
  features, 
  popular = false,
  className 
}: ServiceCardProps) => {
  return (
    <div 
      className={cn(
        'glass-card p-6 transition-transform duration-300 hover:translate-y-[-8px]',
        popular ? 'border-primary/30 ring-1 ring-primary/20' : '',
        className
      )}
    >
      {popular && (
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-display font-bold mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-primary mr-2 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link to="/booking" className="block">
        <Button className="w-full" variant={popular ? "default" : "outline"}>
          Book Now
        </Button>
      </Link>
    </div>
  );
};

export default ServiceCard;
