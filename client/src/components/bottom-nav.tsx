import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Package, 
  MapPin, 
  BarChart3, 
  Settings 
} from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/locations", icon: MapPin, label: "Locations" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-card border-t border-border">
      <div className="grid grid-cols-5 px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Button
            key={path}
            variant="ghost"
            onClick={() => setLocation(path)}
            className={`flex flex-col items-center justify-center p-3 touch-target smooth-transition ${
              isActive(path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
