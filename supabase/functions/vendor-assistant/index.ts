import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data, error } = await supabaseAuth.auth.getUser();
        if (!error && data?.user) userId = data.user.id;
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch vendor's own data for context
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [
      { data: vendorVenues },
      { data: vendorBookings },
      { data: vendorReviews },
      { data: vendorEvents },
      { data: vendorGrievances },
    ] = await Promise.all([
      supabase.from("venues").select("id, name, slug, type, city, average_rating, review_count, is_active, is_featured, price_range, features").eq("owner_id", userId),
      supabase.from("bookings").select("id, status, booking_date, booking_type, total_amount, party_size, created_at, venues!inner(owner_id)").eq("venues.owner_id", userId).order("created_at", { ascending: false }).limit(50),
      supabase.from("reviews").select("id, rating, title, content, created_at, venues!inner(owner_id, name)").eq("venues.owner_id", userId).order("created_at", { ascending: false }).limit(30),
      supabase.from("events").select("id, name, slug, event_type, start_date, ticket_price, tickets_sold, max_capacity, is_active, venues!inner(owner_id)").eq("venues.owner_id", userId).order("start_date", { ascending: false }).limit(30),
      supabase.from("grievances").select("id, subject, category, status, priority, created_at").eq("user_id", userId).eq("user_type", "vendor").order("created_at", { ascending: false }).limit(10),
    ]);

    // Compute quick stats
    const totalVenues = vendorVenues?.length || 0;
    const activeVenues = vendorVenues?.filter(v => v.is_active)?.length || 0;
    const totalBookings = vendorBookings?.length || 0;
    const pendingBookings = vendorBookings?.filter(b => b.status === "pending")?.length || 0;
    const confirmedBookings = vendorBookings?.filter(b => b.status === "confirmed")?.length || 0;
    const totalRevenue = vendorBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
    const avgRating = vendorVenues?.length
      ? (vendorVenues.reduce((sum, v) => sum + (v.average_rating || 0), 0) / vendorVenues.length).toFixed(1)
      : "N/A";
    const totalReviews = vendorVenues?.reduce((sum, v) => sum + (v.review_count || 0), 0) || 0;
    const upcomingEvents = vendorEvents?.filter(e => new Date(e.start_date) > new Date())?.length || 0;
    const openGrievances = vendorGrievances?.filter(g => g.status === "open")?.length || 0;

    const recentReviewsSummary = (vendorReviews || []).slice(0, 10).map(r => ({
      rating: r.rating,
      title: r.title,
      content: r.content?.slice(0, 100),
      venue: (r as any).venues?.name,
      date: r.created_at,
    }));

    const venuesSummary = (vendorVenues || []).map(v => ({
      name: v.name,
      type: v.type,
      city: v.city,
      rating: v.average_rating,
      reviews: v.review_count,
      active: v.is_active,
      featured: v.is_featured,
      features: v.features,
    }));

    const systemPrompt = `You are Ausly Vendor Assistant, an AI business advisor for venue owners on the Ausly platform in Germany.

YOUR ROLE:
- Help vendors understand their business performance
- Provide actionable tips to improve listings, bookings, and reviews
- Answer questions about managing venues, events, and customer interactions on Ausly
- Offer marketing and optimization suggestions

COMMUNICATION STYLE:
- Professional but friendly
- Concise — use bullet points
- Data-driven when possible, reference their actual stats
- Provide specific, actionable advice

VENDOR'S BUSINESS DATA:
📊 Overview:
- Venues: ${totalVenues} total (${activeVenues} active)
- Bookings: ${totalBookings} total (${pendingBookings} pending, ${confirmedBookings} confirmed)
- Revenue: €${totalRevenue.toFixed(2)}
- Average Rating: ${avgRating} (${totalReviews} reviews)
- Upcoming Events: ${upcomingEvents}
- Open Grievances: ${openGrievances}

🏢 Venues:
${JSON.stringify(venuesSummary, null, 0)}

⭐ Recent Reviews:
${JSON.stringify(recentReviewsSummary, null, 0)}

TOPICS YOU CAN HELP WITH:
1. **Listing Optimization** — How to improve descriptions, photos, features to rank higher
2. **Booking Management** — Understanding booking trends, peak times, no-shows
3. **Review Strategy** — Responding to reviews, improving ratings
4. **Event Planning** — Tips for creating successful events, pricing strategy
5. **Marketing** — How to get more visibility on the Ausly platform
6. **Revenue Growth** — Upselling, pricing optimization, capacity management
7. **Customer Experience** — Handling grievances, improving service
8. **Platform Features** — How to use Ausly vendor tools effectively

RULES:
- Only advise based on the vendor's actual data when available
- If they have no venues yet, guide them on creating their first listing
- Don't share data about other vendors
- Suggest using platform features (events, menu items, photos) to improve visibility
- Be encouraging but honest about areas for improvement`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("vendor-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
