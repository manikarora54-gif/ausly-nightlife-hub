import { MapPin, Sparkles, Ticket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    step: "01",
    title: "Pick your city",
    description: "Berlin, Munich, Hamburg, Cologne — choose where you are and we'll show you what's around.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Explore or let AI plan",
    description: "Browse by category, search for something specific, or tell our AI planner your vibe and budget — it'll build the evening for you.",
  },
  {
    icon: Ticket,
    step: "03",
    title: "Save, share & go",
    description: "Bookmark your favourites, save itineraries, and head out — the city is yours tonight.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-4xl font-heading font-bold mb-3">
            From <span className="gradient-text">"I just moved here"</span> to <span className="gradient-text">"I know a place"</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three steps to stop wondering and start exploring.
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
