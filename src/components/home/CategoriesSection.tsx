import { Calendar, Film, Utensils, Music, Theater, Dumbbell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoriesSectionProps {
  selectedCity: string;
}

const categories = [
  {
    id: "events",
    name: "Events",
    icon: Calendar,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop",
    type: "events",
  },
  {
    id: "movies",
    name: "Movies",
    icon: Film,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
    link: "/movies",
  },
  {
    id: "restaurants",
    name: "Dining",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    type: "restaurant",
  },
  {
    id: "nightlife",
    name: "Nightlife",
    icon: Music,
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop",
    type: "club",
  },
  {
    id: "culture",
    name: "Culture",
    icon: Theater,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    type: "culture",
  },
  {
    id: "sports",
    name: "Sports",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1461896836934-c17b55c?w=600&h=400&fit=crop",
    type: "sports",
  },
];

const CategoriesSection = ({ selectedCity }: CategoriesSectionProps) => {
  const getCategoryLink = (category: typeof categories[0]) => {
    if (category.link) return category.link;
    return `/discover?type=${category.type}&city=${selectedCity.toLowerCase()}`;
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold">
            Browse by <span className="gradient-text">category</span>
          </h2>
          <Link to="/discover" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={getCategoryLink(category)}
              className="group relative overflow-hidden rounded-2xl aspect-square"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent group-hover:via-background/40 transition-all" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
