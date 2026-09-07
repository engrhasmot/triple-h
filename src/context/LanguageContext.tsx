"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "bn" | "en";

const translations: Record<Locale, Record<string, string>> = {
  bn: {
    // Nav links
    "nav.home": "হোম",
    "nav.about": "আমাদের সম্পর্কে",
    "nav.services": "সেবাসমূহ",
    "nav.portfolio": "প্রজেক্টসমূহ",
    "nav.contact": "যোগাযোগ",
    "nav.more": "অন্যান্য",
    "nav.costEstimator": "খরচ ক্যালকুলেটর",
    "nav.clientPortal": "ক্লায়েন্ট পোর্টাল",
    "nav.trackPlan": "প্ল্যান ট্র্যাকার",
    "nav.bookAppointment": "অ্যাপয়েন্টমেন্ট নিন",
    "nav.verify": "ডকুমেন্ট যাচাই",
    "nav.blog": "ব্লগ",
    "nav.faq": "সাধারণ জিজ্ঞাসা",
    "nav.team": "আমাদের ইঞ্জিনিয়ার",
    "nav.callNow": "কল করুন",

    // Common
    "common.tripleh": "ট্রিপল এইচ",
    "common.tagline": "প্ল্যানড্রাফট ও ইঞ্জিনিয়ারিং কনসালটেন্সি",
    "common.callNow": "সরাসরি কল করুন",
    "common.getEstimate": "খরচের হিসাব দেখুন",
    "common.bookVisit": "সাইট ভিজিট বুক করুন",
    "common.explore": "আমাদের সেবাসমূহ",
  },
  en: {
    // Nav links
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.portfolio": "Portfolio",
    "nav.contact": "Contact",
    "nav.more": "More",
    "nav.costEstimator": "Cost Estimator",
    "nav.clientPortal": "Client Portal",
    "nav.trackPlan": "Track Plan",
    "nav.bookAppointment": "Book Appointment",
    "nav.verify": "Verify Document",
    "nav.blog": "Blog",
    "nav.faq": "FAQ",
    "nav.team": "Our Team",
    "nav.callNow": "Call Now",

    // Common
    "common.tripleh": "Triple H",
    "common.tagline": "Plandraft & Engineering Consultancy",
    "common.callNow": "Call Now",
    "common.getEstimate": "Get Cost Estimate",
    "common.bookVisit": "Book Site Visit",
    "common.explore": "Explore Services",
  },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "bn",
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("bn");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferred_lang") as Locale;
      if (saved === "bn" || saved === "en") {
        setLocaleState(saved);
      }
    } catch {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("preferred_lang", l);
    } catch {}
  };

  const toggleLocale = () => {
    const next = locale === "bn" ? "en" : "bn";
    setLocale(next);
  };

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
