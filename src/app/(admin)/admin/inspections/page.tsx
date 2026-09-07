"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  ClipboardCheck,
  Plus,
  Search,
  Printer,
  Trash2,
  Edit,
  Eye,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Upload,
  Camera,
  X,
  Calendar,
  Phone,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { adminFetch } from "@/lib/admin-fetch";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";

interface InspectionItem {
  _id: string;
  reportNumber: string;
  clientName: string;
  clientPhone: string;
  projectTitle: string;
  projectLocation: string;
  inspectionDate: string;
  stage: string;
  inspectorName: string;
  checklist: Array<{ item: string; status: "pass" | "issue" | "na"; note?: string }>;
  observations: string;
  instructions: string;
  photos: string[];
  status: "satisfactory" | "action-required" | "rejected";
  nextVisitDate?: string;
  createdAt: string;
}

const STAGES = [
  "লেআউট ও সয়েল টেস্ট পরীক্ষা",
  "ফাউন্ডেশন ও ফুটিং রড বাইন্ডিং",
  "শর্ট কলাম ও প্লাইন্থ বিম",
  "ফ্লোর কলাম রিবার ও শাটারিং",
  "ছাদ ঢালাই (Roof Beam & Slab Casting)",
  "ইটের গাথুনি ও লিন্টেল লেভেল",
  "প্লাস্টার, প্লাম্বিং ও ইলেকট্রিক্যাল পাইপিং",
  "ফাইনাল ফিনিশিং ও হ্যান্ডওভার",
];

type ChecklistItemType = { item: string; status: "pass" | "issue" | "na"; note?: string };

const DEFAULT_CHECKLIST: ChecklistItemType[] = [
  { item: "রডের সাইজ, স্পেসিং ও ল্যাপিং দৈর্ঘ্য", status: "pass" },
  { item: "ক্লিয়ার কভার ও কভার ব্লকের পর্যাপ্ততা", status: "pass" },
  { item: "শাটারিংয়ের শক্তিবৃদ্ধি ও লেভেলিং", status: "pass" },
  { item: "সিমেন্ট, বালু ও খোয়ার মিক্স রেশিও", status: "pass" },
  { item: "নজল ভাইব্রেটর মেশিনের উপস্থিতি ও কার্যকারিতা", status: "pass" },
  { item: "পর্যাপ্ত পানি ও কিউরিং ব্যবস্থা", status: "pass" },
];

