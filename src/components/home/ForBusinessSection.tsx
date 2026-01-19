import { Utensils, Film, Calendar, Building2, ArrowRight, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const businessTypes = [
  {
    icon: Utensils,
    name: "Restaurants & Cafés",
    benefit: "Fill more tables with direct reservations",
  },
  {
    icon: Film,
    name: "Cinemas",
    benefit: "Sell tickets and showcase your program",
  },
  {
    icon: Calendar,
    name: "Event Organizers",
    benefit: "Reach the right audience for your events",
  },
  {
    icon: Building2,
    name: "Venues & Clubs",
    benefit: "Increase visibility in your city",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase visibility",
    description: "Get discovered by people actively looking for things to do",
  },
  {
    icon: Users,
    title: "Reach your audience",
    description: "Connect with locals, tourists, students, and expats",
  },
  {
    icon: BarChart3,
    title: "Analytics & insights",
    description: "Understand your audience and optimize your listings",
  },
];

const ForBusinessSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                For Businesses
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Grow your business with{" "}
                <span className="text-secondary">Ausly</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join hundreds of restaurants, cinemas, event organizers, and venues 
                already using Ausly to reach new customers.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => navigate("/contact")}
                size="lg"
                className="bg-gradient-to-r from-secondary to-primary hover:opacity-90 text-primary-foreground rounded-xl px-8"
              >
                List your place or event
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Right: Business Types Grid */}
            <div className="grid grid-cols-2 gap-4">
              {businessTypes.map((type, index) => (
                <div 
                  key={type.name}
                  className="glass-card p-5 rounded-xl border border-border/50 hover:border-secondary/30 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <type.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBusinessSection;
