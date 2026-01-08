import { Sparkles, Clock, Users, Utensils, Music, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PlanNightSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI-Powered Planning</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
                Let AI Plan Your{" "}
                <span className="gradient-text">Perfect Night</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                Tell us your preferences, and our AI will craft a personalized itinerary 
                with the best restaurants, bars, and events tailored just for you.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Time Optimized</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-sm font-medium">Group Friendly</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium">Cuisine Match</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Vibe Selection</span>
                </div>
              </div>

              <Button variant="neon" size="xl" asChild>
                <Link to="/plan">
                  Start Planning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Visual */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="glass-card p-6 space-y-4">
                {/* Mock Itinerary Preview */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Your Berlin Night Plan
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                        1
                      </div>
                      <div className="w-0.5 h-full bg-border mt-2" />
                    </div>
                    <div className="glass-card p-4 flex-1">
                      <div className="text-xs text-primary mb-1">19:00</div>
                      <div className="font-semibold">Dinner at Nobelhart & Schmutzig</div>
                      <div className="text-sm text-muted-foreground">Modern German • Kreuzberg</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-sm font-bold">
                        2
                      </div>
                      <div className="w-0.5 h-full bg-border mt-2" />
                    </div>
                    <div className="glass-card p-4 flex-1">
                      <div className="text-xs text-secondary mb-1">21:30</div>
                      <div className="font-semibold">Cocktails at Buck & Breck</div>
                      <div className="text-sm text-muted-foreground">Speakeasy • Mitte</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
                        3
                      </div>
                    </div>
                    <div className="glass-card p-4 flex-1">
                      <div className="text-xs text-accent mb-1">23:00</div>
                      <div className="font-semibold">Dancing at Watergate</div>
                      <div className="text-sm text-muted-foreground">Club • Kreuzberg</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanNightSection;
