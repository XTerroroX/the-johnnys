
import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function MobileNavigation({ activeTab, onTabChange, onLogout }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { id: "appointments", label: "Appointments", icon: "Calendar" },
    { id: "services", label: "My Services", icon: "Settings" }, // Updated label
    { id: "profile", label: "My Profile", icon: "User" },
    { id: "blocked-times", label: "Time Off", icon: "Clock" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden fixed right-4 bottom-4 z-50 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] pt-16">
        <nav className="flex flex-col gap-4">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-lg",
                activeTab === item.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                onTabChange(item.id);
                setIsOpen(false);
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-lg text-destructive hover:text-destructive"
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
          >
            Logout
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
