"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FileText,
  Plus,
  Search,
  Printer,
  Trash2,
  Edit,
  Eye,
  Loader2,
  CheckCircle,
  X,
  Share2,
  Scroll,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { adminFetch } from "@/lib/admin-fetch";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";

interface AgreementItem {
  _id: string;
  agreementNumber: string;
  clientName: string;
  clientFatherOrHusband?: string;
  clientPhone: string;
  clientAddress?: string;
  clientNid?: string;
  projectTitle: string;
  projectLocation: string;
  landArea?: string;
  floors?: string;
  scopeOfWork: string[];
  totalFee: number;
  advanceFee: number;
  dueFee: number;
  installments: Array<{ stage: string; amount: number; dueDate?: string }>;
  terms: string[];
  layoutMode: "pad" | "stamp300";
  status: "draft" | "signed" | "completed" | "cancelled";
  createdAt: string;
}

const DEFAULT_TERMS = [
  "১ম পক্ষ (ট্রিপল এইচ) বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) ও রাজউক/পৌরসভার বিধি মেনে নিরাপদ নকশা প্রণয়ন করবে।",
  "২য় পক্ষ (মালিক) তার জমির সঠিক সীমানা ও কাগজপত্রের সঠিকতার জন্য দায়বদ্ধ থাকবেন।",
  "অনুমোদিত ড্রয়িং চূড়ান্ত হওয়ার পর বড় ধরণের আর্কিটেকচারাল পরিবর্তনে অতিরিক্ত ফি প্রযোজ্য হতে পারে।",
  "চুক্তিকৃত সাইট ভিজিট পূর্বে আলোচনা সাপেক্ষে নির্ধারিত তারিখে পরিচালিত হবে।",
  "কাজের অগ্রগতি অনুযায়ী নির্ধারিত কিস্তির অর্থ ১ম পক্ষকে যথাসময়ে পরিশোধ করতে হবে।",
];

const DEFAULT_SCOPE = [
  "আর্কিটেকচারাল ২D ফ্লোর প্ল্যান ও ওয়ার্কিং ড্রয়িং",
  "সিভিল স্ট্রাকচারাল ডিজাইন ও রিবার ডিটেইলিং (BNBC মেনে)",
  "আধুনিক ৩D এক্সটেরিয়র কালার ভিউ",
  "প্লাম্বিং, স্যানিটারি ও ওয়াটার সাপ্লাই লেআউট",
  "বিল্ডিং ইলেকট্রিক্যাল সার্ভিস ড্রয়িং ও লোড ক্যালকুলেশন",
  "পৌরসভা/রাজউক অনুমোদনের জন্য প্রয়োজনীয় শিট প্রস্তুত",
  "নির্মাণকালীন গুরুত্বপূর্ণ ধাপে সাইট পরিদর্শন",
];

