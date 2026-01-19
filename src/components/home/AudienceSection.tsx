import { Users, GraduationCap, Globe, Plane, Building2, Megaphone } from "lucide-react";

const audiences = [
  {
    icon: Users,
    title: "Locals",
    description: "Entdecke versteckte Perlen in deiner eigenen Stadt"
  },
  {
    icon: GraduationCap,
    title: "Studenten",
    description: "Die besten Studentenpartys und Rabatte"
  },
  {
    icon: Globe,
    title: "Expats",
    description: "Finde Anschluss an die lokale Szene"
  },
  {
    icon: Plane,
    title: "Touristen",
    description: "Erlebe echtes deutsches Nachtleben"
  }
];

const forClubs = [
  {
    icon: Building2,
    title: "Mehr Sichtbarkeit",
    description: "Erreiche neue Gäste in deiner Stadt"
  },
  {
    icon: Megaphone,
    title: "Zielgruppen-Marketing",
    description: "Sprich die richtige Crowd an"
  }
];

const AudienceSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            Für wen?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
            Ausly ist für <span className="text-secondary">alle</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* For Nightgoers */}
          <div>
            <h3 className="text-xl font-heading font-semibold mb-6 text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Für Nachtschwärmer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {audiences.map((audience) => (
                <div 
                  key={audience.title}
                  className="p-5 rounded-xl glass-card border border-border/50 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <audience.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{audience.title}</h4>
                      <p className="text-sm text-muted-foreground">{audience.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Clubs & Organizers */}
          <div>
            <h3 className="text-xl font-heading font-semibold mb-6 text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Für Clubs & Veranstalter
            </h3>
            <div className="space-y-4">
              {forClubs.map((item) => (
                <div 
                  key={item.title}
                  className="p-5 rounded-xl glass-card border border-border/50 hover:border-secondary/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-5 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
                <p className="text-sm text-muted-foreground">
                  <span className="text-secondary font-semibold">Coming Soon:</span> Ticketing, Reservierungen & Analytics für dein Venue
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
