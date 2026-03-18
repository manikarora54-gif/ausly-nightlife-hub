import { promises as fs } from 'fs';
import path from 'path';

interface Route {
    path: string;
    priority: number;
    changeFrequency: string;
}

const routes: Route[] = [
    { path: '/', priority: 1.0, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.8, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
    // Add more routes as necessary
];

const generateSitemap = async () => {
    const urlset = routes.map(route => `<url>` +
        `<loc>https://www.yoursite.com${route.path}</loc>` +
        `<priority>${route.priority}</priority>` +
        `<changefreq>${route.changeFrequency}</changefreq>` +
        `</url>`).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image">\n` +
        `${urlset}\n` +
        `</urlset>`;

    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    await fs.writeFile(sitemapPath, sitemap);
    console.log('Sitemap generated at:', sitemapPath);
};

generateSitemap().catch(err => console.error('Error generating sitemap:', err));