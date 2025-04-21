import { useEffect } from 'react';
import { Scissors, Clock, Award, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-card p-6 h-full">
    <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
