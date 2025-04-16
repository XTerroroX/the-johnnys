
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  UserPlus, 
  Settings, 
  LogOut, 
  Scissors, 
  Calendar,
  User 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 pt-[var(--navbar-height)] bg-sidebar-background border-r border-sidebar-border">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-3 space-y-1">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("dashboard")}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "services" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("services")}
          >
            <Scissors className="mr-2 h-5 w-5" />
            Services
          </Button>
          <Button
            variant={activeTab === "barbers" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("barbers")}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Barbers
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("bookings")}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Bookings
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("profile")}
          >
            <User className="mr-2 h-5 w-5" />
            My Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </nav>
      </div>
    </aside>
  );
}
