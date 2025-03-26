
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Service data - in a real app, this would come from Supabase
const services = [
  {
    id: 1,
    name: "Classic Cut",
    price: "$35",
    description: "Traditional barbering techniques for a timeless look.",
    features: [
      "Consultation",
      "Shampoo & Conditioning",
      "Precision Haircut",
      "Hot Towel Finish"
    ],
    category: "haircut"
  },
  {
    id: 2,
    name: "Premium Experience",
    price: "$55",
    description: "Our signature service for the complete grooming experience.",
    features: [
      "Extended Consultation",
      "Premium Shampoo & Conditioning",
      "Precision Haircut",
      "Beard Trim",
      "Hot Towel & Facial Massage"
    ],
    popular: true,
    category: "combo"
  },
  {
    id: 3,
    name: "Beard Grooming",
    price: "$25",
    description: "Expert beard trimming and shaping for the perfect look.",
    features: [
      "Beard Consultation",
      "Precision Trimming",
      "Shape Design",
      "Beard Conditioning"
    ],
    category: "beard"
  },
  {
    id: 4,
    name: "Buzz Cut",
    price: "$25",
    description: "Quick and efficient all-over short cut with clippers.",
    features: [
      "Consultation",
      "Precision Clipper Work",
      "Even Length All Over",
      "Clean Edges"
    ],
    category: "haircut"
  },
  {
    id: 5,
    name: "Skin Fade",
    price: "$45",
    description: "Gradual fade from skin to your desired length on top.",
    features: [
      "Consultation",
      "Precision Fade Technique",
      "Styling for Top Length",
      "Edge Detailing"
    ],
    category: "haircut"
  },
  {
    id: 6,
    name: "Hot Towel Shave",
    price: "$35",
    description: "Traditional straight razor shave with hot towel preparation.",
    features: [
      "Hot Towel Preparation",
      "Pre-Shave Oil",
      "Straight Razor Shave",
      "After-Shave Treatment"
    ],
    category: "beard"
  },
  {
    id: 7,
    name: "Father & Son Package",
    price: "$75",
    description: "Quality time with matching haircuts for father and son.",
    features: [
      "Two Haircuts",
      "Styling for Both",
      "Complimentary Drinks",
      "10% Off Products"
    ],
    category: "combo"
  },
  {
    id: 8,
    name: "Hair Coloring",
    price: "$65+",
    description: "Professional color application for a refreshed look.",
    features: [
      "Color Consultation",
      "Professional Application",
      "Processing Time",
      "Styling"
    ],
    category: "coloring"
  },
  {
    id: 9,
    name: "Groom Package",
    price: "$120",
    description: "Complete preparation for the big day.",
    features: [
      "Premium Haircut",
      "Beard Styling",
      "Facial Treatment",
      "Glass of Whiskey"
    ],
    popular: true,
    category: "combo"
  }
];

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [...new Set(services.map(service => service.category))];

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
                {services
                  .filter(service => service.category === category)
                  .map(service => (
                    <ServiceCard
                      key={service.id}
                      name={service.name}
                      price={service.price}
                      description={service.description}
                      features={service.features}
                      popular={service.popular}
                    />
                  ))
                }
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
