import { TrendingUp, Brain, Ticket, BarChart3, Globe } from "lucide-react";

const visionItems = [
  {
    icon: TrendingUp,
    title: "Multi-Stadt Expansion",
    description: "Deutschlandweit verfügbar"
  },
  {
    icon: Brain,
    title: "KI-gesteuerte Personalisierung",
    description: "Empfehlungen basierend auf deinem Geschmack"
  },
  {
    icon: Ticket,
    title: "Ticketing & Reservierungen",
    description: "Alles in einer App"
  },
  {
    icon: BarChart3,
    title: "Analytics für Clubs",
    description: "Datengetriebene Insights"
  },
  {
    icon: Globe,
    title: "Europäische Expansion",
    description: "Nach dem Deutschland-Launch"
  }
];

const VisionSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            Vision & Roadmap
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Was kommt <span className="text-secondary">als Nächstes?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ausly wächst — mit mehr Features, mehr Städten und mehr Möglichkeiten.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent" />

          <div className="space-y-8">
            {visionItems.map((item, index) => (
              <div 
                key={item.title}
                className={`relative flex items-center gap-6 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                
                {/* Content */}
                <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className={`inline-flex p-5 rounded-xl glass-card border border-border/50 hover:border-primary/30 transition-all ${
                    index % 2 === 0 ? 'md:ml-auto' : ''
                  }`}>
                    <div className={`flex items-start gap-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className={index % 2 === 0 ? 'md:text-right' : ''}>
                        <h3 className="font-heading font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Empty space for alternating layout */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
