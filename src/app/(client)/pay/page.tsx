"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Loader2, 
  ArrowRight,
  FileCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

const OFFICIAL_BKASH = "01631186218";
const OFFICIAL_NAGAD = "01631186218";

export default function OnlinePaymentPage() {
  const searchParams = useSearchParams();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: searchParams.get("name") || "",
    phone: searchParams.get("phone") || "",
    planFileRef: searchParams.get("fileId") || "",
    projectTitle: searchParams.get("title") || "",
    amount: searchParams.get("amount") || "",
    method: "bkash",
    senderPhone: "",
    transactionId: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const copyToClipboard = (text: string, field: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${text} কপি করা হয়েছে!`);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.phone.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম ও ফোন নম্বর লিখুন");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("অনুগ্রহ করে সঠিক টাকার পরিমাণ দিন");
      return;
    }
    if (!formData.senderPhone.trim()) {
      toast.error("যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন");
      return;
    }
    if (!formData.transactionId.trim()) {
      toast.error("ট্রানজেকশন আইডি (TrxID) অবশ্যই দিতে হবে");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmittedData(data.submission);
        toast.success("পেমেন্ট তথ্য সফলভাবে জমা হয়েছে!");
      } else {
        toast.error(data.error || "পেমেন্ট তথ্য জমা দিতে ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, অনুগ্রহ করে আবার চেষ্টা করুন");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="px-3 py-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Triple H Official Payment Gateway
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            অনলাইন ফি ও কিস্তি পরিশোধ
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            বিকাশ ও নগদ এর মাধ্যমে ঘরে বসেই আপনার ড্রয়িং, রাজউক অনুমোদন ও কনসালটেন্সির ফি পরিশোধ করুন।
          </p>
        </div>

        {/* Success Confirmation State */}
        {submittedData ? (
          <Card className="border-2 border-emerald-500/30 shadow-lg text-center p-8 bg-card space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">পেমেন্ট সাবমিশন সফল হয়েছে!</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                ধন্যবাদ! আপনার <strong>৳{Number(submittedData.amount).toLocaleString("en-IN")}</strong> টাকার পেমেন্ট তথ্য (TrxID: <span className="font-mono font-bold text-accent">{submittedData.transactionId}</span>) আমাদের অ্যাডমিন সিস্টেমে জমা হয়েছে।
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl border border-border max-w-md mx-auto text-xs text-left space-y-2">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" /> পরবর্তী ধাপ ও ভেরিফিকেশন:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>আমাদের টিম দ্রুত বিকাশ/নগদ স্টেটমেন্ট যাচাই করে আপনার পেমেন্ট অ্যাপ্রুভ করবে।</li>
                <li>অ্যাপ্রুভ হওয়ার সাথে সাথে আপনার নম্বরে অফিসিয়াল <strong>WhatsApp Money Receipt</strong> পৌঁছে যাবে।</li>
                <li>আপনার <Link href="/client-portal" className="text-accent underline font-semibold">ক্লায়েন্ট পোর্টাল</Link>-এ বকেয়ার হিসাব আপডেট হয়ে যাবে।</li>
              </ul>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/client-portal">
                <Button variant="default" className="font-bold bg-accent hover:bg-accent/90">
                  ক্লায়েন্ট পোর্টালে যান
                </Button>
              </Link>
              <a href="tel:+8801711285651">
                <Button variant="outline" className="gap-2">
                  <Phone className="w-4 h-4" /> হেল্পলাইন: 01711-285651
                </Button>
              </a>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Official Payment Numbers & Instructions */}
            <div className="lg:col-span-5 space-y-6">
              {/* bKash Card */}
              <Card className="border-2 border-pink-500/20 bg-pink-500/5 overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black text-pink-700 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-pink-600 text-white font-black text-xs">bKash</span>
                      বিকাশ পেমেন্ট
                    </CardTitle>
                    <CardDescription className="text-xs">পার্সোনাল / Send Money</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-pink-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">অফিসিয়াল নম্বর</span>
                      <span className="font-mono text-base font-black text-slate-900">{OFFICIAL_BKASH}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 border-pink-300 text-pink-700 hover:bg-pink-100"
                      onClick={() => copyToClipboard(OFFICIAL_BKASH, "bkash")}
                    >
                      {copiedField === "bkash" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === "bkash" ? "কপি হয়েছে" : "কপি"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Nagad Card */}
              <Card className="border-2 border-orange-500/20 bg-orange-500/5 overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black text-orange-700 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-black text-xs">Nagad</span>
                      নগদ পেমেন্ট
                    </CardTitle>
                    <CardDescription className="text-xs">পার্সোনাল / Send Money</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-orange-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">অফিসিয়াল নম্বর</span>
                      <span className="font-mono text-base font-black text-slate-900">{OFFICIAL_NAGAD}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 border-orange-300 text-orange-700 hover:bg-orange-100"
                      onClick={() => copyToClipboard(OFFICIAL_NAGAD, "nagad")}
                    >
                      {copiedField === "nagad" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === "nagad" ? "কপি হয়েছে" : "কপি"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions Guide */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-accent" /> যেভাবে টাকা পাঠাবেন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-[11px]">১</span>
                    <p>আপনার <strong>bKash</strong> বা <strong>Nagad</strong> অ্যাপে প্রবেশ করে <strong>"Send Money"</strong> অপশন সিলেক্ট করুন।</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-[11px]">২</span>
                    <p>প্রাপক নম্বরে <strong>01631186218</strong> লিখুন এবং নির্ধারিত টাকার পরিমাণ পাঠিয়ে কনফার্ম করুন।</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-[11px]">৩</span>
                    <p>সফল লেনদেনের পর স্ক্রিনে দেখানো <strong>TrxID (ট্রানজেকশন আইডি)</strong> কপি করে পাশের ফর্মে সাবমিট করুন।</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Submission Form */}
            <div className="lg:col-span-7">
              <Card className="border-2 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" /> পেমেন্ট সাবমিশন ফর্ম
                  </CardTitle>
                  <CardDescription>
                    টাকা পাঠানোর পর নিচের তথ্যগুলো পূরণ করে সাবমিট করুন।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>আপনার নাম (Client Name) *</Label>
                        <Input
                          required
                          value={formData.clientName}
                          onChange={(e) => setFormData((p) => ({ ...p, clientName: e.target.value }))}
                          placeholder="যেমন: মোঃ কামরুল ইসলাম"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>আপনার ফোন নম্বর (Phone) *</Label>
                        <Input
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="01700000000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>প্রজেক্টের নাম / বিবরণ</Label>
                        <Input
                          value={formData.projectTitle}
                          onChange={(e) => setFormData((p) => ({ ...p, projectTitle: e.target.value }))}
                          placeholder="যেমন: কামরুল ভিলা (মিরপুর)"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>ফাইল আইডি (জানা থাকলে)</Label>
                        <Input
                          value={formData.planFileRef}
                          onChange={(e) => setFormData((p) => ({ ...p, planFileRef: e.target.value }))}
                          placeholder="যেমন: TH-2026-0001"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>পেমেন্ট মাধ্যম (Method) *</Label>
                        <select
                          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-semibold"
                          value={formData.method}
                          onChange={(e) => setFormData((p) => ({ ...p, method: e.target.value }))}
                        >
                          <option value="bkash">bKash (বিকাশ)</option>
                          <option value="nagad">Nagad (নগদ)</option>
                          <option value="bank">Bank Transfer (ব্যাংক)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>টাকার পরিমাণ (Amount in BDT) *</Label>
                        <Input
                          required
                          type="number"
                          min="1"
                          value={formData.amount}
                          onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                          placeholder="যেমন: 15000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender No) *</Label>
                        <Input
                          required
                          value={formData.senderPhone}
                          onChange={(e) => setFormData((p) => ({ ...p, senderPhone: e.target.value }))}
                          placeholder="01600000000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>ট্রানজেকশন আইডি (TrxID) *</Label>
                        <Input
                          required
                          className="font-mono uppercase tracking-wider"
                          value={formData.transactionId}
                          onChange={(e) => setFormData((p) => ({ ...p, transactionId: e.target.value }))}
                          placeholder="যেমন: 9X7AB2CD"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>নোট বা অতিরিক্ত তথ্য (Optional)</Label>
                      <Input
                        value={formData.note}
                        onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                        placeholder="যেমন: ২য় কিস্তি বাবদ পরিশোধ"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 font-bold text-base bg-accent hover:bg-accent/90 gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            সাবমিট হচ্ছে...
                          </>
                        ) : (
                          <>
                            পেমেন্ট ভেরিফিকেশনের জন্য পাঠান <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
