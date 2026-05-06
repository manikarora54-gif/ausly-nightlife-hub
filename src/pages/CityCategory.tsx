import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useVenues } from "@/hooks/useVenues";
import { useEvents } from "@/hooks/useEvents";
import SEOHead from "@/components/seo/SEOHead";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

// Supported cities (slug -> display name)
const CITIES: Record<string, string> = {
  berlin: "Berlin",
  hamburg: "Hamburg",
  munich: "München",
  muenchen: "München",
  cologne: "Köln",
  koln: "Köln",
  frankfurt: "Frankfurt",
  stuttgart: "Stuttgart",
  duesseldorf: "Düsseldorf",
  dusseldorf: "Düsseldorf",
  leipzig: "Leipzig",
};

// Supported categories (slug -> {venueType?, eventType?, label})
type CategoryDef = {
  label: string;
  venueType?: string;
  isEvent?: boolean;
  description: string;
  faqs: { q: string; a: string }[];
};

const CATEGORIES: Record<string, CategoryDef> = {
  restaurants: {
    label: "Restaurants",
    venueType: "restaurant",
    description: "Top-rated restaurants — from cozy local kitchens to fine dining.",
    faqs: [
      { q: "What are the best restaurants in {city}?", a: "Ausly curates the highest-rated restaurants in {city} based on real reviews, cuisine variety, and atmosphere. Browse the list above to discover popular and hidden-gem spots." },
      { q: "Can I book a table on Ausly?", a: "Yes — most restaurants on Ausly support direct table reservations. Pick a venue, choose your date, party size and time, and confirm in seconds." },
      { q: "Are there vegetarian or vegan options in {city}?", a: "Many of our listed restaurants offer vegetarian and vegan menus. Use the cuisine filter on each venue page or check the menu section to see options." },
    ],
  },
  bars: {
    label: "Bars",
    venueType: "bar",
    description: "Best bars — craft cocktails, local beer, and unforgettable evenings.",
    faqs: [
      { q: "Where are the best bars in {city}?", a: "Ausly highlights the top-rated bars in {city} — from speakeasy cocktail dens to lively neighborhood pubs." },
      { q: "Until when are bars open in {city}?", a: "Most bars in {city} stay open until 2 AM on weekends, with some open until sunrise. Check each venue's opening hours for exact times." },
    ],
  },
  clubs: {
    label: "Clubs",
    venueType: "club",
    description: "Clubs and nightlife — techno, house, hip-hop and everything between.",
    faqs: [
      { q: "What's the dress code for clubs in {city}?", a: "It varies — Berlin clubs are famously casual and underground, while Munich and Hamburg lean more upscale. Check each venue's page for specific guidelines." },
      { q: "Do clubs in {city} have entry fees?", a: "Most clubs charge between €10–€20 entry depending on the night and headlining DJ. Some events require advance tickets." },
    ],
  },
  nightlife: {
    label: "Nightlife",
    description: "The complete guide to nightlife — bars, clubs, late-night eats and events.",
    faqs: [
      { q: "What is {city}'s nightlife like?", a: "{city} has one of Germany's most vibrant nightlife scenes, with everything from underground techno clubs and craft cocktail bars to late-night street food and live music venues." },
      { q: "Where do locals go out in {city}?", a: "Ausly surfaces the spots locals actually love — not tourist traps. Browse our curated nightlife picks above." },
    ],
  },
  events: {
    label: "Events",
    isEvent: true,
    description: "Upcoming events, concerts, parties and experiences.",
    faqs: [
      { q: "What events are happening in {city} this week?", a: "Browse the list above for the freshest events in {city} — concerts, parties, festivals, and pop-ups, updated daily." },
      { q: "Can I buy event tickets on Ausly?", a: "Yes — Ausly lets you discover and book tickets for events directly, with secure payment and instant confirmation." },
    ],
  },
  experiences: {
    label: "Experiences",
    venueType: "experience",
    description: "Unique experiences and things to do beyond the typical tourist trail.",
    faqs: [
      { q: "What are unique things to do in {city}?", a: "From rooftop tours to hidden food walks, Ausly curates one-of-a-kind experiences in {city} you won't find on standard guides." },
    ],
  },
};

