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

    // ---- Heuristic fallback used when AI is unavailable ----
    function heuristicPick(reason: string) {
      const q = (query || "").toLowerCase();
      const wantsEvent = /event|party|techno|club|show|gig|concert|tonight|weekend/.test(q);
      const pool = wantsEvent && eventList.length ? eventList : venueList.length ? venueList : eventList;

      const score = (item: any) => {
        let s = 0;
        const hay = `${item.name} ${item.type || ""} ${item.cuisine || ""} ${item.desc || ""}`.toLowerCase();
        for (const w of q.split(/\W+/).filter(Boolean)) if (hay.includes(w)) s += 3;
        if ("rating" in item && item.rating) s += Number(item.rating);
        if (item.img) s += 0.5;
        return s;
      };
      const ranked = [...pool].sort((a, b) => score(b) - score(a)).slice(0, 3);
      if (!ranked.length) return null;

      const pickCity = ranked[0].city || cityFilter || "Berlin";
      const toCard = (it: any, hero: boolean) => ({
        kind: it.kind,
        slug: it.slug,
        name: it.name,
        tagline: it.desc?.slice(0, 80) || (it.kind === "event" ? "Live event you'll love" : "Local favourite"),
        ...(hero ? { why: `Hand-picked from our top ${it.kind === "event" ? "events" : "venues"} in ${pickCity}. ${it.desc || ""}`.trim().slice(0, 220) } : {}),
        category: it.type || it.cuisine || (it.kind === "event" ? "Event" : "Venue"),
        image: it.img || undefined,
        price: it.price ? `€${it.price}` : it.kind === "venue" && it.price === undefined ? undefined : undefined,
      });

      return {
        intent: q.split(/\W+/).filter(Boolean).slice(0, 3).join(" ") || "best picks",
        city: pickCity,
        hero: toCard(ranked[0], true),
        alternatives: ranked.slice(1, 3).map((it) => toCard(it, false)),
        fallback: true,
        fallbackReason: reason,
      };
    }

    if (!resp.ok) {
      const status = resp.status;
      const reason = status === 402 ? "AI credits exhausted" : status === 429 ? "rate limited" : `gateway ${status}`;
      console.warn("AI unavailable, using heuristic:", reason);
      const recommendation = heuristicPick(reason);
      const spoken = status === 402
        ? "I'm running on backup mode — here are my top picks from the city."
        : "Quick picks coming right up.";
      return new Response(JSON.stringify({ spoken, recommendation, fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const choice = data.choices?.[0]?.message;
    const spoken = choice?.content || "Here's my top pick for you.";
    const toolCall = choice?.tool_calls?.[0];
    let recommendation: any = null;
    if (toolCall?.function?.arguments) {
      try { recommendation = JSON.parse(toolCall.function.arguments); }
      catch (e) { console.error("parse err", e); }
    }

    // If AI replied but produced no usable recommendation, fall back too
    if (!recommendation?.hero) {
      recommendation = heuristicPick("ai_no_result");
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
