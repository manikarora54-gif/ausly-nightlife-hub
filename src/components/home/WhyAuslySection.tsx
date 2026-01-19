import { Check, Layers, Zap, Calendar, Smartphone } from "lucide-react";

const benefits = [
  {
    icon: Layers,
    title: "One platform for everything",
    description: "No more switching between Google, Instagram, booking sites, and apps. Ausly brings it all together.",
  },
  {
    icon: Zap,
    title: "Real-time discovery",
    description: "See what's actually happening now — not outdated listings or past events.",
  },
  {
    icon: Calendar,
    title: "Easy booking & reservations",
    description: "Book tables, get tickets, and make reservations directly from one place.",
  },
  {
    icon: Smartphone,
    title: "Designed for everyday use",
    description: "Whether it's a quick lunch or a big night out, Ausly is your go-to before making plans.",
  },
];

const comparisons = [
  { platform: "Google", issue: "Not focused on what's happening now" },
  { platform: "Instagram", issue: "Chaotic, no structure, hard to search" },
  { platform: "Multiple booking sites", issue: "Scattered across many apps" },
  { platform: "Word of mouth", issue: "You miss out on hidden gems" },
];

const WhyAuslySection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-card/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left: Why Ausly */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Why Ausly?
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
              Better than using{" "}
              <span className="gradient-text">multiple apps</span>
            </h2>

            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Comparison */}
          <div className="flex flex-col justify-center">
            <div className="glass-card rounded-2xl p-6 border border-border/50">
              <h3 className="font-heading font-semibold text-lg mb-6 text-muted-foreground">
                The old way
              </h3>
              <div className="space-y-4 mb-8">
                {comparisons.map((comp) => (
                  <div key={comp.platform} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive text-xs">✕</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{comp.platform}</span>
                      <span className="text-muted-foreground"> — {comp.issue}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-heading font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  The Ausly way
                </h3>
                <p className="text-foreground">
                  One platform. Real-time discovery. Easy booking.
                  <br />
                  <span className="text-primary font-medium">Your city, simplified.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyAuslySection;
