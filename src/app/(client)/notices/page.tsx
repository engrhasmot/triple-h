"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Pin,
  Flame,
  AlertTriangle,
  Calendar,
  Share2,
  Phone,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  category: "holiday" | "engineering_tips" | "regulatory" | "offer" | "general";
  priority: "urgent" | "important" | "normal";
  isPinned: boolean;
  publishedAt: string;
  author: string;
  createdAt: string;
}

function safeFormatDate(d: any, fmt: string = "dd MMMM yyyy") {
  if (!d) return "N/A";
  try {
    const obj = new Date(d);
    if (isNaN(obj.getTime())) return "N/A";
    return format(obj, fmt);
  } catch {
    return "N/A";
  }
}

export default function PublicNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetch("/api/notices?audience=public")
      .then((res) => res.json())
      .then((data) => {
        if (data.notices) setNotices(data.notices);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: "all", label: "সকল নোটিশ" },
    { id: "holiday", label: "ছুটির নোটিশ" },
    { id: "engineering_tips", label: "সাইট টিপস ও সতর্কতা" },
    { id: "regulatory", label: "পৌরসভা / সরকারি নিয়ম" },
    { id: "offer", label: "অফার ও সুবিধা" },
    { id: "general", label: "সাধারণ বিজ্ঞপ্তি" },
  ];

  const filteredNotices = notices.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || n.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-white border border-border/80 shadow-md p-2 flex items-center justify-center">
              <img src="/images/logo.png" alt="Triple H Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-accent/10 text-accent border-accent/20 text-xs font-semibold">
            <Bell className="w-3.5 h-3.5 mr-1" /> Triple H Plandraft &amp; Engineering — Official Circulars
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            অফিসিয়াল নোটিশ বোর্ড ও কারিগরি নির্দেশনা
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            ট্রিপল এইচ প্ল্যানড্রাফট ও ইঞ্জিনিয়ারিং কনসালটেন্সির অফিস বন্ধ ও ছুটির তালিকা, রাজউক ও পৌরসভা প্ল্যান অনুমোদনের নিয়মাবলী এবং ভবন নির্মাণ সাইট সতর্কতা।
          </p>
        </div>

        {/* Search & Categories */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
            <Input
              placeholder="নোটিশ খুঁজুন..."
              className="pl-10 h-11 bg-background rounded-xl shadow-xs text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? "bg-accent text-white shadow-xs"
                    : "bg-card border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notice List */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
            <p className="text-xs text-muted-foreground mt-2">নোটিশ বোর্ড লোড হচ্ছে...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <Card className="text-center py-12 border-dashed max-w-md mx-auto">
            <CardContent className="space-y-3">
              <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto" />
              <h3 className="text-base font-bold">কোনো নোটিশ পাওয়া যায়নি</h3>
              <p className="text-xs text-muted-foreground">বর্তমানে এই ক্যাটাগরিতে কোনো সক্রিয় নোটিশ নেই।</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <Card
                key={notice._id}
                className={`border-2 transition-all shadow-xs overflow-hidden ${
                  notice.isPinned ? "border-accent/40 bg-card" : "bg-card"
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b pb-3.5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {notice.isPinned && (
                          <Badge className="bg-accent text-white font-bold text-[10px] gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </Badge>
                        )}
                        {notice.priority === "urgent" && (
                          <Badge className="bg-rose-600 text-white font-bold text-[10px] gap-1">
                            <Flame className="w-3 h-3" /> জরুরি
                          </Badge>
                        )}
                        {notice.priority === "important" && (
                          <Badge className="bg-amber-600 text-white font-bold text-[10px] gap-1">
                            <AlertTriangle className="w-3 h-3" /> গুরুত্বপূর্ণ
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize font-bold">
                          {notice.category?.replace("_", " ")}
                        </Badge>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground pt-0.5">
                        {notice.title}
                      </h2>
                    </div>

                    <span className="text-xs text-muted-foreground shrink-0 font-medium">
                      {safeFormatDate(notice.publishedAt || notice.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/40 font-normal">
                    {notice.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
                    <span>
                      প্রকাশক: <strong className="text-foreground font-semibold">{notice.author}</strong>
                    </span>

                    <div className="flex items-center gap-3">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`📢 *${notice.title}*\n\n${notice.content}\n\n- ${notice.author}\nট্রিপল এইচ ইঞ্জিনিয়ারিং\nhttps://triple-h-engineering.vercel.app/notices`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                      >
                        <Share2 className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপে শেয়ার
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Support Banner */}
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-base font-bold text-foreground">
            আপনার চলমান প্রজেক্টের লাইভ স্ট্যাটাস দেখতে চান?
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            ড্রয়িং ফাইল ডাউনলোড, পেমেন্ট মানি রিসিট ও সাইট পরিদর্শনের রিপোর্ট দেখতে ক্লায়েন্ট পোর্টালে ভিজিট করুন।
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <Link href="/client-portal">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-white font-bold text-xs">
                👤 ক্লায়েন্ট পোর্টাল খুলুন
              </Button>
            </Link>
            <a href="tel:+8801778506500">
              <Button size="sm" variant="outline" className="text-xs gap-1.5 font-bold">
                <Phone className="w-3.5 h-3.5" /> কল করুন: 01778-506500
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
