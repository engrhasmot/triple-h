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
  ExternalLink,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [query, setQuery] = useState(searchParams.get("query") || searchParams.get("fileId") || "");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      toast.error("অনুগ্রহ করে আপনার ফোন নম্বর বা ফাইল আইডি লিখুন");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/client-portal?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
      } else {
        setProjects([]);
        toast.error(data.error || "কোনো প্রজেক্টের তথ্য পাওয়া যায়নি");
      }
    } catch {
      setProjects([]);
      toast.error("সার্ভারে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, []);

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero & Search Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="px-3 py-1 bg-accent/10 text-accent border-accent/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Triple H Client Self-Service Portal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            প্রজেক্ট স্ট্যাটাস ও পেমেন্ট ট্র্যাকার
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            আপনার চলমান প্রজেক্টের অনুমোদনের অগ্রগতি, নকশা বা ড্রয়িং ডাউনলোড এবং পেমেন্ট রশিদ দেখতে ফোন নম্বর বা ফাইল আইডি দিন।
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-muted-foreground" />
              <Input
                className="pl-11 h-12 bg-background text-sm sm:text-base rounded-xl shadow-sm border-2 focus-visible:ring-accent"
                placeholder="যেমন: 01711... বা TH-2026-0001"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="h-12 px-6 rounded-xl font-bold bg-accent hover:bg-accent/90">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "খুঁজুন"}
            </Button>
          </form>
        </div>

        {/* Results Section */}
        {searched && projects.length === 0 && !loading && (
          <Card className="text-center py-12 border-dashed">
            <CardContent className="space-y-3">
              <AlertCircle className="w-12 h-12 text-muted-foreground/60 mx-auto" />
              <h3 className="text-lg font-bold">কোনো রেকর্ড পাওয়া যায়নি</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                "{query}" এর সাথে মিলে এমন কোনো প্ল্যান বা পেমেন্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক ফোন নম্বর বা ফাইল আইডি দিন অথবা আমাদের হটলাইনে যোগাযোগ করুন।
              </p>
              <div className="pt-2">
                <a href="tel:+8801711285651">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="w-4 h-4" /> কল করুন: +880 1711-285651
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {projects.map((project, pIdx) => {
          const mainPayment = project.payments && project.payments.length > 0 ? project.payments[0] : null;

          return (
            <div key={pIdx} className="space-y-6">
              {/* Project Card */}
              <Card className="overflow-hidden border-2 shadow-sm">
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
                      <a
                        href={`https://wa.me/8801711285651?text=${encodeURIComponent(`Hello Triple H, I am checking my project ${project.projectTitle} (File: ${project.fileId})`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                          <MessageCircle className="w-3.5 h-3.5" /> ইঞ্জিনিয়ার পরামর্শ
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
                  {/* Milestones Timeline */}
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
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800"
                                  : isProgress
                                  ? "bg-blue-500/5 border-blue-500/20 text-blue-800"
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
                        <FileText className="w-4 h-4 text-accent" /> অনুমোদিত ড্রয়িং ও ডকুমেন্টস
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {project.documents.map((doc: any, dIdx: number) => (
                          <div key={dIdx} className="flex items-center justify-between p-3 rounded-xl border bg-card">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-accent" />
                              <div>
                                <p className="font-semibold text-xs text-foreground">{doc.name}</p>
                                <p className="text-[10px] text-muted-foreground">{safeFormatDate(doc.uploadedAt)}</p>
                              </div>
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

                  {/* Financial & Payment Ledger */}
                  {mainPayment && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-accent" /> পেমেন্ট লেজার ও রসিদ বিবরণ
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl border bg-muted/30 text-xs">
                          <span className="text-muted-foreground">মোট চুক্তি বিল</span>
                          <p className="text-lg font-black text-foreground mt-0.5">{formatBDT(mainPayment.totalAmount)}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-xs">
                          <span className="text-emerald-700 font-semibold">পরিশোধিত টাকা</span>
                          <p className="text-lg font-black text-emerald-700 mt-0.5">{formatBDT(mainPayment.paidAmount)}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-amber-500/5 border-amber-500/20 text-xs">
                          <span className="text-amber-700 font-semibold">বর্তমান বকেয়া</span>
                          <p className="text-lg font-black text-amber-700 mt-0.5">
                            {mainPayment.dueAmount > 0 ? formatBDT(mainPayment.dueAmount) : "৳০ (পরিশোধিত)"}
                          </p>
                        </div>
                      </div>

                      {/* Installments Table */}
                      {mainPayment.installments && mainPayment.installments.length > 0 && (
                        <div className="border rounded-xl overflow-hidden mt-3 text-xs">
                          <table className="w-full text-left">
                            <thead className="bg-muted/60 text-muted-foreground font-semibold uppercase text-[10px]">
                              <tr>
                                <th className="p-2.5">তারিখ</th>
                                <th className="p-2.5">বিবরণ / কিস্তি</th>
                                <th className="p-2.5">পেমেন্ট মাধ্যম</th>
                                <th className="p-2.5 text-right">টাকা</th>
                                <th className="p-2.5 text-right">রশিদ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {mainPayment.installments.map((inst: any, instIdx: number) => (
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
                                      className="h-7 text-xs gap-1"
                                      onClick={() => setSelectedReceipt({ payment: mainPayment, installment: inst })}
                                    >
                                      <Printer className="w-3 h-3" /> ভাউচার
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Printable Money Receipt Modal */}
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white text-slate-900">
            {selectedReceipt && (
              <div className="space-y-6">
                <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-sm space-y-6">
                  {/* Header with Logo */}
                  <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                    <div className="flex items-center gap-3">
                      <img src="/logo.png" alt="Triple H Logo" className="w-12 h-12 object-contain" />
                      <div>
                        <h2 className="text-xl font-black text-slate-900">TRIPLE H</h2>
                        <p className="text-xs font-semibold text-accent uppercase">Engineering Consultancy</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-600">
                      <p className="font-semibold">+880 1711-285651</p>
                      <p>contact@tripleh.com</p>
                    </div>
                  </div>

                  <div className="text-center py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded uppercase">
                    Money Receipt / অফিসিয়াল ক্যাশ মেমো
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
                      <p className="text-slate-500">{selectedReceipt.installment.note || "Official Payment"}</p>
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
