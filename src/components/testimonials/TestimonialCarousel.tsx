"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star, MessageSquarePlus, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

  // Review Dialog State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewDesignation, setReviewDesignation] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchTestimonials = () => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((json) => {
        setTestimonials(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const next = useCallback(() => {
    if (testimonials.length === 0) return;
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    if (testimonials.length === 0) return;
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [testimonials.length, next]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewContent.trim()) {
      toast.error("Please enter your name and review message");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: reviewName,
          designation: reviewDesignation,
          content: reviewContent,
          rating: reviewRating,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Thank you! Your review has been submitted for approval.");
        setReviewOpen(false);
        setReviewName("");
        setReviewDesignation("");
        setReviewContent("");
        setReviewRating(5);
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const visible = getVisibleTestimonials(testimonials, current);

  return (
    <div className="space-y-8">
      {/* Review Submission Button at Top */}
      <div className="flex justify-end px-4 sm:px-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReviewOpen(true)}
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10 shadow-sm"
        >
          <MessageSquarePlus className="w-4 h-4" />
          আপনার মতামত দিন (Write a Review)
        </Button>

        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                আপনার মূল্যবান অভিজ্ঞতা জানান
              </DialogTitle>
              <DialogDescription>
                Triple H Plandraft & Engineering-এর সাথে আপনার কাজের অভিজ্ঞতা শেয়ার করুন।
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="review-name">আপনার নাম *</Label>
                <Input
                  id="review-name"
                  placeholder="যেমন: ইঞ্জিনিয়ার শফিউল ইসলাম"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-designation">পদবী / এলাকা / প্রজেক্ট (ঐচ্ছিক)</Label>
                <Input
                  id="review-designation"
                  placeholder="যেমন: বাড়ি মালিক, সাভার / MD, ABC Group"
                  value={reviewDesignation}
                  onChange={(e) => setReviewDesignation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>স্টার রেটিং *</Label>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-muted-foreground ml-2">
                    {reviewRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-content">আপনার মন্তব্য / অভিজ্ঞতা *</Label>
                <Textarea
                  id="review-content"
                  rows={4}
                  placeholder="ডিজাইনের মান, কাজের সময়সীমা বা সার্বিক সার্ভিস সম্পর্কে আপনার মন্তব্য লিখুন..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setReviewOpen(false)}
                  disabled={submittingReview}
                >
                  বাতিল
                </Button>
                <Button type="submit" disabled={submittingReview} className="bg-primary">
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      জমা হচ্ছে...
                    </>
                  ) : (
                    "রিভিউ সাবমিট করুন"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!testimonials.length ? (
        <div className="py-20 text-center text-muted-foreground">
          <Quote className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>No testimonials yet. Be the first to leave a review!</p>
        </div>
      ) : (
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
                        className={`h-4 w-4 ${
                          s < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                        }`}
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
