import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Venue = Tables<"venues">;
export type VenueInsert = TablesInsert<"venues">;
export type VenueUpdate = TablesUpdate<"venues">;

// Fetch all venues with optional filters
export const useVenues = (filters?: {
  city?: string;
  type?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["venues", filters],
    queryFn: async () => {
      let query = supabase
        .from("venues")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("average_rating", { ascending: false });

      if (filters?.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      if (filters?.featured) {
        query = query.eq("is_featured", true);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,cuisine.ilike.%${filters.search}%`
        );
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

// Fetch single venue by ID or slug
export const useVenue = (idOrSlug: string) => {
  return useQuery({
    queryKey: ["venue", idOrSlug],
    queryFn: async () => {
      // Try to fetch by UUID first, then by slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let query = supabase.from("venues").select("*");
      
      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }
      
      const { data, error } = await query.single();

      if (error) throw error;
      return data;
    },
    enabled: !!idOrSlug,
  });
};

// Fetch featured venues
export const useFeaturedVenues = (limit = 6) => {
  return useVenues({ featured: true, limit });
};
