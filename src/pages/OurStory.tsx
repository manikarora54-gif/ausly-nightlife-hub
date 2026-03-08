import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Globe, Users, Sparkles, MapPin, ArrowRight, Rocket } from "lucide-react";

const values = [
  {
    icon: Globe,
    title: "Built by newcomers",
    text: "We moved to Germany not knowing where to eat, who to trust, or how to find our people. We built the tool we wish existed.",
  },
  {
    icon: Heart,
    title: "Empathy over algorithms",
    text: "Every recommendation, every feature, every word on this platform comes from real experience — not data scraped from a search engine.",
  },
  {
    icon: Users,
    title: "Community is everything",
    text: "Ausly isn't just a product. It's a shared space for people figuring out life in a new country — together.",
  },
  {
    icon: Sparkles,
    title: "Technology with soul",
    text: "Our AI doesn't just match keywords. It understands mood, budget, and the feeling of wanting a good night without the stress.",
  },
];

const milestones = [
  { label: "The idea", description: "A group of expats in Berlin tired of asking the same questions in WhatsApp groups." },
  { label: "First prototype", description: "A simple list of places we actually liked — shared with friends who just arrived." },
  { label: "Ausly is born", description: "What started as a list became a platform — restaurants, events, nightlife, movies, all in one place." },
  { label: "AI Planner", description: "We built an AI that plans your evening based on your vibe. No more decision fatigue." },
  { label: "Multi-city launch", description: "Berlin, Hamburg, München, Köln, Frankfurt, Düsseldorf — and growing." },
];

const OurStory = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Our Story – Ausly | Built by Newcomers, for Newcomers"
        description="Ausly was born from the experience of moving to Germany and not knowing where to go. We're building the platform we wish existed — for everyone making a new city feel like home."
      />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[160px] animate-float" />
            <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[140px] animate-float" style={{ animationDelay: "-3s" }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 text-primary text-sm font-medium mb-8"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.05))" }}
              >
                <Heart className="w-4 h-4" />
                Our Story
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-8 leading-[1.1] tracking-tight">
                <span className="text-foreground">We moved here.</span>
                <br />
                <span className="gradient-text">We figured it out.</span>
                <br />
                <span className="text-foreground">Now we're sharing it.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Ausly started with a simple frustration: moving to Germany and having no idea
                where to go, who to trust, or how to find your people. We built the answer.
              </p>
            </div>
          </div>
        </section>

        {/* The Origin */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="glass-card rounded-3xl p-8 md:p-12 border border-border/50">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-foreground">
                  The moment it started
                </h2>
                <div className="space-y-5 text-muted-foreground leading-relaxed">
                  <p>
                    Picture this: you just landed in a new city. Your German is basic at best. You're hungry,
                    you want to go out, but every Google result feels like it was written for tourists with
                    a guidebook and a bus pass.
                  </p>
                  <p>
                    You ask in a WhatsApp group. Someone sends a link that's expired. Another person
                    recommends a place that closed last month. A third says "just walk around Neukölln" —
                    helpful, thanks.
                  </p>
                  <p>
                    That was us. Standing outside restaurants wondering if they were actually good.
                    Missing events because we found out about them the next day. Spending more time
                    researching than actually <span className="text-foreground font-medium">living</span>.
                  </p>
                  <p className="text-foreground font-medium text-lg">
                    So we stopped waiting for someone else to solve it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Statement */}
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <blockquote className="text-2xl md:text-4xl font-heading font-bold leading-snug text-foreground">
                "We're not building another listings app.
                <br />
                <span className="gradient-text">We're building the friend who already knows the city.</span>"
              </blockquote>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-4xl font-heading font-bold mb-4">
                What drives <span className="gradient-text">Ausly</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every decision we make goes through one filter: does this help someone feel more at home?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {values.map((value, i) => (
                <div key={i} className="group glass-card rounded-2xl p-7 border border-border/50 hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 mb-5 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Timeline */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-b from-card/30 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
                <Rocket className="w-4 h-4" />
                The Journey
              </div>
              <h2 className="text-2xl md:text-4xl font-heading font-bold mb-4">
                How we got <span className="text-secondary">here</span>
              </h2>
            </div>

            <div className="relative max-w-3xl mx-auto">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent" />

              <div className="space-y-10">
                {milestones.map((item, index) => (
                  <div
                    key={index}
                    className={`relative flex items-start gap-6 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background mt-2" />
                    <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <div className={`inline-flex p-5 rounded-xl glass-card border border-border/50 hover:border-primary/30 transition-all ${
                        index % 2 === 0 ? "md:ml-auto" : ""
                      }`}>
                        <div>
                          <h3 className="font-heading font-semibold text-foreground mb-1">{item.label}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-heading font-bold mb-6">
                Who is Ausly <span className="gradient-text">for?</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>For the woman standing outside a restaurant, wondering if this is actually the place.</p>
                <p>For the guy who just moved to Hamburg and doesn't know anyone yet.</p>
                <p>For the couple looking for something to do on a Friday that isn't Netflix.</p>
                <p>For anyone who's ever opened Google Maps and thought — <span className="text-foreground font-medium">"now what?"</span></p>
              </div>
              <div className="mt-4">
                <p className="text-xl font-heading font-bold text-foreground">
                  Ausly is for anyone making a new city feel like home.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-10 md:p-14 border border-border/50">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl font-heading font-bold mb-4">
                Ready to explore?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Stop researching. Start living. Ausly shows you where to go — so you can focus on being there.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="xl">
                  <Link to="/discover">
                    Start exploring <ArrowRight className="w-5 h-5 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="hero-outline" size="xl">
                  <Link to="/signup">Create your free account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OurStory;
