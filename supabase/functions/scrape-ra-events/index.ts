const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CITIES = [
  { name: 'Berlin', raSlug: 'berlin' },
  { name: 'Munich', raSlug: 'munich' },
  { name: 'Hamburg', raSlug: 'hamburg' },
  { name: 'Frankfurt', raSlug: 'frankfurt' },
  { name: 'Cologne', raSlug: 'cologne' },
  { name: 'Düsseldorf', raSlug: 'dusseldorf' },
  { name: 'Stuttgart', raSlug: 'stuttgart' },
  { name: 'Leipzig', raSlug: 'leipzig' },
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
    if (!firecrawlKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const results: any[] = [];

    for (const city of CITIES) {
      console.log(`Scraping RA events for ${city.name}...`);
      
      const raUrl = `https://ra.co/events/de/${city.raSlug}`;
      
      const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: raUrl,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 3000,
        }),
      });

      const scrapeText = await scrapeRes.text();
      let scrapeData: any;
      try {
        scrapeData = JSON.parse(scrapeText);
      } catch {
        console.error(`Non-JSON response for ${city.name}:`, scrapeText.substring(0, 200));
        continue;
      }
      
      if (!scrapeRes.ok) {
        console.error(`Failed to scrape RA for ${city.name}:`, scrapeData);
        continue;
      }

      const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || '';
      
      if (!markdown) {
        console.log(`No content found for ${city.name}`);
        continue;
      }

      // Use Lovable AI to parse the events from markdown
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableApiKey) {
        console.error('LOVABLE_API_KEY not configured, skipping AI parsing');
        continue;
      }

      const aiRes = await fetch('https://api.lovable.dev/v1/chat/completions', {
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
              content: `You extract event data from Resident Advisor website content. Return a JSON array of events. Each event should have: name (string), date (ISO date string), venue_name (string), description (string, short), event_type (one of: concert, club_night, festival, party, live_music). Only include real events, not navigation or ads. Return ONLY valid JSON array, no markdown.`
            },
            {
              role: 'user',
              content: `Extract events from this Resident Advisor page for ${city.name}, Germany:\n\n${markdown.substring(0, 8000)}`
            }
          ],
          temperature: 0.1,
        }),
      });

      const aiText = await aiRes.text();
      let aiData: any;
      try { aiData = JSON.parse(aiText); } catch { console.error('AI non-JSON:', aiText.substring(0, 200)); continue; }
      const aiContent = aiData?.choices?.[0]?.message?.content || '[]';
      
      let events: any[] = [];
      try {
        // Try to parse JSON, handle potential markdown wrapping
        const cleaned = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        events = JSON.parse(cleaned);
      } catch (e) {
        console.error(`Failed to parse AI response for ${city.name}:`, e);
        continue;
      }

      // Upsert events into the database
      for (const event of events) {
        if (!event.name || !event.date) continue;
        
        const slug = slugify(`${event.name}-${city.name}-${event.date?.split('T')[0] || ''}`);
        const sourceUrl = raUrl;

        const { error } = await supabase.from('events').upsert({
          name: event.name,
          slug,
          description: event.description || `${event.name} at ${event.venue_name || city.name}`,
          short_description: event.description?.substring(0, 150) || null,
          event_type: event.event_type || 'club_night',
          start_date: event.date,
          is_active: true,
          source: 'resident_advisor',
          source_url: sourceUrl,
        }, { onConflict: 'slug' });

        if (error) {
          console.error(`Failed to upsert event ${event.name}:`, error);
        } else {
          results.push({ name: event.name, city: city.name });
        }
      }
    }

    console.log(`Scraped ${results.length} events total`);

    return new Response(
      JSON.stringify({ success: true, count: results.length, events: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in RA scraper:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
