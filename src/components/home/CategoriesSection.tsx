import { Calendar, Film, Utensils, Music, Theater, Dumbbell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { DotPattern, GlowOrb } from "@/components/decorative/FloatingShapes";

interface CategoriesSectionProps {
  selectedCity: string;
}

const categories = [
  {
    id: "events",
    name: "Events",
    description: "Concerts, parties & festivals",
    icon: Calendar,
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop",
    type: "events",
    gradient: "from-violet-600/80 to-purple-900/80",
  },
  {
    id: "movies",
    name: "Movies",
    description: "Cinemas & screenings",
    icon: Film,
    image: "https://images.unsplash.com/photo-1596445836561-991bcd39a86f?w=600&h=400&fit=crop",
    link: "/movies",
    gradient: "from-blue-600/80 to-indigo-900/80",
  },
  {
    id: "restaurants",
    name: "Dining",
    description: "From street food to Michelin stars",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&h=400&fit=crop",
    type: "restaurant",
    gradient: "from-orange-600/80 to-red-900/80",
  },
  {
    id: "nightlife",
    name: "Nightlife",
    description: "Bars, clubs & late-night spots",
    icon: Music,
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&h=400&fit=crop",
    type: "club",
    gradient: "from-pink-600/80 to-rose-900/80",
  },
  {
    id: "culture",
    name: "Culture",
    description: "Museums, galleries & hidden gems",
    icon: Theater,
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop",
    type: "culture",
    gradient: "from-emerald-600/80 to-teal-900/80",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Fitness, outdoor & wellness",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop",
    type: "sports",
    gradient: "from-amber-600/80 to-yellow-900/80",
  },
];

const CategoriesSection = ({ selectedCity }: CategoriesSectionProps) => {
  const { ref, isVisible } = useScrollReveal();

  const getCategoryLink = (category: (typeof categories)[0]) => {
    if (category.link) return category.link;
    return `/discover?type=${category.type}&city=${selectedCity.toLowerCase()}`;
  };

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Decorative elements */}
      <DotPattern className="inset-0" />
      <GlowOrb color="primary" size={300} className="top-0 -right-32" />
      <GlowOrb color="secondary" size={250} className="-bottom-20 -left-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex items-center justify-between mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <h2 className="text-2xl md:text-4xl font-heading font-bold mb-2">
              What are you in the mood for?
            </h2>
            <p className="text-muted-foreground">Your starting point in {selectedCity} — pick a vibe</p>
          </div>
          <Link
            to="/discover"
            className="hidden md:flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={getCategoryLink(category)}
              className={`group relative overflow-hidden rounded-2xl aspect-[16/9] md:aspect-[2/1] transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop";
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} group-hover:opacity-90 transition-opacity`} />

              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              <div className="absolute inset-0 flex items-end p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-lg md:text-xl">
                      {category.name}
                    </h3>
                    <p className="text-white/70 text-xs md:text-sm">{category.description}</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="md:hidden text-center mt-6">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            View all categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
