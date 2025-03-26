
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Booking', path: '/booking' },
  ];

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm' : 'py-5 bg-transparent'
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold">
              The Johnnys
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'navigation-link',
                  location.pathname === item.path && 'active'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm" className="smooth-transition">
                <User className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </Link>
            <Link to="/booking">
              <Button className="smooth-transition">Book Now</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden h-screen w-full bg-background animate-fade-in">
          <div className="container px-4 py-8 space-y-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'block text-lg font-medium',
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col space-y-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-center smooth-transition"
                >
                  <User className="w-4 h-4 mr-2" />
                  Log In
                </Button>
              </Link>
              <Link to="/booking" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center smooth-transition">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
