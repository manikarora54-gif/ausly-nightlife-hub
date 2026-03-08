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
      try {
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data, error } = await supabaseAuth.auth.getUser();
        isAuthenticated = !error && !!data?.user;
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    }

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [{ data: venues }, { data: events }] = await Promise.all([
      supabase.from("venues").select("slug, name, type, cuisine, city, address, price_range, average_rating, features, short_description, images").eq("is_active", true).limit(200),
      supabase.from("events").select("slug, name, event_type, start_date, end_date, ticket_price, short_description, images, venues(name, city, address)").eq("is_active", true).gte("start_date", new Date().toISOString()).limit(100),
    ]);

    // Detect if user is asking for a plan/itinerary
    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content?.toLowerCase() || "";
    const isPlanRequest = /plan|itinerary|night out|evening|what should|recommend|suggest|where should|date night|weekend|tonight|today|best.*for|things to do|activities/i.test(lastUserMsg);

    // Build a clean venue lookup for the AI
    const venueList = (venues || []).map(v => ({
      slug: v.slug,
      name: v.name,
      type: v.type,
      cuisine: v.cuisine,
      city: v.city,
      address: v.address,
      price_range: v.price_range,
      rating: v.average_rating,
      features: v.features,
      desc: v.short_description,
      img: v.images?.[0] || null,
    }));

    const eventList = (events || []).map(e => ({
      slug: e.slug,
      name: e.name,
      type: e.event_type,
      date: e.start_date,
      price: e.ticket_price,
      desc: e.short_description,
      img: e.images?.[0] || null,
      venue: e.venues?.name || null,
      city: e.venues?.city || null,
    }));

    const systemPrompt = `You are Ausly AI, a friendly nightlife & entertainment planner for Germany.

COMMUNICATION STYLE:
- Be CONCISE. Short sentences. No walls of text.
- Use bullet points, not paragraphs
- Max 2-3 sentences for descriptions
- Emoji sparingly 🎉

YOUR PROCESS:
1. If the user gives you a city and any preference, call the "generate_itineraries" tool IMMEDIATELY. Don't ask too many questions.
2. If you need more info, ask at most 1-2 quick questions with bullet options
3. After tool call, write ONLY a short intro like "Here are your plans! 🎉" — the tool output renders as visual cards automatically
4. NEVER write out venue lists, itinerary details, or stop-by-stop plans in text. ALWAYS use the tool for that.

CRITICAL RULES FOR TOOL CALLS:
- ONLY use venue slugs and names that EXACTLY match the data below
- ONLY use image URLs that EXACTLY come from the venue/event data below — NEVER make up or guess image URLs
- If a venue has no image (empty images array or null), do NOT include an "image" field for that stop
- Each stop's "slug" must exactly match a slug from the data
- Each stop's "name" must exactly match the name from the data
- estimated_total should be a realistic number based on price_range and stop count

VENUE DATA (use EXACT slugs, names, and image URLs):
${JSON.stringify(venueList, null, 0)}

EVENTS DATA (use EXACT slugs, names, and image URLs):
${JSON.stringify(eventList, null, 0)}

ADDITIONAL RULES:
- Only recommend venues/events from the data above — NEVER invent venues
- Each itinerary option should have 3-5 stops
- Include mix of dining, drinks, entertainment
- Vary the options: one budget, one premium, one unique/adventurous
- Use realistic times and travel considerations
- If user asks about a city with no venues in the data, say so honestly
${isAuthenticated ? "- User is signed in, they can save plans and book." : "- User is NOT signed in. Mention they can sign in to save plans."}`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_itineraries",
          description: "Generate 3-5 curated itinerary options for the user's night/day out. Each option is a themed plan with stops at real venues. ALWAYS use this tool when the user wants recommendations or plans — never write plans as text.",
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
                    title: { type: "string", description: "Catchy short title, e.g. 'Budget Bites & Beats'" },
                    emoji: { type: "string", description: "Single emoji representing this option" },
                    vibe: { type: "string", enum: ["chill", "party", "romantic", "foodie", "cultural", "adventurous"], description: "Vibe category" },
                    estimated_total: { type: "number", description: "Total estimated cost per person in EUR" },
                    stops: {
                      type: "array",
                      description: "3-5 stops in chronological order",
                      items: {
                        type: "object",
                        properties: {
                          time: { type: "string", description: "Time like '19:00'" },
                          name: { type: "string", description: "EXACT venue/event name from the data" },
                          slug: { type: "string", description: "EXACT slug from the data" },
                          type: { type: "string", enum: ["dining", "drinks", "nightlife", "activity", "event"] },
                          description: { type: "string", description: "1 sentence why this stop is great" },
                          cost_estimate: { type: "string", description: "Cost like '€15-25' or 'Free'" },
                          image: { type: "string", description: "EXACT image URL from the venue/event data. OMIT this field if no image exists." },
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

    // Build request body — use tool_choice to force tool call when it's clearly a plan request
    const requestBody: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10), // Only send last 10 messages to avoid context bloat
      ],
      tools,
      stream: true,
    };

    // If clearly a plan request and we have venue data, encourage tool use
    if (isPlanRequest && venueList.length > 0) {
      requestBody.tool_choice = { type: "function", function: { name: "generate_itineraries" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
