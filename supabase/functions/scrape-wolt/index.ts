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

    // Accept optional city filter to avoid timeouts
    let body: any = {};
    try { body = await req.json(); } catch {}
    const cityFilter = body?.city as string | undefined;

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

    for (const city of citiesToScrape) {
      console.log(`Scraping Wolt restaurants for ${city.name}...`);

      // Scrape Wolt restaurant listing page
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
      try {
        scrapeData = JSON.parse(scrapeText);
      } catch {
        console.error(`Non-JSON scrape response for ${city.name}:`, scrapeText.substring(0, 200));
      }

      // Also search for more Wolt restaurants in this city
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
      try {
        searchData = JSON.parse(searchText);
      } catch {
        console.error(`Non-JSON search response for ${city.name}:`, searchText.substring(0, 200));
        continue;
      }

      // Combine content
      const scrapedContent = scrapeData?.data?.markdown || scrapeData?.markdown || '';
      const searchContent = (searchData?.data || [])
        .map((r: any) => `### ${r.title || ''}\nURL: ${r.url || ''}\n${r.markdown || r.description || ''}`)
        .join('\n\n');

      const allContent = `${scrapedContent}\n\n${searchContent}`.substring(0, 15000);

      if (!allContent.trim()) {
        console.log(`No content found for ${city.name}, skipping`);
        continue;
      }

      // Parse with AI
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
- cuisine (string, required) — primary cuisine type (e.g. "Italian", "Japanese", "German", "Turkish", "Indian", "American", "Vietnamese", "Thai", "Mexican", "Mediterranean", "Korean", "Middle Eastern")
- address (string, required) — specific street address. Use real addresses when available, otherwise use "City Center, [City]" with a plausible street.
- price_range (number 1-4) — 1=budget, 2=moderate, 3=upscale, 4=fine dining. Estimate from context.
- rating (number or null) — rating out of 5 if mentioned
- delivery_fee (string or null) — e.g. "€1.99", "Free delivery"
- delivery_time (string or null) — e.g. "25-35 min"
- website (string URL or null) — the Wolt URL for this restaurant
- image_url (string, MANDATORY) — extract image URLs. Look for Wolt CDN URLs (imageproxy.wolt.com, wolt.com). NEVER return null — use a relevant food/restaurant image URL if not found.
- features (array of strings) — e.g. ["Delivery", "Takeaway", "Popular"], extract from tags/badges if available

Extract at most 20 unique restaurants per city. Prioritize diversity in cuisine types. Return ONLY valid JSON array.`
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
      try {
        aiData = JSON.parse(aiText);
      } catch {
        console.error('AI non-JSON:', aiText.substring(0, 200));
        continue;
      }

      const aiContent = aiData?.choices?.[0]?.message?.content || '[]';

      let restaurants: any[] = [];
      try {
        const cleaned = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        restaurants = JSON.parse(cleaned);
      } catch (e) {
        console.error(`Failed to parse restaurants for ${city.name}:`, e);
        continue;
      }

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

        if (rest.rating) {
          venueData.average_rating = rest.rating;
        }
        if (rest.price_range) {
          venueData.price_range = rest.price_range;
        }

        const { error } = await supabase.from('venues').upsert(venueData, { onConflict: 'slug' });

        if (error) {
          console.error(`Failed to upsert restaurant ${rest.name}:`, error);
        } else {
          results.push({
            name: rest.name,
            city: city.name,
            cuisine: rest.cuisine,
            hasImage: !!rest.image_url,
            price_range: rest.price_range,
          });
        }
      }
    }

    console.log(`Scraped ${results.length} Wolt restaurants total`);

    return new Response(
      JSON.stringify({ success: true, count: results.length, restaurants: results }),
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
