import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface FinalCTASectionProps {
  selectedCity: string;
}

const FinalCTASection = ({ selectedCity }: FinalCTASectionProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/8 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">
            Your city. Your terms.
          </p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 leading-tight">
            The best way to know a city
            <br />
            is to <span className="gradient-text">live in it</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Start with dinner. End wherever the night takes you.
            {selectedCity && ` ${selectedCity} is waiting.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <Button
              asChild
              size="xl"
              variant="outline"
              className="rounded-xl font-bold"
            >
              <Link to="/signup">
                Create your free account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
