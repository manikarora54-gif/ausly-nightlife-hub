import { Star } from "lucide-react";

const CinemaCard = ({ cinema }: { cinema: any }) => {
  return (
    <div className="group block rounded-xl shadow-lg bg-card p-4 relative h-full">
      <div className="font-bold text-lg mb-1">{cinema.name}</div>
      <div className="text-sm text-muted-foreground mb-2">{cinema.address}</div>
      <div className="flex items-center gap-1 text-yellow-500 mb-1">
        <Star className="w-4 h-4" />
        {cinema.rating ?? "--"}
      </div>
      <div className="text-xs text-muted-foreground">{cinema.city}</div>
    </div>
  );
};

export default CinemaCard;
