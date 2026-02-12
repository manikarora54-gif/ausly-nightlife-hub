import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Itinerary } from "@/types/itinerary";

export const useItineraries = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["itineraries", user?.id],
    queryFn: async (): Promise<Itinerary[]> => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("itineraries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useSaveItinerary = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itinerary: {
      title: string;
      city: string;
      content: string;
      stops?: any[];
      estimated_cost?: number;
    }): Promise<Itinerary> => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("itineraries")
        .insert({
          user_id: user.id,
          ...itinerary,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
};
