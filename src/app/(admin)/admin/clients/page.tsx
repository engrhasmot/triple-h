"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldAlert,
  Dices,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";
import { format } from "date-fns";
import Link from "next/link";

interface ClientData {
  _id: string;
  clientId?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  linkedFiles: string[];
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface StatsData {
  total: number;
  active: number;
  suspended: number;
  linkedFilesCount: number;
}

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [stats, setStats] = useState<StatsData>({ total: 0, active: 0, suspended: 0, linkedFilesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  // Create / Edit Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    phone: "",
    password: "",
    email: "",
    address: "",
    linkedFilesInput: "",
    isActive: true,
    isVerified: true,
  });

  // Password Modal State
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [targetClient, setTargetClient] = useState<ClientData | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passSubmitting, setPassSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search.trim()) q.set("search", search.trim());
      if (statusFilter !== "all") q.set("status", statusFilter);

      const res = await adminFetch(`/api/admin/clients?${q.toString()}`);
      const json = await res.json();
      if (json.success) {
        setClients(json.data || []);
        if (json.stats) setStats(json.stats);
      }
    } catch {
      toast.error("ক্লায়েন্ট তালিকা লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingClient(null);
    const autoPass = generateSecurePassword();
    setFormData({
      clientId: "",
      name: "",
      phone: "",
      password: autoPass,
      email: "",
      address: "",
      linkedFilesInput: "",
      isActive: true,
      isVerified: true,
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (client: ClientData) => {
    setEditingClient(client);
    setFormData({
      clientId: client.clientId || "",
      name: client.name || "",
      phone: client.phone || "",
      password: "", // Leave blank unless updating
      email: client.email || "",
      address: client.address || "",
      linkedFilesInput: (client.linkedFiles || []).join(", "),
      isActive: client.isActive ?? true,
      isVerified: client.isVerified ?? true,
    });
    setFormModalOpen(true);
  };

  // Submit Create / Edit
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("নাম ও মোবাইল নম্বর প্রদান করুন");
      return;
    }

    if (!editingClient && (!formData.password || formData.password.length < 6)) {
      toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
      return;
    }

    setFormSubmitting(true);
    try {
      const parsedFiles = formData.linkedFilesInput
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const payload: any = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        clientId: formData.clientId.trim() || undefined,
        linkedFiles: parsedFiles,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
      };

      if (!editingClient) {
        payload.password = formData.password;
        const res = await adminFetch("/api/admin/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "তৈরি ব্যর্থ হয়েছে");
        toast.success("নতুন ক্লায়েন্ট সফলভাবে যুক্ত করা হয়েছে");
      } else {
        payload.id = editingClient._id;
        if (formData.password?.trim()) {
          payload.password = formData.password.trim();
        }
        const res = await adminFetch("/api/admin/clients", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "আপডেট ব্যর্থ হয়েছে");
        toast.success("ক্লায়েন্টের তথ্য সফলভাবে আপডেট হয়েছে");
      }

      setFormModalOpen(false);
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "সমস্যা হয়েছে");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Password Modal
  const openPasswordModal = (client: ClientData) => {
    setTargetClient(client);
    setNewPassword(generateSecurePassword());
    setShowPassword(true);
    setPassModalOpen(true);
  };

  // Save Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClient || !newPassword || newPassword.length < 6) {
      toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
      return;
    }

    setPassSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetClient._id,
          password: newPassword.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");

      toast.success(`পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে: ${newPassword}`);
      setPassModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setPassSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (client: ClientData) => {
    try {
      const res = await adminFetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: client._id,
          isActive: !client.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");

      toast.success(
        !client.isActive
          ? `ক্লায়েন্ট "${client.name}" অ্যাকাউন্ট সক্রিয় করা হয়েছে`
          : `ক্লায়েন্ট "${client.name}" অ্যাকাউন্ট স্থগিত করা হয়েছে`
      );
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "সমস্যা হয়েছে");
    }
  };

  // Confirm Delete
  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/clients?id=${deletingId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "মুছে ফেলতে সমস্যা হয়েছে");

      toast.success("ক্লায়েন্ট অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে");
      setDeleteModalOpen(false);
      setDeletingId(null);
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeleting(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} কপি করা হয়েছে: ${text}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
              Client Management
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
              ক্লায়েন্ট পোর্টাল
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            ক্লায়েন্টের Client ID, ফোন নম্বর, পাসওয়ার্ড রিসেট ও ফাইল লিঙ্ক পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClients}
            disabled={loading}
            className="h-9 gap-1.5"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </Button>

          <Button onClick={openCreateModal} className="h-9 gap-1.5 font-semibold">
            <UserPlus className="w-4 h-4" />
            নতুন ক্লায়েন্ট যুক্ত করুন
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">মোট ক্লায়েন্ট</p>
              <h3 className="text-2xl font-bold font-heading mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">সক্রিয় অ্যাকাউন্ট</p>
              <h3 className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.active}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">স্থগিত (Suspended)</p>
              <h3 className="text-2xl font-bold font-heading text-rose-600 dark:text-rose-400 mt-1">
                {stats.suspended}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">লিঙ্কড প্রজেক্ট ফাইল</p>
              <h3 className="text-2xl font-bold font-heading text-sky-600 dark:text-sky-400 mt-1">
                {stats.linkedFilesCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, ফোন নম্বর, Client ID বা ফাইল আইডি দিয়ে খুঁজুন..."
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
            খুঁজুন
          </Button>
        </form>

        <div className="flex items-center gap-1.5 border-t md:border-t-0 pt-2 md:pt-0">
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className="h-8 text-xs"
          >
            সকল ({stats.total})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            className="h-8 text-xs"
          >
            সক্রিয় ({stats.active})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "suspended" ? "default" : "outline"}
            onClick={() => setStatusFilter("suspended")}
            className="h-8 text-xs"
          >
            স্থগিত ({stats.suspended})
          </Button>
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold">কোনো ক্লায়েন্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? "আপনার অনুসন্ধানের সাথে কোনো ক্লায়েন্ট অ্যাকাউন্ট মেলেনি।"
              : "এখনো কোনো ক্লায়েন্ট অ্যাকাউন্ট তৈরি করা হয়নি। নতুন ক্লায়েন্ট যুক্ত করুন।"}
          </p>
          <Button onClick={openCreateModal} size="sm" className="mt-4 gap-1.5">
            <UserPlus className="w-4 h-4" /> প্রথম ক্লায়েন্ট যুক্ত করুন
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/60 border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Client ID</th>
                  <th className="py-3 px-4">নাম ও তথ্য</th>
                  <th className="py-3 px-4">যোগাযোগ</th>
                  <th className="py-3 px-4">লিঙ্কড প্রজেক্ট ফাইল</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4">নিবন্ধন / লগইন</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => {
                  const bdPhone = client.phone.replace(/^880/, "0");
                  return (
                    <tr key={client._id} className="hover:bg-muted/30 transition-colors">
                      {/* Client ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-mono text-primary font-bold bg-primary/5 border-primary/20">
                            {client.clientId || "N/A"}
                          </Badge>
                          {client.clientId && (
                            <button
                              onClick={() => copyToClipboard(client.clientId!, "Client ID")}
                              className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                              title="আইডি কপি করুন"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Name & Address */}
                      <td className="py-3 px-4">
                        <div className="min-w-40">
                          <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            {client.name}
                            {client.isVerified && (
                              <span title="ভেরিফাইড অ্যাকাউন্ট">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          {client.address && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate max-w-xs">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {client.address}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-semibold text-foreground">{bdPhone}</span>
                            <a
                              href={`tel:${bdPhone}`}
                              className="text-muted-foreground hover:text-primary p-0.5"
                              title="কল করুন"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://wa.me/88${bdPhone.replace(/^0/, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-emerald-500 p-0.5"
                              title="WhatsApp এ মেসেজ দিন"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          {client.email && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />
                              {client.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Linked Files */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {client.linkedFiles && client.linkedFiles.length > 0 ? (
                            client.linkedFiles.map((f) => (
                              <Link key={f} href={`/admin/plan-tracker?search=${f}`}>
                                <Badge
                                  variant="secondary"
                                  className="font-mono text-[10px] px-1.5 py-0 hover:bg-primary/20 transition-colors cursor-pointer"
                                  title="প্ল্যান ট্র্যাকারে দেখুন"
                                >
                                  {f}
                                </Badge>
                              </Link>
                            ))
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">কোনো ফাইল যুক্ত নেই</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(client)}
                          title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                          className="inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {client.isActive ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25">
                              সক্রিয়
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="hover:bg-destructive/80">
                              স্থগিত
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-muted-foreground">
                        <div>
                          <span>যুক্ত: </span>
                          <span className="font-mono text-foreground">
                            {format(new Date(client.createdAt), "dd/MM/yyyy")}
                          </span>
                        </div>
                        {client.lastLogin && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            লগইন: {format(new Date(client.lastLogin), "dd MMM, hh:mm a")}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => openPasswordModal(client)}
                            title="পাসওয়ার্ড পরিবর্তন / রিসেট"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditModal(client)}
                            title="প্রোফাইল এডিট করুন"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => confirmDelete(client._id)}
                            title="অ্যাকাউন্ট ডিলিট করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Client Modal ─── */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-background border-border shadow-2xl">
          <div className="bg-muted/70 border-b border-border px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              {editingClient ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold font-heading">
                {editingClient ? "ক্লায়েন্টের তথ্য এডিট করুন" : "নতুন ক্লায়েন্ট অ্যাকাউন্ট তৈরি করুন"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                ক্লায়েন্টের আইডি, ফোন নম্বর, পাসওয়ার্ড ও লিঙ্কড ফাইল পরিচালনা করুন।
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleSaveClient} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cId" className="text-xs font-semibold">
                  Client ID (ঐচ্ছিক / অটো)
                </Label>
                <Input
                  id="cId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value.toUpperCase() })}
                  placeholder="e.g. CL-2026-0001"
                  className="h-9 text-xs font-mono uppercase mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cName" className="text-xs font-semibold">
                  ক্লায়েন্টের পুরো নাম *
                </Label>
                <Input
                  id="cName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cPhone" className="text-xs font-semibold">
                  মোবাইল নম্বর *
                </Label>
                <Input
                  id="cPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="h-9 text-xs font-mono mt-1"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cPass" className="text-xs font-semibold">
                    {editingClient ? "পাসওয়ার্ড (পরিবর্তন করতে চাইলে দিন)" : "পাসওয়ার্ড *"}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, password: generateSecurePassword() })}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Dices className="w-3 h-3" /> অটো পাসওয়ার্ড
                  </button>
                </div>
                <Input
                  id="cPass"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingClient ? "পরিবর্তন না করতে খালি রাখুন" : "কমপক্ষে ৬ অক্ষর"}
                  className="h-9 text-xs font-mono mt-1"
                  required={!editingClient}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cEmail" className="text-xs font-semibold">
                  ইমেইল (ঐচ্ছিক)
                </Label>
                <Input
                  id="cEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@example.com"
                  className="h-9 text-xs mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cAddress" className="text-xs font-semibold">
                  ঠিকানা / এলাকা (ঐচ্ছিক)
                </Label>
                <Input
                  id="cAddress"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="উত্তরা, ঢাকা"
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cFiles" className="text-xs font-semibold">
                লিঙ্কড প্ল্যান ফাইল আইডি (কমা দিয়ে আলাদা করুন)
              </Label>
              <Input
                id="cFiles"
                value={formData.linkedFilesInput}
                onChange={(e) => setFormData({ ...formData, linkedFilesInput: e.target.value })}
                placeholder="যেমন: TH-2026-0001, TH-2026-0002"
                className="h-9 text-xs font-mono uppercase mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                এই আইডিগুলোর সাহায্যে ক্লায়েন্ট তার পোর্টাল ড্যাশবোর্ডে প্ল্যান অনুমোদন ও ড্রয়িং দেখতে পারবেন।
              </p>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-border w-4 h-4 text-primary"
                />
                <span className="text-xs font-medium">অ্যাকাউন্ট সক্রিয় (Active)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="rounded border-border w-4 h-4 text-primary"
                />
                <span className="text-xs font-medium">যাচাইকৃত (Verified)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormModalOpen(false)}
                className="h-9 text-xs"
              >
                বাতিল
              </Button>
              <Button type="submit" size="sm" disabled={formSubmitting} className="h-9 text-xs gap-1.5">
                {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingClient ? "তথ্য আপডেট করুন" : "অ্যাকাউন্ট সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Password Change / Reset Modal ─── */}
      <Dialog open={passModalOpen} onOpenChange={setPassModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-border shadow-2xl">
          <div className="bg-muted/70 border-b border-border px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold font-heading">
                পাসওয়ার্ড পরিবর্তন / রিসেট
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                ক্লায়েন্ট: <span className="font-bold text-foreground">{targetClient?.name}</span> ({targetClient?.phone})
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="p-6 space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="newPass" className="text-xs font-semibold">
                  নতুন পাসওয়ার্ড *
                </Label>
                <button
                  type="button"
                  onClick={() => setNewPassword(generateSecurePassword())}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" /> র‍্যান্ডম জেনারেট
                </button>
              </div>

              <div className="relative">
                <Input
                  id="newPass"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                  className="h-10 text-sm font-mono pr-20"
                  required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showPassword ? "হাইড করুন" : "দেখুন"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newPassword, "পাসওয়ার্ড")}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="পাসওয়ার্ড কপি করুন"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[11px] text-amber-800 dark:text-amber-300">
              💡 পাসওয়ার্ড সেভ করার পর এটি ক্লায়েন্টকে এসএমএস বা হোয়াটসঅ্যাপে প্রদান করতে পারেন।
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPassModalOpen(false)}
                className="h-9 text-xs"
              >
                বাতিল
              </Button>
              <Button type="submit" size="sm" disabled={passSubmitting} className="h-9 text-xs gap-1.5">
                {passSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                পাসওয়ার্ড পরিবর্তন করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Modal ─── */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md p-6 bg-background border-border shadow-2xl space-y-4">
          <div className="flex items-center gap-3 text-destructive">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 border border-destructive/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">ক্লায়েন্ট অ্যাকাউন্ট ডিলিট নিশ্চিত করুন</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                এই প্রক্রিয়াটি অপরিবর্তনীয়। অ্যাকাউন্টটি স্থায়ীভাবে মুছে যাবে।
              </DialogDescription>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            আপনি কি নিশ্চিত যে এই ক্লায়েন্ট অ্যাকাউন্টটি ডিলিট করতে চান? ক্লায়েন্ট পোর্টাল থেকে এই ব্যবহারকারীর সকল অ্যাক্সেস মুছে যাবে।
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              className="h-8 text-xs"
            >
              বাতিল
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
              className="h-8 text-xs gap-1.5"
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              হ্যাঁ, ডিলিট করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
