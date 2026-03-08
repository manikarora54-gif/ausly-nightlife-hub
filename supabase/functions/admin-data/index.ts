import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify calling user is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();

    if (action === "get_users") {
      const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 100 });
      if (error) throw error;

      // Get all roles
      const { data: allRoles } = await adminClient.from("user_roles").select("*");
      // Get all profiles
      const { data: profiles } = await adminClient.from("profiles").select("*");

      const enrichedUsers = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        display_name: u.user_metadata?.display_name || profiles?.find((p: any) => p.id === u.id)?.display_name || "Unknown",
        avatar_url: profiles?.find((p: any) => p.id === u.id)?.avatar_url,
        roles: allRoles?.filter((r: any) => r.user_id === u.id).map((r: any) => r.role) || [],
      }));

      return new Response(JSON.stringify({ users: enrichedUsers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_stats") {
      // Total users
      const { data: { users: allUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const totalUsers = allUsers?.length || 0;

      // Bookings
      const { data: bookings } = await adminClient.from("bookings").select("*");
      const totalBookings = bookings?.length || 0;
      const totalRevenue = bookings?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;
      const pendingBookings = bookings?.filter((b: any) => b.status === "pending").length || 0;
      const confirmedBookings = bookings?.filter((b: any) => b.status === "confirmed").length || 0;
      const cancelledBookings = bookings?.filter((b: any) => b.status === "cancelled").length || 0;

      // Venues & Events
      const { count: totalVenues } = await adminClient.from("venues").select("*", { count: "exact", head: true });
      const { count: totalEvents } = await adminClient.from("events").select("*", { count: "exact", head: true });
      const { count: pendingGrievances } = await adminClient.from("grievances").select("*", { count: "exact", head: true }).eq("status", "open");

      // Revenue by month (last 6 months)
      const now = new Date();
      const revenueByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthBookings = bookings?.filter((b: any) => {
          const bd = new Date(b.booking_date);
          return bd >= d && bd <= end;
        }) || [];
        revenueByMonth.push({
          month: d.toLocaleDateString("en", { month: "short", year: "2-digit" }),
          revenue: monthBookings.reduce((s: number, b: any) => s + (b.total_amount || 0), 0),
          bookings: monthBookings.length,
        });
      }

      // Bookings by status
      const bookingsByStatus = [
        { status: "confirmed", count: confirmedBookings },
        { status: "pending", count: pendingBookings },
        { status: "cancelled", count: cancelledBookings },
      ];

      // New users last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const newUsersLast30 = allUsers?.filter((u: any) => u.created_at >= thirtyDaysAgo).length || 0;

      // Top venues by bookings
      const { data: venues } = await adminClient.from("venues").select("id, name, average_rating, review_count");
      const venueBookingCounts: Record<string, number> = {};
      bookings?.forEach((b: any) => {
        if (b.venue_id) venueBookingCounts[b.venue_id] = (venueBookingCounts[b.venue_id] || 0) + 1;
      });
      const topVenues = venues
        ?.map((v: any) => ({ ...v, booking_count: venueBookingCounts[v.id] || 0 }))
        .sort((a: any, b: any) => b.booking_count - a.booking_count)
        .slice(0, 5) || [];

      return new Response(JSON.stringify({
        totalUsers,
        totalBookings,
        totalRevenue,
        pendingBookings,
        totalVenues,
        totalEvents,
        pendingGrievances,
        newUsersLast30,
        revenueByMonth,
        bookingsByStatus,
        topVenues,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "assign_role") {
      const { user_id, role } = await req.json().catch(() => ({}));
      // Already parsed above, get from body
      const body = JSON.parse(await new Request(req.url, { body: null }).text().catch(() => "{}"));
      // Re-parse since we already consumed the body - use the original parse
    }

    if (action === "update_role") {
      // Handled via direct supabase calls with admin RLS
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
