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

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [{ data: venues }, { data: events }] = await Promise.all([
      supabase.from("venues").select("slug, name, type, cuisine, city, address, price_range, average_rating, features, short_description, images").eq("is_active", true).limit(200),
      supabase.from("events").select("slug, name, event_type, start_date, end_date, ticket_price, short_description, images, venues(name, city, address)").eq("is_active", true).gte("start_date", new Date().toISOString()).limit(100),
    ]);

    // Detect if user is asking for a plan/itinerary vs a general question
    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content?.toLowerCase() || "";
    const isPlanRequest = /plan|itinerary|night out|evening|what should|recommend|suggest|where should|date night|weekend|tonight|today/i.test(lastUserMsg);

    const systemPrompt = `You are Ausly AI, a friendly nightlife & entertainment planner for Germany.

COMMUNICATION STYLE:
- Be CONCISE. Short sentences. No walls of text.
- Use bullet points, not paragraphs
- Max 2-3 sentences for descriptions
- Emoji sparingly 🎉

YOUR PROCESS:
1. Ask 1-2 quick questions: city, vibe, budget (keep it brief, use bullet options)
2. Once you know enough, call the "generate_itineraries" tool to create 3-5 itinerary options
3. After tool call, write a SHORT intro like "Here are your plans! 🎉" — the tool output will be rendered as visual cards automatically

WHEN TO USE THE TOOL:
- User asks for recommendations, plans, itineraries, or "what should I do"
- You have enough info (at minimum: a city)
- Default to the city if user doesn't specify preferences

WHEN NOT TO USE THE TOOL:
- User is asking a general question
- User is still answering your preference questions
- User wants info about a specific venue/event

VENUE DATA (use exact slugs):
${JSON.stringify(venues?.slice(0, 120), null, 0)}

EVENTS DATA (use exact slugs):
${JSON.stringify(events?.slice(0, 50), null, 0)}

RULES:
- Only recommend venues from the data above
- Each itinerary option should have 3-5 stops
- Include mix of dining, drinks, entertainment
- Vary the options: one budget, one premium, one unique/adventurous
- Use realistic times and travel considerations
- ALWAYS use real slugs and real image URLs from the venue data
${isAuthenticated ? "- User is signed in, they can book." : "- User is NOT signed in. Mention they can sign in to save/book."}`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_itineraries",
          description: "Generate 3-5 curated itinerary options for the user's night/day out. Each option is a themed plan with stops at real venues.",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string", description: "The city for the itineraries" },
              itineraries: {
                type: "array",
                description: "3-5 different itinerary options",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Catchy short title for this option, e.g. 'Budget Bites & Beats' or 'Luxury Date Night'" },
                    emoji: { type: "string", description: "Single emoji representing this option" },
                    vibe: { type: "string", description: "One-word vibe: chill, party, romantic, foodie, cultural, adventurous" },
                    estimated_total: { type: "number", description: "Total estimated cost per person in EUR" },
                    stops: {
                      type: "array",
                      description: "3-5 stops in chronological order",
                      items: {
                        type: "object",
                        properties: {
                          time: { type: "string", description: "Time like '19:00' or '7:00 PM'" },
                          name: { type: "string", description: "Venue or event name (must match real data)" },
                          slug: { type: "string", description: "Exact slug from venue/event data" },
                          type: { type: "string", enum: ["dining", "drinks", "nightlife", "activity", "event"], description: "Type of stop" },
                          description: { type: "string", description: "1 sentence why this stop is great" },
                          cost_estimate: { type: "string", description: "Cost like '€15-25' or 'Free'" },
                          image: { type: "string", description: "Image URL from the venue/event data (use first image from images array)" },
                          tip: { type: "string", description: "Quick insider tip" },
                        },
                        required: ["time", "name", "slug", "type", "description", "cost_estimate"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["title", "emoji", "vibe", "estimated_total", "stops"],
                  additionalProperties: false,
                },
              },
            },
            required: ["city", "itineraries"],
            additionalProperties: false,
          },
        },
      },
    ];

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
        tools,
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
