
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import BarberNotifications from '@/components/BarberNotifications';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [isBarber, setIsBarber] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check for current user
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Check if user is a barber and fetch profile data
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setProfileData(data);
          if (data.role === 'barber') {
            setIsBarber(true);
          }
        }
      }
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          
          // Check if user is a barber and fetch profile data
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (data) {
            setProfileData(data);
            if (data.role === 'barber') {
              setIsBarber(true);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsBarber(false);
          setProfileData(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
            {user ? (
              <>
                {isBarber && (
                  <BarberNotifications barberId={user.id} />
                )}
                <Link to={isBarber ? "/barber-dashboard" : "/admin-dashboard"} className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage src={profileData?.image_url} alt={profileData?.name || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(profileData?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="smooth-transition ml-2">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="smooth-transition">
                  <User className="w-4 h-4 mr-2" />
                  Log In
                </Button>
              </Link>
            )}
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
              {user ? (
                <>
                  {isBarber && (
                    <div className="py-2">
                      <BarberNotifications barberId={user.id} />
                    </div>
                  )}
                  <Link to={isBarber ? "/barber-dashboard" : "/admin-dashboard"} onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                    <Avatar className="h-8 w-8 border border-primary/20 mr-2">
                      <AvatarImage src={profileData?.image_url} alt={profileData?.name || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(profileData?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      className="w-full justify-center smooth-transition"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center smooth-transition"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                </Link>
              )}
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
