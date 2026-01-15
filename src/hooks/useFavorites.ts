import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type Favorite = Tables<"user_favorites">;

// Fetch user's favorites
export const useFavorites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_favorites")
        .select("*, venues(*), events(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// Check if a venue/event is favorited
export const useIsFavorite = (venueId?: string, eventId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favorite", user?.id, venueId, eventId],
    queryFn: async () => {
      if (!user) return false;

      let query = supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", user.id);

      if (venueId) {
        query = query.eq("venue_id", venueId);
      }

      if (eventId) {
        query = query.eq("event_id", eventId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && (!!venueId || !!eventId),
  });
};

// Toggle favorite
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ venueId, eventId }: { venueId?: string; eventId?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if already favorited
      let query = supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", user.id);

      if (venueId) query = query.eq("venue_id", venueId);
      if (eventId) query = query.eq("event_id", eventId);

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { action: "removed" };
      } else {
        // Add favorite
        const { error } = await supabase
          .from("user_favorites")
          .insert({
            user_id: user.id,
            venue_id: venueId || null,
            event_id: eventId || null,
          });

        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favorite"] });
    },
  });
};
