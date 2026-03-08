const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) throw new Error('FIRECRAWL_API_KEY not configured');

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let body: any = {};
    try { body = await req.json(); } catch {}
    const cityFilter = body?.city as string | undefined;
    const batchSize = body?.batchSize || 5;

    // Get Wolt restaurants that don't have menu items yet
    let query = supabase
      .from('venues')
      .select('id, name, city, website, slug')
      .eq('source', 'wolt')
      .eq('is_active', true)
      .not('website', 'is', null);

    if (cityFilter) {
      query = query.ilike('city', cityFilter);
    }

    const { data: venues, error: venueError } = await query.limit(batchSize);
    if (venueError) throw venueError;
    if (!venues || venues.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'No venues to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out venues that already have menu items
    const venueIds = venues.map(v => v.id);
    const { data: existingMenus } = await supabase
      .from('menu_items')
      .select('venue_id')
      .in('venue_id', venueIds);

    const venuesWithMenus = new Set((existingMenus || []).map(m => m.venue_id));
    const venuesToProcess = venues.filter(v => !venuesWithMenus.has(v.id));

    if (venuesToProcess.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'All venues already have menus' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];
    let totalMenuItems = 0;

    for (const venue of venuesToProcess) {
      console.log(`Scraping menu for ${venue.name} (${venue.city})...`);

      try {
        // Scrape the restaurant's Wolt page
        const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: venue.website,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 5000,
          }),
        });

        const scrapeText = await scrapeRes.text();
        let scrapeData: any;
        try { scrapeData = JSON.parse(scrapeText); } catch { continue; }

        const menuContent = (scrapeData?.data?.markdown || scrapeData?.markdown || '').substring(0, 12000);
        if (!menuContent.trim()) {
          console.log(`No content for ${venue.name}, skipping`);
          continue;
        }

        // Extract menu items with AI
        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `Extract menu items from this Wolt restaurant page. Return a JSON array. Each object:
- name (string, required) — dish/item name
- description (string or null) — brief description
- price (number or null) — price in EUR (number only)
- category (string, required) — e.g. "Burgers", "Pizza", "Drinks", "Desserts", "Sides", "Salads", "Main Courses", "Appetizers", "Wraps", "Bowls"
- image_url (string or null) — Wolt CDN image URL if found

Extract up to 30 items. Prioritize popular/featured items. Return ONLY valid JSON array.`
              },
              {
                role: 'user',
                content: `Extract menu items from ${venue.name} in ${venue.city}:\n\n${menuContent}`
              }
            ],
            temperature: 0.1,
          }),
        });

        const aiText = await aiRes.text();
        let aiData: any;
        try { aiData = JSON.parse(aiText); } catch { continue; }

        const aiContent = aiData?.choices?.[0]?.message?.content || '[]';
        let menuItems: any[] = [];
        try {
          const cleaned = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          menuItems = JSON.parse(cleaned);
        } catch { continue; }

        if (menuItems.length > 0) {
          const menuRows = menuItems.map((item: any) => ({
            venue_id: venue.id,
            name: item.name,
            description: item.description || null,
            price: item.price || null,
            currency: 'EUR',
            category: item.category || 'Other',
            image_url: item.image_url || null,
            is_available: true,
          }));

          const { error: menuError } = await supabase.from('menu_items').insert(menuRows);
          if (menuError) {
            console.error(`Failed to insert menu for ${venue.name}:`, menuError);
          } else {
            totalMenuItems += menuItems.length;
            results.push({ venue: venue.name, city: venue.city, items: menuItems.length });
            console.log(`Inserted ${menuItems.length} menu items for ${venue.name}`);
          }
        }
      } catch (e) {
        console.error(`Error processing ${venue.name}:`, e);
      }
    }

    console.log(`Scraped menus: ${results.length} restaurants, ${totalMenuItems} items`);

    return new Response(
      JSON.stringify({ success: true, restaurantsProcessed: results.length, menuItemsCount: totalMenuItems, details: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in menu scraper:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
