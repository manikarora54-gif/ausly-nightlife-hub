import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";
import logo from "@/assets/ausly-logo.png";

const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-neon flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Ausly logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-xl font-heading font-bold gradient-text">
                Ausly
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your ultimate guide to nightlife, restaurants, and unforgettable experiences across Germany.
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
              <a 
                href="https://facebook.com/ausly" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Discover</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/discover?type=restaurants" className="text-muted-foreground hover:text-primary transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/discover?type=bars" className="text-muted-foreground hover:text-primary transition-colors">
                  Bars & Clubs
                </Link>
              </li>
              <li>
                <Link to="/discover?type=events" className="text-muted-foreground hover:text-primary transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/discover?type=experiences" className="text-muted-foreground hover:text-primary transition-colors">
                  Experiences
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Popular Cities</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/discover?city=berlin" className="text-muted-foreground hover:text-primary transition-colors">
                  Berlin
                </Link>
              </li>
              <li>
                <Link to="/discover?city=munich" className="text-muted-foreground hover:text-primary transition-colors">
                  Munich
                </Link>
              </li>
              <li>
                <Link to="/discover?city=hamburg" className="text-muted-foreground hover:text-primary transition-colors">
                  Hamburg
                </Link>
              </li>
              <li>
                <Link to="/discover?city=frankfurt" className="text-muted-foreground hover:text-primary transition-colors">
                  Frankfurt
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Ausly. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <a href="mailto:hello@ausly.de" className="hover:text-primary transition-colors">
              hello@ausly.de
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;