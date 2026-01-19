import { AlertCircle, MessageCircle, Search, Users } from "lucide-react";

const problems = [
  {
    icon: Search,
    title: "Überall verstreut",
    description: "Events sind auf Instagram, Google, Flyern & Gruppenchats verteilt"
  },
  {
    icon: AlertCircle,
    title: "Keine zentrale Plattform",
    description: "Keine einzelne Quelle für das, was heute Nacht passiert"
  },
  {
    icon: Users,
    title: "Verpassen von Erlebnissen",
    description: "Touristen, Studenten & Neuankömmlinge verpassen das Beste"
  }
];

const ProblemSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            Das Problem
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Nightlife-Entdeckung ist{" "}
            <span className="text-secondary">fragmentiert</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Es gibt keine einfache Möglichkeit herauszufinden, was heute Nacht in deiner Stadt passiert.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div 
              key={problem.title}
              className="group p-6 rounded-2xl glass-card border border-secondary/20 hover:border-secondary/40 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <problem.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">
                {problem.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
