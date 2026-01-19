import { Calendar, Film, Utensils, Music, Theater, Dumbbell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: "events",
    name: "Events & Festivals",
    description: "Concerts, festivals, and special happenings",
    icon: Calendar,
    color: "primary",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop",
    link: "/discover?type=events",
  },
  {
    id: "movies",
    name: "Movies & Cinema",
    description: "Latest films and cinema experiences",
    icon: Film,
    color: "secondary",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
    link: "/movies",
  },
  {
    id: "restaurants",
    name: "Restaurants & Cafés",
    description: "Dining, brunch spots, and coffee",
    icon: Utensils,
    color: "accent",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    link: "/discover?type=restaurant",
  },
  {
    id: "nightlife",
    name: "Concerts & Nightlife",
    description: "Clubs, bars, and live music",
    icon: Music,
    color: "primary",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop",
    link: "/discover?type=club",
  },
  {
    id: "culture",
    name: "Culture & Theatre",
    description: "Museums, theatre, and exhibitions",
    icon: Theater,
    color: "secondary",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    link: "/discover?type=culture",
  },
  {
    id: "sports",
    name: "Sports & Activities",
    description: "Fitness, sports events, and outdoor",
    icon: Dumbbell,
    color: "accent",
    image: "https://images.unsplash.com/photo-1461896836934- voices-c17b55c?w=600&h=400&fit=crop",
    link: "/discover?type=sports",
  },
];

const getColorClasses = (color: string) => {
  switch (color) {
    case "primary":
      return "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20";
    case "secondary":
      return "bg-secondary/10 text-secondary border-secondary/20 group-hover:bg-secondary/20";
    case "accent":
      return "bg-accent/10 text-accent border-accent/20 group-hover:bg-accent/20";
    default:
      return "bg-primary/10 text-primary border-primary/20";
  }
};

const CategoriesSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Explore by <span className="gradient-text">category</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you're looking for, from morning coffee to late-night clubs
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative overflow-hidden rounded-2xl glass-card border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
              </div>

              {/* Content */}
              <div className="relative p-6 flex flex-col h-48">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${getColorClasses(category.color)}`}>
                  <category.icon className="w-6 h-6" />
                </div>

                {/* Text */}
                <div className="mt-auto">
                  <h3 className="font-heading font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
