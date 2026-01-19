import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/ausly-logo-neon.png";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Danke! Du bist jetzt auf unserer Liste.");
      setEmail("");
    }
  };

  return (
    <footer className="bg-card/50 border-t border-border/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="max-w-xl mx-auto text-center mb-12 pb-12 border-b border-border/30">
          <h3 className="text-xl font-heading font-bold mb-2">
            Bleib auf dem Laufenden
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Erhalte Early Access zu neuen Features und Cities
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-border/50"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Anmelden
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img src={logo} alt="Ausly logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-heading font-bold gradient-text">
                Ausly
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Dein Nachtleben-Guide für ganz Deutschland. Entdecke Clubs, Events und unvergessliche Erlebnisse.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/ausly" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/ausly" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Entdecken */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Entdecken</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/discover?type=club" className="text-muted-foreground hover:text-primary transition-colors">
                  Clubs
                </Link>
              </li>
              <li>
                <Link to="/discover?type=bar" className="text-muted-foreground hover:text-primary transition-colors">
                  Bars
                </Link>
              </li>
              <li>
                <Link to="/discover?type=events" className="text-muted-foreground hover:text-primary transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/discover?type=restaurant" className="text-muted-foreground hover:text-primary transition-colors">
                  Restaurants
                </Link>
              </li>
            </ul>
          </div>

          {/* Städte */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Städte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/discover?city=berlin" className="text-muted-foreground hover:text-primary transition-colors">
                  Berlin
                </Link>
              </li>
              <li>
                <Link to="/discover?city=hamburg" className="text-muted-foreground hover:text-primary transition-colors">
                  Hamburg
                </Link>
              </li>
              <li>
                <Link to="/discover?city=munich" className="text-muted-foreground hover:text-primary transition-colors">
                  München
                </Link>
              </li>
              <li>
                <Link to="/discover?city=cologne" className="text-muted-foreground hover:text-primary transition-colors">
                  Köln
                </Link>
              </li>
            </ul>
          </div>

          {/* Über uns */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Über Ausly</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Datenschutz (DSGVO)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Hilfe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-secondary fill-secondary" /> in Germany 🇩🇪
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 Ausly. Alle Rechte vorbehalten.</span>
            <a href="mailto:hello@ausly.de" className="hover:text-primary transition-colors flex items-center gap-1">
              <Mail className="w-4 h-4" />
              hello@ausly.de
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
