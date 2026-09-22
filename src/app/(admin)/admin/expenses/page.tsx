"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Search, 
  Loader2, 
  Building2, 
  PieChart, 
  Layers, 
  ArrowRight, 
  ExternalLink, 
  Printer, 
  FileCheck2, 
  Table, 
  Upload, 
  Copy, 
  PlusCircle, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Save, 
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  KeyRound,
  Coins,
  BadgePercent
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  EXPENSE_CATEGORIES, 
  getCategoryDef, 
  getSubCategoryLabel 
} from "@/lib/expense-categories";

function formatBDT(amount: number) {
  return "৳" + Number(amount || 0).toLocaleString("en-IN");
}

// Robust CSV Parser supporting quotes and commas
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let current = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (insideQuote && next === '"') {
        current += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(current.trim());
      current = "";
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && next === '\n') i++;
      row.push(current.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
        lines.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    lines.push(row);
  }
  return lines;
}

interface ExcelRow {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  category: string;
  subCategory: string;
  title: string;
  amount: string;
  paidTo: string;
  paymentMethod: string;
  voucherNo: string;
  notes: string;
}

export default function AdminExpensesPage() {
  // Main view navigation: 'transactions' | 'excel' | 'single' | 'categories' | 'ledger' | 'deposits'
  const [activeView, setActiveView] = useState<"transactions" | "excel" | "single" | "categories" | "ledger" | "deposits">("transactions");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectLedger, setProjectLedger] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalPaymentIncome: 0,
    totalFundDeposited: 0,
    totalExpense: 0,
    netProfit: 0,
    thisMonthExpense: 0,
    filteredTotal: 0,
    categoryBreakdown: {} as Record<string, { total: number; count: number }>,
    subCategoryBreakdown: {} as Record<string, { total: number; count: number }>,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [projectFilter, setProjectFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Mandatory Pre-Entry Project Selection Modal
  const [projectSelectModalOpen, setProjectSelectModalOpen] = useState(false);
  const [targetEntryMode, setTargetEntryMode] = useState<"excel" | "single">("excel");

  // Delete All Records Security Confirmation Modal
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [confirmSecurityCode, setConfirmSecurityCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);

  // Add Balance / Fund Deposit Modal
  const [addBalanceModalOpen, setAddBalanceModalOpen] = useState(false);
  const [submittingBalance, setSubmittingBalance] = useState(false);
  const initialBalanceFormState = {
    title: "",
    projectId: "general-office",
    projectName: "General / Office Overhead",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    source: "owner-equity",
    depositedBy: "",
    paymentMethod: "bank",
    referenceNo: "",
    notes: "",
  };
  const [balanceForm, setBalanceForm] = useState(initialBalanceFormState);

  // Single Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submittingSingle, setSubmittingSingle] = useState(false);

  // Excel Spreadsheet State
  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
  const [savingExcel, setSavingExcel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialSingleFormState = {
    title: "",
    projectId: "general-office",
    projectName: "General / Office Overhead",
    category: "civil-materials",
    subCategory: "",
    customSubCategory: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paidTo: "",
    paymentMethod: "cash",
    voucherNo: "",
    attachmentUrl: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialSingleFormState);

  // Available sub-categories based on selected category in single form
  const currentCategoryDef = useMemo(() => {
    return getCategoryDef(formData.category);
  }, [formData.category]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (projectFilter !== "all") params.set("projectId", projectFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (subCategoryFilter !== "all") params.set("subCategory", subCategoryFilter);
      if (monthFilter) params.set("month", monthFilter);
      if (searchFilter) params.set("search", searchFilter);

      const res = await adminFetch(`/api/admin/expenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        if (data.funds) setFunds(data.funds || []);
        if (data.projects) setProjects(data.projects || []);
        if (data.projectLedger) setProjectLedger(data.projectLedger || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      toast.error("Failed to load expenses data");
    } finally {
      setLoading(false);
    }
  }, [projectFilter, categoryFilter, subCategoryFilter, monthFilter, searchFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Helper to get selected project details
  const activeProjectInfo = useMemo(() => {
    if (projectFilter === "all") return null;
    if (projectFilter === "general-office") {
      return { id: "general-office", title: "General / Office Overhead", location: "Head Office" };
    }
    const p = projects.find((proj) => proj._id === projectFilter);
    return p ? { id: p._id, title: p.title, location: p.location } : null;
  }, [projectFilter, projects]);

  // ================= BALANCE DEPOSIT HANDLER =================
  const handleOpenAddBalance = () => {
    const pId = projectFilter !== "all" ? projectFilter : "general-office";
    const pName =
      pId !== "general-office"
        ? projects.find((p) => p._id === pId)?.title || "Project"
        : "General / Office Overhead";

    setBalanceForm({
      ...initialBalanceFormState,
      projectId: pId,
      projectName: pName,
    });
    setAddBalanceModalOpen(true);
  };

  const handleSaveBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceForm.title.trim() || !balanceForm.amount || Number(balanceForm.amount) <= 0) {
      toast.error("Please provide a valid deposit title and amount");
      return;
    }

    setSubmittingBalance(true);
    try {
      const res = await adminFetch("/api/admin/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...balanceForm,
          amount: Number(balanceForm.amount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`🎉 Balance of ৳${Number(balanceForm.amount).toLocaleString()} added successfully!`);
        setAddBalanceModalOpen(false);
        fetchExpenses();
      } else {
        toast.error(data.error || "Failed to add balance");
      }
    } catch {
      toast.error("Network error while adding balance");
    } finally {
      setSubmittingBalance(false);
    }
  };

  const handleDeleteFund = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove deposit record "${title}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/funds?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deposit record removed");
        fetchExpenses();
      } else {
        toast.error("Failed to delete deposit record");
      }
    } catch {
      toast.error("Network error while deleting deposit");
    }
  };

  // MANDATORY PROJECT SELECTION HANDLER BEFORE ENTRY
  const handleInitiateEntry = (mode: "excel" | "single") => {
    if (projectFilter === "all") {
      setTargetEntryMode(mode);
      setProjectSelectModalOpen(true);
    } else {
      proceedToEntry(mode, projectFilter);
    }
  };

  const proceedToEntry = (mode: "excel" | "single", pId: string) => {
    setProjectFilter(pId);
    setProjectSelectModalOpen(false);

    let pName = "General / Office Overhead";
    if (pId !== "general-office") {
      const p = projects.find((proj) => proj._id === pId);
      if (p) pName = p.title;
    }

    if (mode === "excel") {
      const newRows: ExcelRow[] = [];
      for (let i = 0; i < 8; i++) {
        newRows.push({
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString().split("T")[0],
          projectId: pId,
          projectName: pName,
          category: "civil-materials",
          subCategory: "",
          title: "",
          amount: "",
          paidTo: "",
          paymentMethod: "cash",
          voucherNo: "",
          notes: "",
        });
      }
      setExcelRows(newRows);
      setActiveView("excel");
      toast.info(`Auto-filled all rows for project: "${pName}"`);
    } else {
      setEditingId(null);
      setFormData({
        ...initialSingleFormState,
        projectId: pId,
        projectName: pName,
      });
      setActiveView("single");
      toast.info(`Project auto-selected: "${pName}"`);
    }
  };

  // Open Full-Page Single Edit Form
  const handleOpenEdit = (item: any) => {
    setEditingId(item._id);
    const cat = getCategoryDef(item.category);
    const hasPredefinedSub = cat?.subCategories.some((s) => s.value === item.subCategory);

    setFormData({
      title: item.title || "",
      projectId: item.projectId ? item.projectId.toString() : "general-office",
      projectName: item.projectName || "General / Office Overhead",
      category: item.category || "civil-materials",
      subCategory: hasPredefinedSub ? item.subCategory : item.subCategory ? "custom" : "",
      customSubCategory: hasPredefinedSub ? "" : item.subCategory || "",
      amount: String(item.amount || ""),
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      paidTo: item.paidTo || "",
      paymentMethod: item.paymentMethod || "cash",
      voucherNo: item.voucherNo || "",
      attachmentUrl: item.attachmentUrl || "",
      notes: item.notes || "",
    });
    setActiveView("single");
  };

  const handleSaveSingleExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid title and amount");
      return;
    }

    const finalSubCategory =
      formData.subCategory === "custom"
        ? formData.customSubCategory.trim()
        : formData.subCategory.trim();

    const selectedProj =
      formData.projectId === "general-office"
        ? null
        : projects.find((p) => p._id === formData.projectId);

    const payload = {
      ...(editingId && { id: editingId }),
      title: formData.title.trim(),
      category: formData.category,
      subCategory: finalSubCategory,
      amount: Number(formData.amount),
      date: formData.date,
      paidTo: formData.paidTo,
      paymentMethod: formData.paymentMethod,
      voucherNo: formData.voucherNo,
      attachmentUrl: formData.attachmentUrl,
      notes: formData.notes,
      projectId: selectedProj ? selectedProj._id : null,
      projectName: selectedProj ? selectedProj.title : "General / Office Overhead",
    };

    setSubmittingSingle(true);
    try {
      const url = "/api/admin/expenses";
      const method = editingId ? "PUT" : "POST";
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingId ? "Expense updated successfully!" : "Expense recorded successfully!");
        setActiveView("transactions");
        fetchExpenses();
      } else {
        toast.error(data.error || "Failed to save expense");
      }
    } catch {
      toast.error("Network error while saving expense");
    } finally {
      setSubmittingSingle(false);
    }
  };

  const handleDeleteExpense = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete expense record "${title}"?`)) return;

    try {
      const res = await adminFetch(`/api/admin/expenses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Expense deleted successfully");
        fetchExpenses();
      } else {
        toast.error("Failed to delete expense");
      }
    } catch {
      toast.error("Network error while deleting expense");
    }
  };

  // ================= DELETE ALL RECORDS WITH CONFIRMATION CODE =================
  const handleOpenDeleteAllModal = () => {
    const randomCode = "DEL-" + Math.floor(1000 + Math.random() * 9000);
    setConfirmSecurityCode(randomCode);
    setUserEnteredCode("");
    setDeleteConfirmModalOpen(true);
  };

  const handleExecuteDeleteAll = async () => {
    if (userEnteredCode.trim().toUpperCase() !== confirmSecurityCode.toUpperCase()) {
      toast.error("Security code does not match! Deletion cancelled.");
      return;
    }

    setDeletingAll(true);
    try {
      const res = await adminFetch(`/api/admin/expenses?deleteAll=true&projectId=${projectFilter}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`🎉 ${data.message || `Deleted ${data.count} expenses successfully`}`);
        setDeleteConfirmModalOpen(false);
        fetchExpenses();
      } else {
        toast.error(data.error || "Failed to delete expenses");
      }
    } catch {
      toast.error("Network error while deleting records");
    } finally {
      setDeletingAll(false);
    }
  };

  // ================= EXCEL SPREADSHEET ROW OPERATIONS =================
  const addExcelRows = (count: number = 1) => {
    const currentPId = projectFilter !== "all" ? projectFilter : "general-office";
    const currentPName =
      currentPId !== "general-office"
        ? projects.find((p) => p._id === currentPId)?.title || "Project"
        : "General / Office Overhead";

    setExcelRows((prev) => {
      const newRows: ExcelRow[] = [];
      for (let i = 0; i < count; i++) {
        newRows.push({
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString().split("T")[0],
          projectId: currentPId,
          projectName: currentPName,
          category: "civil-materials",
          subCategory: "",
          title: "",
          amount: "",
          paidTo: "",
          paymentMethod: "cash",
          voucherNo: "",
          notes: "",
        });
      }
      return [...prev, ...newRows];
    });
  };

  const updateExcelRow = (id: string, field: keyof ExcelRow, value: string) => {
    setExcelRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "projectId") {
          const p = projects.find((proj) => proj._id === value);
          return {
            ...r,
            projectId: value,
            projectName: p ? p.title : "General / Office Overhead",
          };
        }
        if (field === "category") {
          return {
            ...r,
            category: value,
            subCategory: "", // reset subCategory when category changes
          };
        }
        return { ...r, [field]: value };
      })
    );
  };

  const duplicateExcelRow = (index: number) => {
    setExcelRows((prev) => {
      const target = prev[index];
      const copy: ExcelRow = {
        ...target,
        id: Math.random().toString(36).substring(2, 9),
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, copy);
      return updated;
    });
  };

  const deleteExcelRow = (id: string) => {
    setExcelRows((prev) => {
      if (prev.length <= 1) {
        const pId = projectFilter !== "all" ? projectFilter : "general-office";
        const pName =
          pId !== "general-office"
            ? projects.find((p) => p._id === pId)?.title || "Project"
            : "General / Office Overhead";
        return [
          {
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toISOString().split("T")[0],
            projectId: pId,
            projectName: pName,
            category: "civil-materials",
            subCategory: "",
            title: "",
            amount: "",
            paidTo: "",
            paymentMethod: "cash",
            voucherNo: "",
            notes: "",
          },
        ];
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const handleSaveExcelBatch = async () => {
    const validRows = excelRows.filter(
      (r) => r.title.trim() !== "" && r.amount !== "" && Number(r.amount) > 0
    );

    if (validRows.length === 0) {
      toast.error("Please fill in at least one row with a valid Title and Amount (BDT)");
      return;
    }

    setSavingExcel(true);
    try {
      const res = await adminFetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: validRows }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`🎉 Successfully saved ${data.count} expenses in bulk!`);
        setActiveView("transactions");
        setExcelRows([]);
        fetchExpenses();
      } else {
        toast.error(data.error || "Failed to save bulk expenses");
      }
    } catch {
      toast.error("Network error while saving bulk entries");
    } finally {
      setSavingExcel(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleHeaders = [
      "Date",
      "Project",
      "Category",
      "SubCategory",
      "Title",
      "Amount",
      "PaidTo",
      "PaymentMethod",
      "VoucherNo",
      "Notes",
    ];

    const currentPName = activeProjectInfo?.title || projects[0]?.title || "General / Office Overhead";

    const sampleRows = [
      [
        "2026-09-22",
        currentPName,
        "civil-materials",
        "rebar-steel",
        "5 Ton BSRM 16mm Rod for Grade Beam",
        "485000",
        "Anwar Steel Traders",
        "bank",
        "INV-9021",
        "Site casting rebar",
      ],
      [
        "2026-09-22",
        currentPName,
        "daily-labour",
        "general-labour-hazira",
        "Daily Labour Hazira (8 Persons)",
        "6400",
        "Abdur Rahim Mistri",
        "cash",
        "HZ-104",
        "Soil leveling and cleaning",
      ],
      [
        "2026-09-22",
        "General / Office Overhead",
        "sanitary-materials",
        "cpvc-ppr-pipes",
        "PPR Pipes 1 inch 10 Pcs",
        "14500",
        "Gazi Hardware",
        "bkash",
        "MEMO-881",
        "Piping fittings",
      ],
    ];

    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      sampleHeaders.join(",") +
      "\n" +
      sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triple_h_sample_expense_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample Excel / CSV template downloaded!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length < 2) {
          toast.error("File is empty or contains no data rows");
          return;
        }

        let startIndex = 0;
        const firstCol = rows[0][0]?.toLowerCase() || "";
        if (firstCol.includes("date") || firstCol.includes("তারিখ") || firstCol.includes("sl")) {
          startIndex = 1;
        }

        const newParsedRows: ExcelRow[] = [];
        for (let i = startIndex; i < rows.length; i++) {
          const r = rows[i];
          if (r.length < 5) continue;

          const [
            dateVal,
            projVal,
            catVal,
            subCatVal,
            titleVal,
            amountVal,
            paidToVal,
            methodVal,
            voucherVal,
            notesVal,
          ] = r;

          if (!titleVal && !amountVal) continue;

          let matchedProjId = projectFilter !== "all" ? projectFilter : "general-office";
          let matchedProjName = activeProjectInfo?.title || projVal || "General / Office Overhead";

          const found = projects.find(
            (p) => p.title.toLowerCase().trim() === (projVal || "").toLowerCase().trim()
          );
          if (found) {
            matchedProjId = found._id;
            matchedProjName = found.title;
          }

          const matchedCat = EXPENSE_CATEGORIES.some((c) => c.value === catVal)
            ? catVal
            : "civil-materials";

          newParsedRows.push({
            id: Math.random().toString(36).substring(2, 9),
            date: dateVal || new Date().toISOString().split("T")[0],
            projectId: matchedProjId,
            projectName: matchedProjName,
            category: matchedCat,
            subCategory: subCatVal || "",
            title: titleVal || "Expense",
            amount: amountVal ? String(amountVal).replace(/[^0-9.]/g, "") : "",
            paidTo: paidToVal || "",
            paymentMethod: methodVal || "cash",
            voucherNo: voucherVal || "",
            notes: notesVal || "",
          });
        }

        if (newParsedRows.length === 0) {
          toast.error("No valid expense rows found in the uploaded file");
          return;
        }

        setExcelRows(newParsedRows);
        setActiveView("excel");
        toast.success(`Loaded ${newParsedRows.length} rows from file into Excel Grid! Review and save.`);
      } catch (err) {
        toast.error("Failed to parse the file. Please use the sample CSV format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const excelCalculatedStats = useMemo(() => {
    let count = 0;
    let sum = 0;
    excelRows.forEach((r) => {
      const val = Number(r.amount);
      if (r.title.trim() && !isNaN(val) && val > 0) {
        count++;
        sum += val;
      }
    });
    return { count, sum };
  }, [excelRows]);

  const downloadCSV = () => {
    if (expenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }

    const headers = [
      "Date",
      "Voucher No",
      "Project",
      "Title",
      "Category",
      "Sub-Category",
      "Paid To",
      "Payment Method",
      "Amount (BDT)",
      "Notes",
    ];

    const rows = expenses.map((e) => [
      `"${format(new Date(e.date), "yyyy-MM-dd")}"`,
      `"${(e.voucherNo || "").replace(/"/g, '""')}"`,
      `"${(e.projectName || "Office Overhead").replace(/"/g, '""')}"`,
      `"${(e.title || "").replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${(e.subCategory || "").replace(/"/g, '""')}"`,
      `"${(e.paidTo || "").replace(/"/g, '""')}"`,
      `"${e.paymentMethod}"`,
      e.amount,
      `"${(e.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triple_h_project_expenses_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hidden file input for Excel/CSV import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,text/csv,application/vnd.ms-excel"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                Project Expense & Accounts Manager
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 font-medium">
                প্রজেক্ট খরচ, মালামাল, ব্যালেন্স ফান্ড যোগ, লেবার হাজিরা ও একাউন্ট ব্যালেন্স ট্র্যাকিং
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Global Project Selector */}
          <div className="flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-1">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <select
              className="bg-transparent text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer max-w-[190px] sm:max-w-xs truncate"
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
              }}
            >
              <option value="all">🌐 All Projects & Office</option>
              <option value="general-office">🏢 General / Office Overhead</option>
              <optgroup label="Active Projects">
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    📍 {p.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* ADD BALANCE / FUND BUTTON */}
          <Button
            size="sm"
            onClick={handleOpenAddBalance}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow"
            title="Add Cash/Bank Balance Fund to Project or Office"
          >
            <Coins className="w-4 h-4" /> Add Balance (ব্যালেন্স যোগ)
          </Button>

          {/* Excel Full-Page Mode Button (Requires Project Selected) */}
          <Button
            variant={activeView === "excel" ? "default" : "outline"}
            size="sm"
            onClick={() => handleInitiateEntry("excel")}
            className={`gap-1.5 text-xs font-bold ${
              activeView === "excel"
                ? "bg-accent text-accent-foreground"
                : "border-accent/40 text-accent hover:bg-accent/10"
            }`}
          >
            <Table className="w-4 h-4" /> Excel Sheet Entry
          </Button>

          {/* Single Full-Page Entry Button (Requires Project Selected) */}
          <Button
            variant={activeView === "single" ? "default" : "outline"}
            size="sm"
            onClick={() => handleInitiateEntry("single")}
            className="gap-1.5 text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> Single Entry
          </Button>

          <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-1 text-xs">
            <Download className="w-4 h-4" /> CSV
          </Button>

          <Button variant="outline" size="sm" onClick={printStatement} className="gap-1 text-xs">
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow (Revenue + Funds) */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
              Total Fund & Revenue Inflow
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">{formatBDT(metrics.totalIncome)}</div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
              <span>Payments: {formatBDT(metrics.totalPaymentIncome)}</span>
              <span className="font-semibold text-emerald-600">Fund: {formatBDT(metrics.totalFundDeposited)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Outflow (Expenses) */}
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center justify-between">
              Total Expenses (Outflow)
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-700">
              {formatBDT(projectFilter === "all" ? metrics.totalExpense : metrics.filteredTotal)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
              <span>{projectFilter === "all" ? "All recorded costs" : "Cost for selected project"}</span>
              {/* Delete All Option in Summary */}
              {expenses.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenDeleteAllModal}
                  className="text-destructive font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  title="Delete all expenses with security confirmation code"
                >
                  <Trash2 className="w-3 h-3" /> Clear All Data
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Balance / Cash in Hand */}
        <Card className={metrics.netProfit >= 0 ? "border-primary/20 bg-primary/5" : "border-rose-500/30 bg-rose-500/10"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              Current Available Balance
              <Wallet className="w-4 h-4 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${metrics.netProfit >= 0 ? "text-primary" : "text-rose-600"}`}>
              {formatBDT(metrics.netProfit)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Available cash in hand / Surplus balance</p>
          </CardContent>
        </Card>

        {/* This Month Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              This Month Cost
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(metrics.thisMonthExpense)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Current month outflow</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Full-Page View Tabs Bar */}
      <div className="flex flex-wrap border-b border-border gap-2">
        <button
          onClick={() => setActiveView("transactions")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeView === "transactions"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Receipt className="w-4 h-4" />
          Cost Transactions ({expenses.length})
        </button>

        <button
          onClick={() => setActiveView("deposits")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeView === "deposits"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-600" />
          Balance Deposits ({funds.length})
        </button>

        <button
          onClick={() => handleInitiateEntry("excel")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeView === "excel"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Table className="w-4 h-4 text-accent" />
          Excel Sheet Entry (Full Page)
        </button>

        <button
          onClick={() => handleInitiateEntry("single")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeView === "single"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Plus className="w-4 h-4" />
          {editingId ? "Edit Expense (Full Page)" : "Single Entry (Full Page)"}
        </button>

        <button
          onClick={() => setActiveView("categories")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeView === "categories"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PieChart className="w-4 h-4" />
          Category Breakdown ({Object.keys(metrics.categoryBreakdown).length})
        </button>

        <button
          onClick={() => setActiveView("ledger")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeView === "ledger"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-4 h-4" />
          Project Accounts Ledger
        </button>
      </div>

      {/* ================= VIEW 0: BALANCE DEPOSITS LIST ================= */}
      {activeView === "deposits" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div>
              <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                Project Balance & Fund Deposits History (জমা ও তহবিলের খতিয়ান)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                মালিকের নিজস্ব ডিপোজিট, ব্যাংক ফান্ডিং ও সাইট খরচের জন্য জমা হওয়া সমস্ত ব্যালেন্স
              </p>
            </div>

            <Button
              onClick={handleOpenAddBalance}
              size="sm"
              className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow"
            >
              <Coins className="w-4 h-4" /> + Add New Balance Deposit
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {funds.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <Coins className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                  <p className="font-bold text-base">No fund deposits recorded yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Click "Add Balance" to deposit cash or bank funds for your project or office overhead.
                  </p>
                  <Button
                    onClick={handleOpenAddBalance}
                    size="sm"
                    className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white mt-1"
                  >
                    <Coins className="w-4 h-4 mr-1.5" /> Add Balance Fund
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Title & Description</th>
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Fund Source</th>
                        <th className="py-3 px-4">Deposited By & Method</th>
                        <th className="py-3 px-4 text-right">Amount (BDT)</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {funds.map((fund) => (
                        <tr key={fund._id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-foreground font-medium">
                            {format(new Date(fund.date), "dd MMM yyyy")}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-foreground">{fund.title}</p>
                            {fund.referenceNo && (
                              <span className="inline-block font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5">
                                Ref: #{fund.referenceNo}
                              </span>
                            )}
                            {fund.notes && (
                              <p className="text-[11px] text-muted-foreground italic mt-0.5 truncate">
                                "{fund.notes}"
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-xs">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{fund.projectName || "General Office"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                              {fund.source}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <p className="font-semibold text-xs">{fund.depositedBy}</p>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {fund.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap font-black text-emerald-600 text-sm sm:text-base">
                            +{formatBDT(fund.amount)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteFund(fund._id, fund.title)}
                              title="Delete Deposit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= VIEW 1: FULL-PAGE EXCEL SPREADSHEET BATCH ENTRY ================= */}
      {activeView === "excel" && (
        <div className="space-y-4">
          {/* Active Project Auto-Fill Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Active Project Auto-Filled For All Rows:
                </span>
                <h4 className="text-base font-black text-foreground flex items-center gap-2">
                  {activeProjectInfo?.title || "General / Office Overhead"}
                  {activeProjectInfo?.location && (
                    <Badge variant="outline" className="text-xs font-normal">
                      📍 {activeProjectInfo.location}
                    </Badge>
                  )}
                </h4>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTargetEntryMode("excel");
                setProjectSelectModalOpen(true);
              }}
              className="text-xs gap-1.5 h-8 font-bold border-emerald-500/30 text-emerald-800 hover:bg-emerald-100 bg-background"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Switch Project
            </Button>
          </div>

          <Card className="border-emerald-500/30 shadow-md">
            <CardHeader className="pb-3 border-b bg-card">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Table className="w-6 h-6 text-emerald-600" />
                    <CardTitle className="text-xl font-bold">
                      Excel Spreadsheet Batch Data Entry (ফুল পেজ এক্সেল শিট এন্ট্রি)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    এক্সেল শিটের মতো পাশাপাশি ঘরে দ্রুত টাইপ করুন, একের পর এক সারি যোগ করুন অথবা CSV ফাইল ইমপোর্ট করে এক ক্লিকে সেভ করুন।
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSampleCSV}
                    className="gap-1.5 text-xs text-emerald-700 hover:text-emerald-800"
                  >
                    <Download className="w-3.5 h-3.5" /> Sample Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 text-xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> Import CSV File
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addExcelRows(1)}
                    className="gap-1 text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> +1 Row
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addExcelRows(5)}
                    className="gap-1 text-xs font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> +5 Rows
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveView("transactions")}
                    className="gap-1 text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to List
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Full Page Excel Table */}
              <div className="overflow-x-auto min-h-[450px] max-h-[65vh]">
                <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
                  <thead className="bg-muted sticky top-0 z-10 border-b font-bold text-foreground text-[11px] uppercase shadow-sm">
                    <tr>
                      <th className="py-3 px-2 w-10 text-center">#</th>
                      <th className="py-3 px-2 w-32">Date *</th>
                      <th className="py-3 px-2 w-48">Project (Auto-Filled) *</th>
                      <th className="py-3 px-2 w-44">Category *</th>
                      <th className="py-3 px-2 w-48">Sub-Category</th>
                      <th className="py-3 px-2 min-w-[220px]">Title / Item Description *</th>
                      <th className="py-3 px-2 w-32 text-right">Amount (৳) *</th>
                      <th className="py-3 px-2 w-36">Paid To (Vendor)</th>
                      <th className="py-3 px-2 w-28">Method</th>
                      <th className="py-3 px-2 w-28">Voucher #</th>
                      <th className="py-3 px-2 w-40">Notes</th>
                      <th className="py-3 px-2 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {excelRows.map((row, idx) => {
                      const catDef = getCategoryDef(row.category);
                      const isFilled = row.title.trim() !== "" && Number(row.amount) > 0;
                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-muted/20 transition-colors ${
                            isFilled ? "bg-emerald-500/[0.03]" : ""
                          }`}
                        >
                          {/* Row Index */}
                          <td className="py-2 px-2 text-center text-[11px] text-muted-foreground font-mono">
                            {idx + 1}
                          </td>

                          {/* Date */}
                          <td className="py-1.5 px-1">
                            <input
                              type="date"
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs focus:ring-1 focus:ring-accent"
                              value={row.date}
                              onChange={(e) => updateExcelRow(row.id, "date", e.target.value)}
                            />
                          </td>

                          {/* Project (Auto-Filled) */}
                          <td className="py-1.5 px-1">
                            <select
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs focus:ring-1 focus:ring-accent truncate font-semibold text-emerald-800"
                              value={row.projectId}
                              onChange={(e) => updateExcelRow(row.id, "projectId", e.target.value)}
                            >
                              <option value="general-office">🏢 General Office</option>
                              {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                  📍 {p.title}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Category */}
                          <td className="py-1.5 px-1">
                            <select
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs focus:ring-1 focus:ring-accent truncate font-medium"
                              value={row.category}
                              onChange={(e) => updateExcelRow(row.id, "category", e.target.value)}
                            >
                              {EXPENSE_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label} ({c.labelBn})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Sub-Category */}
                          <td className="py-1.5 px-1">
                            <select
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs focus:ring-1 focus:ring-accent truncate"
                              value={row.subCategory}
                              onChange={(e) => updateExcelRow(row.id, "subCategory", e.target.value)}
                            >
                              <option value="">-- Sub Category --</option>
                              {catDef?.subCategories.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.labelBn} / {s.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Title / Description */}
                          <td className="py-1.5 px-1">
                            <input
                              type="text"
                              placeholder="e.g. 5 Ton BSRM 16mm Rod"
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs focus:ring-1 focus:ring-accent font-medium"
                              value={row.title}
                              onChange={(e) => updateExcelRow(row.id, "title", e.target.value)}
                            />
                          </td>

                          {/* Amount */}
                          <td className="py-1.5 px-1">
                            <input
                              type="number"
                              placeholder="0"
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs text-right font-bold text-rose-600 focus:ring-1 focus:ring-accent"
                              value={row.amount}
                              onChange={(e) => updateExcelRow(row.id, "amount", e.target.value)}
                            />
                          </td>

                          {/* Paid To */}
                          <td className="py-1.5 px-1">
                            <input
                              type="text"
                              placeholder="Vendor / Mistri"
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs focus:ring-1 focus:ring-accent"
                              value={row.paidTo}
                              onChange={(e) => updateExcelRow(row.id, "paidTo", e.target.value)}
                            />
                          </td>

                          {/* Method */}
                          <td className="py-1.5 px-1">
                            <select
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs focus:ring-1 focus:ring-accent"
                              value={row.paymentMethod}
                              onChange={(e) => updateExcelRow(row.id, "paymentMethod", e.target.value)}
                            >
                              <option value="cash">Cash</option>
                              <option value="bank">Bank</option>
                              <option value="bkash">bKash</option>
                              <option value="nagad">Nagad</option>
                              <option value="cheque">Cheque</option>
                              <option value="other">Other</option>
                            </select>
                          </td>

                          {/* Voucher # */}
                          <td className="py-1.5 px-1">
                            <input
                              type="text"
                              placeholder="INV-102"
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs font-mono focus:ring-1 focus:ring-accent"
                              value={row.voucherNo}
                              onChange={(e) => updateExcelRow(row.id, "voucherNo", e.target.value)}
                            />
                          </td>

                          {/* Notes */}
                          <td className="py-1.5 px-1">
                            <input
                              type="text"
                              placeholder="Remarks..."
                              className="w-full px-2 py-1.5 bg-background border rounded text-xs focus:ring-1 focus:ring-accent"
                              value={row.notes}
                              onChange={(e) => updateExcelRow(row.id, "notes", e.target.value)}
                            />
                          </td>

                          {/* Actions */}
                          <td className="py-1.5 px-1 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateExcelRow(idx)}
                                className="p-1.5 text-muted-foreground hover:text-accent rounded hover:bg-muted"
                                title="Duplicate Row"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteExcelRow(row.id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                                title="Delete Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 bg-muted/40 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="font-semibold text-muted-foreground">
                    Total Rows: <span className="font-mono text-foreground font-bold">{excelRows.length}</span>
                  </span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid Entries: <span className="font-mono font-black">{excelCalculatedStats.count}</span>
                  </span>
                  <span className="font-semibold text-rose-600">
                    Total Sum: <span className="font-mono font-black text-sm">{formatBDT(excelCalculatedStats.sum)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView("transactions")}
                    className="flex-1 sm:flex-initial text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveExcelBatch}
                    disabled={savingExcel || excelCalculatedStats.count === 0}
                    className="flex-1 sm:flex-initial font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow"
                  >
                    {savingExcel ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save {excelCalculatedStats.count} Records to Database
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= VIEW 2: FULL-PAGE SINGLE EXPENSE ENTRY FORM ================= */}
      {activeView === "single" && (
        <div className="space-y-4">
          {/* Active Project Auto-Fill Banner */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-accent text-accent-foreground rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  Active Project Auto-Selected:
                </span>
                <h4 className="text-base font-black text-foreground flex items-center gap-2">
                  {formData.projectName || activeProjectInfo?.title || "General / Office Overhead"}
                  {activeProjectInfo?.location && (
                    <Badge variant="outline" className="text-xs font-normal">
                      📍 {activeProjectInfo.location}
                    </Badge>
                  )}
                </h4>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTargetEntryMode("single");
                setProjectSelectModalOpen(true);
              }}
              className="text-xs gap-1.5 h-8 font-bold border-accent/30 text-accent hover:bg-accent/10 bg-background"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Switch Project
            </Button>
          </div>

          <Card className="shadow-md border-border">
            <CardHeader className="border-b pb-4 bg-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">
                      {editingId ? "Edit Expense Record (খরচ সম্পাদনা)" : "Record New Project Cost (নতুন খরচ এন্ট্রি)"}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      প্রজেক্ট, ক্যাটাগরি, সাব-ক্যাটাগরি, মালামালের বিস্তারিত এবং বিল ভাউচার এন্ট্রি দিন।
                    </CardDescription>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveView("transactions")}
                  className="gap-1.5 text-xs w-fit"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Transactions
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSaveSingleExpense} className="space-y-6 max-w-4xl mx-auto">
                {/* Section 1: Project & Hierarchy */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-accent" /> ১. প্রজেক্ট ও ক্যাটাগরি নির্বাচন
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Project (Pre-Filled) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Project (Auto-Selected) *</Label>
                      <select
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-semibold text-accent"
                        value={formData.projectId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const p = projects.find((proj) => proj._id === pId);
                          setFormData((prev) => ({
                            ...prev,
                            projectId: pId,
                            projectName: p ? p.title : "General / Office Overhead",
                          }));
                        }}
                      >
                        <option value="general-office">🏢 General / Office Overhead</option>
                        <optgroup label="Active Projects">
                          {projects.map((p) => (
                            <option key={p._id} value={p._id}>
                              📍 {p.title}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Main Category */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Main Category *</Label>
                      <select
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        value={formData.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            category: newCat,
                            subCategory: "",
                            customSubCategory: "",
                          }));
                        }}
                      >
                        {EXPENSE_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label} ({c.labelBn})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub-Category */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Sub-Category (সেকশন)</Label>
                      <select
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        value={formData.subCategory}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
                      >
                        <option value="">-- Select Sub-category --</option>
                        {currentCategoryDef?.subCategories.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.labelBn} / {s.label}
                          </option>
                        ))}
                        <option value="custom">✍️ Custom Sub-category (অন্যান্য)</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Sub-Category input if "custom" selected */}
                  {formData.subCategory === "custom" && (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs text-muted-foreground font-semibold">
                        Custom Sub-Category Name (নিজস্ব উপ-বিভাগের নাম)
                      </Label>
                      <Input
                        value={formData.customSubCategory}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customSubCategory: e.target.value }))}
                        placeholder="e.g. BSRM 16mm Rod / Special Polish"
                        className="max-w-md"
                      />
                    </div>
                  )}
                </div>

                {/* Section 2: Expense Details */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-accent" /> ২. খরচের বিবরণ ও টাকার পরিমাণ
                  </h3>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Expense Title / Item Description * (খরচের বিবরণ)
                    </Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. 5 Ton BSRM 16mm Rod for Grade Beam Casting"
                      className="text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Amount (BDT ৳) * (টাকা)</Label>
                      <Input
                        required
                        type="number"
                        min="1"
                        value={formData.amount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="85000"
                        className="font-black text-rose-600 text-base"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Date of Expense (তারিখ)</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Vendor & Payment */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-accent" /> ৩. প্রাপক ও পেমেন্ট মাধ্যম
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Paid To (Vendor / Contractor)</Label>
                      <Input
                        value={formData.paidTo}
                        onChange={(e) => setFormData((prev) => ({ ...prev, paidTo: e.target.value }))}
                        placeholder="e.g. Anwar Steel / Karim Mistri"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Payment Method</Label>
                      <select
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      >
                        <option value="cash">Cash (নগদ টাকা)</option>
                        <option value="bank">Bank Transfer / Cheque (ব্যাংক/চেক)</option>
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="cheque">Cheque</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">Voucher / Memo No (ভাউচার নং)</Label>
                      <Input
                        value={formData.voucherNo}
                        onChange={(e) => setFormData((prev) => ({ ...prev, voucherNo: e.target.value }))}
                        placeholder="e.g. MEMO-8841"
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">
                        Receipt / Voucher Document URL (রসিদের লিংক)
                      </Label>
                      <Input
                        value={formData.attachmentUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, attachmentUrl: e.target.value }))}
                        placeholder="https://... image or pdf link"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">Notes & Remarks (মন্তব্য)</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Extra details about supplier, delivery challan, or site supervisor remarks"
                  />
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveView("transactions")}
                    className="flex-1 text-sm font-semibold"
                  >
                    Cancel / Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingSingle}
                    className="flex-1 font-bold bg-accent hover:bg-accent/90 text-sm gap-2"
                  >
                    {submittingSingle ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingId ? "Update Expense Record" : "Save Expense Record"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= VIEW 3: COST TRANSACTIONS TABLE ================= */}
      {activeView === "transactions" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-card rounded-xl border border-border shadow-sm">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                className="pl-9 text-xs sm:text-sm"
                placeholder="Search title, voucher no, vendor, memo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-xs sm:text-sm"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSubCategoryFilter("all");
                }}
              >
                <option value="all">All Categories (সব খাত)</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} ({c.labelBn})
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category Filter */}
            <div>
              <select
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-xs sm:text-sm"
                value={subCategoryFilter}
                onChange={(e) => setSubCategoryFilter(e.target.value)}
                disabled={categoryFilter === "all"}
              >
                <option value="all">All Sub-categories</option>
                {categoryFilter !== "all" &&
                  getCategoryDef(categoryFilter)?.subCategories.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.labelBn} / {s.label}
                    </option>
                  ))}
              </select>
            </div>

            {/* Month Filter & Reset */}
            <div className="flex gap-2">
              <Input
                type="month"
                className="text-xs sm:text-sm"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />
              {(categoryFilter !== "all" || subCategoryFilter !== "all" || monthFilter || searchFilter || projectFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter("all");
                    setSubCategoryFilter("all");
                    setMonthFilter("");
                    setSearchFilter("");
                    setProjectFilter("all");
                  }}
                  className="text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <span className="text-sm text-muted-foreground">Loading expense records...</span>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <Receipt className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                  <p className="font-bold text-base">No expense records found</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Try changing your search or filter options, or click "Excel Sheet Entry" to enter multiple records fast.
                  </p>
                  <div className="flex justify-center gap-2 pt-1">
                    <Button
                      onClick={() => handleInitiateEntry("excel")}
                      size="sm"
                      className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Table className="w-4 h-4 mr-1" /> Excel Sheet Entry
                    </Button>
                    <Button onClick={() => handleInitiateEntry("single")} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" /> Single Entry
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Date & Voucher</th>
                        <th className="py-3 px-4">Title & Item Detail</th>
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Vendor & Method</th>
                        <th className="py-3 px-4 text-right">Amount (BDT)</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {expenses.map((expense) => {
                        const catObj = getCategoryDef(expense.category);
                        return (
                          <tr key={expense._id} className="hover:bg-muted/30 transition-colors">
                            {/* Date & Voucher */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-medium text-foreground">
                                {format(new Date(expense.date), "dd MMM yyyy")}
                              </p>
                              {expense.voucherNo ? (
                                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5">
                                  <FileCheck2 className="w-3 h-3 text-accent" /> #{expense.voucherNo}
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground/60">—</span>
                              )}
                            </td>

                            {/* Title & Sub-Category */}
                            <td className="py-3 px-4 max-w-xs">
                              <p className="font-bold text-foreground truncate">{expense.title}</p>
                              {expense.subCategory && (
                                <p className="text-[11px] text-accent font-medium mt-0.5">
                                  • {getSubCategoryLabel(expense.category, expense.subCategory)}
                                </p>
                              )}
                              {expense.notes && (
                                <p className="text-[11px] text-muted-foreground italic mt-0.5 truncate">
                                  "{expense.notes}"
                                </p>
                              )}
                              {expense.attachmentUrl && (
                                <a
                                  href={expense.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1 font-semibold"
                                >
                                  <ExternalLink className="w-3 h-3" /> View Voucher/Receipt
                                </a>
                              )}
                            </td>

                            {/* Project Name */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="font-medium text-xs text-foreground truncate max-w-[150px]">
                                  {expense.projectName || "General Office"}
                                </span>
                              </div>
                            </td>

                            {/* Category Badge */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <Badge variant="outline" className={`text-xs ${catObj?.color || ""}`}>
                                {catObj?.label || expense.category}
                              </Badge>
                            </td>

                            {/* Vendor & Method */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-medium">{expense.paidTo || "—"}</p>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {expense.paymentMethod || "cash"}
                              </span>
                            </td>

                            {/* Amount */}
                            <td className="py-3 px-4 text-right whitespace-nowrap font-black text-rose-600 text-sm sm:text-base">
                              {formatBDT(expense.amount)}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10"
                                  onClick={() => handleOpenEdit(expense)}
                                  title="Edit Expense (Full Page)"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteExpense(expense._id, expense.title)}
                                  title="Delete Expense"
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
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= VIEW 4: CATEGORY BREAKDOWN ANALYTICS ================= */}
      {activeView === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Category-wise Spending Breakdown</h2>
              <p className="text-xs text-muted-foreground">
                কোন সেকশনে কত টাকা খরচ হয়েছে এবং মোট ব্যয়ের কত শতাংশ ব্যয়িত হয়েছে তা পর্যালোচনা করুন
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Total In Scope:</span>
              <p className="text-base font-black text-rose-600">
                {formatBDT(projectFilter === "all" ? metrics.totalExpense : metrics.filteredTotal)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPENSE_CATEGORIES.map((cat) => {
              const spentData = metrics.categoryBreakdown[cat.value] || { total: 0, count: 0 };
              const totalCostBase = (projectFilter === "all" ? metrics.totalExpense : metrics.filteredTotal) || 1;
              const percentage = Math.round((spentData.total / totalCostBase) * 100);

              return (
                <Card
                  key={cat.value}
                  className={`border transition-all hover:shadow-md cursor-pointer ${
                    spentData.total > 0 ? "bg-card" : "bg-muted/10 opacity-70"
                  }`}
                  onClick={() => {
                    setCategoryFilter(cat.value);
                    setActiveView("transactions");
                  }}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${cat.color}`}>
                        {cat.label}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        {spentData.count} entries
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{cat.labelBn}</span>
                      <span className="text-base font-black text-foreground">
                        {formatBDT(spentData.total)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{percentage}% of total expenses</span>
                      <span className="text-accent font-semibold flex items-center gap-0.5">
                        Filter <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 5: PROJECT ACCOUNTS LEDGER ================= */}
      {activeView === "ledger" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Project-wise Accounts & Profit Margin Ledger</h2>
            <p className="text-xs text-muted-foreground">
              প্রতিটি প্রজেক্টে ক্লায়েন্টের থেকে গৃহীত আয় (Revenue Inflow) বনাম মোট নির্মাণ খরচ (Outflow) এবং মুনাফা
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Project Name</th>
                        <th className="py-3 px-4">Category & Location</th>
                        <th className="py-3 px-4 text-right">Client Billed / Paid</th>
                        <th className="py-3 px-4 text-right">Direct Funds</th>
                        <th className="py-3 px-4 text-right">Total Expenses</th>
                        <th className="py-3 px-4 text-right">Net Available Balance</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {projectLedger.map((proj) => {
                        const isProfitable = proj.netMargin >= 0;
                        return (
                          <tr key={proj.projectId} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-accent" />
                                {proj.title}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                              <span>{proj.category}</span>
                              {proj.location && <span className="text-[11px] block text-muted-foreground/70">• {proj.location}</span>}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                              {formatBDT(proj.collectedRevenue)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-cyan-600 whitespace-nowrap">
                              {formatBDT(proj.directFunds || 0)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                              {formatBDT(proj.totalCost)}
                              <span className="text-[10px] block font-normal text-muted-foreground">
                                {proj.expenseCount} vouchers
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <span
                                className={`font-black text-sm ${
                                  isProfitable ? "text-emerald-700" : "text-rose-700"
                                }`}
                              >
                                {formatBDT(proj.netMargin)}
                              </span>
                              {proj.totalInflow > 0 && (
                                <span className="text-[10px] block font-semibold text-muted-foreground">
                                  {proj.marginPercent}% surplus
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              {proj.projectId === "general-office" ? (
                                <Badge variant="secondary" className="text-[10px]">Overhead</Badge>
                              ) : isProfitable ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> In Surplus
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px] gap-1">
                                  <AlertCircle className="w-3 h-3" /> Cost Exceeded
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 gap-1"
                                onClick={() => {
                                  setProjectFilter(proj.projectId);
                                  setActiveView("transactions");
                                }}
                              >
                                View Costs <ArrowRight className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD BALANCE / FUND DEPOSIT ================= */}
      <Dialog open={addBalanceModalOpen} onOpenChange={setAddBalanceModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 text-white rounded-lg">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Add Balance / Fund Deposit (ব্যালেন্স জমা)</DialogTitle>
                <DialogDescription className="text-xs">
                  প্রজেক্টে বা অফিস একাউন্টে ক্যাশ বা ব্যাংক ব্যালেন্স জমা করুন
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveBalance} className="space-y-4 mt-2">
            {/* Project Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Select Project / Account *</Label>
              <select
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-semibold"
                value={balanceForm.projectId}
                onChange={(e) => {
                  const pId = e.target.value;
                  const p = projects.find((proj) => proj._id === pId);
                  setBalanceForm((prev) => ({
                    ...prev,
                    projectId: pId,
                    projectName: p ? p.title : "General / Office Overhead",
                  }));
                }}
              >
                <option value="general-office">🏢 General / Office Overhead</option>
                <optgroup label="Active Projects">
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      📍 {p.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Deposit Title & Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Deposit Description / Title *</Label>
              <Input
                required
                value={balanceForm.title}
                onChange={(e) => setBalanceForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Hasan Sir Cash Deposit for Piling / Client 1st Installment"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Deposit Amount (BDT ৳) *</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={balanceForm.amount}
                  onChange={(e) => setBalanceForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="500000"
                  className="font-black text-emerald-600 text-base"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Date of Deposit</Label>
                <Input
                  type="date"
                  value={balanceForm.date}
                  onChange={(e) => setBalanceForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            {/* Fund Source & Deposited By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Fund Source (উৎস)</Label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  value={balanceForm.source}
                  onChange={(e) => setBalanceForm((prev) => ({ ...prev, source: e.target.value }))}
                >
                  <option value="owner-equity">Owner Deposit (মালিকের ডিপোজিট)</option>
                  <option value="client-payment">Client Advance / Installment (ক্লায়েন্ট পেমেন্ট)</option>
                  <option value="bank-deposit">Bank Deposit (ব্যাংক ট্রান্সফার)</option>
                  <option value="cash-advance">Cash Advance (সাইট ক্যাশ অগ্রিম)</option>
                  <option value="loan-borrowing">Loan / Borrowing (ঋণ / ধার)</option>
                  <option value="other">Other Source (অন্যান্য)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Deposited By (প্রদানকারী ব্যক্তি)</Label>
                <Input
                  value={balanceForm.depositedBy}
                  onChange={(e) => setBalanceForm((prev) => ({ ...prev, depositedBy: e.target.value }))}
                  placeholder="e.g. Engr. Hasan / Client Name"
                />
              </div>
            </div>

            {/* Payment Method & Ref No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Payment Method</Label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  value={balanceForm.paymentMethod}
                  onChange={(e) => setBalanceForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="bank">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                  <option value="cheque">Cheque (চেক)</option>
                  <option value="cash">Cash (নগদ ক্যাশ)</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Receipt / Ref # (রসিদ/চেক নং)</Label>
                <Input
                  value={balanceForm.referenceNo}
                  onChange={(e) => setBalanceForm((prev) => ({ ...prev, referenceNo: e.target.value }))}
                  placeholder="e.g. CHQ-9921 / TR-819"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Notes / Remarks</Label>
              <Input
                value={balanceForm.notes}
                onChange={(e) => setBalanceForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Bank name, branch, or deposit purpose remarks"
              />
            </div>

            <div className="flex items-center gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddBalanceModalOpen(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingBalance}
                className="flex-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow"
              >
                {submittingBalance ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Coins className="w-4 h-4" />
                )}
                Save Deposit & Add Balance
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: MANDATORY PROJECT SELECTOR BEFORE ENTRY ================= */}
      <Dialog open={projectSelectModalOpen} onOpenChange={setProjectSelectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" />
              Select Project Before Data Entry
            </DialogTitle>
            <DialogDescription className="text-xs">
              খরচ এন্ট্রি পেজে যাওয়ার পূর্বে প্রজেক্ট সিলেক্ট করুন। নির্বাচিত প্রজেক্টটি সকল সারিতে স্বয়ংক্রিয়ভাবে (Auto-Fill) যুক্ত থাকবে।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 mt-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* General Office Option */}
            <div
              onClick={() => proceedToEntry(targetEntryMode, "general-office")}
              className="p-3 rounded-lg border border-border hover:border-accent/60 hover:bg-accent/5 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-muted rounded-md text-foreground">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">🏢 General / Office Overhead</h4>
                  <p className="text-[11px] text-muted-foreground">অফিস ইউটিলিটি, সাধারণ বেতন ও বিবিধ খরচ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Active Projects List */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Active Projects ({projects.length})
              </span>
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div
                    key={proj._id}
                    onClick={() => proceedToEntry(targetEntryMode, proj._id)}
                    className="p-3 rounded-lg border border-border hover:border-emerald-500 hover:bg-emerald-500/5 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-700 transition-colors">
                        📍 {proj.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {proj.category} {proj.location && `• ${proj.location}`}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: DELETE ALL EXPENSES WITH SECURITY CODE ================= */}
      <Dialog open={deleteConfirmModalOpen} onOpenChange={setDeleteConfirmModalOpen}>
        <DialogContent className="max-w-md border-destructive/30">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-6 h-6" />
              <DialogTitle className="text-lg font-bold text-destructive">
                Security Confirmation Required
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              {projectFilter === "all" ? (
                <span className="text-rose-600 font-semibold block">
                  ⚠️ সতর্কবার্তা: আপনি সকল প্রজেক্টের সমস্ত খরচ স্থায়ীভাবে ডিলিট করতে যাচ্ছেন ({expenses.length} records, {formatBDT(metrics.totalExpense)})!
                </span>
              ) : (
                <span className="text-rose-600 font-semibold block">
                  ⚠️ সতর্কবার্তা: আপনি "{activeProjectInfo?.title}" প্রজেক্টের সমস্ত খরচ স্থায়ীভাবে ডিলিট করতে যাচ্ছেন ({expenses.length} records, {formatBDT(metrics.filteredTotal)})!
                </span>
              )}
              এই কাজটি করলে কোনো ডাটা আর পুনরুদ্ধার করা যাবে না।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            {/* Safety Code Display */}
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                নিরাপত্তা নিশ্চিতকরণ কোড (Security Code):
              </span>
              <div className="font-mono text-xl font-black text-destructive tracking-widest selection:bg-destructive selection:text-white">
                {confirmSecurityCode}
              </div>
            </div>

            {/* Code Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-accent" />
                নিশ্চিত করতে হুবহু উপরের কোডটি লিখুন:
              </Label>
              <Input
                value={userEnteredCode}
                onChange={(e) => setUserEnteredCode(e.target.value)}
                placeholder={`Type "${confirmSecurityCode}" here...`}
                className="font-mono uppercase font-bold text-center tracking-wider text-base"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmModalOpen(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={
                  deletingAll ||
                  userEnteredCode.trim().toUpperCase() !== confirmSecurityCode.toUpperCase()
                }
                onClick={handleExecuteDeleteAll}
                className="flex-1 text-xs font-bold gap-1.5"
              >
                {deletingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Permanently Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
