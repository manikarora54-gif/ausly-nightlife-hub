import { MapPin, Sparkles, Ticket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    step: "01",
    title: "Pick your city",
    description: "Choose from Berlin, Munich, Hamburg, Cologne, Frankfurt & more across Germany.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Discover & explore",
    description: "Browse events, restaurants, nightlife, movies — or let AI plan your perfect night.",
  },
  {
    icon: Ticket,
    step: "03",
    title: "Book & go",
    description: "Reserve tables, buy tickets, and get directions — all in one tap.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-4xl font-heading font-bold mb-3">
            How <span className="gradient-text">Ausly</span> works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            From choosing your city to booking your night — it takes less than a minute.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="glass-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all h-full text-center md:text-left">
                <div className="text-4xl font-heading font-bold text-primary/20 mb-4">
                  {step.step}
                </div>
                <div className="w-14 h-14 mx-auto md:mx-0 mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background border border-border items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
