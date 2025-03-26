
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?q=80&w=1470&auto=format&fit=crop')", 
          filter: "brightness(0.5)"
        }}
      />

      {/* Content */}
      <div className="relative z-10 page-container">
        <div className="max-w-3xl">
          <h1 className="text-white mb-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Premium Barber Experience
          </h1>
          <p className="text-slate-200 text-xl mb-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
            The Johnnys offers exceptional grooming services with skilled barbers who are masters of both classic and modern techniques.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <Link to="/booking">
              <Button size="lg" className="w-full sm:w-auto">
                Book Appointment
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Services
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-white text-sm mb-2">Scroll Down</span>
        <ChevronRight className="h-6 w-6 text-white transform rotate-90" />
      </div>
    </section>
  );
};

export default Hero;
