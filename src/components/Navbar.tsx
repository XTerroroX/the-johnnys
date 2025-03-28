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
  const [isBarberOrAdmin, setIsBarberOrAdmin] = useState(false);
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
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setProfileData(data);
          if (data.role === 'barber' || data.role === 'superadmin') {
            setIsBarberOrAdmin(true);
          }
        }
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (data) {
            setProfileData(data);
            if (data.role === 'barber' || data.role === 'superadmin') {
              setIsBarberOrAdmin(true);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsBarberOrAdmin(false);
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
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Booking', path: '/booking' },
  ];

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm' : 'py-5 bg-transparent')}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-display font-bold whitespace-nowrap">
              The Johnnys
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn('navigation-link', location.pathname === item.path && 'active')}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {isBarberOrAdmin && (
                  <Link to={profileData?.role === 'superadmin' ? "/admin-dashboard" : "/barber-dashboard"}>
                    <Button variant="outline" size="sm">Admin Portal</Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage src={profileData?.image_url} alt={profileData?.name || ''} />
                    <AvatarFallback>{getInitials(profileData?.name || '')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{profileData?.name}</span>
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" /> Log In
                </Button>
              </Link>
            )}
            <Link to="/booking">
              <Button className="smooth-transition">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
