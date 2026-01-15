import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Review = Tables<"reviews">;
export type ReviewInsert = TablesInsert<"reviews">;
export type ReviewUpdate = TablesUpdate<"reviews">;

// Fetch reviews for a venue
export const useVenueReviews = (venueId: string) => {
  return useQuery({
    queryKey: ["reviews", "venue", venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles(display_name, avatar_url)")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!venueId,
  });
};

// Create a new review
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (review: Omit<ReviewInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          ...review,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "venue", data.venue_id] });
      queryClient.invalidateQueries({ queryKey: ["venue"] });
    },
  });
};

// Update a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ReviewUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "venue", data.venue_id] });
    },
  });
};

// Delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, venueId }: { id: string; venueId: string }) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, venueId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "venue", data.venueId] });
      queryClient.invalidateQueries({ queryKey: ["venue"] });
    },
  });
};
