
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { formatCurrency } from '@/utils/bookingUtils';

const Services = () => {
  const { data: services = [], isLoading } = useServices();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Group services by category based on their name
  const categorizeServices = (service) => {
    const name = service.name.toLowerCase();
    if (name.includes('cut') || name.includes('fade')) return 'haircut';
    if (name.includes('beard') || name.includes('shave')) return 'beard';
    if (name.includes('color')) return 'coloring';
    return 'combo';
  };

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const category = categorizeServices(service);
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  const categories = Object.keys(servicesByCategory);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-24">
          <section className="bg-slate-950 text-white py-20">
            <div className="page-container text-center">
              <h1 className="mb-6">Our Services</h1>
              <div className="flex justify-center">
                <div className="w-6 h-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="bg-slate-950 text-white py-20">
          <div className="page-container text-center">
            <h1 className="mb-6">Our Services</h1>
            <p className="text-slate-300 max-w-3xl mx-auto text-lg">
              The Johnnys offers a range of premium barbering services tailored to your individual style and needs.
              Each service is performed by our expert barbers using high-quality products.
            </p>
          </div>
        </section>

        {/* Services Categories */}
        {categories.map((category) => (
          <section key={category} className="py-16" id={category}>
            <div className="page-container">
              <h2 className="mb-10 capitalize">
                {category === 'haircut' ? 'Haircuts' : 
                 category === 'beard' ? 'Beard Services' : 
                 category === 'combo' ? 'Combo Packages' : 
                 category === 'coloring' ? 'Hair Coloring' : category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {servicesByCategory[category].map(service => (
                  <ServiceCard
                    key={service.id}
                    name={service.name}
                    price={formatCurrency(service.price)}
                    description={service.description || ''}
                    features={[
                      `${service.duration} minutes`,
                      ...(service.description ? [service.description] : [])
                    ]}
                    popular={category === 'combo'}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="page-container text-center">
            <h2 className="mb-4">Ready to Book Your Service?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Our online booking system makes it easy to schedule your appointment with your preferred barber.
            </p>
            <Link to="/booking">
              <Button size="lg">Book Now</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Services;
