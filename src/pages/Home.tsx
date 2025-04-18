import { useEffect } from 'react';
import { Scissors, Clock, Award, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import { useServices } from '@/hooks/useServices';
import { formatCurrency } from '@/utils/bookingUtils';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-card p-6 h-full">
    <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Testimonial = ({ quote, author, role }: { quote: string, author: string, role: string }) => (
  <div className="glass-card p-6 h-full">
    <p className="italic text-lg mb-6">{quote}</p>
    <div>
      <p className="font-semibold">{author}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
    </div>
  </div>
);

const Home = () => {
  const { data: services = [], isLoading } = useServices();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get top 3 services by price (most premium services)
  const topServices = [...services]
    .filter(service => service.active)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        
        {/* Features Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="page-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="mb-4">Why Choose The Johnnys</h2>
              <p className="text-muted-foreground">
                We combine traditional barbering techniques with modern styles to deliver 
                a premium grooming experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={<Scissors className="h-6 w-6 text-primary" />}
                title="Expert Barbers"
                description="Our team consists of highly skilled barbers with years of experience in both classic and modern styles."
              />
              <FeatureCard 
                icon={<Clock className="h-6 w-6 text-primary" />}
                title="Efficient Service"
                description="Book online and enjoy efficient service with minimal waiting time."
              />
              <FeatureCard 
                icon={<Award className="h-6 w-6 text-primary" />}
                title="Premium Products"
                description="We use only the highest quality products for that perfect finish every time."
              />
              <FeatureCard 
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Personalized Style"
                description="We take the time to understand your preferences for a truly customized cut."
              />
            </div>
          </div>
        </section>
        
        {/* Popular Services Section */}
        <section className="py-20">
          <div className="page-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="mb-4">Our Popular Services</h2>
              <p className="text-muted-foreground">
                From classic cuts to modern styles, we offer a range of services 
                to keep you looking your best.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {isLoading ? (
                // Loading state - show placeholder cards
                Array(3).fill(0).map((_, index) => (
                  <div 
                    key={index} 
                    className="glass-card p-6 h-[400px] animate-pulse bg-slate-100 dark:bg-slate-800"
                  />
                ))
              ) : (
                topServices.map((service, index) => (
                  <ServiceCard 
                    key={service.id}
                    name={service.name}
                    price={formatCurrency(service.price)}
                    description={service.description || ''}
                    features={[
                      `${service.duration} minutes`,
                      ...(service.description ? [service.description] : [])
                    ]}
                    popular={index === 1} // Middle card marked as popular
                  />
                ))
              )}
            </div>
            
            <div className="text-center mt-12">
              <a href="/services" className="text-primary font-medium hover:underline">
                View All Services →
              </a>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="page-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="mb-4">What Our Clients Say</h2>
              <p className="text-muted-foreground">
                Don't just take our word for it. Here's what our customers have to say.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Testimonial 
                quote="The best haircut I've ever had. The attention to detail and the overall experience was top-notch."
                author="Michael Scott"
                role="Loyal Customer"
              />
              <Testimonial 
                quote="I've been going to The Johnnys for over a year now, and I've never been disappointed. Highly recommended!"
                author="James Wilson"
                role="Monthly Subscriber"
              />
              <Testimonial 
                quote="Not only was my haircut perfect, but the atmosphere and conversation made for an enjoyable experience."
                author="Robert Chen"
                role="First-time Customer"
              />
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="page-container text-center max-w-3xl mx-auto">
            <h2 className="mb-4">Ready for a Premium Barbering Experience?</h2>
            <p className="mb-8 text-primary-foreground/90">
              Book your appointment today and discover why our clients keep coming back.
            </p>
            <a href="/booking" className="inline-block bg-white text-primary font-medium px-8 py-3 rounded-md hover:bg-white/90 transition-colors">
              Book Your Appointment
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;
