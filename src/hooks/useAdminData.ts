import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-data", {
        body: { action: "get_stats" },
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // refresh every minute
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-data", {
        body: { action: "get_users" },
      });
      if (error) throw error;
      return data.users;
    },
  });
};

export const useAdminBookings = () => {
  return useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, venues(name), events(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminVenues = () => {
  return useQuery({
    queryKey: ["admin-venues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminEvents = () => {
  return useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, venues(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ["admin-pending-approvals"],
    queryFn: async () => {
      const [venueRes, eventRes] = await Promise.all([
        supabase.from("venues").select("*").eq("is_active", false).order("created_at", { ascending: false }),
        supabase.from("events").select("*, venues(name)").eq("is_active", false).order("created_at", { ascending: false }),
      ]);
      return {
        venues: venueRes.data || [],
        events: eventRes.data || [],
      };
    },
  });
};
