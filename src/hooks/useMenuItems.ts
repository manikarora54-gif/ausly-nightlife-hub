import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MenuItem = Tables<"menu_items">;

export const useMenuItems = (venueId: string | undefined) => {
  return useQuery({
    queryKey: ["menu_items", venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("venue_id", venueId!)
        .eq("is_available", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!venueId,
  });
};
