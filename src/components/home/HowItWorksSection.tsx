import { MapPin, Sparkles, Ticket, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GridPattern, GlowOrb, FloatingParticles } from "@/components/decorative/FloatingShapes";

const steps = [
  {
    icon: MapPin,
    step: "01",
    title: "Pick your city",
    description: "Berlin, Munich, Hamburg, Cologne — choose where you are and we'll show you what's around.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Explore or let AI plan",
    description: "Browse by category, search for something specific, or tell our AI planner your vibe and budget — it'll build the evening for you.",
    color: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Ticket,
    step: "03",
    title: "Save, share & go",
    description: "Bookmark your favourites, save itineraries, and head out — the city is yours tonight.",
    color: "from-accent/20 to-accent/5",
  },
];

const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-20 relative overflow-hidden bg-card/30">
      {/* Decorative background */}
      <GridPattern />
      <FloatingParticles count={8} />
      <GlowOrb color="primary" size={350} className="top-[-10%] right-[-5%]" />
      <GlowOrb color="accent" size={200} className="bottom-[-5%] left-[10%]" />

      {/* Connecting line behind steps */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-2xl md:text-4xl font-heading font-bold mb-3">
            From <span className="gradient-text">"I just moved here"</span> to <span className="gradient-text">"I know a place"</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three steps to stop wondering and start exploring.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative group transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="glass-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all h-full text-center md:text-left group-hover:shadow-[var(--shadow-neon-primary)] group-hover:-translate-y-1">
                {/* Step number with glow */}
                <div className="relative inline-block mb-4">
                  <div className="text-4xl font-heading font-bold text-primary/20">
                    {step.step}
                  </div>
                  <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className={`w-14 h-14 mx-auto md:mx-0 mb-5 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
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
                <div className="hidden md:flex absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background border border-border items-center justify-center group-hover:border-primary/50 transition-colors">
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
