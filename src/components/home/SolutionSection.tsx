import { MapPin, Music, Zap, Brain, CheckCircle } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Stadt-basierte Entdeckung",
    description: "Sieh sofort, was in deiner Stadt passiert"
  },
  {
    icon: Music,
    title: "Kuratiertes Nachtleben",
    description: "Clubs, DJs, Partys & Events — gefiltert, nicht überflutet"
  },
  {
    icon: Zap,
    title: "Heute zuerst",
    description: "Echtzeit-Nachtleben, keine veralteten Einträge"
  },
  {
    icon: Brain,
    title: "Smarte Empfehlungen",
    description: "Entdecke Events, die zu deinem Vibe passen"
  }
];

const SolutionSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Die Lösung
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Ein Nachtleben-Portal für{" "}
            <span className="gradient-text">jede Stadt</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ausly verbindet das Nachtleben in ganz Deutschland auf einer Plattform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group relative p-6 rounded-2xl glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
