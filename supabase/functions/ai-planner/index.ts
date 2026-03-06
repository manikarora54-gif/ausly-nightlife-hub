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

    // Authenticate user via JWT instead of spoofable header
    let isAuthenticated = false;
    const authHeader = req.headers.get("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabaseAuth.auth.getClaims(token);
      isAuthenticated = !error && !!data?.claims?.sub;
    }

    // Use service role only for reading public venue/event data
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [{ data: venues }, { data: events }] = await Promise.all([
      supabase.from("venues").select("slug, name, type, cuisine, city, address, price_range, average_rating, features, short_description").eq("is_active", true).limit(200),
      supabase.from("events").select("slug, name, event_type, start_date, end_date, ticket_price, short_description, venues(name, city)").eq("is_active", true).gte("start_date", new Date().toISOString()).limit(100),
    ]);

    const systemPrompt = `You are Ausly AI, a friendly and enthusiastic nightlife & entertainment planner for cities across Germany. You help people plan their perfect day, evening, or weekend.
- Warm, fun, and knowledgeable about German nightlife and culture
- Use emojis sparingly but effectively 🎉
- Give personalized recommendations based on user preferences
- Always include estimated costs and time for each activity

YOUR PROCESS:
1. First, ask the user 2-3 quick questions to understand their preferences:
   - Which city? (Berlin, Munich, Hamburg, Frankfurt, Cologne, Düsseldorf)
   - What's the occasion? (Date night, friends outing, solo adventure, weekend trip)
   - What vibe? (Chill, party, foodie, cultural, romantic)
   - Budget level? (Budget-friendly, moderate, splurge)
2. Then create a detailed itinerary with:
   - Timeline with specific times
   - Venue/restaurant names from the real data below
   - Estimated cost per person for each stop
   - Total estimated cost
   - Pro tips for each venue
   - Transportation suggestions between venues

INTERACTIVE ACTIONS:
You MUST include interactive action buttons in your responses to help users navigate and book. Use this exact syntax:

- To link to a venue page: {{ACTION:VENUE:venue-slug:View Venue Name}}
- To link to an event page: {{ACTION:EVENT:event-slug:View Event Name}}
- To start a booking for a venue: {{ACTION:BOOK_VENUE:venue-slug:venue-name:Book Now}}
- To start a booking for an event: {{ACTION:BOOK_EVENT:event-slug:event-name:Book Tickets}}
- To explore a category: {{ACTION:DISCOVER:type:Browse Category}}
- To open the map: {{ACTION:MAP:::Open Map}}
- To explore a city: {{ACTION:CITY:city-name:Explore City}}

ALWAYS include at least one action button per venue or event you mention. Place them right after describing each venue/event. Example:

**7:00 PM - Dinner at Bella Italia** 🍝
Amazing Italian restaurant in Mitte with handmade pasta.
*Estimated: €25-35 per person*
{{ACTION:VENUE:bella-italia:View Bella Italia}} {{ACTION:BOOK_VENUE:bella-italia:Bella Italia:Reserve a Table}}

REAL VENUE DATA (IMPORTANT: each venue has a "slug" field - you MUST use the exact slug value from the data for action buttons):
${JSON.stringify(venues?.slice(0, 100), null, 0)}

UPCOMING EVENTS (IMPORTANT: each event has a "slug" field - you MUST use the exact slug value from the data for action buttons):
${JSON.stringify(events?.slice(0, 50), null, 0)}

IMPORTANT RULES:
- Only recommend venues and events from the data above
- If a city has limited data, acknowledge it and suggest what's available
- Always format itineraries clearly with times, venues, and costs
- Include a mix of dining, drinks, and entertainment
- Consider opening hours and realistic travel times
- Use markdown formatting for readability
- ALWAYS include action buttons for every venue and event mentioned

AUTHENTICATION RULES:
${isAuthenticated ? `- The user IS signed in. You can offer booking actions freely using {{ACTION:BOOK_VENUE:...}} and {{ACTION:BOOK_EVENT:...}} buttons.` : `- The user is NOT signed in. They can browse and discover venues/events, but CANNOT book.
- When they ask to book or reserve anything, kindly tell them they need to sign in or create an account first.
- Include a sign-in button: {{ACTION:SIGNIN:::Sign In}} or sign-up button: {{ACTION:SIGNUP:::Create Account}}
- Do NOT include any BOOK_VENUE or BOOK_EVENT action buttons for unauthenticated users.
- You can still show VENUE and EVENT view buttons so they can explore.`}`;

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
          ...messages,
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
    console.error("ai-planner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
