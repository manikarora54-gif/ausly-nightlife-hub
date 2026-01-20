import { Button } from "@/components/ui/button";
import { Search, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FinalCTASectionProps {
  selectedCity: string;
}

const FinalCTASection = ({ selectedCity }: FinalCTASectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
            {selectedCity},{" "}
            <span className="gradient-text">happening now.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            Stop searching. Start experiencing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => navigate(`/discover?city=${selectedCity.toLowerCase()}`)}
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl px-8 py-6 h-auto text-lg font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] w-full sm:w-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore {selectedCity}
            </Button>
            
            <Button 
              onClick={() => navigate("/contact")}
              variant="outline"
              size="lg" 
              className="rounded-xl px-8 py-6 h-auto text-lg font-semibold border-2 border-muted-foreground/30 hover:border-secondary hover:bg-secondary/10 w-full sm:w-auto"
            >
              <Building2 className="w-5 h-5 mr-2" />
              List your place
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Venues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-1">7+</div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">∞</div>
              <div className="text-sm text-muted-foreground">Experiences</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
