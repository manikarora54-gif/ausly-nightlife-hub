import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Users, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GlowOrb } from "@/components/decorative/FloatingShapes";

const benefits = [
  { icon: Users, label: "Reach expats & locals" },
  { icon: TrendingUp, label: "Grow your visibility" },
  { icon: Star, label: "Build trust with reviews" },
];

const ForBusinessSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 relative overflow-hidden">
      <GlowOrb color="secondary" size={350} className="top-[-20%] right-[20%]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12 border border-border/50 hover:border-secondary/20 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
                <Building2 className="w-4 h-4" />
                For Venues & Organisers
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                Be the place people discover
              </h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Thousands of newcomers are looking for their next favourite spot. List your venue or event and get in front of people who are actively exploring.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <benefit.icon className="w-4 h-4 text-primary" />
                    {benefit.label}
                  </div>
                ))}
              </div>
              <Button asChild variant="secondary" size="lg" className="rounded-xl group">
                <Link to="/contact">
                  List your business
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            
            {/* Right side - visual with animated rings */}
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center group">
                <Building2 className="w-16 h-16 text-secondary" />
              </div>
              {/* Animated decorative rings */}
              <div className="absolute -inset-4 rounded-3xl border border-secondary/10 animate-pulse-glow" />
              <div className="absolute -inset-8 rounded-3xl border border-secondary/5" />
              {/* Floating stats */}
              <div className="absolute -top-3 -right-3 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg">
                10K+
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBusinessSection;
