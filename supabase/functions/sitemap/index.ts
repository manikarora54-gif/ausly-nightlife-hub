// Dynamic sitemap edge function — pulls active venues + upcoming events
// Public endpoint (no JWT required). Returns XML.
// Reference URL: https://dpbsxrqjendnoraasafs.supabase.co/functions/v1/sitemap

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE = "https://ausly.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const [{ data: venues }, { data: events }] = await Promise.all([
      supabase
        .from("venues")
        .select("slug, id, updated_at, city, type, images")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(5000),
      supabase
        .from("events")
        .select("slug, id, updated_at, start_date, images")
        .eq("is_active", true)
        .gte("start_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("start_date", { ascending: true })
        .limit(5000),
    ]);

    const urls: string[] = [];

    // Static high-priority routes
    const staticRoutes: Array<[string, string, number]> = [
      ["/", "daily", 1.0],
      ["/discover", "daily", 0.9],
      ["/map", "weekly", 0.7],
      ["/movies", "daily", 0.7],
      ["/cinemas", "weekly", 0.6],
      ["/plan", "weekly", 0.6],
      ["/our-story", "monthly", 0.5],
      ["/help", "monthly", 0.4],
      ["/contact", "monthly", 0.4],
    ];
    for (const [path, freq, prio] of staticRoutes) {
      urls.push(
        `<url><loc>${SITE}${path}</loc><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`
      );
    }

    // Venues
    for (const v of venues || []) {
      const slug = v.slug || v.id;
      const lastmod = v.updated_at ? new Date(v.updated_at).toISOString().split("T")[0] : undefined;
      const image = Array.isArray(v.images) && v.images[0] ? `<image:image><image:loc>${escapeXml(v.images[0])}</image:loc></image:image>` : "";
      urls.push(
        `<url><loc>${SITE}/venue/${escapeXml(slug)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.7</priority>${image}</url>`
      );
    }

    // Events
    for (const e of events || []) {
      const slug = e.slug || e.id;
      const lastmod = e.updated_at ? new Date(e.updated_at).toISOString().split("T")[0] : undefined;
      const image = Array.isArray(e.images) && e.images[0] ? `<image:image><image:loc>${escapeXml(e.images[0])}</image:loc></image:image>` : "";
      urls.push(
        `<url><loc>${SITE}/event/${escapeXml(slug)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>daily</changefreq><priority>0.7</priority>${image}</url>`
      );
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
      urls.join("\n") +
      `\n</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("sitemap error:", err);
    return new Response(`<?xml version="1.0"?><error>${(err as Error).message}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
