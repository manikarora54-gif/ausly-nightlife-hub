import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, city } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const cityFilter = city || null;
    const venuesQ = supabase
      .from("venues")
      .select("slug,name,type,cuisine,city,address,price_range,average_rating,short_description,images")
      .eq("is_active", true)
      .limit(80);
    if (cityFilter) venuesQ.eq("city", cityFilter);

    const eventsQ = supabase
      .from("events")
      .select("slug,name,event_type,start_date,ticket_price,short_description,images,venues(name,city)")
      .eq("is_active", true)
      .gte("start_date", new Date().toISOString())
      .limit(50);

    const [{ data: venues }, { data: events }] = await Promise.all([venuesQ, eventsQ]);

    const venueList = (venues || []).map((v: any) => ({
      slug: v.slug, name: v.name, type: v.type, cuisine: v.cuisine,
      city: v.city, price: v.price_range, rating: v.average_rating,
      desc: v.short_description, img: v.images?.[0] || null,
      kind: "venue",
    }));
    const eventList = (events || []).map((e: any) => ({
      slug: e.slug, name: e.name, type: e.event_type,
      date: e.start_date, price: e.ticket_price,
      desc: e.short_description, img: e.images?.[0] || null,
      city: e.venues?.city || null, venue: e.venues?.name || null,
      kind: "event",
    }));

    const systemPrompt = `You are Ausly's holographic AI representative — a warm, witty, ultra-helpful local concierge for Germany. You are speaking aloud to a user via a Jarvis-style holographic interface, so keep your spoken reply to ONE short, friendly sentence (max 18 words). Then call the recommend_top tool with the absolute best 3 matches (1 hero + 2 alternatives) from the data below. Use ONLY exact slugs and names from the data. If the user gave no city, infer from query or default to Berlin.

DATA (venues + events, use exact slugs):
${JSON.stringify({ venues: venueList, events: eventList }).slice(0, 18000)}`;

    const tools = [{
      type: "function",
      function: {
        name: "recommend_top",
        description: "Return the single best match plus 2 alternatives for the user's request.",
        parameters: {
          type: "object",
          properties: {
            intent: { type: "string", description: "1-3 words summarizing what the user wants, e.g. 'romantic dinner', 'techno tonight'" },
            city: { type: "string" },
            hero: {
              type: "object",
              properties: {
                kind: { type: "string", enum: ["venue", "event"] },
                slug: { type: "string" },
                name: { type: "string" },
                tagline: { type: "string", description: "One punchy line on why this is THE pick" },
                why: { type: "string", description: "2 sentences max — concrete reasons" },
                price: { type: "string" },
                category: { type: "string" },
                image: { type: "string" },
              },
              required: ["kind", "slug", "name", "tagline", "why"],
            },
            alternatives: {
              type: "array",
              minItems: 2,
              maxItems: 2,
              items: {
                type: "object",
                properties: {
                  kind: { type: "string", enum: ["venue", "event"] },
                  slug: { type: "string" },
                  name: { type: "string" },
                  tagline: { type: "string" },
                  category: { type: "string" },
                  image: { type: "string" },
                },
                required: ["kind", "slug", "name", "tagline"],
              },
            },
          },
          required: ["intent", "city", "hero", "alternatives"],
        },
      },
    }];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "recommend_top" } },
      }),
    });

    if (!resp.ok) {
      const status = resp.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("Gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const choice = data.choices?.[0]?.message;
    const spoken = choice?.content || "Here's my top pick for you.";
    const toolCall = choice?.tool_calls?.[0];
    let recommendation = null;
    if (toolCall?.function?.arguments) {
      try { recommendation = JSON.parse(toolCall.function.arguments); }
      catch (e) { console.error("parse err", e); }
    }

    return new Response(JSON.stringify({ spoken, recommendation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("jarvis-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
