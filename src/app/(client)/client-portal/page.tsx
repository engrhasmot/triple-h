"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FolderKanban,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Banknote,
  MapPin,
  Phone,
  MessageCircle,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Printer,
  CreditCard,
  ClipboardCheck,
  User,
  UserPlus,
  LogIn,
  LogOut,
  Settings,
  Send,
  Building,
  KeyRound,
  FileCheck,
  HelpCircle,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

function formatBDT(amount: number) {
  return "৳" + Number(amount || 0).toLocaleString("en-IN");
}

function safeFormatDate(d: any, fmt: string = "dd MMM yyyy") {
  if (!d) return "N/A";
  try {
    const obj = new Date(d);
    if (isNaN(obj.getTime())) return "N/A";
    return format(obj, fmt);
  } catch {
    return "N/A";
  }
}

export default function ClientPortalPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || searchParams.get("fileId") || "";

  // Auth & Profile State
  const [authChecking, setAuthChecking] = useState(true);
  const [clientUser, setClientUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "search">(
    initialQuery ? "search" : "login"
  );
  const [portalTab, setPortalTab] = useState<
    "projects" | "payments" | "inspections" | "agreements" | "support" | "profile"
  >("projects");

  // Login Form
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regFileId, setRegFileId] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Authenticated Data
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [clientPayments, setClientPayments] = useState<any[]>([]);
  const [clientInspections, setClientInspections] = useState<any[]>([]);
  const [clientAgreements, setClientAgreements] = useState<any[]>([]);
  const [clientStats, setClientStats] = useState<any>({
    activeProjects: 0,
    totalContract: 0,
    totalPaid: 0,
    totalDue: 0,
    inspectionCount: 0,
  });

  // Support / Site Visit Request Form
  const [supportCategory, setSupportCategory] = useState("সাইট ভিজিট রিকোয়েস্ট");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportFileId, setSupportFileId] = useState("");
  const [supportPreferredDate, setSupportPreferredDate] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);

  // Profile Settings Form
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [linkNewFileId, setLinkNewFileId] = useState("");
  const [profileUpdating, setProfileUpdating] = useState(false);

  // Guest Quick Search State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchProjects, setSearchProjects] = useState<any[]>([]);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Check client authentication on mount
  const checkAuth = async () => {
    setAuthChecking(true);
    try {
      const res = await fetch("/api/client/me");
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        setClientUser(data.user);
        setClientProjects(data.projects || []);
        setClientPayments(data.payments || []);
        setClientInspections(data.inspections || []);
        setClientAgreements(data.agreements || []);
        setClientStats(
          data.stats || {
            activeProjects: (data.projects || []).length,
            totalContract: 0,
            totalPaid: 0,
            totalDue: 0,
            inspectionCount: (data.inspections || []).length,
          }
        );

        // Pre-fill profile state
        setProfileName(data.user.name || "");
        setProfileEmail(data.user.email || "");
        setProfileAddress(data.user.address || "");
        if (data.projects?.[0]?.fileId) {
          setSupportFileId(data.projects[0].fileId);
        }
      } else {
        setClientUser(null);
      }
    } catch {
      setClientUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Handle Quick Search for guest
  const handleQuickSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("অনুগ্রহ করে আপনার ফোন নম্বর বা ফাইল আইডি লিখুন");
      return;
    }

    setSearchLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/client-portal?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setSearchProjects(data.projects || []);
      } else {
        setSearchProjects([]);
        toast.error(data.error || "কোনো প্রজেক্টের তথ্য পাওয়া যায়নি");
      }
    } catch {
      setSearchProjects([]);
      toast.error("সার্ভারে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন");
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && !clientUser) {
      handleQuickSearch();
    }
  }, [initialQuery]);

  // Handle Client Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || !loginPassword) {
      toast.error("মোবাইল নম্বর ও পাসওয়ার্ড লিখুন");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginPhone.trim(), password: loginPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "লগইন সফল হয়েছে!");
        await checkAuth();
      } else {
        toast.error(data.error || "লগইন ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("সার্ভার এরর, পুনরায় চেষ্টা করুন");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Client Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      toast.error("আপনার পুরো নাম লিখুন");
      return;
    }
    if (!regPhone.trim()) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch("/api/client/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          password: regPassword,
          email: regEmail.trim(),
          address: regAddress.trim(),
          fileId: regFileId.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("অ্যাকাউন্ট তৈরি ও প্রজেক্ট লিংকিং সফল হয়েছে!");
        await checkAuth();
      } else {
        toast.error(data.error || "রেজিস্ট্রেশনে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভার এরর, পুনরায় চেষ্টা করুন");
    } finally {
      setRegLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
      setClientUser(null);
      setClientProjects([]);
      setClientPayments([]);
      toast.success("সফলভাবে লগআউট হয়েছে");
    } catch {
      toast.error("লগআউটে সমস্যা হয়েছে");
    }
  };

  // Handle Support / Site Visit Request
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      toast.error("অনুগ্রহ করে আপনার বার্তা বা সাইট পরিদর্শনের বিবরণ লিখুন");
      return;
    }

    setSupportLoading(true);
    try {
      const res = await fetch("/api/client/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: supportSubject || supportCategory,
          category: supportCategory,
          message: supportMessage,
          fileId: supportFileId,
          preferredDate: supportPreferredDate,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("আপনার অনুরোধটি গৃহীত হয়েছে! ইঞ্জিনিয়ার দ্রুত যোগাযোগ করবেন।");
        setSupportSubject("");
        setSupportMessage("");
        setSupportPreferredDate("");
      } else {
        toast.error(data.error || "অনুরোধটি পাঠানো যায়নি");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setSupportLoading(false);
    }
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdating(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          address: profileAddress,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
          newFileId: linkNewFileId || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!");
        setCurrentPassword("");
        setNewPassword("");
        setLinkNewFileId("");
        await checkAuth();
      } else {
        toast.error(data.error || "আপডেটে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setProfileUpdating(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">ক্লায়েন্ট পোর্টাল লোড হচ্ছে...</p>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: AUTHENTICATED VIP CLIENT DASHBOARD
  // ==========================================
  if (clientUser) {
    return (
      <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top VIP Client Header Card */}
          <Card className="border-2 border-accent/20 bg-gradient-to-r from-card via-card to-accent/5 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center text-accent shrink-0">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-black text-foreground">
                        স্বাগতম, {clientUser.name}
                      </h1>
                      <Badge className="bg-accent/15 text-accent border-accent/30 text-[11px] font-bold gap-1">
                        <Sparkles className="w-3 h-3" /> VIP Client Portal
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-accent" /> {clientUser.phone}
                      </span>
                      {clientUser.email && <span>{clientUser.email}</span>}
                      {clientUser.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-accent" /> {clientUser.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <a
                    href="https://wa.me/8801778506500"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex"
                  >
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 h-9">
                      <MessageCircle className="w-4 h-4" /> ইঞ্জিনিয়ার হাসমত আলী
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 h-9"
                  >
                    <LogOut className="w-3.5 h-3.5" /> লগআউট
                  </Button>
                </div>
              </div>

              {/* Financial Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <span className="text-[11px] text-muted-foreground font-semibold">আমার প্রজেক্ট</span>
                  <p className="text-xl font-black text-foreground mt-0.5">{clientStats.activeProjects || 0} টি</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                  <span className="text-[11px] text-muted-foreground font-semibold">মোট চুক্তি ফি</span>
                  <p className="text-xl font-black text-foreground mt-0.5">{formatBDT(clientStats.totalContract || 0)}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">পরিশোধিত</span>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{formatBDT(clientStats.totalPaid || 0)}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">বর্তমান বকেয়া</span>
                  <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
                    {clientStats.totalDue > 0 ? formatBDT(clientStats.totalDue) : "৳০ (পরিশোধিত)"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Tabs Bar */}
          <div className="flex overflow-x-auto gap-2 p-1.5 bg-card border rounded-2xl shadow-xs no-scrollbar">
            <button
              onClick={() => setPortalTab("projects")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                portalTab === "projects"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <FolderKanban className="w-4 h-4" /> আমার প্রজেক্টসমূহ ({clientProjects.length})
            </button>
            <button
              onClick={() => setPortalTab("payments")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                portalTab === "payments"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Banknote className="w-4 h-4" /> পেমেন্ট ও ক্যাশ মেমো
            </button>
            <button
              onClick={() => setPortalTab("inspections")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                portalTab === "inspections"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" /> সাইট পরিদর্শন ({clientInspections.length})
            </button>
            <button
              onClick={() => setPortalTab("agreements")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                portalTab === "agreements"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <FileCheck className="w-4 h-4" /> চুক্তিপত্র ({clientAgreements.length})
            </button>
            <button
              onClick={() => setPortalTab("support")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                portalTab === "support"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <HelpCircle className="w-4 h-4" /> সাইট ভিজিট ও সাপোর্ট
            </button>
            <button
              onClick={() => setPortalTab("profile")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                portalTab === "profile"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Settings className="w-4 h-4" /> প্রোফাইল সেটিংস
            </button>
          </div>

          {/* TAB 1: PROJECTS */}
          {portalTab === "projects" && (
            <div className="space-y-6">
              {clientProjects.length === 0 ? (
                <Card className="text-center py-12 border-dashed">
                  <CardContent className="space-y-3">
                    <FolderKanban className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                    <h3 className="text-lg font-bold">এখনো কোনো প্রজেক্ট ফাইল লিংক হয়নি</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      আপনার ফাইল নম্বর জানা থাকলে সেটি প্রোফাইল সেটিংসে গিয়ে যোগ করুন অথবা সরাসরি ইঞ্জিনিয়ার মোঃ হাসমত আলীর সাথে যোগাযোগ করুন।
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <Button onClick={() => setPortalTab("profile")} variant="outline" className="text-xs">
                        ফাইল আইডি যুক্ত করুন
                      </Button>
                      <Link href="/sketch-upload">
                        <Button className="text-xs bg-accent text-white font-bold">
                          📐 নতুন প্ল্যান এর জন্য নকশা পাঠান
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                clientProjects.map((project, pIdx) => {
                  const mainPayment = project.payments && project.payments.length > 0 ? project.payments[0] : null;

                  return (
                    <Card key={pIdx} className="overflow-hidden border-2 shadow-sm">
                      <CardHeader className="bg-card border-b pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-xl font-bold text-foreground">
                                {project.projectTitle}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs capitalize font-bold text-accent bg-accent/5">
                                {project.currentStatus?.replace("-", " ") || "In Progress"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>ফাইল আইডি: <strong className="font-mono text-foreground">{project.fileId}</strong></span>
                              {project.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-accent" /> {project.location}
                                </span>
                              )}
                              <span>শুরুর তারিখ: {safeFormatDate(project.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/verify/${encodeURIComponent(project.fileId || "")}`} target="_blank">
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ডিজিটাল সিল ভেরিফাই
                              </Button>
                            </Link>
                            <a
                              href={`https://wa.me/8801778506500?text=${encodeURIComponent(`Hello Engineer Hasmot Ali, I am inquiring about my project ${project.projectTitle} (File: ${project.fileId})`)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                                <MessageCircle className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপে কথা বলুন
                              </Button>
                            </a>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-5 pt-4 border-t space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-muted-foreground">কাজের মোট অগ্রগতি (Work Progress)</span>
                            <span className="text-accent font-black text-sm">{project.progressPercentage || 0}% সম্পন্ন</span>
                          </div>
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all duration-700 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, project.progressPercentage || 0))}%` }}
                            />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-6">
                        {/* Milestones Stepper */}
                        {project.milestones && project.milestones.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-accent" /> প্রজেক্ট মাইলস্টোন ও ধাপসমূহ
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {project.milestones.map((m: any, mIdx: number) => {
                                const isDone = m.status === "completed";
                                const isProgress = m.status === "in-progress";

                                return (
                                  <div
                                    key={mIdx}
                                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
                                      isDone
                                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400"
                                        : isProgress
                                        ? "bg-blue-500/5 border-blue-500/20 text-blue-800 dark:text-blue-400"
                                        : "bg-muted/40 border-border text-muted-foreground"
                                    }`}
                                  >
                                    <div className="mt-0.5">
                                      {isDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                                      )}
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="font-bold">{m.title}</p>
                                      <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                                        {m.status}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Documents & Blueprints Downloads */}
                        {project.documents && project.documents.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-accent" /> অনুমোদিত ড্রয়িং ও ডকুমেন্টস ডাউনলোড
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {project.documents.map((doc: any, dIdx: number) => (
                                <div key={dIdx} className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:border-accent/40 transition-colors">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-xs text-foreground">{doc.name}</p>
                                      <p className="text-[10px] text-muted-foreground">{safeFormatDate(doc.uploadedAt)}</p>
                                    </div>
                                  </div>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 font-bold border-accent/30 text-accent hover:bg-accent/10">
                                      <Download className="w-3.5 h-3.5" /> ডাউনলোড
                                    </Button>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: PAYMENTS & RECEIPTS */}
          {portalTab === "payments" && (
            <div className="space-y-6">
              {clientPayments.length === 0 ? (
                <Card className="text-center py-12 border-dashed">
                  <CardContent className="space-y-3">
                    <Banknote className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                    <h3 className="text-lg font-bold">কোনো পেমেন্ট রেকর্ড নেই</h3>
                    <p className="text-sm text-muted-foreground">আপনার ফাইলটি যুক্ত থাকলে অফিসিয়াল কিস্তি ও পেমেন্ট হিস্ট্রি এখানে প্রদর্শিত হবে।</p>
                  </CardContent>
                </Card>
              ) : (
                clientPayments.map((payment, pIdx) => (
                  <Card key={pIdx} className="border-2 shadow-sm">
                    <CardHeader className="bg-card border-b pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg font-bold text-foreground">
                            {payment.projectTitle}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ফাইল রেফারেন্স: <strong className="font-mono text-foreground">{payment.planFileRef || "N/A"}</strong>
                          </p>
                        </div>
                        <Link
                          href={`/pay?fileId=${payment.planFileRef || ""}&phone=${payment.phone}&name=${encodeURIComponent(payment.clientName)}&title=${encodeURIComponent(payment.projectTitle)}&amount=${payment.dueAmount > 0 ? payment.dueAmount : ""}`}
                        >
                          <Button size="sm" className="font-bold gap-1.5 bg-accent hover:bg-accent/90 text-white text-xs">
                            <CreditCard className="w-4 h-4" /> অনলাইনে পরিশোধ করুন
                          </Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        <div className="p-3.5 rounded-xl border bg-muted/30 text-xs">
                          <span className="text-muted-foreground">মোট চুক্তি বিল</span>
                          <p className="text-lg font-black text-foreground mt-0.5">{formatBDT(payment.totalAmount)}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-xs">
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">পরিশোধিত টাকা</span>
                          <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{formatBDT(payment.paidAmount)}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-amber-500/5 border-amber-500/20 text-xs">
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">বর্তমান বকেয়া</span>
                          <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">
                            {payment.dueAmount > 0 ? formatBDT(payment.dueAmount) : "৳০ (পরিশোধিত)"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-accent" /> পরিশোধিত কিস্তির হিসাব ও রসিদ
                      </h4>
                      {payment.installments && payment.installments.length > 0 ? (
                        <div className="border rounded-xl overflow-hidden text-xs">
                          <table className="w-full text-left">
                            <thead className="bg-muted/60 text-muted-foreground font-semibold uppercase text-[10px]">
                              <tr>
                                <th className="p-2.5">তারিখ</th>
                                <th className="p-2.5">বিবরণ / কিস্তি</th>
                                <th className="p-2.5">মাধ্যম</th>
                                <th className="p-2.5 text-right">টাকা</th>
                                <th className="p-2.5 text-right">ভাউচার</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {payment.installments.map((inst: any, instIdx: number) => (
                                <tr key={instIdx} className="hover:bg-muted/20">
                                  <td className="p-2.5 text-muted-foreground">{safeFormatDate(inst.paidOn)}</td>
                                  <td className="p-2.5 font-semibold text-foreground">{inst.label}</td>
                                  <td className="p-2.5">
                                    <Badge variant="outline" className="text-[10px] capitalize">
                                      {inst.type}
                                    </Badge>
                                  </td>
                                  <td className="p-2.5 text-right font-black text-emerald-600">
                                    {formatBDT(inst.amount)}
                                  </td>
                                  <td className="p-2.5 text-right">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs gap-1 font-semibold"
                                      onClick={() => setSelectedReceipt({ payment, installment: inst })}
                                    >
                                      <Printer className="w-3 h-3" /> ক্যাশ মেমো
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">এখনো কোনো কিস্তির এন্ট্রি রেকর্ড করা হয়নি।</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SITE INSPECTIONS */}
          {portalTab === "inspections" && (
            <div className="space-y-4">
              {clientInspections.length === 0 ? (
                <Card className="text-center py-12 border-dashed">
                  <CardContent className="space-y-3">
                    <ClipboardCheck className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                    <h3 className="text-lg font-bold">কোনো পরিদর্শন রিপোর্ট পাওয়া যায়নি</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      সাইটে ইঞ্জিনিয়ার হাসমত আলী রড বাইন্ডিং, শাটারিং বা কাস্টিং চেক করলেই রিয়েল-টাইম রিপোর্ট এখানে দেখতে পাবেন।
                    </p>
                    <Button onClick={() => setPortalTab("support")} className="text-xs bg-accent text-white font-bold">
                      পরিদর্শনের আবেদন করুন
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientInspections.map((insp: any, iIdx: number) => (
                    <Card key={iIdx} className="border-2 shadow-xs">
                      <CardContent className="p-5 space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-primary-foreground font-mono font-bold text-[10px]">
                              {insp.reportNumber}
                            </Badge>
                            <span className="font-bold text-sm text-foreground">{insp.stage}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              insp.status === "satisfactory"
                                ? "text-emerald-700 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30"
                                : "text-amber-700 border-amber-500/30 bg-amber-50 dark:bg-amber-950/30"
                            }`}
                          >
                            {insp.status === "satisfactory" ? "সন্তোষজনক ✅" : "সংশোধন প্রয়োজন ⚠️"}
                          </Badge>
                        </div>
                        <div className="space-y-1.5 bg-muted/40 p-3 rounded-xl border border-border/50">
                          <p><strong className="text-foreground">প্রজেক্ট:</strong> {insp.projectTitle}</p>
                          <p><strong className="text-foreground">পর্যবেক্ষণ:</strong> {insp.observations}</p>
                          <p><strong className="text-accent font-bold">মিস্ত্রির প্রতি নির্দেশ:</strong> {insp.instructions}</p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                          <span>তারিখ: {safeFormatDate(insp.inspectionDate)}</span>
                          <span>ইন্সপেক্টর: {insp.inspectorName}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AGREEMENTS */}
          {portalTab === "agreements" && (
            <div className="space-y-4">
              {clientAgreements.length === 0 ? (
                <Card className="text-center py-12 border-dashed">
                  <CardContent className="space-y-3">
                    <FileCheck className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                    <h3 className="text-lg font-bold">কোনো চুক্তিপত্র পাওয়া যায়নি</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      অফিসিয়াল চুক্তিপত্র স্বাক্ষরিত হলে তার ডিজিটাল কপি এখানে পাওয়া যাবে।
                    </p>
                  </CardContent>
                </Card>
              ) : (
                clientAgreements.map((agr: any, aIdx: number) => (
                  <Card key={aIdx} className="border-2 shadow-xs">
                    <CardHeader className="bg-card border-b pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-bold text-foreground">
                            {agr.projectTitle} - অফিসিয়াল ইঞ্জিনিয়ারিং চুক্তিপত্র
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            তারিখ: {safeFormatDate(agr.agreementDate || agr.createdAt)}
                          </p>
                        </div>
                        <Badge className="bg-accent/10 text-accent border-accent/20 text-xs font-bold">
                          Official Signed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-muted/30 p-3 rounded-xl">
                        <div>
                          <span className="text-muted-foreground">চুক্তিবদ্ধ ক্লায়েন্ট:</span>
                          <p className="font-bold text-foreground">{agr.clientName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ফোন:</span>
                          <p className="font-bold text-foreground">{agr.clientPhone}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">মোট চুক্তি মূল্য:</span>
                          <p className="font-black text-emerald-600">{formatBDT(agr.totalFee || 0)}</p>
                        </div>
                      </div>
                      {agr.scopeOfWork && agr.scopeOfWork.length > 0 && (
                        <div>
                          <p className="font-bold text-muted-foreground mb-1">কাজের পরিধি (Scope of Work):</p>
                          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                            {agr.scopeOfWork.map((scope: string, sIdx: number) => (
                              <li key={sIdx}>{scope}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 5: SITE VISIT & DIRECT SUPPORT */}
          {portalTab === "support" && (
            <Card className="border-2 shadow-sm">
              <CardHeader className="bg-card border-b pb-4">
                <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-accent" /> সরাসরি ইঞ্জিনিয়ার পরামর্শ ও সাইট ভিজিট রিকোয়েস্ট
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  আপনার নির্মাণ সাইটে রড চেক, শাটারিং পর্যবেক্ষণ বা ড্রয়িং সংশোধনের প্রয়োজন হলে এখান থেকেই সরাসরি আবেদন করুন।
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSupportSubmit} className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">অনুরোধের ধরন / ক্যাটাগরি</label>
                      <select
                        className="w-full h-11 px-3 bg-background border rounded-xl text-xs sm:text-sm focus-visible:ring-accent"
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                      >
                        <option value="সাইট ভিজিট রিকোয়েস্ট">সাইট পরিদর্শন (Site Inspection Request)</option>
                        <option value="রড বাইন্ডিং ও কাস্টিং চেক">রড বাইন্ডিং ও ছাদ ঢালাই চেকিং</option>
                        <option value="ড্রয়িং বা নকশা সংশোধন">ড্রয়িং / নকশা সংশোধন (Design Revision)</option>
                        <option value="স্ট্রাকচারাল কনসালটেন্সি">স্ট্রাকচারাল পরামর্শ (Structural Advice)</option>
                        <option value="পেমেন্ট ও বিল সংক্রান্ত">পেমেন্ট ও বিল সংক্রান্ত জিজ্ঞাসা</option>
                        <option value="অন্যান্য জিজ্ঞাসা">অন্যান্য জিজ্ঞাসা</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">প্রজেক্ট / ফাইল রেফারেন্স</label>
                      <Input
                        placeholder="যেমন: TH-2026-0001"
                        value={supportFileId}
                        onChange={(e) => setSupportFileId(e.target.value)}
                        className="h-11 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">বিষয় (Subject)</label>
                      <Input
                        placeholder="যেমন: ১ম তলার ছাদ ঢালাই চেকিং রিকোয়েস্ট"
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        className="h-11 rounded-xl text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">পছন্দের তারিখ / সময় (ঐচ্ছিক)</label>
                      <Input
                        placeholder="যেমন: আগামী শুক্রবার সকাল ১০টা"
                        value={supportPreferredDate}
                        onChange={(e) => setSupportPreferredDate(e.target.value)}
                        className="h-11 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">বিস্তারিত বিবরণ ও বার্তা *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="আপনার সাইটের বর্তমান অবস্থা এবং ইঞ্জিনিয়ারের সহায়তা বা পরিদর্শনের বিস্তারিত লিখুন..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="w-full p-3 bg-background border rounded-xl text-xs sm:text-sm focus-visible:ring-accent"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={supportLoading}
                      className="h-11 px-6 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white gap-2 text-xs sm:text-sm"
                    >
                      {supportLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      অনুরোধ সাবমিট করুন
                    </Button>
                    <a
                      href="https://wa.me/8801778506500"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" /> জরুরি ক্ষেত্রে সরাসরি হোয়াটসঅ্যাপে জানান
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 6: PROFILE SETTINGS */}
          {portalTab === "profile" && (
            <Card className="border-2 shadow-sm">
              <CardHeader className="bg-card border-b pb-4">
                <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5 text-accent" /> প্রোফাইল সেটিংস ও নিরাপত্তা
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  আপনার ব্যক্তিগত তথ্য ও পাসওয়ার্ড পরিবর্তন করুন।
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">ব্যক্তিগত বিবরণ</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">পূর্ণ নাম</label>
                        <Input
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="h-11 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">মোবাইল নম্বর (পরিবর্তনযোগ্য নয়)</label>
                        <Input
                          disabled
                          value={clientUser.phone}
                          className="h-11 rounded-xl text-xs sm:text-sm bg-muted text-muted-foreground font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                        <Input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="h-11 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">বর্তমান ঠিকানা / এলাকা</label>
                        <Input
                          value={profileAddress}
                          onChange={(e) => setProfileAddress(e.target.value)}
                          className="h-11 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">নতুন প্রজেক্ট ফাইল লিংক করুন</h3>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">ফাইল নম্বর (File ID)</label>
                      <Input
                        placeholder="যেমন: TH-2026-0002"
                        value={linkNewFileId}
                        onChange={(e) => setLinkNewFileId(e.target.value)}
                        className="h-11 rounded-xl text-xs sm:text-sm uppercase font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        ইতোমধ্যে লিংক করা ফাইলসমূহ: {clientUser.linkedFiles?.length > 0 ? clientUser.linkedFiles.join(", ") : "স্বয়ংক্রিয় ফোন লিংকিং সক্রিয়"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">বর্তমান পাসওয়ার্ড</label>
                        <Input
                          type="password"
                          placeholder="বর্তমান পাসওয়ার্ড দিন"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="h-11 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">নতুন পাসওয়ার্ড</label>
                        <Input
                          type="password"
                          placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={profileUpdating}
                    className="h-11 px-6 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white gap-2 text-xs sm:text-sm"
                  >
                    {profileUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                    প্রোফাইল আপডেট সংরক্ষণ করুন
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Printable Official Cash Memo / Money Receipt Modal */}
          <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white text-slate-900">
              {selectedReceipt && (
                <div className="space-y-6">
                  <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                      <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Triple H Logo" className="w-12 h-12 object-contain" />
                        <div>
                          <h2 className="text-xl font-black text-slate-900">TRIPLE H</h2>
                          <p className="text-xs font-semibold text-accent uppercase">Engineering Consultancy</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-600">
                        <p className="font-semibold">+880 1778-506500</p>
                        <p>Dhanmondi, Dhaka</p>
                      </div>
                    </div>

                    <div className="text-center py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded uppercase">
                      Official Money Receipt / ক্যাশ মেমো
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 font-semibold">Received From:</p>
                        <p className="font-bold text-sm text-slate-900">{selectedReceipt.payment.clientName}</p>
                        <p className="text-slate-600">Phone: {selectedReceipt.payment.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-semibold">Project:</p>
                        <p className="font-bold text-sm text-slate-900">{selectedReceipt.payment.projectTitle}</p>
                        <p className="text-slate-600">Date: {safeFormatDate(selectedReceipt.installment.paidOn)}</p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-3 text-xs flex justify-between items-center bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-800">{selectedReceipt.installment.label}</p>
                        <p className="text-slate-500">{selectedReceipt.installment.note || "Official Project Payment"}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] uppercase block">Amount Paid</span>
                        <span className="text-lg font-black text-emerald-700">{formatBDT(selectedReceipt.installment.amount)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs pt-4 border-t border-slate-200 text-slate-600">
                      <span>Total Bill: <strong>{formatBDT(selectedReceipt.payment.totalAmount)}</strong></span>
                      <span>Total Paid: <strong className="text-emerald-700">{formatBDT(selectedReceipt.payment.paidAmount)}</strong></span>
                      <span>Balance Due: <strong className="text-rose-700">{formatBDT(selectedReceipt.payment.dueAmount)}</strong></span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 print:hidden">
                    <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                      Close
                    </Button>
                    <Button className="gap-2 bg-accent hover:bg-accent/90 text-white font-bold" onClick={() => window.print()}>
                      <Printer className="w-4 h-4" /> Print Receipt
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNAUTHENTICATED CLIENT VIEW
  // (Login / Register / Quick Search)
  // ==========================================
  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="px-3 py-1 bg-accent/10 text-accent border-accent/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Triple H Client Self-Service Portal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            ক্লায়েন্ট সেলফ-সার্ভিস ও প্রজেক্ট ট্র্যাকার
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            আপনার চলমান প্রজেক্টের লাইভ স্ট্যাটাস, অনুমোদিত ড্রয়িং ডাউনলোড, পেমেন্ট রসিদ এবং সাইট পরিদর্শনের রিপোর্ট দেখতে লগইন বা রেজিস্ট্রেশন করুন।
          </p>

          {/* Mode Switcher Buttons */}
          <div className="inline-flex p-1.5 bg-card border rounded-2xl shadow-xs gap-1 max-w-md mx-auto">
            <button
              onClick={() => setAuthMode("login")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                authMode === "login"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <LogIn className="w-4 h-4" /> লগইন
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                authMode === "register"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <UserPlus className="w-4 h-4" /> নতুন রেজিস্ট্রেশন
            </button>
            <button
              onClick={() => setAuthMode("search")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                authMode === "search"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Search className="w-4 h-4" /> কুইক সার্চ
            </button>
          </div>
        </div>

        {/* 1. LOGIN FORM */}
        {authMode === "login" && (
          <Card className="max-w-md mx-auto border-2 shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold">ক্লায়েন্ট একাউন্টে লগইন</CardTitle>
              <CardDescription className="text-xs">
                আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">মোবাইল নম্বর বা ইমেইল</label>
                  <Input
                    type="text"
                    required
                    placeholder="যেমন: 017XXXXXXXX"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">পাসওয়ার্ড</label>
                  <Input
                    type="password"
                    required
                    placeholder="আপনার পাসওয়ার্ড দিন"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-11 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white gap-2"
                >
                  {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  লগইন করুন
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="text-xs text-muted-foreground hover:text-accent font-semibold"
                  >
                    অ্যাকাউন্ট নেই? <span className="text-accent underline font-bold">নতুন একাউন্ট খুলুন</span>
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 2. REGISTER FORM */}
        {authMode === "register" && (
          <Card className="max-w-lg mx-auto border-2 shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold">নতুন ক্লায়েন্ট রেজিস্ট্রেশন</CardTitle>
              <CardDescription className="text-xs">
                রেজিস্ট্রেশন করলেই আপনার মোবাইল নম্বরের সাথে যুক্ত সব ড্রয়িং ও ফাইল স্বয়ংক্রিয়ভাবে লিংক হয়ে যাবে
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">আপনার পূর্ণ নাম *</label>
                  <Input
                    required
                    placeholder="যেমন: মোঃ কামরুল হাসান"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">মোবাইল নম্বর (সঠিক ১১ ডিজিট) *</label>
                  <Input
                    required
                    type="tel"
                    placeholder="যেমন: 01711223344"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="h-11 rounded-xl text-sm font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    যে নম্বরে আপনার প্রজেক্টের আপডেট বা ড্রয়িং দেওয়া হয়েছে
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *</label>
                  <Input
                    required
                    type="password"
                    placeholder="পাসওয়ার্ড তৈরি করুন"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                    <Input
                      type="email"
                      placeholder="client@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">প্রজেক্ট ফাইল আইডি (ঐচ্ছিক)</label>
                    <Input
                      placeholder="যেমন: TH-2026-0001"
                      value={regFileId}
                      onChange={(e) => setRegFileId(e.target.value)}
                      className="h-11 rounded-xl text-sm uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">বর্তমান ঠিকানা / এলাকা (ঐচ্ছিক)</label>
                  <Input
                    placeholder="যেমন: উত্তরা, ঢাকা"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="h-11 rounded-xl text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={regLoading}
                  className="w-full h-11 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white gap-2"
                >
                  {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  রেজিস্ট্রেশন সম্পন্ন করুন
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-xs text-muted-foreground hover:text-accent font-semibold"
                  >
                    ইতোমধ্যে একাউন্ট আছে? <span className="text-accent underline font-bold">লগইন করুন</span>
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 3. GUEST QUICK SEARCH */}
        {authMode === "search" && (
          <div className="space-y-6">
            <form onSubmit={handleQuickSearch} className="max-w-xl mx-auto flex gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-muted-foreground" />
                <Input
                  className="pl-11 h-12 bg-background text-sm sm:text-base rounded-xl shadow-sm border-2 focus-visible:ring-accent"
                  placeholder="যেমন: 01711... বা TH-2026-0001"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={searchLoading} className="h-12 px-6 rounded-xl font-bold bg-accent hover:bg-accent/90">
                {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "খুঁজুন"}
              </Button>
            </form>

            {searched && searchProjects.length === 0 && !searchLoading && (
              <Card className="text-center py-12 border-dashed">
                <CardContent className="space-y-3">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                  <h3 className="text-lg font-bold">কোনো রেকর্ড পাওয়া যায়নি</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    "{searchQuery}" এর সাথে মিলে এমন কোনো প্ল্যান বা পেমেন্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক ফোন নম্বর বা ফাইল আইডি দিন।
                  </p>
                  <div className="pt-2">
                    <a href="tel:+8801778506500">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Phone className="w-4 h-4" /> হটলাইন: +880 1778-506500
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {searchProjects.map((project, pIdx) => {
              const mainPayment = project.payments && project.payments.length > 0 ? project.payments[0] : null;

              return (
                <Card key={pIdx} className="overflow-hidden border-2 shadow-sm">
                  <CardHeader className="bg-card border-b pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl font-bold text-foreground">
                            {project.projectTitle}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs capitalize font-bold text-accent bg-accent/5">
                            {project.currentStatus?.replace("-", " ") || "In Progress"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>ক্লায়েন্ট: <strong className="text-foreground">{project.clientName}</strong></span>
                          <span>ফাইল আইডি: <strong className="font-mono text-foreground">{project.fileId}</strong></span>
                          {project.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-accent" /> {project.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/verify/${encodeURIComponent(project.fileId || "")}`} target="_blank">
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-700 hover:bg-emerald-50">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> সনদ ভেরিফাই
                          </Button>
                        </Link>
                        <a
                          href={`https://wa.me/8801778506500?text=${encodeURIComponent(`Hello Triple H, I am checking my project ${project.projectTitle} (File: ${project.fileId})`)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                            <MessageCircle className="w-3.5 h-3.5" /> ইঞ্জিনিয়ার পরামর্শ
                          </Button>
                        </a>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-muted-foreground">কাজের মোট অগ্রগতি</span>
                        <span className="text-accent font-black text-sm">{project.progressPercentage || 0}% সম্পন্ন</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-700 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, project.progressPercentage || 0))}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Milestones */}
                    {project.milestones && project.milestones.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-accent" /> প্রজেক্ট মাইলস্টোন
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {project.milestones.map((m: any, mIdx: number) => (
                            <div
                              key={mIdx}
                              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                                m.status === "completed"
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800"
                                  : "bg-muted/40 border-border text-muted-foreground"
                              }`}
                            >
                              {m.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                              )}
                              <div>
                                <p className="font-bold">{m.title}</p>
                                <span className="text-[10px] uppercase">{m.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {project.documents && project.documents.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-accent" /> অনুমোদিত ড্রয়িং ও ডকুমেন্টস
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {project.documents.map((doc: any, dIdx: number) => (
                            <div key={dIdx} className="flex items-center justify-between p-3 rounded-xl border bg-card">
                              <div>
                                <p className="font-semibold text-xs text-foreground">{doc.name}</p>
                                <p className="text-[10px] text-muted-foreground">{safeFormatDate(doc.uploadedAt)}</p>
                              </div>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="gap-1 text-xs h-8">
                                  <Download className="w-3.5 h-3.5" /> ডাউনলোড
                                </Button>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Ledger */}
                    {mainPayment && (
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Banknote className="w-4 h-4 text-accent" /> পেমেন্ট লেজার
                          </h4>
                          <Link
                            href={`/pay?fileId=${project.fileId}&phone=${project.phone}&name=${encodeURIComponent(project.clientName)}&title=${encodeURIComponent(project.projectTitle)}&amount=${mainPayment.dueAmount > 0 ? mainPayment.dueAmount : ''}`}
                          >
                            <Button size="sm" className="h-8 font-bold gap-1.5 bg-accent text-white text-xs">
                              <CreditCard className="w-3.5 h-3.5" /> অনলাইনে পরিশোধ
                            </Button>
                          </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl border bg-muted/30 text-xs">
                            <span className="text-muted-foreground">মোট চুক্তি</span>
                            <p className="text-base font-black mt-0.5">{formatBDT(mainPayment.totalAmount)}</p>
                          </div>
                          <div className="p-3 rounded-xl border bg-emerald-500/5 text-xs">
                            <span className="text-emerald-700 font-semibold">পরিশোধিত</span>
                            <p className="text-base font-black text-emerald-700 mt-0.5">{formatBDT(mainPayment.paidAmount)}</p>
                          </div>
                          <div className="p-3 rounded-xl border bg-amber-500/5 text-xs">
                            <span className="text-amber-700 font-semibold">বকেয়া</span>
                            <p className="text-base font-black text-amber-700 mt-0.5">{formatBDT(mainPayment.dueAmount)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
