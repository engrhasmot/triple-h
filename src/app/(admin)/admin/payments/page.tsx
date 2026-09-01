"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2, Banknote, TrendingUp, AlertCircle, CheckCircle, Clock, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { adminFetch } from "@/lib/admin-fetch";

type PaymentStatus = "due" | "partial" | "paid" | "overdue";
type InstallmentType = "booking" | "design-fee" | "approval-fee" | "site-visit" | "final" | "other";

interface Installment {
  type: InstallmentType;
  label: string;
  amount: number;
  paidOn: string;
  note?: string;
  receivedBy: string;
}

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
  installments: Installment[];
  dueDate?: string;
  planFileRef?: string;
  notes?: string;
  createdAt: string;
}

interface Stats {
  totalCollected: number;
  totalOutstanding: number;
  totalAmount: number;
  count: number;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  paid: { label: "Paid", color: "bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
  partial: { label: "Partial", color: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400", icon: <Clock className="w-3 h-3" /> },
  due: { label: "Due", color: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400", icon: <Banknote className="w-3 h-3" /> },
  overdue: { label: "Overdue", color: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400", icon: <AlertCircle className="w-3 h-3" /> },
};

const INSTALLMENT_TYPES: { value: InstallmentType; label: string }[] = [
  { value: "booking", label: "Booking Money" },
  { value: "design-fee", label: "Design Fee" },
  { value: "approval-fee", label: "Approval Fee" },
  { value: "site-visit", label: "Site Visit Fee" },
  { value: "final", label: "Final Payment" },
  { value: "other", label: "Other" },
];

function formatBDT(amount: number) {
  return `৳ ${amount.toLocaleString("en-BD")}`;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // New payment form
  const [newForm, setNewForm] = useState({
    clientName: "", phone: "", projectTitle: "", serviceType: "2D Plan",
    totalAmount: "", dueDate: "", planFileRef: "", notes: "",
  });

  // New installment form
  const [instForm, setInstForm] = useState({
    type: "booking" as InstallmentType,
    label: "Booking Money",
    amount: "",
    paidOn: format(new Date(), "yyyy-MM-dd"),
    note: "",
  });

  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (search) params.set("search", search);
      const res = await adminFetch(`/api/admin/payments?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data);
        setStats(json.stats);
      }
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newForm, totalAmount: Number(newForm.totalAmount) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Payment record created!");
      setShowNewModal(false);
      setNewForm({ clientName: "", phone: "", projectTitle: "", serviceType: "2D Plan", totalAmount: "", dueDate: "", planFileRef: "", notes: "" });
      fetchPayments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create payment");
    }
  };

  const handleAddInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    try {
      const res = await adminFetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPayment._id,
          action: "add-installment",
          installment: { ...instForm, amount: Number(instForm.amount) },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Installment added!");
      setShowInstallmentModal(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add installment");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment record?")) return;
    try {
      await adminFetch("/api/admin/payments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Deleted");
      fetchPayments();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Tracker</h1>
          <p className="text-muted-foreground mt-1">Track client payments, installments & outstanding dues.</p>
        </div>
        <Button onClick={() => setShowNewModal(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> New Payment
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
              <Banknote className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBDT(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">{stats.count} client(s)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-600">Collected</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatBDT(stats.totalCollected)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalAmount > 0 ? Math.round((stats.totalCollected / stats.totalAmount) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-600">Outstanding</CardTitle>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatBDT(stats.totalOutstanding)}</div>
              <p className="text-xs text-muted-foreground">Remaining dues</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-600">Collection Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalAmount > 0 ? Math.round((stats.totalCollected / stats.totalAmount) * 100) : 0}%
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${stats.totalAmount > 0 ? (stats.totalCollected / stats.totalAmount) * 100 : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="due">Due</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Payment List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Banknote className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No payment records found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const statusCfg = STATUS_CONFIG[payment.status];
            const isExpanded = expandedId === payment._id;
            const pct = payment.totalAmount > 0 ? (payment.paidAmount / payment.totalAmount) * 100 : 0;

            return (
              <Card key={payment._id} className="overflow-hidden border-border hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Header Row */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg truncate">{payment.clientName}</h3>
                        <Badge className={`text-xs font-semibold border ${statusCfg.color} flex items-center gap-1`}>
                          {statusCfg.icon} {statusCfg.label}
                        </Badge>
                        {payment.planFileRef && (
                          <Badge variant="outline" className="text-xs font-mono">{payment.planFileRef}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{payment.projectTitle} · {payment.phone}</p>
                      <p className="text-xs text-muted-foreground">{payment.serviceType} · Added {format(new Date(payment.createdAt), "dd MMM yyyy")}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold">{formatBDT(payment.totalAmount)}</p>
                      </div>
                      <div className="flex gap-2 text-sm">
                        <span className="text-green-600 font-medium">Paid: {formatBDT(payment.paidAmount)}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-red-600 font-medium">Due: {formatBDT(payment.dueAmount)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-semibold"
                        onClick={() => { setSelectedPayment(payment); setShowInstallmentModal(true); }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isExpanded ? null : payment._id)}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(payment._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-5 pb-3">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          pct >= 100 ? "bg-green-500" : pct > 0 ? "bg-yellow-500" : "bg-red-400"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(pct)}% collected</p>
                  </div>

                  {/* Expanded Installment History */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 p-5">
                      <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Payment History</h4>
                      {payment.installments.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No payments recorded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {payment.installments.map((inst, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                              <div>
                                <p className="font-semibold text-sm">{inst.label}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(inst.paidOn), "dd MMM yyyy")} · by {inst.receivedBy}</p>
                                {inst.note && <p className="text-xs text-muted-foreground italic mt-0.5">"{inst.note}"</p>}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{formatBDT(inst.amount)}</p>
                                <Badge variant="outline" className="text-xs mt-1">{inst.type}</Badge>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between px-3 py-2 bg-primary/5 rounded-lg border border-primary/20 font-bold mt-3">
                            <span>Total Paid</span>
                            <span className="text-green-600">{formatBDT(payment.paidAmount)}</span>
                          </div>
                        </div>
                      )}
                      {payment.notes && (
                        <div className="mt-3 p-3 bg-card rounded-lg border border-border text-sm text-muted-foreground">
                          <strong>Notes:</strong> {payment.notes}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Payment Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Banknote className="w-5 h-5 text-accent" /> New Payment Record
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePayment} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client Name *</Label>
                <Input required value={newForm.clientName} onChange={e => setNewForm(p => ({ ...p, clientName: e.target.value }))} placeholder="Md. Shahin" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input required value={newForm.phone} onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))} placeholder="01700000000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Project Title *</Label>
              <Input required value={newForm.projectTitle} onChange={e => setNewForm(p => ({ ...p, projectTitle: e.target.value }))} placeholder="Shahin Villa Rajuk Approval" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Service Type *</Label>
                <select className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm" value={newForm.serviceType} onChange={e => setNewForm(p => ({ ...p, serviceType: e.target.value }))}>
                  <option>2D Plan</option>
                  <option>3D Design</option>
                  <option>BOQ Estimation</option>
                  <option>Plan Passing</option>
                  <option>Site Supervision</option>
                  <option>Consultation</option>
                  <option>Full Package</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Total Amount (BDT) *</Label>
                <Input required type="number" min="0" value={newForm.totalAmount} onChange={e => setNewForm(p => ({ ...p, totalAmount: e.target.value }))} placeholder="50000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={newForm.dueDate} onChange={e => setNewForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Plan File Ref (e.g. TH-2026-0001)</Label>
                <Input value={newForm.planFileRef} onChange={e => setNewForm(p => ({ ...p, planFileRef: e.target.value }))} placeholder="TH-2026-0001" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <textarea className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none" rows={2} value={newForm.notes} onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any additional notes..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowNewModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 font-bold">Create Record</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Installment Modal */}
      <Dialog open={showInstallmentModal} onOpenChange={setShowInstallmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" /> Add Payment
              {selectedPayment && <span className="text-sm font-normal text-muted-foreground">— {selectedPayment.clientName}</span>}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm mb-2">
              <p>Total: <strong>{formatBDT(selectedPayment.totalAmount)}</strong></p>
              <p>Paid so far: <strong className="text-green-600">{formatBDT(selectedPayment.paidAmount)}</strong></p>
              <p>Remaining: <strong className="text-red-600">{formatBDT(selectedPayment.dueAmount)}</strong></p>
            </div>
          )}
          <form onSubmit={handleAddInstallment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Payment Type *</Label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  value={instForm.type}
                  onChange={e => {
                    const t = e.target.value as InstallmentType;
                    const lbl = INSTALLMENT_TYPES.find(x => x.value === t)?.label || "";
                    setInstForm(p => ({ ...p, type: t, label: lbl }));
                  }}
                >
                  {INSTALLMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Amount (BDT) *</Label>
                <Input required type="number" min="1" value={instForm.amount} onChange={e => setInstForm(p => ({ ...p, amount: e.target.value }))} placeholder="10000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={instForm.label} onChange={e => setInstForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. 1st Installment" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Payment Date</Label>
                <Input type="date" value={instForm.paidOn} onChange={e => setInstForm(p => ({ ...p, paidOn: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Note</Label>
                <Input value={instForm.note} onChange={e => setInstForm(p => ({ ...p, note: e.target.value }))} placeholder="Cash / bKash etc." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowInstallmentModal(false); setSelectedPayment(null); }}>Cancel</Button>
              <Button type="submit" className="flex-1 font-bold">Add Payment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
