import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

// Fetch current user's profile
export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// Fetch user roles
export const useUserRoles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return data?.map((r) => r.role) || [];
    },
    enabled: !!user,
  });
};

// Check if user has a specific role
export const useHasRole = (role: "admin" | "moderator" | "user") => {
  const { data: roles = [] } = useUserRoles();
  return roles.includes(role);
};
