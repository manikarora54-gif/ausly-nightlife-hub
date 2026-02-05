import { MapPin, Sparkles, Ticket } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Pick your city",
    description: "Berlin, Munich, Hamburg & more"
  },
  {
    icon: Sparkles,
    title: "Discover",
    description: "Find events, dining & nightlife"
  },
  {
    icon: Ticket,
    title: "Book & Go",
    description: "Reserve instantly"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block w-12 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
