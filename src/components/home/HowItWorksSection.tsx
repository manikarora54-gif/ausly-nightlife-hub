import { MapPin, Sliders, PartyPopper } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Wähle deine Stadt",
    description: "Berlin, München, Hamburg, Leipzig und mehr"
  },
  {
    number: "02",
    icon: Sliders,
    title: "Wähle deinen Vibe",
    description: "Techno, House, Jazz, Live-Musik, Bars oder Clubs"
  },
  {
    number: "03",
    icon: PartyPopper,
    title: "Geh raus",
    description: "Finde dein perfektes Event heute Nacht"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            So funktioniert's
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
            In <span className="text-accent">3 Schritten</span> zum perfekten Abend
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="text-center group">
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            📱 Funktioniert gleich in Berlin, München, Hamburg, Leipzig und mehr
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
