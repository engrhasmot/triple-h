"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  _id: string;
  clientName: string;
  designation?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: { url: string; publicId: string };
  isFeatured: boolean;
}

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((json) => {
        setTestimonials(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [testimonials.length, next]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!testimonials.length) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <Quote className="mx-auto h-12 w-12 mb-4 opacity-30" />
        <p>No testimonials yet.</p>
      </div>
    );
  }

  const visible = getVisibleTestimonials(testimonials, current);

  return (
    <div className="relative px-4 sm:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {visible.map((t, i) => (
            <motion.div
              key={t._id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-panel rounded-2xl p-6 flex flex-col h-full"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <div className="relative flex-1 mb-6">
                <Quote className="absolute -top-1 -left-1 h-6 w-6 text-primary/20" />
                <p className="text-muted-foreground text-sm leading-relaxed pl-5 line-clamp-4">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                {t.avatar?.url ? (
                  <Image
                    src={t.avatar.url}
                    alt={t.clientName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {t.clientName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{t.clientName}</p>
                  {(t.designation || t.company) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {[t.designation, t.company].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {testimonials.length > 3 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background shadow-md border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background shadow-md border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getVisibleTestimonials(list: Testimonial[], index: number): Testimonial[] {
  if (list.length <= 3) return list;
  const items: Testimonial[] = [];
  for (let i = 0; i < 3; i++) {
    items.push(list[(index + i) % list.length]);
  }
  return items;
}
