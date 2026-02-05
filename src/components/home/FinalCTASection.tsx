import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface FinalCTASectionProps {
  selectedCity: string;
}

const FinalCTASection = ({ selectedCity }: FinalCTASectionProps) => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            {selectedCity}, <span className="gradient-text">happening now</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Don't miss out on what's happening in your city
          </p>
          <Button 
            asChild 
            size="xl" 
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
          >
            <Link to={`/discover?city=${selectedCity.toLowerCase()}`}>
              <Sparkles className="w-5 h-5 mr-2" />
              Explore {selectedCity}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
