"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, User, ArrowLeft, Tag, BookOpen, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, truncate } from "@/lib/utils";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  coverImage?: { url: string; publicId: string };
  tags: string[];
  category: string;
  publishedAt: string;
}

import { setClientMeta } from "@/lib/seo";

export default function BlogDetailPage() {
  const params = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchBlog() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/blog/${params.slug}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setBlog(json.blog);

        setClientMeta({
          title: json.blog.title,
          description: json.blog.excerpt?.slice(0, 160),
          ogImage: json.blog.coverImage?.url,
        });

        const relatedRes = await fetch(`/api/blog?category=${json.blog.category}&limit=4`);
        const relatedJson = await relatedRes.json();
        setRelated(
          (relatedJson.blogs || []).filter((b: BlogPost) => b._id !== json.blog._id).slice(0, 3)
        );
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 text-2xl font-bold">Article Not Found</h2>
        <p className="mb-6 text-muted-foreground">The article you are looking for does not exist or has been removed.</p>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <article>
        {blog.coverImage?.url && (
          <div className="relative h-64 max-h-96 w-full overflow-hidden md:h-96">
            <Image src={blog.coverImage.url} alt={blog.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 py-8">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge>{blog.category}</Badge>
              {blog.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight md:text-4xl">{blog.title}</h1>

            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {blog.author}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(blog.publishedAt)}
              </span>
            </div>

            <div
              className="prose prose-sm max-w-none md:prose-base"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </motion.div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-2xl font-black">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((post) => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="group block">
                  <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      {post.coverImage?.url ? (
                        <Image
                          src={post.coverImage.url}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <Badge className="mb-2">{post.category}</Badge>
                      <h3 className="mb-2 line-clamp-2 text-sm font-semibold group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {truncate(post.excerpt, 100)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