export default function AdminAgreementsPage() {
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");

  // View / Print Modal
  const [viewAgreement, setViewAgreement] = useState<AgreementItem | null>(null);
  const [viewLayoutMode, setViewLayoutMode] = useState<"pad" | "stamp300">("pad");

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [agreementNumber, setAgreementNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientFatherOrHusband, setClientFatherOrHusband] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientNid, setClientNid] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [landArea, setLandArea] = useState("");
  const [floors, setFloors] = useState("G + 5 তলা আবাসিক ভবন");
  const [totalFee, setTotalFee] = useState<number>(50000);
  const [advanceFee, setAdvanceFee] = useState<number>(15000);
  const [scopeOfWork, setScopeOfWork] = useState<string[]>(DEFAULT_SCOPE);
  const [newScopeItem, setNewScopeItem] = useState("");
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);
  const [newTermItem, setNewTermItem] = useState("");
  const [installments, setInstallments] = useState<Array<{ stage: string; amount: number; dueDate?: string }>>([
    { stage: "বুকিং ও আর্কিটেকচারাল প্ল্যান চূড়ান্তকরণ", amount: 15000 },
    { stage: "স্ট্রাকচারাল ড্রয়িং ও ডিটেইলিং হস্তান্তর", amount: 20000 },
    { stage: "প্লাম্বিং, ইলেকট্রিক্যাল ও ফাইনাল কপি ডেলিভারি", amount: 15000 },
  ]);
  const [layoutMode, setLayoutMode] = useState<"pad" | "stamp300">("pad");
  const [status, setStatus] = useState<"draft" | "signed" | "completed" | "cancelled">("draft");
  const [saving, setSaving] = useState(false);

  const fetchAgreements = useCallback(async () => {
    try {
      setLoading(true);
      const url = search ? `/api/admin/agreements?search=${encodeURIComponent(search)}` : "/api/admin/agreements";
      const res = await adminFetch(url);
      const data = await res.json();
      if (data.agreements) setAgreements(data.agreements);
    } catch (err: any) {
      toast.error("Failed to load agreements: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  const resetForm = () => {
    setEditId(null);
    setAgreementNumber(`AGR-${Date.now().toString().slice(-5)}`);
    setClientName("");
    setClientFatherOrHusband("");
    setClientPhone("");
    setClientAddress("");
    setClientNid("");
    setProjectTitle("");
    setProjectLocation("");
    setLandArea("");
    setFloors("G + 5 তলা আবাসিক ভবন");
    setTotalFee(50000);
    setAdvanceFee(15000);
    setScopeOfWork(DEFAULT_SCOPE);
    setTerms(DEFAULT_TERMS);
    setInstallments([
      { stage: "বুকিং ও আর্কিটেকচারাল প্ল্যান চূড়ান্তকরণ", amount: 15000 },
      { stage: "স্ট্রাকচারাল ড্রয়িং ও ডিটেইলিং হস্তান্তর", amount: 20000 },
      { stage: "প্লাম্বিং, ইলেকট্রিক্যাল ও ফাইনাল কপি ডেলিভারি", amount: 15000 },
    ]);
    setLayoutMode("pad");
    setStatus("draft");
  };

  const handleStartCreate = () => {
    resetForm();
    setActiveTab("create");
  };

  const handleEdit = (item: AgreementItem) => {
    setEditId(item._id);
    setAgreementNumber(item.agreementNumber);
    setClientName(item.clientName);
    setClientFatherOrHusband(item.clientFatherOrHusband || "");
    setClientPhone(item.clientPhone);
    setClientAddress(item.clientAddress || "");
    setClientNid(item.clientNid || "");
    setProjectTitle(item.projectTitle);
    setProjectLocation(item.projectLocation);
    setLandArea(item.landArea || "");
    setFloors(item.floors || "");
    setTotalFee(item.totalFee);
    setAdvanceFee(item.advanceFee);
    setScopeOfWork(item.scopeOfWork || DEFAULT_SCOPE);
    setTerms(item.terms || DEFAULT_TERMS);
    setInstallments(item.installments || []);
    setLayoutMode(item.layoutMode || "pad");
    setStatus(item.status);
    setActiveTab("create");
  };

  const handleSaveAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !projectTitle || !totalFee) {
      toast.error("নাম, ফোন, প্রজেক্ট ও মোট ফি পূরণ করা বাধ্যতামূলক");
      return;
    }

    try {
      setSaving(true);
      const res = await adminFetch("/api/admin/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: editId,
          agreementNumber,
          clientName,
          clientFatherOrHusband,
          clientPhone,
          clientAddress,
          clientNid,
          projectTitle,
          projectLocation,
          landArea,
          floors,
          scopeOfWork,
          totalFee,
          advanceFee,
          dueFee: Math.max(0, totalFee - advanceFee),
          installments,
          terms,
          layoutMode,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(editId ? "চুক্তিপত্র সফলভাবে আপডেট হয়েছে!" : "নতুন চুক্তিপত্র সফলভাবে তৈরি হয়েছে!");
      setActiveTab("list");
      fetchAgreements();
    } catch (err: any) {
      toast.error(err.message || "Failed to save agreement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}"-এর চুক্তিপত্রটি ডিলিট করতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/agreements?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("চুক্তিপত্র ডিলিট করা হয়েছে");
      fetchAgreements();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const openViewModal = (item: AgreementItem) => {
    setViewAgreement(item);
    setViewLayoutMode(item.layoutMode || "pad");
  };

  const handleWhatsAppShare = (item: AgreementItem) => {
    const lines = [
      `📑 *কাজের চুক্তিনামা — Triple H Engineering*`,
      `চুক্তি নম্বর: *${item.agreementNumber}*`,
      ``,
      `প্রিয় ${item.clientName},`,
      `আপনার প্রজেক্ট "*${item.projectTitle}*" এর ইঞ্জিনিয়ারিং চুক্তিপত্র প্রস্তুত করা হয়েছে।`,
      ``,
      `🏗️ কাজের পরিধি:`,
      ...item.scopeOfWork.map((s) => `• ${s}`),
      ``,
      `💰 মোট চুক্তি ফি: ৳${item.totalFee.toLocaleString()}`,
      `💵 অগ্রিম প্রদান: ৳${item.advanceFee.toLocaleString()}`,
      `⏳ অবশিষ্ট বকেয়া: ৳${item.dueFee.toLocaleString()}`,
      ``,
      `📞 যোগাযোগ: 01778-506500`,
      `ইঞ্জিনিয়ার মোঃ হাসমত আলী (Managing Director)`,
    ];

    const text = lines.join("\n");
    const cleanPhone = item.clientPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Scroll className="w-7 h-7 text-accent" /> ক্লায়েন্ট চুক্তিপত্র জেনারেটর
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            পেশাদার ইঞ্জিনিয়ারিং চুক্তিনামা তৈরি, ট্রিপল এইচ প্যাড বা ৩০০ টাকার নন-জুডিশিয়াল স্ট্যাম্পে প্রিন্ট ও হোয়াটসঅ্যাপ শেয়ার
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "create" ? (
            <Button variant="outline" size="sm" onClick={() => setActiveTab("list")} className="cursor-pointer">
              <X className="w-4 h-4 mr-1.5" /> তালিকায় ফিরুন
            </Button>
          ) : (
            <Button onClick={handleStartCreate} size="sm" className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" /> নতুন চুক্তিপত্র তৈরি করুন
            </Button>
          )}
        </div>
      </div>

      {activeTab === "list" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">সংরক্ষিত চুক্তিপত্রসমূহ</CardTitle>
                <CardDescription className="text-xs">
                  ক্লায়েন্টদের সাথে সম্পাদিত সকল আর্কিটেকচারাল ও স্ট্রাকচারাল ডিজাইন এগ্রিমেন্ট
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="নাম, ফোন বা চুক্তি নং দিয়ে খুঁজুন..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : agreements.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-sm">কোনো চুক্তিপত্র পাওয়া যায়নি।</p>
                <Button onClick={handleStartCreate} variant="outline" size="sm" className="mt-3 cursor-pointer">
                  প্রথম চুক্তিপত্র তৈরি করুন
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-border bg-secondary/30 text-muted-foreground font-semibold">
                      <th className="py-3 px-4">চুক্তি নং</th>
                      <th className="py-3 px-4">ক্লায়েন্ট ও ফোন</th>
                      <th className="py-3 px-4">প্রজেক্ট ও অবস্থান</th>
                      <th className="py-3 px-4 text-right">মোট ফি (৳)</th>
                      <th className="py-3 px-4 text-right">অগ্রিম (৳)</th>
                      <th className="py-3 px-4 text-center">লেআউট</th>
                      <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {agreements.map((item) => (
                      <tr key={item._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-accent">{item.agreementNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{item.clientName}</div>
                          <div className="text-[11px] text-muted-foreground">{item.clientPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{item.projectTitle}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{item.projectLocation}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold">৳{item.totalFee.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-semibold">৳{item.advanceFee.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="text-[10px]">
                            {item.layoutMode === "stamp300" ? "৩০০ টাকার স্ট্যাম্প" : "অফিসিয়াল প্যাড"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              item.status === "signed"
                                ? "bg-emerald-600 text-white"
                                : item.status === "completed"
                                ? "bg-blue-600 text-white"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewModal(item)}
                              className="h-8 px-2 text-xs cursor-pointer"
                              title="প্রিন্ট ও ভিউ"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> প্রিন্ট
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhatsAppShare(item)}
                              className="h-8 px-2 text-xs text-[#25D366] hover:text-[#1EBE5D] cursor-pointer"
                              title="হোয়াটসঅ্যাপে পাঠান"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item._id, item.clientName)}
                              className="h-8 w-8 p-0 cursor-pointer text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Form */}
      {activeTab === "create" && (
        <form onSubmit={handleSaveAgreement} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-bold">
                {editId ? "চুক্তিপত্র সম্পাদনা করুন" : "নতুন চুক্তিপত্রের তথ্য"}
              </CardTitle>
              <CardDescription className="text-xs">
                মালিক ও ইঞ্জিনিয়ারিং কনসালটেন্সির পূর্ণাঙ্গ শর্তাবলী ও কাজের বিবরণ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">চুক্তি নম্বর</Label>
                  <Input
                    value={agreementNumber}
                    onChange={(e) => setAgreementNumber(e.target.value)}
                    required
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">ডিফল্ট লেআউট মোড</Label>
                  <select
                    value={layoutMode}
                    onChange={(e) => setLayoutMode(e.target.value as any)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="pad">অফিসিয়াল লেটারহেড প্যাড (Triple H Pad)</option>
                    <option value="stamp300">৩০০ টাকার স্ট্যাম্প পেপার (Govt Stamp)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">স্ট্যাটাস</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="draft">খসড়া (Draft)</option>
                    <option value="signed">স্বাক্ষরিত (Signed)</option>
                    <option value="completed">সম্পন্ন (Completed)</option>
                    <option value="cancelled">বাতিল (Cancelled)</option>
                  </select>
                </div>
              </div>

              {/* Second Party (Client) */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  ২য় পক্ষ (জমির মালিক / ক্লায়েন্টের তথ্য)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">ক্লায়েন্টের নাম *</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="মোঃ আনোয়ার হোসেন"
                      required
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">পিতা / স্বামীর নাম</Label>
                    <Input
                      value={clientFatherOrHusband}
                      onChange={(e) => setClientFatherOrHusband(e.target.value)}
                      placeholder="মোঃ রফিকুল ইসলাম"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">মোবাইল নম্বর *</Label>
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="01712-XXXXXX"
                      required
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">জাতীয় পরিচয়পত্র (NID)</Label>
                    <Input
                      value={clientNid}
                      onChange={(e) => setClientNid(e.target.value)}
                      placeholder="১৯৮৫XXXXXXXXXX"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">বর্তমান ঠিকানা</Label>
                    <Input
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="গ্রাম/রোড, থানা, জেলা"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  প্রজেক্ট ও ভূমির বিবরণ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">প্রজেক্টের নাম *</Label>
                    <Input
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="আনোয়ার ভিলা — ৬ তলা আবাসিক ভবন"
                      required
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">প্রজেক্টের অবস্থান / ঠিকানা *</Label>
                    <Input
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      placeholder="রেডিও কলোনি, সাভার, ঢাকা"
                      required
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">জমির পরিমাণ / দাগ-খতিয়ান</Label>
                    <Input
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="৫ কাঠা (মৌজা: সাভার, আরএস দাগ: ৪১২)"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">ভবনের উচ্চতা / তলা সংখ্যা</Label>
                    <Input
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      placeholder="G + 6 তলা"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  কাজের পরিধি (Scope of Work)
                </h3>
                <div className="space-y-2">
                  {scopeOfWork.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const updated = [...scopeOfWork];
                          updated[idx] = e.target.value;
                          setScopeOfWork(updated);
                        }}
                        className="text-xs h-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setScopeOfWork(scopeOfWork.filter((_, i) => i !== idx))}
                        className="h-8 w-8 p-0 text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      value={newScopeItem}
                      onChange={(e) => setNewScopeItem(e.target.value)}
                      placeholder="নতুন কাজের আইটেম যোগ করুন..."
                      className="text-xs h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newScopeItem.trim()) {
                          setScopeOfWork([...scopeOfWork, newScopeItem.trim()]);
                          setNewScopeItem("");
                        }
                      }}
                      className="h-8 text-xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> যোগ করুন
                    </Button>
                  </div>
                </div>
              </div>

              {/* Financial Terms & Installments */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  আর্থিক বিবরণ ও কিস্তি শিডিউল
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <Label className="text-xs font-semibold">সর্বমোট চুক্তি ফি (৳) *</Label>
                    <Input
                      type="number"
                      value={totalFee}
                      onChange={(e) => setTotalFee(Number(e.target.value))}
                      required
                      className="mt-1 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">অগ্রিম বুকিং ফি (৳)</Label>
                    <Input
                      type="number"
                      value={advanceFee}
                      onChange={(e) => setAdvanceFee(Number(e.target.value))}
                      className="mt-1 text-xs text-emerald-600 font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">অবশিষ্ট বকেয়া (৳)</Label>
                    <Input
                      type="number"
                      value={Math.max(0, totalFee - advanceFee)}
                      disabled
                      className="mt-1 text-xs bg-muted font-bold text-destructive"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">ধাপভিত্তিক কিস্তিসমূহ</Label>
                  {installments.map((inst, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={inst.stage}
                        onChange={(e) => {
                          const updated = [...installments];
                          updated[idx].stage = e.target.value;
                          setInstallments(updated);
                        }}
                        placeholder="কিস্তির ধাপ/বিবরণ"
                        className="text-xs h-8 flex-1"
                      />
                      <Input
                        type="number"
                        value={inst.amount}
                        onChange={(e) => {
                          const updated = [...installments];
                          updated[idx].amount = Number(e.target.value);
                          setInstallments(updated);
                        }}
                        placeholder="টাকা"
                        className="text-xs h-8 w-32 font-semibold"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setInstallments(installments.filter((_, i) => i !== idx))}
                        className="h-8 w-8 p-0 text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInstallments([...installments, { stage: "পরবর্তী কিস্তি", amount: 10000 }])}
                    className="h-8 text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> কিস্তি যোগ করুন
                  </Button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  চুক্তির সাধারণ শর্তাবলী (Terms &amp; Conditions)
                </h3>
                <div className="space-y-2">
                  {terms.map((term, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={term}
                        onChange={(e) => {
                          const updated = [...terms];
                          updated[idx] = e.target.value;
                          setTerms(updated);
                        }}
                        className="text-xs h-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTerms(terms.filter((_, i) => i !== idx))}
                        className="h-8 w-8 p-0 text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      value={newTermItem}
                      onChange={(e) => setNewTermItem(e.target.value)}
                      placeholder="নতুন শর্ত যোগ করুন..."
                      className="text-xs h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newTermItem.trim()) {
                          setTerms([...terms, newTermItem.trim()]);
                          setNewTermItem("");
                        }
                      }}
                      className="h-8 text-xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> শর্ত যোগ করুন
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>
                  বাতিল
                </Button>
                <Button type="submit" disabled={saving} className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  চুক্তিপত্র সংরক্ষণ করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Printable Agreement Modal */}
      {viewAgreement && (
        <Dialog open={!!viewAgreement} onOpenChange={() => setViewAgreement(null)}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-border">
            {/* Modal Top Actions */}
            <div className="p-4 bg-secondary/60 border-b border-border flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">লেআউট পরিবর্তন:</span>
                <div className="inline-flex p-1 bg-background rounded-lg border border-border">
                  <button
                    onClick={() => setViewLayoutMode("pad")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      viewLayoutMode === "pad" ? "bg-accent text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    লেটারহেড প্যাড
                  </button>
                  <button
                    onClick={() => setViewLayoutMode("stamp300")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      viewLayoutMode === "stamp300" ? "bg-accent text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    ৳৩০০ স্ট্যাম্প পেপার
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> প্রিন্ট / PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWhatsAppShare(viewAgreement)}
                  className="text-xs text-[#25D366] hover:text-[#1EBE5D] cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 mr-1.5" /> হোয়াটসঅ্যাপ
                </Button>
              </div>
            </div>

            {/* Printable Document Paper */}
            <div
              id="printable-agreement"
              className={`bg-white text-slate-900 p-8 sm:p-12 shadow-inner font-serif text-[13px] leading-relaxed mx-auto max-w-[210mm] min-h-[297mm] ${
                viewLayoutMode === "stamp300" ? "pt-[110mm]" : "pt-8"
              }`}
            >
              {/* If Pad Mode, show full Letterhead */}
              {viewLayoutMode === "pad" && (
                <div className="border-b-2 border-slate-900 pb-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/images/logo.png"
                        alt="Triple H"
                        width={64}
                        height={64}
                        className="h-14 w-auto object-contain"
                      />
                      <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-950 font-sans uppercase">
                          Triple H Plandraft &amp; Engineering
                        </h1>
                        <p className="text-[10px] font-semibold text-slate-600 font-sans tracking-wider uppercase">
                          পরিকল্পিত নকশা, নিরাপদ নির্মাণ • কনসালটেন্সি ও সুপারভিশন
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-sans text-slate-700 leading-tight">
                      <p className="font-bold">ইঞ্জিনিয়ার মোঃ হাসমত আলী</p>
                      <p className="text-[10px] text-slate-600">B.Sc. in Civil Engineering (IEB Member)</p>
                      <p className="text-[10px]">📞 01778-506500 | 01631-186218</p>
                      <p className="text-[10px]">নয়াবাড়ী, রেডিও কলোনি, সাভার, ঢাকা</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title Header */}
              <div className="text-center my-6">
                <h2 className="text-base sm:text-lg font-bold uppercase underline tracking-wide font-sans">
                  ইঞ্জিনিয়ারিং পরামর্শ ও ড্রয়িং চুক্তিনামা
                </h2>
                <p className="text-[11px] text-slate-600 font-mono mt-0.5">চুক্তি স্মারক নং: {viewAgreement.agreementNumber}</p>
                <p className="text-[11px] text-slate-600">তারিখ: {format(new Date(viewAgreement.createdAt || new Date()), "dd MMMM, yyyy")}</p>
              </div>

              {/* Parties Block */}
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <p className="font-bold font-sans text-slate-900">১ম পক্ষ (পরামর্শক / ইঞ্জিনিয়ারিং প্রতিষ্ঠান):</p>
                  <p>
                    <span className="font-semibold">ইঞ্জিনিয়ার মোঃ হাসমত আলী</span>, ম্যানেজিং ডিরেক্টর,{" "}
                    <span className="font-semibold">ট্রিপল এইচ প্ল্যানড্রাফট অ্যান্ড ইঞ্জিনিয়ারিং কনসালটেন্সি</span>,
                    নয়াবাড়ী, রেডিও কলোনি, সাভার, ঢাকা।
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <p className="font-bold font-sans text-slate-900">২য় পক্ষ (জমির মালিক / ক্লায়েন্ট):</p>
                  <p>
                    নাম: <span className="font-semibold">{viewAgreement.clientName}</span>, পিতা/স্বামী:{" "}
                    <span className="font-semibold">{viewAgreement.clientFatherOrHusband || "—"}</span>, মোবাইল:{" "}
                    <span className="font-semibold">{viewAgreement.clientPhone}</span>
                    {viewAgreement.clientNid && <>, NID: <span className="font-semibold">{viewAgreement.clientNid}</span></>}
                    {viewAgreement.clientAddress && <>, ঠিকানা: {viewAgreement.clientAddress}</>}।
                  </p>
                </div>
              </div>

              {/* Preamble */}
              <p className="mb-4 text-justify">
                উভয় পক্ষ স্বেচ্ছায়, সজ্ঞানে এবং সুস্থ মস্তিষ্কে দ্বিতীয় পক্ষের নিম্নোক্ত প্রজেক্টের আর্কিটেকচারাল,
                স্ট্রাকচারাল এবং ইঞ্জিনিয়ারিং কনসালটেন্সি কাজের জন্য নিম্নের শর্তাবলীতে সম্মত হয়ে এই চুক্তিপত্রে স্বাক্ষর করছেন:
              </p>

              {/* Project Details */}
              <div className="mb-5">
                <h3 className="font-bold font-sans text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  ১. প্রজেক্টের তফসিল ও বিবরণ:
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-800">
                  <li><strong>প্রজেক্টের নাম:</strong> {viewAgreement.projectTitle}</li>
                  <li><strong>অবস্থান:</strong> {viewAgreement.projectLocation}</li>
                  {viewAgreement.landArea && <li><strong>জমির পরিমাণ/দাগ:</strong> {viewAgreement.landArea}</li>}
                  {viewAgreement.floors && <li><strong>ভবনের ধরন:</strong> {viewAgreement.floors}</li>}
                </ul>
              </div>

              {/* Scope of Work */}
              <div className="mb-5">
                <h3 className="font-bold font-sans text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  ২. ১ম পক্ষের কাজের পরিধি (Scope of Work):
                </h3>
                <ul className="list-decimal list-inside space-y-1 ml-2 text-slate-800">
                  {viewAgreement.scopeOfWork.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Financial Terms */}
              <div className="mb-5">
                <h3 className="font-bold font-sans text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  ৩. আর্থিক চুক্তি ও কিস্তি পরিশোধের বিবরণ:
                </h3>
                <p className="mb-2">
                  উক্ত প্রজেক্টের মোট কনসালটেন্সি ও ড্রয়িং ফি নির্ধারণ করা হলো সর্বমোট <strong>৳{viewAgreement.totalFee.toLocaleString()}</strong> (কথায়: {viewAgreement.totalFee} টাকা মাত্র)। চুক্তি সম্পাদনকালে অগ্রিম বাবদ পরিশোধ করা হয়েছে <strong>৳{viewAgreement.advanceFee.toLocaleString()}</strong> টাকা এবং অবশিষ্ট বকেয়া <strong>৳{viewAgreement.dueFee.toLocaleString()}</strong> টাকা নিম্নের কিস্তিতে পরিশোধ করতে হবে:
                </p>
                <table className="w-full text-left text-xs border border-slate-300 my-2">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold font-sans">
                      <th className="p-2">কিস্তির বিবরণ</th>
                      <th className="p-2 text-right">টাকার পরিমাণ (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewAgreement.installments.map((inst, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2">{inst.stage}</td>
                        <td className="p-2 text-right font-semibold">৳{inst.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Terms */}
              <div className="mb-8">
                <h3 className="font-bold font-sans text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  ৪. সাধারণ নিয়ম ও শর্তাবলী:
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-800">
                  {viewAgreement.terms.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-16 grid grid-cols-2 gap-8 text-center font-sans text-xs">
                <div>
                  <div className="border-t border-slate-800 pt-1.5 font-bold">
                    ১ম পক্ষ (পরামর্শকের স্বাক্ষর ও সিল)
                  </div>
                  <p className="text-[11px] text-slate-600">ইঞ্জিনিয়ার মোঃ হাসমত আলী</p>
                  <p className="text-[10px] text-slate-500">Managing Director, Triple H</p>
                </div>
                <div>
                  <div className="border-t border-slate-800 pt-1.5 font-bold">
                    ২য় পক্ষ (জমির মালিক / ক্লায়েন্টের স্বাক্ষর)
                  </div>
                  <p className="text-[11px] text-slate-600">{viewAgreement.clientName}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
