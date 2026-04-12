import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Personalization hook for the homepage.
 *
 * Strategy:
 * 1. If user is logged in → fetch their favorites & bookings to determine
 *    preferred venue types/cities, then query venues & events matching those
 *    preferences (excluding already-favorited items).
 * 2. If user is anonymous → fall back to trending (highest-rated, featured)
 *    venues and upcoming events filtered by the selected city.
 *
 * The hook returns a unified list of recommended items.
 */

export interface PersonalizedItem {
  id: string;
  name: string;
  type: "venue" | "event";
  category: string;
  image: string | null;
  city: string;
  slug: string;
  rating?: number | null;
  price?: string | null;
  reason: string; // e.g. "Because you liked Thai food", "Trending in Berlin"
}

export const usePersonalized = (selectedCity: string, limit = 8) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["personalized", user?.id, selectedCity, limit],
    queryFn: async () => {
      const items: PersonalizedItem[] = [];

      if (user) {
        // 1. Get user's favorite venue types & cities from favorites + bookings
        const [favResult, bookingResult] = await Promise.all([
          supabase
            .from("user_favorites")
            .select("venue_id, event_id, venues(type, city, cuisine), events(event_type, venues(city))")
            .eq("user_id", user.id)
            .limit(50),
          supabase
            .from("bookings")
            .select("venue_id, event_id, venues(type, city, cuisine)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(30),
        ]);

        const favVenueIds = new Set<string>();
        const preferredTypes = new Map<string, number>();
        const preferredCuisines = new Map<string, number>();

        // Tally preferred types from favorites
        for (const fav of favResult.data || []) {
          if (fav.venue_id) favVenueIds.add(fav.venue_id);
          const v = fav.venues as any;
          if (v?.type) preferredTypes.set(v.type, (preferredTypes.get(v.type) || 0) + 2);
          if (v?.cuisine) preferredCuisines.set(v.cuisine, (preferredCuisines.get(v.cuisine) || 0) + 2);
        }

        // Tally from bookings (lower weight)
        for (const b of bookingResult.data || []) {
          const v = b.venues as any;
          if (v?.type) preferredTypes.set(v.type, (preferredTypes.get(v.type) || 0) + 1);
          if (v?.cuisine) preferredCuisines.set(v.cuisine, (preferredCuisines.get(v.cuisine) || 0) + 1);
        }

        const topTypes = [...preferredTypes.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([t]) => t);

        const topCuisine = [...preferredCuisines.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([c]) => c);

        // 2. Fetch recommended venues matching preferences
        if (topTypes.length > 0 || topCuisine.length > 0) {
          let venueQuery = supabase
            .from("venues")
            .select("*")
            .eq("is_active", true)
            .ilike("city", `%${selectedCity}%`)
            .order("average_rating", { ascending: false })
            .limit(limit);

          // Filter by preferred types
          if (topTypes.length > 0) {
            venueQuery = venueQuery.in("type", topTypes);
          }

          const { data: recVenues } = await venueQuery;

          for (const v of recVenues || []) {
            if (favVenueIds.has(v.id)) continue; // skip already favorited
            const reason = topCuisine.includes(v.cuisine || "")
              ? `Because you enjoy ${v.cuisine}`
              : `Based on your ${v.type} picks`;
            items.push({
              id: v.id,
              name: v.name,
              type: "venue",
              category: v.cuisine || v.type,
              image: v.images?.[0] || null,
              city: v.city,
              slug: v.slug,
              rating: v.average_rating,
              price: v.price_range ? "€".repeat(v.price_range) : null,
              reason,
            });
          }
        }

        // 3. Fetch recommended events
        const { data: recEvents } = await supabase
          .from("events")
          .select("*, venues(city, name)")
          .eq("is_active", true)
          .gte("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .limit(limit);

        for (const e of recEvents || []) {
          const eCity = (e.venues as any)?.city || "";
          if (eCity.toLowerCase() !== selectedCity.toLowerCase() && eCity !== "") continue;
          const reason = topTypes.includes(e.event_type)
            ? `Matches your ${e.event_type} interests`
            : `Upcoming in ${selectedCity}`;
          items.push({
            id: e.id,
            name: e.name,
            type: "event",
            category: e.event_type,
            image: e.images?.[0] || null,
            city: eCity || selectedCity,
            slug: e.slug,
            rating: null,
            price: e.ticket_price ? `€${e.ticket_price}` : "Free",
            reason,
          });
        }
      }

      // 4. If not enough personalized results, fill with trending
      if (items.length < limit) {
        const remaining = limit - items.length;
        const existingIds = new Set(items.map((i) => i.id));

        const { data: trending } = await supabase
          .from("venues")
          .select("*")
          .eq("is_active", true)
          .ilike("city", `%${selectedCity}%`)
          .order("average_rating", { ascending: false })
          .order("review_count", { ascending: false })
          .limit(remaining + 5); // fetch extra to filter dupes

        for (const v of trending || []) {
          if (existingIds.has(v.id)) continue;
          if (items.length >= limit) break;
          items.push({
            id: v.id,
            name: v.name,
            type: "venue",
            category: v.cuisine || v.type,
            image: v.images?.[0] || null,
            city: v.city,
            slug: v.slug,
            rating: v.average_rating,
            price: v.price_range ? "€".repeat(v.price_range) : null,
            reason: v.is_featured ? `Featured in ${selectedCity}` : `Trending in ${selectedCity}`,
          });
        }
      }

      return items.slice(0, limit);
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};
