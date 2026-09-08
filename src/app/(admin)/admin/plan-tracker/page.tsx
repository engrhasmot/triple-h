"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Compass,
  Search,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileX,
  Printer,
  Share2,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckSquare,
  FileText,
  Calendar,
  Phone,
  MapPin,
  User,
  Sliders,
  Sparkles,
  ArrowRight,
  Send,
  Trash2,
  Download,
  Building,
  Layers,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";
import { format } from "date-fns";

const DEFAULT_MILESTONES = [
  { title: "১. ডিজিটাল ল্যান্ড সার্ভে ও মাটি পরীক্ষা (Soil Test)", status: "pending" },
  { title: "২. আর্কিটেকচারাল ফ্লোর প্ল্যান ও ২ডি ড্রয়িং", status: "pending" },
  { title: "৩. ৩ডি এলিভেশন ও স্ট্রাকচারাল ডিজাইন", status: "pending" },
  { title: "৪. পৌরসভা / রাজউক ফাইল প্রস্তুত ও দাখিল", status: "pending" },
  { title: "৫. বিসি কমিটি মিটিং ও ফিল্ড ইন্সপেকশন", status: "pending" },
  { title: "৬. চূড়ান্ত প্ল্যান অনুমোদন ও ফাইল হস্তান্তর", status: "pending" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: any; color: string; desc: string }
> = {
  submitted: {
    label: "দাখিলকৃত (Submitted)",
    badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    icon: Clock,
    color: "#3b82f6",
    desc: "ফাইল জমা নেওয়া হয়েছে ও প্রাথমিক যাচাই চলছে",
  },
  "under-review": {
    label: "পর্যালোচনাধীন (Under Review)",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    icon: Compass,
    color: "#f59e0b",
    desc: "প্রকৌশলী ও অনুমোদন কর্তৃপক্ষের পর্যালোচনাধীন",
  },
  "revision-required": {
    label: "সংশোধন প্রয়োজন (Revision)",
    badgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
    icon: AlertTriangle,
    color: "#f97316",
    desc: "নকশা বা নথিপত্রে পরিমার্জন প্রয়োজন",
  },
  approved: {
    label: "অনুমোদিত ও পাশ (Approved)",
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    icon: CheckCircle2,
    color: "#10b981",
    desc: "পৌরসভা / রাজউক কর্তৃক সফলভাবে অনুমোদিত",
  },
  rejected: {
    label: "বাতিল (Rejected)",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    icon: FileX,
    color: "#ef4444",
    desc: "আইনি বা কাঠামোগত কারণে ফাইল বাতিল",
  },
};

export default function AdminPlanTrackerPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "pipeline">("cards");

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    clientName: "",
    phone: "",
    projectTitle: "",
    location: "",
    submissionDate: format(new Date(), "yyyy-MM-dd"),
    expectedCompletionDate: "",
  });

  // Status & Remark Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedPlanForStatus, setSelectedPlanForStatus] = useState<any>(null);
  const [targetStatus, setTargetStatus] = useState<string>("under-review");
  const [statusRemark, setStatusRemark] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Milestones Modal State
  const [milestonesModalOpen, setMilestonesModalOpen] = useState(false);
  const [selectedPlanForMilestones, setSelectedPlanForMilestones] = useState<any>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [currentMilestones, setCurrentMilestones] = useState<any[]>([]);
  const [savingMilestones, setSavingMilestones] = useState(false);

  // Printable Certificate Modal
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedPlanForPrint, setSelectedPlanForPrint] = useState<any>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/files");
      const json = await res.json();
      setPlans(json.data || []);
    } catch {
      toast.error("প্ল্যান ফাইলগুলো লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        !searchQuery.trim() ||
        (plan.fileId && plan.fileId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.clientName && plan.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.phone && plan.phone.includes(searchQuery)) ||
        (plan.projectTitle && plan.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.location && plan.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTab = activeTab === "all" || plan.currentStatus === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [plans, searchQuery, activeTab]);

  // Statistics
  const stats = useMemo(() => {
    const total = plans.length;
    const underReview = plans.filter((p) => p.currentStatus === "under-review").length;
    const revision = plans.filter((p) => p.currentStatus === "revision-required").length;
    const approved = plans.filter((p) => p.currentStatus === "approved").length;
    const avgProgress = total
      ? Math.round(plans.reduce((acc, p) => acc + (p.progressPercentage || 0), 0) / total)
      : 0;

    return { total, underReview, revision, approved, avgProgress };
  }, [plans]);

  // Create new plan
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.clientName || !newPlan.phone || !newPlan.projectTitle || !newPlan.location) {
      toast.error("অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন");
      return;
    }
    setCreating(true);
    try {
      const res = await adminFetch("/api/admin/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      toast.success("নতুন ট্র্যাকিং ফাইল তৈরি হয়েছে!");
      setCreateOpen(false);
      setNewPlan({
        clientName: "",
        phone: "",
        projectTitle: "",
        location: "",
        submissionDate: format(new Date(), "yyyy-MM-dd"),
        expectedCompletionDate: "",
      });
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || "ফাইল তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setCreating(false);
    }
  };

  // Update status & remark
  const handleSaveStatus = async () => {
    if (!selectedPlanForStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await adminFetch("/api/admin/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPlanForStatus._id,
          currentStatus: targetStatus,
          remark: statusRemark,
          updatedBy: "Engr. Md. Hasmot Ali",
        }),
      });
      if (!res.ok) throw new Error();

      toast.success("ফাইলের অবস্থা সফলভাবে আপডেট করা হয়েছে!");
      setStatusModalOpen(false);
      setStatusRemark("");
      fetchPlans();
    } catch {
      toast.error("অবস্থা আপডেট করতে ব্যর্থ হয়েছে");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Save Milestones & Progress
  const handleSaveMilestones = async () => {
    if (!selectedPlanForMilestones) return;
    setSavingMilestones(true);
    try {
      const res = await adminFetch("/api/admin/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPlanForMilestones._id,
          progressPercentage: currentProgress,
          milestones: currentMilestones,
        }),
      });
      if (!res.ok) throw new Error();

      toast.success("মাইলস্টোন ও প্রগ্রেস সফলভাবে সেভ হয়েছে!");
      setMilestonesModalOpen(false);
      fetchPlans();
    } catch {
      toast.error("মাইলস্টোন সংরক্ষণ করতে সমস্যা হয়েছে");
    } finally {
      setSavingMilestones(false);
    }
  };

  // Delete plan
  const handleDelete = async (id: string, fileId: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${fileId}" ট্র্যাকিং ফাইলটি মুছে ফেলতে চান?`)) return;
    setDeletingId(id);
    try {
      const res = await adminFetch(`/api/admin/files?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success(`ফাইল ${fileId} সফলভাবে মুছে ফেলা হয়েছে`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("ফাইল মুছে ফেলতে ব্যর্থ হয়েছে");
    } finally {
      setDeletingId(null);
    }
  };

  // Send WhatsApp Progress Update to Client
  const handleWhatsAppUpdate = (plan: any) => {
    const statusText = STATUS_CONFIG[plan.currentStatus]?.label || plan.currentStatus;
    const progress = plan.progressPercentage || 0;
    const queryUrl = `https://triple-h-engineering.vercel.app/track-plan?query=${encodeURIComponent(
      plan.fileId
    )}`;

    const text = `*🏗️ ট্রিপল এইচ কনসালটেন্সি — প্ল্যান ট্র্যাকিং আপডেট*\n\n` +
      `শ্রদ্ধেয় *${plan.clientName}*,\n` +
      `আপনার প্রজেক্ট: *${plan.projectTitle}*\n` +
      `ফাইল নম্বর: *${plan.fileId}*\n` +
      `অবস্থান: ${plan.location}\n\n` +
      `📊 *বর্তমান স্ট্যাটাস:* ${statusText}\n` +
      `⚡ *কাজের মোট অগ্রগতি:* ${progress}%\n` +
      (plan.statusHistory?.length
        ? `📝 *সর্বশেষ নোট:* ${plan.statusHistory[plan.statusHistory.length - 1]?.note || "প্রক্রিয়াধীন"}\n\n`
        : `\n`) +
      `🔍 *অনলাইনে লাইভ আপডেট দেখতে:* \n${queryUrl}\n\n` +
      `যেকোনো প্রয়োজনে কল করুন:\n` +
      `📞 ০১৭৭৮-৫০৬৫০০\n` +
      `ইঞ্জিনিয়ার মোঃ হাসমত আলী (B.Sc. Civil Engr, AUST)`;

    const phoneDigits = plan.phone.replace(/[^0-9]/g, "");
    const formattedPhone = phoneDigits.startsWith("88") ? phoneDigits : `88${phoneDigits}`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Plan Tracker & Sanction Hub
              </h1>
              <p className="text-sm text-muted-foreground">
                রাজউক ও পৌরসভা প্ল্যান অনুমোদন, ড্রয়িং অগ্রগতি এবং লাইভ ট্র্যাকিং নিয়ন্ত্রণ কেন্দ্র
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlans}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </Button>

          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            নতুন প্ল্যান ফাইল যোগ করুন
          </Button>
        </div>
      </div>

      {/* ── Metric Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">মোট প্ল্যান ফাইল</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{stats.total}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
              <Layers className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-amber-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">পর্যালোচনাধীন (Review)</p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600 mt-1">{stats.underReview}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-orange-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">সংশোধন প্রয়োজন</p>
              <h3 className="text-2xl font-bold tracking-tight text-orange-600 mt-1">{stats.revision}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">অনুমোদিত ও পাশ</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600 mt-1">{stats.approved}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-blue-500/40 transition-colors col-span-2 md:col-span-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">গড় কাজের অগ্রগতি</p>
              <h3 className="text-2xl font-bold tracking-tight text-primary mt-1">{stats.avgProgress}%</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-muted/40 p-3.5 rounded-xl border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ফাইল আইডি (PLN-...), ক্লায়েন্টের নাম, ফোন নম্বর, বা ঠিকানা দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-background rounded-lg p-1 border">
            <Button
              size="sm"
              variant={viewMode === "cards" ? "default" : "ghost"}
              className="h-8 text-xs px-3"
              onClick={() => setViewMode("cards")}
            >
              কার্ড ভিউ
            </Button>
            <Button
              size="sm"
              variant={viewMode === "pipeline" ? "default" : "ghost"}
              className="h-8 text-xs px-3"
              onClick={() => setViewMode("pipeline")}
            >
              পাইপলাইন ভিউ
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabs for Status Filter ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b">
        {[
          { id: "all", label: "সকল ফাইল", count: plans.length },
          { id: "submitted", label: "দাখিলকৃত", count: plans.filter((p) => p.currentStatus === "submitted").length },
          { id: "under-review", label: "পর্যালোচনাধীন", count: plans.filter((p) => p.currentStatus === "under-review").length },
          { id: "revision-required", label: "সংশোধন প্রয়োজন", count: plans.filter((p) => p.currentStatus === "revision-required").length },
          { id: "approved", label: "অনুমোদিত", count: plans.filter((p) => p.currentStatus === "approved").length },
          { id: "rejected", label: "বাতিল", count: plans.filter((p) => p.currentStatus === "rejected").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

        {/* ── Plans Display Area ── */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-3">
              <Loader2 className="w-9 h-9 animate-spin text-primary" />
              <p className="text-sm font-medium">প্ল্যান ফাইলগুলো লোড হচ্ছে...</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <CardContent className="space-y-3">
                <FileX className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                <h3 className="text-lg font-bold">কোনো প্ল্যান ফাইল খুঁজে পাওয়া যায়নি</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery
                    ? `"${searchQuery}" এর সাথে মিলে এমন কোনো ফাইল নেই। অন্য কি-ওয়ার্ড দিয়ে চেষ্টা করুন।`
                    : "এই ক্যাটাগরিতে এখনো কোনো ফাইল নেই। আপনি নতুন ফাইল যুক্ত করতে পারেন।"}
                </p>
                <Button onClick={() => setCreateOpen(true)} className="gap-2 mt-2">
                  <Plus className="w-4 h-4" /> নতুন ফাইল তৈরি করুন
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "pipeline" ? (
            /* ── PIPELINE / KANBAN VIEW ── */
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
              {["submitted", "under-review", "revision-required", "approved", "rejected"].map(
                (colStatus) => {
                  const colPlans = plans.filter((p) => p.currentStatus === colStatus);
                  const config = STATUS_CONFIG[colStatus];
                  const Icon = config.icon;

                  return (
                    <div
                      key={colStatus}
                      className="bg-muted/30 rounded-xl border p-3 flex flex-col gap-3 min-h-[420px]"
                    >
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                          <span className="truncate">{config.label.split(" ")[0]}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-5">
                          {colPlans.length}
                        </Badge>
                      </div>

                      <div className="space-y-3 flex-1">
                        {colPlans.map((plan) => (
                          <Card
                            key={plan._id}
                            className="bg-card hover:shadow-md transition-shadow border-border p-3.5 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                {plan.fileId}
                              </span>
                              <span className="text-[11px] font-bold text-muted-foreground">
                                {plan.progressPercentage || 0}%
                              </span>
                            </div>

                            <div>
                              <h4 className="font-semibold text-xs text-foreground line-clamp-1">
                                {plan.projectTitle}
                              </h4>
                              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground/80" />
                                {plan.clientName}
                              </p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground/80" />
                                {plan.location}
                              </p>
                            </div>

                            {/* Mini Progress */}
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300 rounded-full"
                                style={{ width: `${plan.progressPercentage || 0}%` }}
                              />
                            </div>

                            {/* Pipeline Card Actions */}
                            <div className="pt-1 flex items-center justify-between border-t gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[10px] px-2 text-primary"
                                onClick={() => {
                                  setSelectedPlanForStatus(plan);
                                  setTargetStatus(plan.currentStatus);
                                  setStatusModalOpen(true);
                                }}
                              >
                                স্ট্যাটাস
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[10px] px-2 text-emerald-600 hover:text-emerald-700"
                                onClick={() => handleWhatsAppUpdate(plan)}
                              >
                                WhatsApp
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            /* ── DETAILED CARDS VIEW ── */
            <div className="grid grid-cols-1 gap-6">
              {filteredPlans.map((plan) => {
                const config = STATUS_CONFIG[plan.currentStatus] || STATUS_CONFIG.submitted;
                const StatusIcon = config.icon;
                const progress = plan.progressPercentage || 0;
                const completedMilestones = (plan.milestones || []).filter(
                  (m: any) => m.status === "completed"
                ).length;
                const totalMilestones = (plan.milestones || []).length || 6;

                return (
                  <Card
                    key={plan._id}
                    className="overflow-hidden border-border hover:shadow-lg transition-all duration-200"
                  >
                    {/* Header */}
                    <CardHeader className="bg-muted/30 border-b pb-4">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20">
                              {plan.fileId}
                            </span>
                            <Badge variant="outline" className={`font-semibold gap-1.5 ${config.badgeClass}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              দাখিল:{" "}
                              {plan.submissionDate
                                ? format(new Date(plan.submissionDate), "dd MMM yyyy")
                                : "অনির্দিষ্ট"}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold tracking-tight text-foreground pt-1">
                            {plan.projectTitle}
                          </h3>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-primary" />
                              {plan.clientName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-primary" />
                              {plan.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {plan.location}
                            </span>
                          </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-500/10"
                            onClick={() => handleWhatsAppUpdate(plan)}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            WhatsApp আপডেট
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => {
                              setSelectedPlanForPrint(plan);
                              setPrintModalOpen(true);
                            }}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            প্রিন্ট ভাউচার
                          </Button>

                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => {
                              setSelectedPlanForStatus(plan);
                              setTargetStatus(plan.currentStatus);
                              setStatusRemark("");
                              setStatusModalOpen(true);
                            }}
                          >
                            <Compass className="w-3.5 h-3.5" />
                            অবস্থা পরিবর্তন
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            disabled={deletingId === plan._id}
                            onClick={() => handleDelete(plan._id, plan.fileId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar with Milestone Count */}
                      <div className="pt-4 mt-2 border-t space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-primary" />
                            কাজের সামগ্রিক অগ্রগতি:
                            <span className="font-mono font-bold text-foreground">{progress}% সম্পন্ন</span>
                          </span>
                          <span className="text-muted-foreground">
                            মাইলস্টোন:{" "}
                            <span className="font-bold text-primary">
                              {completedMilestones}/{totalMilestones} ধাপ
                            </span>
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          />
                        </div>
                      </div>
                    </CardHeader>

                    {/* Card Body with Milestones & Details */}
                    <CardContent className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Milestones Column */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-primary" />
                            অনুমোদন ও নকশার মূল ধাপসমূহ (Milestones)
                          </h4>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary font-semibold"
                            onClick={() => {
                              setSelectedPlanForMilestones(plan);
                              setCurrentProgress(plan.progressPercentage || 0);
                              setCurrentMilestones(
                                plan.milestones && plan.milestones.length > 0
                                  ? plan.milestones
                                  : DEFAULT_MILESTONES
                              );
                              setMilestonesModalOpen(true);
                            }}
                          >
                            এডিট মাইলস্টোন →
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(plan.milestones && plan.milestones.length > 0
                            ? plan.milestones
                            : DEFAULT_MILESTONES
                          ).map((m: any, idx: number) => {
                            const isDone = m.status === "completed";
                            const isInProgress = m.status === "in-progress";

                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 transition-colors ${
                                  isDone
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                                    : isInProgress
                                    ? "bg-amber-500/5 border-amber-500/30 text-foreground font-medium"
                                    : "bg-muted/20 border-border text-muted-foreground"
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                ) : isInProgress ? (
                                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="line-clamp-1">{m.title}</p>
                                  {m.completedAt && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {format(new Date(m.completedAt), "dd MMM yy")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status History & Live Link Column */}
                      <div className="space-y-4 border-t lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            সাম্প্রতিক আপডেট ইতিহাস (History)
                          </h4>
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                            {plan.statusHistory && plan.statusHistory.length > 0 ? (
                              plan.statusHistory
                                .slice(-3)
                                .reverse()
                                .map((hist: any, i: number) => (
                                  <div
                                    key={i}
                                    className="text-xs bg-muted/40 p-2 rounded-md border text-muted-foreground space-y-0.5"
                                  >
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="font-semibold text-foreground capitalize">
                                        {hist.status.replace("-", " ")}
                                      </span>
                                      <span>
                                        {hist.date ? format(new Date(hist.date), "dd/MM/yy hh:mm a") : ""}
                                      </span>
                                    </div>
                                    {hist.note && <p className="text-foreground text-[11px]">{hist.note}</p>}
                                  </div>
                                ))
                            ) : (
                              <p className="text-xs text-muted-foreground">কোনো পূর্বের নোট নেই।</p>
                            )}
                          </div>
                        </div>

                        {/* Direct Client Track Link */}
                        <div className="pt-2 border-t">
                          <a
                            href={`/track-plan?query=${encodeURIComponent(plan.fileId)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            ক্লায়েন্ট ভিউ পেজ দেখুন ({plan.fileId})
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      {/* ── CREATE NEW PLAN MODAL ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              নতুন প্ল্যান ট্র্যাকিং ফাইল খুলুন
            </DialogTitle>
            <DialogDescription>
              ক্লায়েন্টের তথ্য ও প্রজেক্টের নাম দিয়ে একটি নতুন অনুমোদন ট্র্যাকিং ফাইল তৈরি করুন।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cName">ক্লায়েন্টের নাম *</Label>
                <Input
                  id="cName"
                  placeholder="উদা: হাজী মোঃ রফিকুল ইসলাম"
                  value={newPlan.clientName}
                  onChange={(e) => setNewPlan({ ...newPlan, clientName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cPhone">মোবাইল নম্বর *</Label>
                <Input
                  id="cPhone"
                  placeholder="উদা: 01712345678"
                  value={newPlan.phone}
                  onChange={(e) => setNewPlan({ ...newPlan, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pTitle">প্রজেক্টের নাম ও বিবরণ *</Label>
              <Input
                id="pTitle"
                placeholder="উদা: ৬ তলা বিশিষ্ট আবাসিক ভবন (স্বপ্ন নীড়)"
                value={newPlan.projectTitle}
                onChange={(e) => setNewPlan({ ...newPlan, projectTitle: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pLoc">প্রজেক্টের অবস্থান / ঠিকানা *</Label>
              <Input
                id="pLoc"
                placeholder="উদা: প্লট #৭, রোড #৪, মিরপুর ডিওএইচএস, ঢাকা"
                value={newPlan.location}
                onChange={(e) => setNewPlan({ ...newPlan, location: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="subDate">ফাইল দাখিলের তারিখ</Label>
                <Input
                  id="subDate"
                  type="date"
                  value={newPlan.submissionDate}
                  onChange={(e) => setNewPlan({ ...newPlan, submissionDate: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expDate">সম্ভাব্য অনুমোদনের তারিখ</Label>
                <Input
                  id="expDate"
                  type="date"
                  value={newPlan.expectedCompletionDate}
                  onChange={(e) => setNewPlan({ ...newPlan, expectedCompletionDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={creating} className="gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                ফাইল তৈরি করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── UPDATE STATUS MODAL ── */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              ফাইলের অবস্থা পরিবর্তন
            </DialogTitle>
            <DialogDescription>
              {selectedPlanForStatus?.projectTitle} ({selectedPlanForStatus?.fileId})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>নতুন স্ট্যাটাস নির্বাচন করুন</Label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="submitted">দাখিলকৃত (Submitted)</option>
                <option value="under-review">পর্যালোচনাধীন (Under Review)</option>
                <option value="revision-required">সংশোধন প্রয়োজন (Revision Required)</option>
                <option value="approved">অনুমোদিত ও পাশ (Approved)</option>
                <option value="rejected">বাতিল (Rejected)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>ইঞ্জিনিয়ারিং রিমার্ক / নোট (ঐচ্ছিক)</Label>
              <Input
                placeholder="উদা: রাজউক বিসি কমিটির অনুমোদন প্রাপ্ত হয়েছে..."
                value={statusRemark}
                onChange={(e) => setStatusRemark(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                এই স্ট্যাটাস পরিবর্তনটি স্বয়ংক্রিয়ভাবে ক্লায়েন্টের হিস্ট্রিতে রেকর্ড হবে এবং SMS/WhatsApp নোটিফিকেশন যাবে।
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleSaveStatus} disabled={updatingStatus} className="gap-2">
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                অবস্থা সেভ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MANAGE MILESTONES & PROGRESS MODAL ── */}
      <Dialog open={milestonesModalOpen} onOpenChange={setMilestonesModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              কাজের অগ্রগতি ও মাইলস্টোন সমন্বয়
            </DialogTitle>
            <DialogDescription>
              {selectedPlanForMilestones?.projectTitle} ({selectedPlanForMilestones?.fileId})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Progress Slider */}
            <div className="bg-muted/40 p-4 rounded-xl border space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>কাজের অগ্রগতি শতাংশ (%):</span>
                <span className="font-mono text-lg font-bold text-primary">{currentProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={currentProgress}
                onChange={(e) => setCurrentProgress(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>0% (শুরু)</span>
                <span>25%</span>
                <span>50% (নকশা সম্পন্ন)</span>
                <span>75% (রাজউক জমা)</span>
                <span>100% (অনুমোদিত)</span>
              </div>
            </div>

            {/* Milestones Checkboxes */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ধাপভিত্তিক চেকলিস্ট (Status Toggle)
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {currentMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs gap-3"
                  >
                    <span className="font-medium flex-1 text-foreground">{m.title}</span>
                    <select
                      value={m.status}
                      onChange={(e) => {
                        const next = [...currentMilestones];
                        next[idx] = {
                          ...next[idx],
                          status: e.target.value,
                          completedAt: e.target.value === "completed" ? new Date() : undefined,
                        };
                        setCurrentMilestones(next);
                      }}
                      className={`text-xs rounded border px-2 py-1 font-semibold focus:outline-none ${
                        m.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-700 border-emerald-300"
                          : m.status === "in-progress"
                          ? "bg-amber-500/15 text-amber-700 border-amber-300"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      <option value="pending">Pending (অপেক্ষমান)</option>
                      <option value="in-progress">In Progress (চলমান)</option>
                      <option value="completed">Completed (সম্পন্ন)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setMilestonesModalOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleSaveMilestones} disabled={savingMilestones} className="gap-2">
                {savingMilestones && <Loader2 className="w-4 h-4 animate-spin" />}
                অগ্রগতি সংরক্ষণ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PRINTABLE OFFICIAL TRACKING CERTIFICATE MODAL ── */}
      <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>অফিসিয়াল প্ল্যান ট্র্যাকিং ও অগ্রগতি ভাউচার</span>
              <Button
                size="sm"
                className="gap-2 print:hidden"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" /> প্রিন্ট / সেভ PDF
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedPlanForPrint && (
            <div className="p-6 bg-white text-black border rounded-xl space-y-6 font-sans">
              {/* Letterhead Header */}
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-emerald-800">
                    TRIPLE H ENGINEERING CONSULTANCY
                  </h2>
                  <p className="text-xs text-gray-600 font-medium">
                    Architectural, Structural Design, Soil Testing & Digital Land Survey
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Head Office: Dhaka, Bangladesh | Helpline: 01778-506500 | Web: triple-h-engineering.vercel.app
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold bg-gray-100 px-3 py-1 rounded border border-gray-300">
                    {selectedPlanForPrint.fileId}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1">
                    তারিখ: {format(new Date(), "dd MMMM, yyyy")}
                  </p>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center py-2 bg-emerald-50 border border-emerald-200 rounded">
                <h3 className="font-bold text-emerald-900 text-sm tracking-wide">
                  PLAN APPROVAL & ENGINEERING PROGRESS CERTIFICATE
                </h3>
              </div>

              {/* Client & Project Details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3.5 rounded border border-gray-200">
                <div>
                  <p><span className="font-semibold text-gray-700">ক্লায়েন্টের নাম:</span> {selectedPlanForPrint.clientName}</p>
                  <p><span className="font-semibold text-gray-700">মোবাইল নম্বর:</span> {selectedPlanForPrint.phone}</p>
                  <p><span className="font-semibold text-gray-700">ফাইল খোলার তারিখ:</span> {selectedPlanForPrint.submissionDate ? format(new Date(selectedPlanForPrint.submissionDate), "dd/MM/yyyy") : "N/A"}</p>
                </div>
                <div>
                  <p><span className="font-semibold text-gray-700">প্রজেক্টের নাম:</span> {selectedPlanForPrint.projectTitle}</p>
                  <p><span className="font-semibold text-gray-700">সাইটের অবস্থান:</span> {selectedPlanForPrint.location}</p>
                  <p><span className="font-semibold text-gray-700">বর্তমান স্ট্যাটাস:</span> <strong className="uppercase text-emerald-800">{selectedPlanForPrint.currentStatus}</strong></p>
                </div>
              </div>

              {/* Progress Bar in Print */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-gray-700">
                  <span>সর্বমোট কাজের অগ্রগতি</span>
                  <span>{selectedPlanForPrint.progressPercentage || 0}% সম্পন্ন</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${selectedPlanForPrint.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Milestones Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-gray-800 border-b pb-1">
                  নকশা ও অনুমোদন ধাপসমূহের অবস্থা (Milestone Breakdown)
                </h4>
                <table className="w-full text-left text-xs border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-2 border border-gray-200">ক্রমিক</th>
                      <th className="p-2 border border-gray-200">ধাপের বিবরণ</th>
                      <th className="p-2 border border-gray-200 text-center">অবস্থা (Status)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPlanForPrint.milestones && selectedPlanForPrint.milestones.length > 0
                      ? selectedPlanForPrint.milestones
                      : DEFAULT_MILESTONES
                    ).map((m: any, i: number) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="p-2 border border-gray-200 font-mono text-center w-12">{i + 1}</td>
                        <td className="p-2 border border-gray-200 font-medium">{m.title}</td>
                        <td className="p-2 border border-gray-200 text-center font-bold">
                          {m.status === "completed" ? (
                            <span className="text-emerald-700">✓ Completed</span>
                          ) : m.status === "in-progress" ? (
                            <span className="text-amber-700">⏳ In Progress</span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-12 flex justify-between items-end text-xs">
                <div className="text-center">
                  <div className="w-40 border-t border-gray-400 pt-1">
                    <p className="font-semibold text-gray-700">ক্লায়েন্টের স্বাক্ষর</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-52 border-t border-gray-400 pt-1">
                    <p className="font-bold text-gray-900">ইঞ্জিনিয়ার মোঃ হাসমত আলী</p>
                    <p className="text-[10px] text-gray-600">B.Sc. in Civil Engineering (AUST)</p>
                    <p className="text-[10px] text-emerald-800 font-semibold">প্রতিষ্ঠাতা ও প্রধান পরামর্শক</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
