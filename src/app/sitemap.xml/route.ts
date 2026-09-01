import dbConnect from "@/lib/db";
import Blog from "@/models/blog.model";
import Project from "@/models/project.model";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tripleh.com.bd";

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const staticPages = [
    { loc: BASE_URL, lastmod: new Date(), changefreq: "weekly", priority: "1.0" },
    { loc: `${BASE_URL}/about`, lastmod: new Date(), changefreq: "monthly", priority: "0.8" },
    { loc: `${BASE_URL}/services`, lastmod: new Date(), changefreq: "monthly", priority: "0.9" },
    { loc: `${BASE_URL}/cost-estimator`, lastmod: new Date(), changefreq: "monthly", priority: "0.7" },
    { loc: `${BASE_URL}/track-plan`, lastmod: new Date(), changefreq: "weekly", priority: "0.6" },
    { loc: `${BASE_URL}/book-appointment`, lastmod: new Date(), changefreq: "monthly", priority: "0.6" },
    { loc: `${BASE_URL}/contact`, lastmod: new Date(), changefreq: "monthly", priority: "0.7" },
    { loc: `${BASE_URL}/blog`, lastmod: new Date(), changefreq: "weekly", priority: "0.8" },
    { loc: `${BASE_URL}/faq`, lastmod: new Date(), changefreq: "monthly", priority: "0.6" },
    { loc: `${BASE_URL}/team`, lastmod: new Date(), changefreq: "monthly", priority: "0.7" },
  ];

  const pages = [...staticPages];

  try {
    await dbConnect();
    const [blogs, projects] = await Promise.all([
      Blog.find({ status: "published" }).select("slug updatedAt").lean(),
      Project.find({ status: "published" }).select("slug updatedAt").lean(),
    ]);

    for (const b of blogs as any[]) {
      pages.push({
        loc: `${BASE_URL}/blog/${xmlEscape(b.slug)}`,
        lastmod: b.updatedAt || new Date(),
        changefreq: "monthly",
        priority: "0.6",
      });
    }

    if (projects.length > 0) {
      const latest = (projects as any[]).reduce((a, b) =>
        (a.updatedAt || 0) > (b.updatedAt || 0) ? a : b
      );
      pages.push({
        loc: `${BASE_URL}/portfolio`,
        lastmod: latest.updatedAt || new Date(),
        changefreq: "weekly",
        priority: "0.8",
      });
    } else {
      pages.push({
        loc: `${BASE_URL}/portfolio`,
        lastmod: new Date(),
        changefreq: "weekly",
        priority: "0.8",
      });
    }
  } catch {
    // fallback to static only
  }

  const urlset = pages
    .map(
      (p) => `  <url>
    <loc>${xmlEscape(p.loc)}</loc>
    <lastmod>${(p.lastmod as Date).toISOString()}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