export default function CityCategory() {
  const { city: citySlug = "", category: categorySlug = "" } = useParams();
  const cityKey = citySlug.toLowerCase();
  const categoryKey = categorySlug.toLowerCase();

  const cityName = CITIES[cityKey];
  const category = CATEGORIES[categoryKey];

  // Always call hooks before any early return
  const { data: venues, isLoading: venuesLoading } = useVenues({
    city: cityName,
    type: category?.venueType,
    limit: 60,
  });
  const { data: events, isLoading: eventsLoading } = useEvents({
    city: cityName,
    limit: 60,
  });

  const items = category?.isEvent ? events ?? [] : venues ?? [];
  const isLoading = category?.isEvent ? eventsLoading : venuesLoading;

  const seo = useMemo(() => {
    if (!cityName || !category) return null;
    const title = `Best ${category.label} in ${cityName} – Ausly`;
    const description = `Discover the best ${category.label.toLowerCase()} in ${cityName}. ${category.description} Curated for locals and expats by Ausly.`;
    const canonical = `https://ausly.lovable.app/${cityKey}/${categoryKey}`;

    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: cityName, url: `/${cityKey}` },
      { name: category.label, url: `/${cityKey}/${categoryKey}` },
    ];

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: category.faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q.split("{city}").join(cityName),
        acceptedAnswer: {
          "@type": "Answer",
          text: a.split("{city}").join(cityName),
        },
      })),
    };

    const itemListJsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title,
      itemListElement: items.slice(0, 20).map((item: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        url: category.isEvent
          ? `https://ausly.lovable.app/event/${item.slug || item.id}`
          : `https://ausly.lovable.app/venue/${item.slug || item.id}`,
        name: item.name,
      })),
    };

    return { title, description, canonical, breadcrumbs, jsonLd: [faqJsonLd, itemListJsonLd] };
  }, [cityName, category, cityKey, categoryKey, items]);

  if (!cityName || !category) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <>
      {seo && (
        <SEOHead
          title={seo.title}
          description={seo.description}
          canonical={seo.canonical}
          breadcrumbs={seo.breadcrumbs}
          jsonLd={seo.jsonLd}
          keywords={`${category.label.toLowerCase()} ${cityName}, best ${category.label.toLowerCase()} ${cityName}, things to do ${cityName}, ${cityName} nightlife, ${cityName} guide expats`}
        />
      )}
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <header className="max-w-3xl mb-10">
            <p className="text-sm text-muted-foreground mb-3">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2">/</span>
              <span className="capitalize">{cityName}</span>
              <span className="mx-2">/</span>
              <span>{category.label}</span>
            </p>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
              Best <span className="gradient-text">{category.label}</span> in {cityName}
            </h1>
            <p className="text-lg text-muted-foreground">{category.description}</p>
          </header>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-4">No {category.label.toLowerCase()} listed in {cityName} yet.</p>
              <Link to="/discover" className="text-primary hover:underline">Explore all listings →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item: any) => {
                const href = category.isEvent
                  ? `/event/${item.slug || item.id}`
                  : `/venue/${item.slug || item.id}`;
                const image = Array.isArray(item.images) && item.images[0];
                return (
                  <Link key={item.id} to={href}>
                    <Card className="overflow-hidden group hover:border-primary/50 transition-all h-full">
                      {image && (
                        <div className="aspect-video overflow-hidden bg-muted">
                          <img
                            src={image}
                            alt={`${item.name} – ${category.label} in ${cityName}`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h2 className="font-heading font-bold text-lg mb-2 line-clamp-1">{item.name}</h2>
                        {item.short_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.short_description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {item.address && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{item.city || cityName}</span>
                            </span>
                          )}
                          {item.average_rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {Number(item.average_rating).toFixed(1)}
                            </span>
                          )}
                          {item.is_featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* FAQ section (visible + matches FAQ schema) */}
          <section className="mt-20 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {category.faqs.map(({ q, a }, i) => (
                <details key={i} className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
                  <summary className="cursor-pointer font-medium flex items-center justify-between">
                    <span>{q.split("{city}").join(cityName)}</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {a.split("{city}").join(cityName)}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Internal links to other categories in same city */}
          <section className="mt-16 max-w-3xl">
            <h2 className="text-xl font-heading font-bold mb-4">Explore more in {cityName}</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES)
                .filter(([slug]) => slug !== categoryKey)
                .map(([slug, def]) => (
                  <Link
                    key={slug}
                    to={`/${cityKey}/${slug}`}
                    className="px-4 py-2 rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-sm"
                  >
                    {def.label} in {cityName}
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
