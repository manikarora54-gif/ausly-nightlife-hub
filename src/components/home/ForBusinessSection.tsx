import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Users, label: "Reach thousands" },
  { icon: TrendingUp, label: "Grow bookings" },
  { icon: Star, label: "Build reputation" },
];

const ForBusinessSection = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12 border border-border/50">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
                <Building2 className="w-4 h-4" />
                For Business
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                List your venue or event
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <benefit.icon className="w-4 h-4 text-primary" />
                    {benefit.label}
                  </div>
                ))}
              </div>
              <Button asChild variant="secondary" size="lg" className="rounded-xl">
                <Link to="/contact">Get started free →</Link>
              </Button>
            </div>
            
            {/* Right side - visual */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBusinessSection;
