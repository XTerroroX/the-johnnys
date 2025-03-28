
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, PhoneCall, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo & about */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-display font-bold">
                The Johnnys
              </span>
            </Link>
            <p className="text-slate-300 mb-6">
              Premium barber services offering classic cuts and modern styles in a refined atmosphere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/services" className="text-slate-300 hover:text-white transition-colors">Services</Link>
              </li>
              <li>
                <Link to="/booking" className="text-slate-300 hover:text-white transition-colors">Book Appointment</Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-300">
                <PhoneCall size={18} className="mr-2" />
                <span>(602) 944-2535</span>
              </li>
              <li className="flex items-start text-slate-300">
                <MapPin size={18} className="mr-2 mt-1" />
                <span>8917 N 19th Ave<br/>Phoenix, AZ 85021</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © {currentYear} The Johnnys. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-slate-400 text-sm hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-slate-400 text-sm hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
