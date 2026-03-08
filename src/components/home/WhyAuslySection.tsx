import { Globe, MapPin, Sparkles, Heart } from "lucide-react";

const reasons = [
  {
    icon: Globe,
    title: "Made for newcomers",
    description: "No more guessing which neighbourhood to explore or where locals actually go. We curate with context — for people still learning the city.",
  },
  {
    icon: MapPin,
    title: "One place for everything",
    description: "Restaurants, events, nightlife, movies — stop switching between five apps and three WhatsApp groups. It's all here.",
  },
  {
    icon: Sparkles,
    title: "AI that gets you",
    description: "Tell us your vibe, budget, and city — our planner builds a full evening for you in seconds. No research needed.",
  },
  {
    icon: Heart,
    title: "Community first",
    description: "Built by people who moved to Germany and know the feeling. Every feature exists because we needed it too.",
  },
];

const WhyAuslySection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-14">
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
              className="group glass-card rounded-2xl p-7 border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 mb-5 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <reason.icon className="w-6 h-6 text-primary" />
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
