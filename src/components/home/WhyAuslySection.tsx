import { Zap, Clock, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "All-in-one",
    description: "Events, dining, movies & nightlife"
  },
  {
    icon: Clock,
    title: "Real-time",
    description: "Live availability & updates"
  },
  {
    icon: Shield,
    title: "Trusted",
    description: "Verified venues & reviews"
  },
  {
    icon: Smartphone,
    title: "Instant",
    description: "Book in seconds"
  }
];

const WhyAuslySection = () => {
  return (
    <section className="py-16 relative overflow-hidden bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold">
            Why <span className="gradient-text">Ausly</span>?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl glass-card border border-border/50 hover:border-primary/30 transition-all text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyAuslySection;
