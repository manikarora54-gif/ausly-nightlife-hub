import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showBack?: boolean;
  onBack?: () => void;
}

const routeLabels: Record<string, string> = {
  "": "Home",
  "discover": "Discover",
  "venue": "Venue",
  "event": "Event",
  "map": "Map",
  "plan": "Plan Your Night",
  "movies": "Movies",
  "movie": "Movie Details",
  "booking": "Booking",
  "cinemas": "Cinemas",
  "signin": "Sign In",
  "signup": "Sign Up",
  "help": "Help Center",
  "contact": "Contact",
  "privacy": "Privacy Policy",
  "terms": "Terms of Service",
  "vendor": "Vendor Dashboard",
  "admin": "Admin",
};

const Breadcrumbs = ({ items, showBack = true, onBack }: BreadcrumbsProps) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
    
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      // Skip UUID-like segments or numeric IDs in label
      const isId = /^[0-9a-f-]{36}$/.test(segment) || /^\d+$/.test(segment) || segment.startsWith("st");
      const label = isId ? "Details" : (routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1));
      
      breadcrumbs.push({
        label,
        href: index < pathSegments.length - 1 ? currentPath : undefined,
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex items-center gap-4 py-4">
      {showBack && breadcrumbItems.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      )}
      
      <nav className="flex items-center gap-1 text-sm overflow-x-auto">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1 flex-shrink-0">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            {index === 0 && (
              <Home className="w-4 h-4 text-muted-foreground mr-1" />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Breadcrumbs;
