import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch real venue and event data for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [{ data: venues }, { data: events }] = await Promise.all([
      supabase.from("venues").select("name, type, cuisine, city, address, price_range, average_rating, features, short_description").eq("is_active", true).limit(200),
      supabase.from("events").select("name, event_type, start_date, end_date, ticket_price, short_description, venues(name, city)").eq("is_active", true).gte("start_date", new Date().toISOString()).limit(100),
    ]);

    const systemPrompt = `You are Ausly AI, a friendly and enthusiastic nightlife & entertainment planner for cities across Germany. You help people plan their perfect day, evening, or weekend.

YOUR PERSONALITY:
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

REAL VENUE DATA (use these for recommendations):
${JSON.stringify(venues?.slice(0, 100), null, 0)}

UPCOMING EVENTS:
${JSON.stringify(events?.slice(0, 50), null, 0)}

IMPORTANT RULES:
- Only recommend venues and events from the data above
- If a city has limited data, acknowledge it and suggest what's available
- Always format itineraries clearly with times, venues, and costs
- Include a mix of dining, drinks, and entertainment
- Consider opening hours and realistic travel times
- Use markdown formatting for readability`;

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
