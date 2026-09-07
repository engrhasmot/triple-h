"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Plus, 
  Trash2, 
  Download, 
  Search, 
  Loader2, 
  Tag, 
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "sonner";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "site-visit", label: "Site Visit & Transport", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "rajuk-municipal", label: "RAJUK / Municipal Fee", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "printing-plotting", label: "Printing & Plotting", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "staff-salary", label: "Staff & Engineer Salary", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: "office-utility", label: "Office Rent & Utility", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { value: "equipment-software", label: "Equipment & Software", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  { value: "marketing", label: "Marketing & Ads", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  { value: "other", label: "Other Expenses", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
];

function formatBDT(amount: number) {
  return "৳" + Number(amount || 0).toLocaleString("en-IN");
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    thisMonthExpense: 0,
    categoryBreakdown: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // Add Expense Dialog
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "site-visit",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paidTo: "",
    paymentMethod: "cash",
    projectRef: "",
    notes: "",
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (monthFilter) params.set("month", monthFilter);
      if (searchFilter) params.set("search", searchFilter);

      const res = await adminFetch(`/api/admin/expenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, monthFilter, searchFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid title and amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Expense recorded successfully!");
        setShowAddModal(false);
        setFormData({
          title: "",
          category: "site-visit",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          paidTo: "",
          paymentMethod: "cash",
          projectRef: "",
          notes: "",
        });
        fetchExpenses();
      } else {
        toast.error(data.error || "Failed to add expense");
      }
    } catch {
      toast.error("Network error while recording expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete expense "${title}"?`)) return;

    try {
      const res = await adminFetch(`/api/admin/expenses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Expense deleted");
        fetchExpenses();
      } else {
        toast.error("Failed to delete expense");
      }
    } catch {
      toast.error("Network error while deleting expense");
    }
  };

  const downloadCSV = () => {
    if (expenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }

    const headers = ["Date", "Title", "Category", "Amount (BDT)", "Paid To", "Method", "Project Ref", "Notes"];
    const rows = expenses.map((e) => [
      `"${format(new Date(e.date), "yyyy-MM-dd")}"`,
      `"${(e.title || "").replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      `"${(e.paidTo || "").replace(/"/g, '""')}"`,
      `"${e.paymentMethod}"`,
      `"${(e.projectRef || "").replace(/"/g, '""')}"`,
      `"${(e.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tripleh_expenses_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Receipt className="w-7 h-7 text-accent" /> Income & Expense Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track business expenses, consultancy overheads, client revenue, and net profit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-1 text-xs">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-1.5 font-bold bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4" /> Add New Expense
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
              Total Revenue (Inflow)
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">{formatBDT(metrics.totalIncome)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Total collected from client payments</p>
          </CardContent>
        </Card>

        {/* Total Outflow */}
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center justify-between">
              Total Expenses (Outflow)
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-700">{formatBDT(metrics.totalExpense)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Recorded consultancy & office costs</p>
          </CardContent>
        </Card>

        {/* Net Profit / Loss */}
        <Card className={metrics.netProfit >= 0 ? "border-primary/20 bg-primary/5" : "border-rose-500/30 bg-rose-500/10"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              Net Profit / Balance
              <Wallet className="w-4 h-4 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${metrics.netProfit >= 0 ? "text-primary" : "text-rose-600"}`}>
              {formatBDT(metrics.netProfit)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Revenue minus all expenses</p>
          </CardContent>
        </Card>

        {/* This Month's Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              This Month Expenses
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(metrics.thisMonthExpense)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Current month overhead</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Badges */}
      <div className="p-4 bg-card rounded-xl border border-border space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expense by Category</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((cat) => {
            const spent = metrics.categoryBreakdown[cat.value] || 0;
            return (
              <div key={cat.value} className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${cat.color}`}>
                <span>{cat.label}:</span>
                <span className="font-bold">{formatBDT(spent)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            className="pl-9 text-sm"
            placeholder="Search by title, paid to, project ref..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <Input
          type="month"
          className="w-auto text-sm"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />
        {(categoryFilter !== "all" || monthFilter || searchFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoryFilter("all");
              setMonthFilter("");
              setSearchFilter("");
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">Loading expenses...</span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Receipt className="w-10 h-10 text-muted-foreground/50 mx-auto" />
              <p className="font-semibold text-sm">No expenses found</p>
              <p className="text-xs text-muted-foreground">Add your first expense record to track financial outflows.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Title & Project</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Paid To & Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((expense) => {
                    const catObj = CATEGORIES.find((c) => c.value === expense.category);
                    return (
                      <tr key={expense._id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                          {format(new Date(expense.date), "dd MMM yyyy")}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-foreground">{expense.title}</p>
                          {expense.projectRef && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Ref: <span className="font-mono">{expense.projectRef}</span>
                            </p>
                          )}
                          {expense.notes && (
                            <p className="text-xs text-muted-foreground italic mt-0.5 max-w-xs truncate">
                              "{expense.notes}"
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant="outline" className={`text-xs ${catObj?.color || ""}`}>
                            {catObj?.label || expense.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-medium">{expense.paidTo || "—"}</p>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                            {expense.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-black text-rose-600">
                          {formatBDT(expense.amount)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteExpense(expense._id, expense.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent" /> Record New Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateExpense} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Expense Title / Description *</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Gazipur Site Visit Car Fuel & Toll"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Amount (BDT) *</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="3500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Expense Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData((p) => ({ ...p, paymentMethod: e.target.value }))}
                >
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Paid To (Person / Vendor)</Label>
                <Input
                  value={formData.paidTo}
                  onChange={(e) => setFormData((p) => ({ ...p, paidTo: e.target.value }))}
                  placeholder="e.g. CNG Driver / Plotter Shop"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Project Ref (Optional)</Label>
                <Input
                  value={formData.projectRef}
                  onChange={(e) => setFormData((p) => ({ ...p, projectRef: e.target.value }))}
                  placeholder="e.g. TH-2026-0001"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes & Remarks</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Any invoice number or additional details"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1 font-bold bg-accent hover:bg-accent/90">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
