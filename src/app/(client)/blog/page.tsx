"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, User, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import SEOHead from "@/components/shared/SEOHead";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  coverImage?: { url: string; publicId: string };
  tags: string[];
  category: string;
  publishedAt: string;
  status: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    document.title = "Blog & Articles | TRIPLE H PLANDRAFT & ENGINEERING";
  }, []);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== "All") params.set("category", activeCategory);
        const res = await fetch(`/api/blog?${params.toString()}`);
        const json = await res.json();
        setBlogs(json.blogs || []);
        if (activeCategory === "All") {
          const cats = [...new Set((json.blogs || []).map((b: BlogPost) => b.category))] as string[];
          setCategories(cats);
        }
      } catch {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, [activeCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen">
      <SEOHead title="Blog" description="বাংলাদেশের ভবন নির্মাণ, প্ল্যান ড্রাফটিং ও ইঞ্জিনিয়ারিং সম্পর্কে সংবাদ ও টিপস।" />
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">Blog & Articles</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Insights, guides, and updates from the world of civil engineering, architectural design, and construction.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <motion.div
          className="mb-8 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setActiveCategory("All")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-card ring-1 ring-foreground/10">
                <div className="aspect-[16/9] rounded-t-xl bg-muted" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-20 rounded bg-muted" />
                  <div className="h-5 w-full rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold">No articles yet</h3>
            <p className="mt-2 text-muted-foreground">Check back soon for new content.</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {blogs.map((blog) => (
              <motion.article key={blog._id} variants={cardVariants}>
                <Link href={`/blog/${blog.slug}`} className="group block">
                  <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      {blog.coverImage?.url ? (
                        <Image
                          src={blog.coverImage.url}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge className="absolute left-3 top-3">{blog.category}</Badge>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {blog.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(blog.publishedAt)}
                        </span>
                      </div>
                      <h3 className="mb-2 line-clamp-2 text-base font-semibold group-hover:text-primary">
                        {blog.title}
                      </h3>
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                        {blog.excerpt.length > 120
                          ? blog.excerpt.slice(0, 120).trimEnd() + "..."
                          : blog.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Read More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
