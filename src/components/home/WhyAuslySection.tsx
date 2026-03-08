import { Globe, MapPin, Sparkles, Heart } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GlowOrb, DiagonalLines } from "@/components/decorative/FloatingShapes";

const reasons = [
  {
    icon: Globe,
    title: "Made for newcomers",
    description: "No more guessing which neighbourhood to explore or where locals actually go. We curate with context — for people still learning the city.",
    accent: "primary",
  },
  {
    icon: MapPin,
    title: "One place for everything",
    description: "Restaurants, events, nightlife, movies — stop switching between five apps and three WhatsApp groups. It's all here.",
    accent: "secondary",
  },
  {
    icon: Sparkles,
    title: "AI that gets you",
    description: "Tell us your vibe, budget, and city — our planner builds a full evening for you in seconds. No research needed.",
    accent: "primary",
  },
  {
    icon: Heart,
    title: "Community first",
    description: "Built by people who moved to Germany and know the feeling. Every feature exists because we needed it too.",
    accent: "secondary",
  },
];

const WhyAuslySection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Decorative elements */}
      <DiagonalLines className="inset-0" />
      <GlowOrb color="secondary" size={400} className="top-[-10%] left-[-10%]" />
      <GlowOrb color="primary" size={300} className="bottom-[-10%] right-[-5%]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-3xl mx-auto text-center mb-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-2xl md:text-4xl font-heading font-bold mb-4">
            Why people use <span className="gradient-text">Ausly</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We built Ausly for the woman standing outside a restaurant, wondering if this is actually the place.
            For the guy who just moved to Hamburg and doesn't know anyone yet.
            For anyone making a new city feel like home.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className={`group glass-card rounded-2xl p-7 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-neon-primary)] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              {/* Icon with animated ring */}
              <div className="relative w-12 h-12 mb-5">
                <div className={`w-12 h-12 rounded-xl bg-${reason.accent}/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <reason.icon className={`w-6 h-6 text-${reason.accent}`} />
                </div>
                <div className={`absolute inset-0 rounded-xl border border-${reason.accent}/20 scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500`} />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyAuslySection;
