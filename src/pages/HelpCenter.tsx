import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  HelpCircle, 
  MapPin, 
  Calendar, 
  CreditCard, 
  User, 
  Settings,
  ChevronRight,
  MessageCircle,
  Mail
} from "lucide-react";

const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: HelpCircle,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click on 'Get Started' in the navigation bar, fill in your details, and verify your email address. You can also sign up using Google or GitHub for faster registration."
      },
      {
        q: "Is Ausly free to use?",
        a: "Yes! Ausly is completely free to browse venues, events, and create your nightlife plans. Some premium features may be available for subscribers."
      },
      {
        q: "Which cities does Ausly cover?",
        a: "We currently cover major German cities including Berlin, Munich, Hamburg, Frankfurt, Cologne, and Düsseldorf. We're constantly expanding to more cities!"
      }
    ]
  },
  {
    id: "venues",
    title: "Venues & Events",
    icon: MapPin,
    questions: [
      {
        q: "How do I find venues near me?",
        a: "Use the Discover page to filter venues by type (restaurants, bars, clubs), location, and other preferences. You can also use the Map view to see venues visually."
      },
      {
        q: "Can I book a table through Ausly?",
        a: "Currently, we provide venue information and links to their booking systems. Direct booking integration is coming soon!"
      },
      {
        q: "How often is venue information updated?",
        a: "We update venue information regularly, including hours, menus, and special events. If you notice outdated information, please contact us."
      }
    ]
  },
  {
    id: "planning",
    title: "Planning Your Night",
    icon: Calendar,
    questions: [
      {
        q: "How does the AI night planning work?",
        a: "Our AI planner asks about your preferences (city, vibe, budget, group size, date) and generates a personalized itinerary with recommended venues and timing."
      },
      {
        q: "Can I customize my generated plan?",
        a: "Yes! After generating a plan, you can modify venues, times, and activities to better suit your needs."
      },
      {
        q: "Can I save my plans?",
        a: "Yes, once you create an account, you can save multiple plans and access them anytime from your profile."
      }
    ]
  },
  {
    id: "account",
    title: "Account & Billing",
    icon: User,
    questions: [
      {
        q: "How do I reset my password?",
        a: "Click 'Sign In' and then 'Forgot password?' Enter your email address and follow the instructions sent to your inbox."
      },
      {
        q: "Can I delete my account?",
        a: "Yes, you can delete your account from the Settings page. This will permanently remove all your data and saved plans."
      },
      {
        q: "Do you offer premium subscriptions?",
        a: "We're working on premium features! Stay tuned for early access to advanced planning tools and exclusive venue partnerships."
      }
    ]
  }
];

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredCategories = faqCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.questions.some(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
              How can we <span className="gradient-text">help you?</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers to common questions or contact our support team
            </p>
            
            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-3 hover:border-primary"
              onClick={() => navigate("/contact")}
            >
              <MessageCircle className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="font-semibold mb-1">Contact Support</div>
                <div className="text-sm text-muted-foreground">
                  Get in touch with our team
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-3 hover:border-primary"
              onClick={() => window.open("mailto:hello@ausly.de", "_blank")}
            >
              <Mail className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="font-semibold mb-1">Email Us</div>
                <div className="text-sm text-muted-foreground">
                  hello@ausly.de
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-3 hover:border-primary"
            >
              <Settings className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="font-semibold mb-1">Live Chat</div>
                <div className="text-sm text-muted-foreground">
                  Coming soon
                </div>
              </div>
            </Button>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found. Try a different search term.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <category.icon className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-heading font-semibold">{category.title}</h2>
                    </div>
                    <div className="space-y-3">
                      {category.questions.map((faq, index) => {
                        const questionId = `${category.id}-${index}`;
                        const isExpanded = expandedQuestion === questionId;
                        return (
                          <div key={index} className="border border-border rounded-lg overflow-hidden">
                            <button
                              onClick={() => setExpandedQuestion(isExpanded ? null : questionId)}
                              className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                            >
                              <span className="font-medium pr-4">{faq.q}</span>
                              <ChevronRight
                                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                  isExpanded ? "transform rotate-90" : ""
                                }`}
                              />
                            </button>
                            {isExpanded && (
                              <div className="p-4 pt-0 text-muted-foreground animate-fade-in">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Still Need Help */}
          <div className="max-w-2xl mx-auto mt-12 glass-card p-8 text-center">
            <h3 className="text-2xl font-heading font-semibold mb-3">
              Still need help?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="neon" onClick={() => navigate("/contact")}>
                Contact Support
              </Button>
              <Button variant="outline" onClick={() => window.open("mailto:hello@ausly.de", "_blank")}>
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
