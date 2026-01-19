import { MapPin } from "lucide-react";

const cities = [
  { name: "Berlin", position: { top: "30%", left: "75%" }, active: true },
  { name: "Hamburg", position: { top: "18%", left: "55%" }, active: true },
  { name: "München", position: { top: "78%", left: "65%" }, active: true },
  { name: "Köln", position: { top: "48%", left: "30%" }, active: true },
  { name: "Frankfurt", position: { top: "55%", left: "45%" }, active: true },
  { name: "Leipzig", position: { top: "40%", left: "68%" }, active: true },
  { name: "Dresden", position: { top: "42%", left: "78%" }, active: false },
  { name: "Stuttgart", position: { top: "68%", left: "48%" }, active: false },
  { name: "Düsseldorf", position: { top: "45%", left: "32%" }, active: false },
  { name: "Hannover", position: { top: "32%", left: "52%" }, active: false },
];

const GermanyMapSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            🇩🇪 Made in Germany
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Gebaut für Deutschlands <span className="text-accent">Nachtleben</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Von Berlin bis München, Hamburg bis Köln — Ausly verbindet das Nachtleben in deutschen Städten.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Stylized Germany Map */}
          <div className="relative aspect-[4/5] max-w-lg mx-auto">
            {/* Map Background Shape */}
            <div className="absolute inset-0 rounded-3xl glass-card border border-primary/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
              
              {/* Germany outline (simplified SVG shape) */}
              <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full p-8 opacity-20">
                <path
                  d="M45 5 L55 8 L65 5 L75 15 L80 25 L85 35 L82 45 L78 55 L75 65 L70 75 L65 85 L55 95 L45 100 L35 95 L25 90 L20 80 L18 70 L15 60 L18 50 L22 40 L25 30 L30 20 L35 10 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-primary"
                />
              </svg>
              
              {/* City Dots */}
              {cities.map((city) => (
                <div
                  key={city.name}
                  className="absolute group cursor-pointer"
                  style={{ top: city.position.top, left: city.position.left }}
                >
                  <div className={`relative flex items-center justify-center`}>
                    {city.active && (
                      <div className="absolute w-8 h-8 rounded-full bg-primary/30 animate-ping" />
                    )}
                    <div className={`relative w-4 h-4 rounded-full flex items-center justify-center ${
                      city.active 
                        ? 'bg-primary shadow-lg shadow-primary/50' 
                        : 'bg-muted-foreground/50'
                    }`}>
                      <MapPin className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  </div>
                  <span className={`absolute left-1/2 -translate-x-1/2 mt-1 text-xs font-medium whitespace-nowrap ${
                    city.active ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {city.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Aktiv</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">Coming Soon</span>
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            🚀 Starten Stadt für Stadt — Mehr Städte kommen bald
          </p>
        </div>
      </div>
    </section>
  );
};

export default GermanyMapSection;
