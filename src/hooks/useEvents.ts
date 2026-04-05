import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { prepareSearchTokens, buildOrFilter, normalizeSearch } from "@/lib/searchUtils";

export type Event = Tables<"events">;
export type EventInsert = TablesInsert<"events">;
export type EventUpdate = TablesUpdate<"events">;

// Fetch all events with optional filters + realtime updates
export const useEvents = (filters?: {
  venueId?: string;
  eventType?: string;
  featured?: boolean;
  upcoming?: boolean;
  search?: string;
  limit?: number;
  city?: string;
}) => {
  const queryClient = useQueryClient();

  // Subscribe to realtime changes on events table
  useEffect(() => {
    const channel = supabase
      .channel("events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["events"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    // Normalize search in queryKey so " foo " and "foo" share cache
    queryKey: ["events", { ...filters, search: normalizeSearch(filters?.search) }],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*, venues(*)")
        .eq("is_active", true)
        .order("start_date", { ascending: true });

      if (filters?.venueId) {
        query = query.eq("venue_id", filters.venueId);
      }

      if (filters?.eventType) {
        query = query.eq("event_type", filters.eventType);
      }

      if (filters?.featured) {
        query = query.eq("is_featured", true);
      }

      if (filters?.upcoming) {
        query = query.gte("start_date", new Date().toISOString());
      }

      // Multi-token AND search: each token must match at least one searchable column.
      // Searchable columns: name, description.
      // Note: filtering on joined venues.name / venues.city via PostgREST embedded
      // resources would require `!inner` joins which change result semantics for
      // events without a venue. Kept to event-own columns for safety.
      const tokens = prepareSearchTokens(filters?.search);
      if (tokens) {
        const EVENT_SEARCH_COLS = ["name", "description"];
        for (const token of tokens) {
          query = query.or(buildOrFilter(token, EVENT_SEARCH_COLS));
        }
      }

      if (filters?.city) {
        query = query.eq("venues.city", filters.city);
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

// Fetch single event by ID or slug
export const useEvent = (idOrSlug: string) => {
  return useQuery({
    queryKey: ["event", idOrSlug],
    queryFn: async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let query = supabase.from("events").select("*");
      
      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!idOrSlug,
  });
};

// Fetch upcoming events
export const useUpcomingEvents = (limit = 5) => {
  return useEvents({ upcoming: true, limit });
};
