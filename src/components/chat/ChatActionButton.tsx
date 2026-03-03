import { useNavigate } from "react-router-dom";
import { MapPin, Ticket, Eye, Compass, Map, LogIn, UserPlus } from "lucide-react";

interface ActionButtonProps {
  type: string;
  param1: string;
  param2: string;
  label: string;
}

export default function ChatActionButton({ type, param1, param2, label }: ActionButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    switch (type) {
      case "VENUE":
        navigate(`/venue/${param1}`);
        break;
      case "EVENT":
        navigate(`/event/${param1}`);
        break;
      case "BOOK_VENUE":
        navigate(`/booking?bookingType=venue&venueName=${encodeURIComponent(param2)}&venueId=${param1}`);
        break;
      case "BOOK_EVENT":
        navigate(`/booking?bookingType=event&eventName=${encodeURIComponent(param2)}&eventId=${param1}`);
        break;
      case "DISCOVER":
        navigate(`/discover?type=${param1}`);
        break;
      case "MAP":
        navigate("/map");
        break;
      case "CITY":
        navigate(`/discover?city=${param1}`);
        break;
      case "SIGNIN":
        navigate("/signin");
        break;
      case "SIGNUP":
        navigate("/signup");
        break;
      default:
        break;
    }
  };

  const isAuth = type === "SIGNIN" || type === "SIGNUP";

  const icon = (() => {
    switch (type) {
      case "VENUE": return <Eye className="w-3 h-3" />;
      case "EVENT": return <Eye className="w-3 h-3" />;
      case "BOOK_VENUE":
      case "BOOK_EVENT": return <Ticket className="w-3 h-3" />;
      case "DISCOVER": return <Compass className="w-3 h-3" />;
      case "MAP": return <Map className="w-3 h-3" />;
      case "CITY": return <MapPin className="w-3 h-3" />;
      case "SIGNIN": return <LogIn className="w-3 h-3" />;
      case "SIGNUP": return <UserPlus className="w-3 h-3" />;
      default: return null;
    }
  })();

  const isBooking = type.startsWith("BOOK");

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors mr-1 mb-1 ${
        isBooking || isAuth
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted hover:bg-muted/80 text-foreground border border-border"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
