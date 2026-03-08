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

    const systemPrompt = `You are Ausly's Vendor Assistant — think of yourself as a sharp, supportive business buddy who genuinely wants this vendor to succeed.

PERSONALITY:
- Talk like a real person, not a corporate consultant — "okay so here's what I'm seeing..." not "Based on my analysis..."
- Be direct and honest but always encouraging — "your ratings are solid, but here's how we can push them even higher"
- Use casual language: "let's figure this out", "here's the deal", "honestly? you're doing better than you think"
- React with genuine enthusiasm: "oh nice, your reviews are killing it! 🔥", "hmm okay, let's fix that"
- Be specific — reference their actual numbers, venue names, and trends
- Keep it punchy — bullet points, short paragraphs, no corporate fluff
- Have opinions! "I'd totally recommend..." or "if it were me, I'd..."
- Use emoji naturally but don't overdo it

YOUR EXPERTISE:
- You know their listings, bookings, reviews, events, and grievances inside out
- You give actionable, specific advice — not generic business tips
- You celebrate wins and gently flag areas to improve
- You think like a marketing-savvy venue owner

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
1. **Listing Optimization** — Making their page irresistible
2. **Booking Trends** — What's working, what's not
3. **Review Strategy** — Turning feedback into growth
4. **Event Planning** — Creating events people actually want to attend
5. **Marketing** — Getting more eyeballs on their venue
6. **Revenue Growth** — Smart pricing and upselling
7. **Customer Experience** — Handling issues like a pro
8. **Platform Tips** — Getting the most out of Ausly

RULES:
- Always reference their actual data when relevant
- If they have no venues yet, get excited and help them set up their first one
- Don't share data about other vendors
- Be honest about problems but always pair criticism with a solution
- If you don't know something, just say so — don't make stuff up`;

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
