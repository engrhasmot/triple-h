import type { Metadata } from "next";
import { Inter, Montserrat, Hind_Siliguri } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "./globals.css";

// Body font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Headings font
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Bengali font
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TRIPLE H PLANDRAFT & ENGINEERING | পরিকল্পিত নকশা, নিরাপদ নির্মাণ",
    template: "%s | TRIPLE H PLANDRAFT & ENGINEERING",
  },
  description:
    "Professional civil engineering consultancy specializing in 2D/3D architectural design, structural drafting, BOQ estimation, plan passing, and site supervision in Bangladesh.",
  keywords: [
    "civil engineering Bangladesh",
    "architectural design",
    "structural drafting",
    "BOQ estimation",
    "plan passing",
    "site supervision",
    "Bangladesh",
    "2D plans",
    "3D design",
    "construction",
    "TRIPLE H",
    "3D rendering",
    "RAJUK plan approval",
    "plan approval Bangladesh",
    "structural design Bangladesh",
    "cost estimator",
    "construction cost estimator",
    "residential building design",
    "commercial building design",
  ],
  authors: [{ name: "TRIPLE H PLANDRAFT & ENGINEERING" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "TRIPLE H PLANDRAFT & ENGINEERING",
    description:
      "Planned Design, Safe Construction — Professional civil engineering consultancy in Bangladesh.",
    type: "website",
    locale: "en_BD",
    siteName: "TRIPLE H PLANDRAFT & ENGINEERING",
    images: [{ url: "/images/logo.png", width: 1024, height: 1024 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${montserrat.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster richColors position="top-right" />
          <Script id="jsonld-organization" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "TRIPLE H PLANDRAFT & ENGINEERING",
              alternateName: "Triple H Engineering",
              description: "Professional civil engineering consultancy in Bangladesh specializing in 2D/3D architectural design, structural drafting, BOQ estimation, plan passing, and site supervision.",
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/images/logo.png`,
              email: "info@tripleh.com.bd",
              telephone: "+880-1778-506500",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Aysha Monjil, House 14/05, Ward No 1",
                addressLocality: "Noyabari, Savar Radio Colony, Dhaka",
                addressCountry: "BD",
              },
              sameAs: [
                `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801778506500"}`,
              ],
              knowsAbout: [
                "Civil Engineering",
                "Architectural Design",
                "Structural Drafting",
                "3D Rendering",
                "BOQ Estimation",
                "Plan Passing",
                "Construction Supervision",
              ],
            })}
          </Script>
      </body>
    </html>
  );
}
