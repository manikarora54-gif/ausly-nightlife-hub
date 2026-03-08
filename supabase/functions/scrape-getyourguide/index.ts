const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CITIES = [
  { name: 'Berlin', gygSlug: 'berlin-l17' },
  { name: 'Munich', gygSlug: 'munich-l26' },
  { name: 'Hamburg', gygSlug: 'hamburg-l30' },
  { name: 'Frankfurt', gygSlug: 'frankfurt-l35' },
  { name: 'Cologne', gygSlug: 'cologne-l31' },
  { name: 'Düsseldorf', gygSlug: 'dusseldorf-l149' },
  { name: 'Stuttgart', gygSlug: 'stuttgart-l164' },
  { name: 'Leipzig', gygSlug: 'leipzig-l165' },
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

    const results: any[] = [];

    for (const city of CITIES) {
      console.log(`Scraping GetYourGuide experiences for ${city.name}...`);

      // Scrape GetYourGuide city page for experiences
      const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://www.getyourguide.com/${city.gygSlug}/`,
          formats: ['markdown', 'links'],
          onlyMainContent: true,
          waitFor: 3000,
        }),
      });

      const scrapeText = await scrapeRes.text();
      let scrapeData: any;
      try {
        scrapeData = JSON.parse(scrapeText);
      } catch {
        console.error(`Non-JSON scrape response for ${city.name}:`, scrapeText.substring(0, 200));
        // Fallback to search
      }

      // Also search for more results
      const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `site:getyourguide.com ${city.name} Germany tours experiences activities`,
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

      // Combine scraped content
      const scrapedContent = scrapeData?.data?.markdown || scrapeData?.markdown || '';
      const searchContent = (searchData?.data || [])
        .map((r: any) => `### ${r.title || ''}\nURL: ${r.url || ''}\n${r.markdown || r.description || ''}`)
        .join('\n\n');

      const allContent = `${scrapedContent}\n\n${searchContent}`.substring(0, 12000);

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
              content: `You are extracting GetYourGuide tours and experiences from scraped content. Return a JSON array of experiences. Each object must have:

- name (string, required) — the tour/experience title. Clean up any pricing or rating text from the name.
- description (string, required, 3-5 sentences) — detailed description of what the experience includes. What visitors will see/do, highlights, duration if mentioned. NEVER leave empty.
- address (string, required) — meeting point or main location. Use specific addresses when available, otherwise "City Center, [City]" or a known landmark.
- type (string, one of: tour, museum, experience, food_tour, walking_tour, boat_tour, attraction, pub_crawl, workshop, day_trip)
- price_estimate (number in EUR or null) — extract from content if mentioned
- duration (string or null) — e.g. "3 hours", "Full day"
- rating (number or null) — extract rating if mentioned (out of 5)
- review_count (number or null) — number of reviews if mentioned
- website (string URL or null) — the GetYourGuide URL for this experience
- image_url (string, MANDATORY) — extract image URLs from the content. Look for GetYourGuide CDN URLs (images.getyourguide.com). If not found, use a relevant photo URL. NEVER return null.

Extract at most 15 unique experiences per city. Prioritize diverse categories (not all walking tours). Return ONLY valid JSON array.`
            },
            {
              role: 'user',
              content: `Extract GetYourGuide experiences in ${city.name}, Germany from:\n\n${allContent}`
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

      let experiences: any[] = [];
      try {
        const cleaned = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        experiences = JSON.parse(cleaned);
      } catch (e) {
        console.error(`Failed to parse experiences for ${city.name}:`, e);
        continue;
      }

      console.log(`Found ${experiences.length} experiences for ${city.name}`);

      for (const exp of experiences) {
        if (!exp.name) continue;

        const slug = slugify(`${exp.name}-${city.name}`);

        const venueData: Record<string, any> = {
          name: exp.name,
          slug,
          description: exp.description || exp.name,
          short_description: exp.description?.substring(0, 150) || null,
          type: exp.type || 'experience',
          address: exp.address || `${city.name} City Center`,
          city: city.name,
          website: exp.website || `https://www.getyourguide.com/${city.gygSlug}/`,
          images: exp.image_url ? [exp.image_url] : [],
          is_active: true,
          source: 'getyourguide',
          source_url: exp.website || `https://www.getyourguide.com/${city.gygSlug}/`,
        };

        // Store rating if available
        if (exp.rating) {
          venueData.average_rating = exp.rating;
        }
        if (exp.review_count) {
          venueData.review_count = exp.review_count;
        }
        // Store price as price_range (1-4 scale)
        if (exp.price_estimate) {
          if (exp.price_estimate <= 20) venueData.price_range = 1;
          else if (exp.price_estimate <= 50) venueData.price_range = 2;
          else if (exp.price_estimate <= 100) venueData.price_range = 3;
          else venueData.price_range = 4;
        }

        const { error } = await supabase.from('venues').upsert(venueData, { onConflict: 'slug' });

        if (error) {
          console.error(`Failed to upsert experience ${exp.name}:`, error);
        } else {
          results.push({
            name: exp.name,
            city: city.name,
            type: exp.type,
            hasImage: !!exp.image_url,
            price: exp.price_estimate,
          });
        }
      }
    }

    console.log(`Scraped ${results.length} GetYourGuide experiences total`);

    return new Response(
      JSON.stringify({ success: true, count: results.length, experiences: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in GetYourGuide scraper:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
