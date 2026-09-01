"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SEOHead from "@/components/shared/SEOHead";

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

interface FaqGroup {
  category: string;
  items: FaqItem[];
}

interface FaqResponse {
  categories: string[];
  faqs: FaqGroup[];
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
  );
}

function FaqSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-5 space-y-3">
          <Shimmer className="h-5 w-3/4" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FaqPage() {
  const [data, setData] = useState<FaqResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/faqs")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        if (json.categories?.length > 0) {
          setActiveCategory(json.categories[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeGroup = data?.faqs.find((g) => g.category === activeCategory);
  const filteredItems = activeGroup?.items.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-background">
      <SEOHead title="FAQ" description="প্ল্যান ড্রাফটিং, রাজুক অনুমোদন ও ইঞ্জিনিয়ারিং সেবা সম্পর্কে সাধারণ প্রশ্নোত্তর।" />
      {/* Hero */}
      <section className="bg-primary pt-32 pb-16 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-primary-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Find answers to common questions about our services, process, and policies.
          </p>
        </motion.div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <FaqSkeleton />
        ) : !data || data.faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
            <HelpCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No FAQs available yet.</p>
            <p className="text-muted-foreground text-sm mt-1">Check back later for updates.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Search */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  className="pl-10 h-12"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </motion.div>

            {/* Category tabs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-8">
              {data.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSearch(""); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-accent text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* FAQ Accordion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
              >
                {filteredItems && filteredItems.length > 0 ? (
                  <Accordion defaultValue={[]}>
                    {filteredItems.map((item, idx) => (
                      <motion.div key={item._id} variants={itemVariants}>
                        <AccordionItem value={`item-${idx}`} className="mb-2 rounded-xl border px-5">
                          <AccordionTrigger className="text-base font-semibold py-4">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    <Search className="w-10 h-10 mx-auto mb-3" />
                    <p>No FAQs match your search.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
