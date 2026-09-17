"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Pin,
  Trash2,
  Edit,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Calendar,
  Sparkles,
  Share2,
  Eye,
  Megaphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  category: "holiday" | "engineering_tips" | "regulatory" | "offer" | "general";
  priority: "urgent" | "important" | "normal";
  targetAudience: "all" | "clients_only";
  isPinned: boolean;
  isActive: boolean;
  publishedAt: string;
  author: string;
  createdAt: string;
}

const NOTICE_TEMPLATES = [
  {
    label: "🌙 ঈদের ছুটির নোটিশ",
    title: "পবিত্র ঈদুল ফিতর উপলক্ষে অফিস বন্ধ ও সাইট ভিজিট সংক্রান্ত বিজ্ঞপ্তি",
    category: "holiday",
    priority: "important",
    content: `সম্মানিত ক্লায়েন্ট ও শুভানুধ্যায়ীগণ,
আসসালামু আলাইকুম।

পবিত্র ঈদুল ফিতর উপলক্ষে ট্রিপল এইচ কনসালটেন্সির প্রধান কার্যালয় আগামী [শুরুর তারিখ] হতে [শেষের তারিখ] পর্যন্ত বন্ধ থাকবে। আগামী [খোলার তারিখ] হতে যথারীতি সকল দাপ্তরিক কার্যক্রম ও ড্রয়িং ডেলিভারি শুরু হবে।

জরুরি সাইট পরিদর্শন বা পরামর্শের জন্য আমাদের হটলাইনে যোগাযোগ করতে পারেন:
📞 01778-506500

আপনাকে ও আপনার পরিবারকে জানাই পবিত্র ঈদুল ফিতরের আন্তরিক শুভেচ্ছা ও ঈদ মোবারক!

- ইঞ্জিনিয়ার মোঃ হাসমত আলী
ট্রিপল এইচ ইঞ্জিনিয়ারিং কনসালটেন্সি`,
  },
  {
    label: "🌧️ বর্ষায় ছাদ ঢালাই সতর্কতা",
    title: "বর্ষার মৌসুমে ছাদ ঢালাই, শাটারিং ও কিউরিং সংক্রান্ত ইঞ্জিনিয়ারিং সতর্কতা",
    category: "engineering_tips",
    priority: "urgent",
    content: `সম্মানিত ক্লায়েন্ট ও সম্মানিত মিস্ত্রিবৃন্দ,
বর্ষাকালে সাইটে কংক্রিট কাস্টিং ও ছাদ ঢালাইয়ের সময় নিচের বিষয়গুলো কঠোরভাবে মেনে চলার অনুরোধ করা যাচ্ছে:

১. ঢালাই চলাকালীন হঠাৎ বৃষ্টি নামলে তাৎক্ষণিকভাবে পলিথিন দিয়ে তাজা কংক্রিট ঢেকে রাখতে হবে।
২. ওয়াটার-সিমেন্ট রেশিও নিয়ন্ত্রণে রাখতে হবে; কোনোভাবেই অতিরিক্ত পানি মেশানো যাবে না।
৩. শাটারিং খোলার আগে পর্যাপ্ত কিউরিং (কমপক্ষে ১৪ থেকে ২১ দিন) নিশ্চিত করতে হবে।
৪. ঢালাইয়ের পূর্বে ইঞ্জিনিয়ার হাসমত আলীর উপস্থিতিতে রড বাইন্ডিং ও কভারিং চেক করিয়ে নিন।

যে কোনো জরুরি কারিগরি নির্দেশনার জন্য সাইট থেকে সরাসরি কল করুন:
📞 01778-506500`,
  },
  {
    label: "🏛️ পৌরসভা / রাজউক অনুমোদন",
    title: "পৌরসভা ও রাজউক প্ল্যান পাসের জন্য প্রয়োজনীয় হালনাগাদ দলিলের চেকলিস্ট",
    category: "regulatory",
    priority: "normal",
    content: `সম্মানিত ভবন নির্মাণকারী ক্লায়েন্টগণ,
আপনার প্রস্তাবিত ভবনের পৌরসভা বা রাজউক অনুমোদন দ্রুত পেতে নিম্নের দলিলপত্রগুলো প্রস্তুত রাখুন:

১. মূল দলিলের সত্যায়িত ফটোকপি ও খাজনা দাখিলা রশিদ
২. ডিজিটাল ল্যান্ড সার্ভে ও ডিমার্কেশন ম্যাপ
৩. সাব-সয়েল ইনভেস্টিগেশন (মাটি পরীক্ষা) রিপোর্ট
৪. বিএনবিসি কোড অনুযায়ী স্ট্রাকচারাল ডিজাইন ও সিভিল ইঞ্জিনিয়ারের দায়বদ্ধতা অঙ্গীকারনামা।

আপনার ফাইলের সর্বশেষ অগ্রগতি জানতে ভিজিট করুন:
🌐 https://triple-h-engineering.vercel.app/client-portal`,
  },
  {
    label: "🧪 সয়েল টেস্ট ও সার্ভে অফার",
    title: "চলতি মাসে ডিজিটাল ল্যান্ড সার্ভে ও মাটি পরীক্ষায় বিশেষ সুবিধা",
    category: "offer",
    priority: "normal",
    content: `আপনার স্বপ্নের বাড়ি নির্মাণের প্রথম ও সবচেয়ে গুরুত্বপূর্ণ ধাপ হলো সঠিক ডিজিটাল সার্ভে ও মাটি পরীক্ষা।

চলতি মাসে নতুন বাড়ি নির্মাণকারী ক্লায়েন্টদের জন্য সয়েল টেস্ট ও আর্কিটেকচারাল কনসেপ্ট প্ল্যানে বিশেষ কনসালটেন্সি প্যাকেজ প্রদান করা হচ্ছে।

বিস্তারিত জানতে ও সাইট ভিজিট বুক করতে কল করুন:
📞 01778-506500, 01631-186218`,
  },
];

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, pinned: 0, urgent: 0 });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<any>("general");
  const [priority, setPriority] = useState<any>("normal");
  const [targetAudience, setTargetAudience] = useState<any>("all");
  const [isPinned, setIsPinned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [author, setAuthor] = useState("ইঞ্জিনিয়ার মোঃ হাসমত আলী");

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notices");
      const data = await res.json();
      if (res.ok && data.success) {
        setNotices(data.notices || []);
        setStats(data.stats || { total: 0, active: 0, pinned: 0, urgent: 0 });
      } else {
        toast.error(data.error || "নোটিশ লোড করতে ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCategory("general");
    setPriority("normal");
    setTargetAudience("all");
    setIsPinned(false);
    setIsActive(true);
    setAuthor("ইঞ্জিনিয়ার মোঃ হাসমত আলী");
    setModalOpen(true);
  };

  const openEditModal = (notice: NoticeItem) => {
    setEditingId(notice._id);
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category);
    setPriority(notice.priority);
    setTargetAudience(notice.targetAudience);
    setIsPinned(notice.isPinned);
    setIsActive(notice.isActive);
    setAuthor(notice.author || "ইঞ্জিনিয়ার মোঃ হাসমত আলী");
    setModalOpen(true);
  };

  const applyTemplate = (tmpl: any) => {
    setTitle(tmpl.title);
    setContent(tmpl.content);
    setCategory(tmpl.category);
    setPriority(tmpl.priority);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("শিরোনাম ও বিষয়বস্তু লিখুন");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/admin/notices/${editingId}` : "/api/admin/notices";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category,
          priority,
          targetAudience,
          isPinned,
          isActive,
          author,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "নোটিশ সফলভাবে সংরক্ষিত হয়েছে");
        setModalOpen(false);
        fetchNotices();
      } else {
        toast.error(data.error || "নোটিশ সংরক্ষণে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("নোটিশ মুছে ফেলা হয়েছে");
        fetchNotices();
      } else {
        toast.error(data.error || "মুছতে ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে");
    }
  };

  const togglePin = async (notice: NoticeItem) => {
    try {
      const res = await fetch(`/api/admin/notices/${notice._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !notice.isPinned }),
      });
      if (res.ok) {
        toast.success(notice.isPinned ? "আনপিন করা হয়েছে" : "উপরে পিন করা হয়েছে");
        fetchNotices();
      }
    } catch {
      toast.error("আপডেটে সমস্যা হয়েছে");
    }
  };

  const toggleActive = async (notice: NoticeItem) => {
    try {
      const res = await fetch(`/api/admin/notices/${notice._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !notice.isActive }),
      });
      if (res.ok) {
        toast.success(notice.isActive ? "নোটিশ নিষ্ক্রিয় করা হয়েছে" : "নোটিশ প্রকাশ করা হয়েছে");
        fetchNotices();
      }
    } catch {
      toast.error("আপডেটে সমস্যা হয়েছে");
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || n.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-accent" /> ক্লায়েন্ট নোটিশ বোর্ড ও ব্রডকাস্ট ম্যানেজার
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            অফিসিয়াল নোটিশ, সাইট পরিদর্শন নির্দেশনা, ছুটির ক্যালেন্ডার প্রকাশ করুন এবং ক্লায়েন্ট পোর্টালে সরাসরি দেখান।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/broadcast">
            <Button variant="outline" size="sm" className="font-bold text-xs gap-1.5 h-10">
              <Share2 className="w-4 h-4 text-emerald-600" /> হোয়াটসঅ্যাপ ব্রডকাস্ট
            </Button>
          </Link>
          <Button onClick={openCreateModal} size="sm" className="bg-accent hover:bg-accent/90 text-white font-bold text-xs gap-1.5 h-10">
            <Plus className="w-4 h-4" /> নতুন নোটিশ তৈরি করুন
          </Button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-semibold">মোট নোটিশ</span>
            <p className="text-2xl font-black text-foreground mt-0.5">{stats.total} টি</p>
          </CardContent>
        </Card>
        <Card className="border shadow-xs bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">সক্রিয় / প্রকাশিত</span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{stats.active} টি</p>
          </CardContent>
        </Card>
        <Card className="border shadow-xs bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <span className="text-xs text-accent font-semibold">উপরে পিন করা</span>
            <p className="text-2xl font-black text-accent mt-0.5">{stats.pinned} টি</p>
          </CardContent>
        </Card>
        <Card className="border shadow-xs bg-rose-500/5 border-rose-500/20">
          <CardContent className="p-4">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold">জরুরি সতর্কতা</span>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{stats.urgent} টি</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="নোটিশ খুঁজুন..."
            className="pl-9 h-10 rounded-xl text-xs sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 bg-background border rounded-xl text-xs sm:text-sm"
        >
          <option value="all">সকল ক্যাটাগরি</option>
          <option value="holiday">ছুটির নোটিশ</option>
          <option value="engineering_tips">সাইট টিপস ও সতর্কতা</option>
          <option value="regulatory">পৌরসভা / সরকারি নিয়ম</option>
          <option value="offer">অফার ও প্যাকেজ</option>
          <option value="general">সাধারণ বিজ্ঞপ্তি</option>
        </select>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
          <p className="text-xs text-muted-foreground mt-2">নোটিশ লোড হচ্ছে...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent className="space-y-3">
            <Bell className="w-12 h-12 text-muted-foreground/60 mx-auto" />
            <h3 className="text-lg font-bold">কোনো নোটিশ পাওয়া যায়নি</h3>
            <p className="text-xs text-muted-foreground">নতুন নোটিশ তৈরি করতে ওপরের বাটনে ক্লিক করুন।</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <Card
              key={notice._id}
              className={`border-2 transition-all shadow-xs ${
                notice.isPinned ? "border-accent/40 bg-accent/5" : ""
              } ${!notice.isActive ? "opacity-60 bg-muted/30" : ""}`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
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
                      <Badge variant="outline" className="text-[10px] capitalize font-semibold">
                        {notice.category.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {notice.targetAudience === "clients_only" ? "🔒 শুধুমাত্র ক্লায়েন্ট" : "🌐 সবার জন্য"}
                      </Badge>
                      {!notice.isActive && (
                        <Badge variant="secondary" className="text-[10px]">
                          অপ্রকাশিত (Inactive)
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground pt-1">{notice.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePin(notice)}
                      title={notice.isPinned ? "আনপিন করুন" : "উপরে পিন করুন"}
                      className={`h-8 w-8 p-0 ${notice.isPinned ? "text-accent font-bold" : "text-muted-foreground"}`}
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(notice)}
                      title={notice.isActive ? "নিষ্ক্রিয় করুন" : "প্রকাশ করুন"}
                      className="h-8 w-8 p-0 text-muted-foreground"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(notice)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notice._id)}
                      className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed bg-card p-3 rounded-xl border border-border/50">
                  {notice.content}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>প্রকাশক: <strong className="text-foreground">{notice.author}</strong></span>
                  <span>তারিখ: {format(new Date(notice.publishedAt || notice.createdAt), "dd MMM yyyy, hh:mm a")}</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`📢 *${notice.title}*\n\n${notice.content}\n\n- ${notice.author}\nট্রিপল এইচ ইঞ্জিনিয়ারিং\nhttps://triple-h-engineering.vercel.app/client-portal`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                  >
                    <Share2 className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপে শেয়ার
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingId ? "নোটিশ সম্পাদনা করুন" : "নতুন অফিসিয়াল নোটিশ তৈরি করুন"}
            </DialogTitle>
          </DialogHeader>

          {/* Quick Templates Bar */}
          {!editingId && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> দ্রুত টেমপ্লেট থেকে তৈরি করুন:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {NOTICE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className="px-2.5 py-1 text-xs rounded-lg border bg-muted/40 hover:bg-accent/10 hover:border-accent/30 text-foreground transition-all"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">নোটিশের শিরোনাম *</label>
              <Input
                required
                placeholder="যেমন: পবিত্র ঈদুল ফিতর উপলক্ষে অফিস বন্ধ সংক্রান্ত বিজ্ঞপ্তি"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-background border rounded-xl text-xs sm:text-sm"
                >
                  <option value="general">সাধারণ বিজ্ঞপ্তি</option>
                  <option value="holiday">ছুটির নোটিশ</option>
                  <option value="engineering_tips">সাইট টিপস ও সতর্কতা</option>
                  <option value="regulatory">পৌরসভা / সরকারি নিয়ম</option>
                  <option value="offer">অফার ও প্যাকেজ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">অগ্রাধিকার (Priority)</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-11 px-3 bg-background border rounded-xl text-xs sm:text-sm"
                >
                  <option value="normal">সাধারণ (Normal)</option>
                  <option value="important">গুরুত্বপূর্ণ (Important)</option>
                  <option value="urgent">জরুরি (Urgent)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">লক্ষ্য ক্লায়েন্ট (Audience)</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full h-11 px-3 bg-background border rounded-xl text-xs sm:text-sm"
                >
                  <option value="all">সবার জন্য (All Visitors)</option>
                  <option value="clients_only">শুধুমাত্র পোর্টাল ক্লায়েন্ট</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">বিস্তারিত বিবরণ ও বার্তা *</label>
              <textarea
                required
                rows={6}
                placeholder="নোটিশের বিস্তারিত বক্তব্য ও নির্দেশনা লিখুন..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 bg-background border rounded-xl text-xs sm:text-sm focus-visible:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">প্রকাশকের নাম</label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="h-10 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-accent focus:ring-accent w-4 h-4"
                  />
                  উপরে পিন করে রাখুন
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-accent focus:ring-accent w-4 h-4"
                  />
                  এখনই প্রকাশ করুন
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={submitting} className="bg-accent hover:bg-accent/90 text-white font-bold gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editingId ? "আপডেট সংরক্ষণ করুন" : "নোটিশ প্রকাশ করুন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
