"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";

type PaymentStatus = "due" | "partial" | "paid" | "overdue";

interface Payment {
  _id: string;
  clientName: string;
  phone: string;
  projectTitle: string;
  serviceType: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: PaymentStatus;
  dueDate?: string;
  createdAt?: string;
  installments?: unknown[];
}

type FilterKey = "all" | "overdue" | "partial" | "15days" | "30days";

function formatBDT(amount: number) {
  return `৳ ${amount.toLocaleString("en-BD")}`;
}

function daysSince(payment: Payment): number {
  const ref = payment.dueDate || payment.createdAt;
  if (!ref) return 0;
  const diff = Date.now() - new Date(ref).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function buildWhatsAppMessage(p: Payment): string {
  return `আসসালামুয়ালাইকুম ${p.clientName} ভাই/আপু,

ট্রিপল এইচ পল্যান ড্রাফট থেকে জানাচ্ছি যে, আপনার *${p.projectTitle}* প্রজেক্টের পেমেন্ট বিষয়ে একটি বিনয়ী স্মরণ করিয়ে দিতে চাইছি।

📋 সেবা: ${p.serviceType}
💰 মোট: ৳${p.totalAmount.toLocaleString("en-BD")}
✅ পরিশোধিত: ৳${p.paidAmount.toLocaleString("en-BD")}
⏳ বকেয়া: ৳${p.dueAmount.toLocaleString("en-BD")}

আপনার বকেয়া পেমেন্টটি সুবিধামতো সময়ে পরিশোধ করার অনুরোধ রইলো। যেকোনো সমস্যায় আমাদের সাথে যোগাযোগ করুন।

ধন্যবাদ
ইঞ্জিনিয়ার মোঃ হাসমত আলী
ট্রিপল এইচ পল্যান ড্রাফট ও ইঞ্জিনিয়ারিং
📞 01XXXXXXXXX`;
}

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "সব" },
  { key: "overdue", label: "শুধু Overdue" },
  { key: "partial", label: "শুধু Partial" },
  { key: "15days", label: "১৫+ দিন" },
  { key: "30days", label: "৩০+ দিন" },
];

export default function PaymentRemindersPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resOverdue, resPartial] = await Promise.all([
        adminFetch("/api/admin/payments?status=overdue"),
        adminFetch("/api/admin/payments?status=partial"),
      ]);
      const [jsonOverdue, jsonPartial] = await Promise.all([
        resOverdue.json(),
        resPartial.json(),
      ]);
      const combined: Payment[] = [
        ...(jsonOverdue.data ?? []),
        ...(jsonPartial.data ?? []),
      ];
      combined.sort((a, b) => b.dueAmount - a.dueAmount);
      setPayments(combined);
    } catch {
      toast.error("পেমেন্ট ডেটা লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const overdueList = payments.filter((p) => p.status === "overdue");
  const partialList = payments.filter((p) => p.status === "partial");
  const totalOutstanding = payments.reduce((s, p) => s + p.dueAmount, 0);

  const filtered = payments.filter((p) => {
    if (filter === "overdue") return p.status === "overdue";
    if (filter === "partial") return p.status === "partial";
    if (filter === "15days") return daysSince(p) >= 15;
    if (filter === "30days") return daysSince(p) >= 30;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          বকেয়া পেমেন্ট রিমাইন্ডার
        </h1>
        <p className="text-muted-foreground mt-1">
          Overdue &amp; partial payment reminder hub — 1-click WhatsApp alerts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-red-600">মোট Overdue</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueList.length}</div>
            <p className="text-xs text-muted-foreground">ক্লায়েন্ট</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-yellow-600">মোট Partial</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{partialList.length}</div>
            <p className="text-xs text-muted-foreground">ক্লায়েন্ট</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-orange-600">মোট বকেয়া সংখ্যা</CardTitle>
            <TrendingDown className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{payments.length}</div>
            <p className="text-xs text-muted-foreground">রেকর্ড</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/40">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">মোট বকেয়া পরিমাণ</CardTitle>
            <Wallet className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{formatBDT(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">সর্বমোট Due</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {FILTER_LABELS.map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "default" : "outline"}
            className="font-semibold"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={fetchData}>
          রিফ্রেশ
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-base">কোনো বকেয়া পেমেন্ট নেই 🎉</p>
          <p className="text-sm mt-1">সব পেমেন্ট সম্পন্ন হয়েছে।</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ক্লায়েন্ট</th>
                    <th className="py-3 px-4">প্রজেক্ট</th>
                    <th className="py-3 px-4 hidden md:table-cell">সেবা</th>
                    <th className="py-3 px-4 text-right">মোট</th>
                    <th className="py-3 px-4 text-right">পরিশোধিত</th>
                    <th className="py-3 px-4 text-right font-bold text-red-600">বকেয়া</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 hidden lg:table-cell">কতদিন আগে</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => {
                    const days = daysSince(p);
                    const waMsg = buildWhatsAppMessage(p);
                    const waPhone = `880${p.phone.replace(/^0/, "")}`;
                    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`;
                    const telUrl = `tel:${p.phone}`;

                    return (
                      <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-foreground">{p.clientName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p.phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground leading-snug max-w-[180px] truncate">{p.projectTitle}</p>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{p.serviceType}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-semibold">{formatBDT(p.totalAmount)}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap text-green-600 font-semibold">{formatBDT(p.paidAmount)}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap text-red-600 font-black">{formatBDT(p.dueAmount)}</td>
                        <td className="py-3 px-4">
                          <Badge className={`text-[11px] font-bold border ${
                            p.status === "overdue"
                              ? "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400"
                              : "bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400"
                          }`}>
                            {p.status === "overdue" ? "Overdue" : "Partial"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className={`text-xs font-semibold ${
                            days >= 30 ? "text-red-600" : days >= 15 ? "text-orange-500" : "text-muted-foreground"
                          }`}>
                            {days} দিন আগে
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <a href={waUrl} target="_blank" rel="noopener noreferrer">
                              <Button
                                size="sm"
                                className="h-8 text-[11px] font-bold gap-1 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => toast.success(`${p.clientName}-কে WhatsApp রিমাইন্ডার পাঠানো হচ্ছে…`)}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </Button>
                            </a>
                            <a href={telUrl}>
                              <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                কল
                              </Button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-muted/30 text-sm font-semibold">
              <span className="text-muted-foreground">মোট {filtered.length} টি রেকর্ড</span>
              <span className="text-red-600">সর্বমোট বকেয়া: {formatBDT(filtered.reduce((s, p) => s + p.dueAmount, 0))}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
