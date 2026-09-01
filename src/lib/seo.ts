import { Metadata } from "next";

interface SEOParams {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function generateSEOMeta(params: SEOParams): Metadata {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "TRIPLE H PLANDRAFT & ENGINEERING";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tripleh.com.bd";
  const url = params.path ? `${siteUrl}${params.path}` : siteUrl;

  return {
    title: `${params.title} | ${siteName}`,
    description: params.description,
    openGraph: {
      title: `${params.title} | ${siteName}`,
      description: params.description,
      url,
      siteName,
      images: params.ogImage ? [{ url: params.ogImage, width: 1200, height: 630 }] : undefined,
    },
    robots: params.noIndex ? "noindex, nofollow" : "index, follow",
  };
}

export function setClientMeta(params: {
  title: string;
  description?: string;
  ogImage?: string;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "TRIPLE H PLANDRAFT & ENGINEERING";

  document.title = `${params.title} | ${siteName}`;

  if (params.description) {
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute("content", params.description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = params.description;
      document.head.appendChild(meta);
    }

    const ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) {
      ogDescEl.setAttribute("content", params.description);
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:description");
      meta.content = params.description;
      document.head.appendChild(meta);
    }
  }

  if (params.ogImage) {
    const ogImageEl = document.querySelector('meta[property="og:image"]');
    if (ogImageEl) {
      ogImageEl.setAttribute("content", params.ogImage);
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image");
      meta.content = params.ogImage;
      document.head.appendChild(meta);
    }
  }

  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  const fullTitle = `${params.title} | ${siteName}`;
  if (ogTitleEl) {
    ogTitleEl.setAttribute("content", fullTitle);
  } else {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:title");
    meta.content = fullTitle;
    document.head.appendChild(meta);
  }
}
