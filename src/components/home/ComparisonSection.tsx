import { Check, X, Instagram, MapIcon } from "lucide-react";

const comparisons = [
  {
    platform: "Instagram",
    icon: Instagram,
    issues: ["Chaotisch & unstrukturiert", "Kein Event-Fokus", "Schwer zu durchsuchen"]
  },
  {
    platform: "Google Maps",
    icon: MapIcon,
    issues: ["Nicht Nachtleben-fokussiert", "Keine Event-Infos", "Veraltete Daten"]
  },
  {
    platform: "Resident Advisor",
    icon: null,
    issues: ["Nur elektronische Musik", "Nur große Städte", "Internationale Ausrichtung"]
  }
];

const auslyFeatures = [
  "Stadt-fokussiert",
  "Echtzeit-Updates",
  "Kuratiert & gefiltert",
  "Deutschlandweit",
  "Alle Musik-Genres"
];

const ComparisonSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            Warum Ausly?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Der <span className="gradient-text">Unterschied</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Other Platforms */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-semibold text-muted-foreground mb-4">
              Andere Plattformen
            </h3>
            {comparisons.map((comp) => (
              <div 
                key={comp.platform}
                className="p-5 rounded-xl glass-card border border-border/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  {comp.icon && <comp.icon className="w-5 h-5 text-muted-foreground" />}
                  <span className="font-semibold text-foreground">{comp.platform}</span>
                </div>
                <ul className="space-y-2">
                  {comp.issues.map((issue) => (
                    <li key={issue} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-destructive flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Ausly */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">
              Ausly
            </h3>
            <div className="p-6 rounded-2xl glass-card border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">A</span>
                </div>
                <span className="text-xl font-heading font-bold gradient-text">Ausly</span>
              </div>
              <ul className="space-y-3">
                {auslyFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  🚀 <span className="text-primary font-medium">Ausly</span> — Die zentrale Plattform für Deutschlands Nachtleben
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