export default function AdminInspectionsPage() {
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");

  // View / Print Modal
  const [viewItem, setViewItem] = useState<InspectionItem | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [reportNumber, setReportNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [inspectionDate, setInspectionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [stage, setStage] = useState(STAGES[4]); // default Roof Slab
  const [inspectorName, setInspectorName] = useState("ইঞ্জিনিয়ার মোঃ হাসমত আলী");
  const [checklist, setChecklist] = useState<ChecklistItemType[]>(DEFAULT_CHECKLIST);
  const [observations, setObservations] = useState("");
  const [instructions, setInstructions] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState<"satisfactory" | "action-required" | "rejected">("satisfactory");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [sendWhatsAppNotice, setSendWhatsAppNotice] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (stageFilter !== "all") params.set("stage", stageFilter);
      const res = await adminFetch(`/api/admin/inspections?${params.toString()}`);
      const data = await res.json();
      if (data.inspections) setInspections(data.inspections);
    } catch (err: any) {
      toast.error("Failed to load inspections: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const resetForm = () => {
    setEditId(null);
    setReportNumber(`INS-${Date.now().toString().slice(-5)}`);
    setClientName("");
    setClientPhone("");
    setProjectTitle("");
    setProjectLocation("");
    setInspectionDate(format(new Date(), "yyyy-MM-dd"));
    setStage(STAGES[4]);
    setInspectorName("ইঞ্জিনিয়ার মোঃ হাসমত আলী");
    setChecklist(DEFAULT_CHECKLIST);
    setObservations("সাইটের রিবার বাইন্ডিং ও শাটারিং নকশা অনুযায়ী সন্তোষজনক পাওয়া গেছে। ক্লিয়ার কভার বজায় রয়েছে।");
    setInstructions("ঢালাইয়ের সময় অবশ্যই ভাইব্রেটর সঠিকভাবে ব্যবহার করতে হবে এবং আগামী ২৮ দিন নিয়মিত কিউরিং নিশ্চিত করতে হবে।");
    setPhotos([]);
    setStatus("satisfactory");
    setNextVisitDate("");
    setSendWhatsAppNotice(true);
  };

  const handleStartCreate = () => {
    resetForm();
    setActiveTab("create");
  };

  const handleEdit = (item: InspectionItem) => {
    setEditId(item._id);
    setReportNumber(item.reportNumber);
    setClientName(item.clientName);
    setClientPhone(item.clientPhone);
    setProjectTitle(item.projectTitle);
    setProjectLocation(item.projectLocation);
    setInspectionDate(format(new Date(item.inspectionDate), "yyyy-MM-dd"));
    setStage(item.stage);
    setInspectorName(item.inspectorName || "ইঞ্জিনিয়ার মোঃ হাসমত আলী");
    setChecklist(item.checklist || DEFAULT_CHECKLIST);
    setObservations(item.observations);
    setInstructions(item.instructions);
    setPhotos(item.photos || []);
    setStatus(item.status);
    setNextVisitDate(item.nextVisitDate || "");
    setSendWhatsAppNotice(false);
    setActiveTab("create");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await adminFetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) newUrls.push(data.url);
      }
      setPhotos((prev) => [...prev, ...newUrls]);
      toast.success(`${newUrls.length} টি ছবি আপলোড হয়েছে!`);
    } catch (err: any) {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !projectTitle || !stage || !observations || !instructions) {
      toast.error("প্রয়োজনীয় সকল তথ্য পূরণ করুন");
      return;
    }

    try {
      setSaving(true);
      const res = await adminFetch("/api/admin/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: editId,
          reportNumber,
          clientName,
          clientPhone,
          projectTitle,
          projectLocation,
          inspectionDate,
          stage,
          inspectorName,
          checklist,
          observations,
          instructions,
          photos,
          status,
          nextVisitDate,
          sendWhatsAppNotice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(
        sendWhatsAppNotice
          ? "রিপোর্ট সংরক্ষিত হয়েছে এবং ক্লায়েন্টের হোয়াটসঅ্যাপে পাঠানো হয়েছে!"
          : "ফিল্ড রিপোর্ট সংরক্ষিত হয়েছে!"
      );
      setActiveTab("list");
      fetchInspections();
    } catch (err: any) {
      toast.error(err.message || "Failed to save inspection");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে রিপোর্ট নং "${num}" ডিলিট করতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/inspections?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("রিপোর্ট ডিলিট করা হয়েছে");
      fetchInspections();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleDirectWhatsApp = (item: InspectionItem) => {
    const statusBangla =
      item.status === "satisfactory"
        ? "সন্তোষজনক ✅"
        : item.status === "action-required"
        ? "সংশোধন প্রয়োজন ⚠️"
        : "অননুমোদিত ❌";

    const lines = [
      `🏗️ *সাইট পরিদর্শন রিপোর্ট — Triple H Engineering*`,
      `রিপোর্ট নং: *${item.reportNumber}*`,
      ``,
      `প্রিয় ${item.clientName},`,
      `প্রজেক্ট: *${item.projectTitle}*`,
      `ধাপ: *${item.stage}*`,
      `ফলাফল: *${statusBangla}*`,
      ``,
      `📝 পর্যবেক্ষণ: ${item.observations}`,
      `👷 নির্দেশ: ${item.instructions}`,
      item.nextVisitDate ? `📅 পরবর্তী ভিজিট: ${item.nextVisitDate}` : "",
      ``,
      `📞 যোগাযোগ: 01778-506500`,
      `ইঞ্জিনিয়ার মোঃ হাসমত আলী`,
    ].filter(Boolean);

    const cleanPhone = item.clientPhone.replace(/[^0-9]/g, "");
    const formatted = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-accent" /> সাইট পরিদর্শন ফিল্ড রিপোর্ট
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            সাইট থেকে সরাসরি রড বাইন্ডিং, শাটারিং ও ঢালাই চেকিং, ছবি আপলোড ও ইনস্ট্যান্ট হোয়াটসঅ্যাপ নোটিফিকেশন
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "create" ? (
            <Button variant="outline" size="sm" onClick={() => setActiveTab("list")} className="cursor-pointer">
              <X className="w-4 h-4 mr-1.5" /> তালিকায় ফিরুন
            </Button>
          ) : (
            <Button onClick={handleStartCreate} size="sm" className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" /> নতুন পরিদর্শন রিপোর্ট
            </Button>
          )}
        </div>
      </div>

      {activeTab === "list" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">ফিল্ড পরিদর্শন লগ</CardTitle>
                <CardDescription className="text-xs">
                  বিভিন্ন প্রজেক্টে পরিচালিত সাইট পরিদর্শনের পূর্ণাঙ্গ ইতিহাস ও ছবি
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs w-full sm:w-48"
                >
                  <option value="all">সকল কাজের ধাপ</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="নাম, ফোন বা রিপোর্ট নং..."
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-sm">কোনো পরিদর্শন রিপোর্ট পাওয়া যায়নি।</p>
                <Button onClick={handleStartCreate} variant="outline" size="sm" className="mt-3 cursor-pointer">
                  প্রথম সাইট রিপোর্ট তৈরি করুন
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-border bg-secondary/30 text-muted-foreground font-semibold">
                      <th className="py-3 px-4">তারিখ ও রিপোর্ট নং</th>
                      <th className="py-3 px-4">ক্লায়েন্ট ও প্রজেক্ট</th>
                      <th className="py-3 px-4">কাজের ধাপ</th>
                      <th className="py-3 px-4 text-center">ছবি</th>
                      <th className="py-3 px-4 text-center">ফলাফল</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inspections.map((item) => (
                      <tr key={item._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-accent">{item.reportNumber}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {format(new Date(item.inspectionDate), "dd MMM, yyyy")}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{item.clientName}</div>
                          <div className="text-[11px] text-muted-foreground">{item.projectTitle}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{item.stage}</td>
                        <td className="py-3 px-4 text-center">
                          {item.photos && item.photos.length > 0 ? (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Camera className="w-3 h-3 text-accent" />
                              {item.photos.length} টি
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={`text-[10px] font-bold ${
                              item.status === "satisfactory"
                                ? "bg-emerald-600 text-white"
                                : item.status === "action-required"
                                ? "bg-amber-600 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {item.status === "satisfactory"
                              ? "সন্তোষজনক"
                              : item.status === "action-required"
                              ? "সংশোধন প্রয়োজন"
                              : "অননুমোদিত"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewItem(item)}
                              className="h-8 px-2 text-xs cursor-pointer"
                              title="রিপোর্ট ভাউচার প্রিন্ট"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> প্রিন্ট
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDirectWhatsApp(item)}
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
                              onClick={() => handleDelete(item._id, item.reportNumber)}
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
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-bold">
                {editId ? "পরিদর্শন রিপোর্ট সম্পাদনা" : "নতুন সাইট পরিদর্শন ফিল্ড রিপোর্ট"}
              </CardTitle>
              <CardDescription className="text-xs">
                ইঞ্জিনিয়ারিং চেকলিস্ট যাচাই, সাইটের ছবি আপলোড এবং মিস্ত্রি ও কন্ট্রাক্টরের জন্য দিকনির্দেশনা
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">রিপোর্ট নম্বর</Label>
                  <Input
                    value={reportNumber}
                    onChange={(e) => setReportNumber(e.target.value)}
                    required
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">পরিদর্শনের তারিখ</Label>
                  <Input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">পরিদর্শনকারী ইঞ্জিনিয়ার</Label>
                  <Input
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    required
                    className="mt-1 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Client & Project */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                <div>
                  <Label className="text-xs">ক্লায়েন্টের নাম *</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="মোঃ দেলোয়ার হোসেন"
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">মোবাইল নম্বর *</Label>
                  <Input
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="01711-XXXXXX"
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">প্রজেক্টের নাম *</Label>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="দেলোয়ার ভিলা — ৫ তলা"
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">সাইটের অবস্থান *</Label>
                  <Input
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="মজিদপুর, সাভার"
                    required
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Stage & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold">কাজের বর্তমান ধাপ *</Label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">পরিদর্শনের সামগ্রিক মূল্যায়ন *</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-bold text-accent"
                  >
                    <option value="satisfactory">সন্তোষজনক (Satisfactory) — কাজ চালিয়ে যান</option>
                    <option value="action-required">সংশোধন আবশ্যক (Action Required)</option>
                    <option value="rejected">অননুমোদিত (Rejected) — কাজ স্থগিত রাখুন</option>
                  </select>
                </div>
              </div>

              {/* Checklist */}
              <div className="pt-2 border-t border-border space-y-2">
                <Label className="text-xs font-bold text-accent uppercase tracking-wider">
                  ইঞ্জিনিয়ারিং ফিল্ড চেকলিস্ট
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-border/70 bg-card flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-medium text-foreground">{item.item}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...checklist];
                            updated[idx].status = "pass";
                            setChecklist(updated);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                            item.status === "pass"
                              ? "bg-emerald-600 text-white"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...checklist];
                            updated[idx].status = "issue";
                            setChecklist(updated);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                            item.status === "issue"
                              ? "bg-amber-600 text-white"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          Issue
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...checklist];
                            updated[idx].status = "na";
                            setChecklist(updated);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                            item.status === "na"
                              ? "bg-muted text-foreground"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observations & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <Label className="text-xs font-semibold">ইঞ্জিনিয়ারের পর্যবেক্ষণ (Observations) *</Label>
                  <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                    placeholder="সাইটে কী কী দেখা গেল, রডের বাঁধন, কভারিং ও শাটারিংয়ের অবস্থা..."
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">মিস্ত্রি ও কন্ট্রাক্টরের জন্য নির্দেশ (Instructions) *</Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    placeholder="ঢালাইয়ের আগে কী সংশোধন করতে হবে, ভাইব্রেটর ও কিউরিং নির্দেশ..."
                    required
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Site Photos Upload */}
              <div className="pt-2 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4" /> সাইটের ছবি সংযুক্তি ({photos.length} টি)
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      মোবাইল ক্যামেরা দিয়ে সরাসরি ছবি তুলে বা গ্যালারি থেকে সিলেক্ট করে আপলোড করুন
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="inspection-photos-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs cursor-pointer"
                    >
                      {uploading ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      ছবি যুক্ত করুন
                    </Button>
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {photos.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-border bg-black aspect-video flex items-center justify-center shadow-xs"
                      >
                        <Image
                          src={url}
                          alt={`Site Photo ${idx + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next visit & WhatsApp notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border items-center">
                <div>
                  <Label className="text-xs">পরবর্তী সম্ভাব্য ভিজিট (Next Visit Date)</Label>
                  <Input
                    type="date"
                    value={nextVisitDate}
                    onChange={(e) => setNextVisitDate(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendWhatsAppNotice}
                      onChange={(e) => setSendWhatsAppNotice(e.target.checked)}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                      ক্লায়েন্টের হোয়াটসঅ্যাপে তাৎক্ষণিক ফিল্ড রিপোর্ট পাঠান
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>
                  বাতিল
                </Button>
                <Button type="submit" disabled={saving} className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  ফিল্ড রিপোর্ট সংরক্ষণ করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Printable Field Inspection Voucher / Certificate Modal */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-border">
            {/* Modal Top Actions */}
            <div className="p-4 bg-secondary/60 border-b border-border flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
              <span className="text-xs font-bold text-muted-foreground">
                ফিল্ড পরিদর্শন সার্টিফিকেট ও ভাউচার
              </span>
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
                  onClick={() => handleDirectWhatsApp(viewItem)}
                  className="text-xs text-[#25D366] hover:text-[#1EBE5D] cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 mr-1.5" /> হোয়াটসঅ্যাপ
                </Button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div
              id="printable-inspection"
              className="bg-white text-slate-900 p-8 sm:p-12 shadow-inner font-sans text-xs leading-relaxed mx-auto max-w-[210mm]"
            >
              {/* Official Letterhead Header */}
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
                      <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                        Triple H Plandraft &amp; Engineering
                      </h1>
                      <p className="text-[10px] font-semibold text-slate-600 tracking-wider uppercase">
                        পরিকল্পিত নকশা, নিরাপদ নির্মাণ • কনসালটেন্সি ও সুপারভিশন
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-700 leading-tight">
                    <p className="font-bold">ইঞ্জিনিয়ার মোঃ হাসমত আলী</p>
                    <p className="text-[10px] text-slate-600">B.Sc. in Civil Engineering (IEB Member)</p>
                    <p className="text-[10px]">📞 01778-506500 | 01631-186218</p>
                    <p className="text-[10px]">নয়াবাড়ী, রেডিও কলোনি, সাভার, ঢাকা</p>
                  </div>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center my-4">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide underline">
                  সাইট পরিদর্শন ফিল্ড রিপোর্ট (Site Inspection Certificate)
                </h2>
                <div className="flex items-center justify-center gap-6 text-[11px] text-slate-600 mt-1">
                  <span>স্মারক নং: <strong>{viewItem.reportNumber}</strong></span>
                  <span>তারিখ: <strong>{format(new Date(viewItem.inspectionDate), "dd MMMM, yyyy")}</strong></span>
                </div>
              </div>

              {/* Project & Client Card */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-sm mb-5 text-[11px]">
                <div>
                  <p><strong>ক্লায়েন্টের নাম:</strong> {viewItem.clientName}</p>
                  <p><strong>মোবাইল নম্বর:</strong> {viewItem.clientPhone}</p>
                  <p><strong>পরিদর্শনকারী:</strong> {viewItem.inspectorName}</p>
                </div>
                <div>
                  <p><strong>প্রজেক্টের নাম:</strong> {viewItem.projectTitle}</p>
                  <p><strong>অবস্থান:</strong> {viewItem.projectLocation}</p>
                  <p><strong>কাজের ধাপ:</strong> <span className="font-bold text-accent">{viewItem.stage}</span></p>
                </div>
              </div>

              {/* Checklist Table */}
              <div className="mb-5">
                <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  ১. ইঞ্জিনিয়ারিং চেকলিস্ট ও মূল্যায়ন:
                </h3>
                <table className="w-full text-left text-[11px] border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-2">পরীক্ষিত আইটেম</th>
                      <th className="p-2 text-center w-28">মূল্যায়ন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.checklist.map((c, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2">{c.item}</td>
                        <td className="p-2 text-center font-bold">
                          {c.status === "pass" ? (
                            <span className="text-emerald-700">✓ সঠিক (Pass)</span>
                          ) : c.status === "issue" ? (
                            <span className="text-amber-700">⚠ ত্রুটি (Issue)</span>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Observations & Instructions */}
              <div className="space-y-4 mb-6 text-[11px]">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <h4 className="font-bold text-slate-900 mb-1">২. ইঞ্জিনিয়ারের সরেজমিন পর্যবেক্ষণ:</h4>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{viewItem.observations}</p>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-sm">
                  <h4 className="font-bold text-amber-950 mb-1">৩. কন্ট্রাক্টর ও মিস্ত্রির জন্য জরুরি নির্দেশাবলী:</h4>
                  <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">{viewItem.instructions}</p>
                </div>
              </div>

              {/* Photos Grid */}
              {viewItem.photos && viewItem.photos.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    ৪. সাইট পরিদর্শনের আলোকচিত্র (Site Photos):
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {viewItem.photos.map((url, idx) => (
                      <div key={idx} className="border border-slate-300 rounded overflow-hidden aspect-video bg-slate-100 flex items-center justify-center">
                        <Image
                          src={url}
                          alt={`Inspection Photo ${idx + 1}`}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-[11px]">
                <div>
                  <div className="border-t border-slate-800 pt-1.5 font-bold">
                    পরিদর্শনকারী ইঞ্জিনিয়ারের স্বাক্ষর ও সিল
                  </div>
                  <p className="text-slate-600">{viewItem.inspectorName}</p>
                  <p className="text-[10px] text-slate-500">Managing Director, Triple H</p>
                </div>
                <div>
                  <div className="border-t border-slate-800 pt-1.5 font-bold">
                    ক্লায়েন্ট / সাইট প্রতিনিধির স্বাক্ষর
                  </div>
                  <p className="text-slate-600">{viewItem.clientName}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
