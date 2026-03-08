const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CITIES = [
  { name: 'Berlin', woltSlug: 'berlin' },
  { name: 'Munich', woltSlug: 'munich' },
  { name: 'Hamburg', woltSlug: 'hamburg' },
  { name: 'Frankfurt', woltSlug: 'frankfurt-am-main' },
  { name: 'Cologne', woltSlug: 'cologne' },
  { name: 'Düsseldorf', woltSlug: 'dusseldorf' },
  { name: 'Stuttgart', woltSlug: 'stuttgart' },
  { name: 'Leipzig', woltSlug: 'leipzig' },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function scrapeRestaurantMenu(firecrawlKey: string, restaurantUrl: string, restaurantName: string, cityName: string, lovableApiKey: string): Promise<any[]> {
  console.log(`Scraping menu for ${restaurantName}...`);
  
  try {
    const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: restaurantUrl,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 5000,
      }),
    });

    const scrapeText = await scrapeRes.text();
    let scrapeData: any;
    try { scrapeData = JSON.parse(scrapeText); } catch { return []; }

    const menuContent = (scrapeData?.data?.markdown || scrapeData?.markdown || '').substring(0, 12000);
    if (!menuContent.trim()) return [];

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
            content: `Extract menu items from this Wolt restaurant page. Return a JSON array of menu items. Each object must have:
- name (string, required) — dish/item name
- description (string or null) — brief description of the dish
- price (number or null) — price in EUR (just the number, no currency symbol)
- category (string, required) — menu category (e.g. "Burgers", "Pizza", "Drinks", "Desserts", "Sides", "Salads", "Main Courses", "Appetizers")
- image_url (string or null) — image URL if available

Extract up to 30 items. Prioritize popular/featured items. Return ONLY valid JSON array.`
          },
          {
            role: 'user',
            content: `Extract menu items from ${restaurantName} in ${cityName}:\n\n${menuContent}`
          }
        ],
        temperature: 0.1,
      }),
    });

    const aiText = await aiRes.text();
    let aiData: any;
    try { aiData = JSON.parse(aiText); } catch { return []; }

    const aiContent = aiData?.choices?.[0]?.message?.content || '[]';
    const cleaned = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error(`Menu scrape failed for ${restaurantName}:`, e);
    return [];
  }
}

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
    const scrapeMenus = body?.scrapeMenus !== false; // default true

    const citiesToScrape = cityFilter
      ? CITIES.filter(c => c.name.toLowerCase() === cityFilter.toLowerCase())
      : CITIES;

    if (citiesToScrape.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: `City "${cityFilter}" not found` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];
    let menuCount = 0;

    for (const city of citiesToScrape) {
      console.log(`Scraping Wolt restaurants for ${city.name}...`);

      const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://wolt.com/en/deu/${city.woltSlug}/restaurants`,
          formats: ['markdown', 'links'],
          onlyMainContent: true,
          waitFor: 5000,
        }),
      });

      const scrapeText = await scrapeRes.text();
      let scrapeData: any;
      try { scrapeData = JSON.parse(scrapeText); } catch {
        console.error(`Non-JSON scrape response for ${city.name}:`, scrapeText.substring(0, 200));
      }

      const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `site:wolt.com ${city.name} Germany restaurants best rated`,
          limit: 10,
          scrapeOptions: { formats: ['markdown'] },
        }),
      });

      const searchText = await searchRes.text();
      let searchData: any;
      try { searchData = JSON.parse(searchText); } catch {
        console.error(`Non-JSON search response for ${city.name}:`, searchText.substring(0, 200));
        continue;
      }

      const scrapedContent = scrapeData?.data?.markdown || scrapeData?.markdown || '';
      const searchContent = (searchData?.data || [])
        .map((r: any) => `### ${r.title || ''}\nURL: ${r.url || ''}\n${r.markdown || r.description || ''}`)
        .join('\n\n');

      const allContent = `${scrapedContent}\n\n${searchContent}`.substring(0, 15000);

      if (!allContent.trim()) {
        console.log(`No content found for ${city.name}, skipping`);
        continue;
      }

      // Parse restaurants with AI
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
              content: `You are extracting restaurant data from Wolt scraped content. Return a JSON array of restaurants. Each object must have:

- name (string, required) — restaurant name, cleaned of any extra text
- description (string, required, 3-5 sentences) — describe the cuisine, atmosphere, popular dishes, what makes it special. NEVER leave empty.
- short_description (string, required, max 100 chars) — brief tagline
- cuisine (string, required) — primary cuisine type
- address (string, required) — specific street address. Use real addresses when available, otherwise use "City Center, [City]" with a plausible street.
- price_range (number 1-4)
- rating (number or null) — rating out of 5 if mentioned
- delivery_fee (string or null)
- delivery_time (string or null)
- website (string URL or null) — the Wolt URL for this restaurant
- image_url (string, MANDATORY) — extract image URLs from Wolt CDN
- features (array of strings)

Extract at most 20 unique restaurants per city. Return ONLY valid JSON array.`
            },
            {
              role: 'user',
              content: `Extract Wolt restaurants in ${city.name}, Germany from:\n\n${allContent}`
            }
          ],
          temperature: 0.1,
        }),
      });

      const aiText = await aiRes.text();
      let aiData: any;
      try { aiData = JSON.parse(aiText); } catch { continue; }

      const aiContent = aiData?.choices?.[0]?.message?.content || '[]';
      let restaurants: any[] = [];
      try {
        const cleaned = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        restaurants = JSON.parse(cleaned);
      } catch { continue; }

      console.log(`Found ${restaurants.length} restaurants for ${city.name}`);

      for (const rest of restaurants) {
        if (!rest.name) continue;

        const slug = slugify(`${rest.name}-${city.name}-wolt`);

        const venueData: Record<string, any> = {
          name: rest.name,
          slug,
          description: rest.description || rest.name,
          short_description: rest.short_description || rest.description?.substring(0, 150) || null,
          type: 'restaurant',
          cuisine: rest.cuisine || null,
          address: rest.address || `${city.name} City Center`,
          city: city.name,
          website: rest.website || `https://wolt.com/en/deu/${city.woltSlug}/restaurants`,
          images: rest.image_url ? [rest.image_url] : [],
          features: rest.features || ['Delivery'],
          is_active: true,
          source: 'wolt',
          source_url: rest.website || `https://wolt.com/en/deu/${city.woltSlug}/restaurants`,
        };

        if (rest.rating) venueData.average_rating = rest.rating;
        if (rest.price_range) venueData.price_range = rest.price_range;

        const { data: upsertedVenue, error } = await supabase
          .from('venues')
          .upsert(venueData, { onConflict: 'slug' })
          .select('id')
          .single();

        if (error) {
          console.error(`Failed to upsert restaurant ${rest.name}:`, error);
          continue;
        }

        results.push({
          name: rest.name,
          city: city.name,
          cuisine: rest.cuisine,
          hasImage: !!rest.image_url,
          price_range: rest.price_range,
        });

        // Scrape menu for this restaurant if enabled and we have a URL
        if (scrapeMenus && upsertedVenue?.id && rest.website) {
          const menuItems = await scrapeRestaurantMenu(firecrawlKey, rest.website, rest.name, city.name, lovableApiKey);

          if (menuItems.length > 0) {
            // Delete old menu items for this venue
            await supabase.from('menu_items').delete().eq('venue_id', upsertedVenue.id);

            const menuRows = menuItems.map((item: any) => ({
              venue_id: upsertedVenue.id,
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
              console.error(`Failed to insert menu for ${rest.name}:`, menuError);
            } else {
              menuCount += menuItems.length;
              console.log(`Inserted ${menuItems.length} menu items for ${rest.name}`);
            }
          }
        }
      }
    }

    console.log(`Scraped ${results.length} restaurants, ${menuCount} menu items total`);

    return new Response(
      JSON.stringify({ success: true, count: results.length, menuItemsCount: menuCount, restaurants: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Wolt scraper:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
