"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  DollarSign,
  Ruler,
  Globe,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import { adminFetch } from "@/lib/admin-fetch";

export type ServiceType =
  | "2d-drafting"
  | "3d-design"
  | "boq-estimation"
  | "cost-estimator"
  | "plan-passing"
  | "site-supervision"
  | "consultation";

export type InquirySource = "website" | "whatsapp" | "phone" | "referral";

export type InquiryStatus =
  | "new"
  | "contacted"
  | "in-progress"
  | "converted"
  | "closed";

interface Inquiry {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  serviceType: ServiceType;
  message: string;
  source: InquirySource;
  projectArea?: number;
  budget?: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  "2d-drafting": "2D Drafting",
  "3d-design": "3D Design",
  "boq-estimation": "BOQ Estimation",
  "cost-estimator": "Cost Estimator",
  "plan-passing": "Plan Passing",
  "site-supervision": "Site Supervision",
  consultation: "Consultation",
};

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  "in-progress": "In Progress",
  converted: "Converted",
  closed: "Closed",
};

const STATUS_BADGE_CLASSES: Record<InquiryStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  "in-progress": "bg-indigo-100 text-indigo-700",
  converted: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-600",
};

const SOURCE_LABELS: Record<InquirySource, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  phone: "Phone",
  referral: "Referral",
};

export default function AdminQuotationsPage() {
  const [inquiries, setQuotations] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [editStatus, setEditStatus] = useState<InquiryStatus>("new");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const limit = 15;

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (statusFilter) params.set("status", statusFilter);
      if (serviceFilter) params.set("serviceType", serviceFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await adminFetch(`/api/admin/inquiries?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setQuotations(json.data || []);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, serviceFilter, sourceFilter, searchQuery]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  function openDetail(inquiry: Inquiry) {
    setSelectedInquiry(inquiry);
    setEditStatus(inquiry.status);
    setEditNotes(inquiry.notes || "");
    setDetailOpen(true);
  }

  async function saveDetail() {
    if (!selectedInquiry) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/api/admin/inquiries/${selectedInquiry._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const json = await res.json();
      setQuotations((prev) =>
        prev.map((i) => (i._id === json.data._id ? json.data : i))
      );
      setSelectedInquiry(json.data);
      toast.success("Inquiry updated");
    } catch {
      toast.error("Failed to update inquiry");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: deleteId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Inquiry deleted");
      setDeleteDialogOpen(false);
      setDeleteId(null);
      if (selectedInquiry?._id === deleteId) {
        setDetailOpen(false);
        setSelectedInquiry(null);
      }
      fetchQuotations();
    } catch {
      toast.error("Failed to delete inquiry");
    } finally {
      setSubmitting(false);
    }
  }

  function exportCSV() {
    if (inquiries.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Service",
      "Source",
      "Status",
      "Budget",
      "Project Area",
      "Message",
      "Notes",
      "Date",
    ];
    const rows = inquiries.map((i) => {
      const escape = (v: unknown) =>
        `"${String(v ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
      return [
        escape(i.name),
        escape(i.phone),
        escape(i.email),
        escape(SERVICE_TYPE_LABELS[i.serviceType] || i.serviceType),
        escape(SOURCE_LABELS[i.source] || i.source),
        escape(STATUS_LABELS[i.status] || i.status),
        escape(i.budget),
        escape(i.projectArea),
        escape(i.message),
        escape(i.notes),
        escape(format(new Date(i.createdAt), "yyyy-MM-dd")),
      ].join(",");
    });
    const BOM = "\uFEFF";
    const csv = BOM + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inquiries_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchQuotations();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Quotation Requests</h1>
          <p className="text-sm text-muted-foreground">
            Manage all client inquiries ({total} total)
          </p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {(
                  Object.entries(STATUS_LABELS) as unknown as [InquiryStatus, string][]
                ).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={serviceFilter}
              onValueChange={(v) => {
                setServiceFilter(v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Services</SelectItem>
                {(
                  Object.entries(SERVICE_TYPE_LABELS) as unknown as [ServiceType, string][]
                ).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sourceFilter}
              onValueChange={(v) => {
                setSourceFilter(v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sources</SelectItem>
                {(
                  Object.entries(SOURCE_LABELS) as unknown as [InquirySource, string][]
                ).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No inquiries found.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Service</th>
                  <th className="px-4 py-3 text-left font-medium">Source</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry._id}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => openDetail(inquiry)}
                  >
                    <td className="px-4 py-3 font-medium">{inquiry.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {inquiry.phone}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">
                        {SERVICE_TYPE_LABELS[inquiry.serviceType]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {SOURCE_LABELS[inquiry.source]}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_BADGE_CLASSES[inquiry.status]
                        }`}
                      >
                        {STATUS_LABELS[inquiry.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {format(new Date(inquiry.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {inquiry.notes || inquiry.message.slice(0, 60) || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(inquiry);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {inquiries.map((inquiry) => (
              <Card
                key={inquiry._id}
                className="cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => openDetail(inquiry)}
              >
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{inquiry.name}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGE_CLASSES[inquiry.status]
                      }`}
                    >
                      {STATUS_LABELS[inquiry.status]}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      {inquiry.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      {SERVICE_TYPE_LABELS[inquiry.serviceType]} —{" "}
                      {SOURCE_LABELS[inquiry.source]}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(inquiry.createdAt), "MMM dd, yyyy")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              View and manage this client inquiry.
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="max-h-[65vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Name
                  </p>
                  <p className="text-sm font-medium">{selectedInquiry.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedInquiry.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedInquiry.email || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Service Type
                  </p>
                  <Badge variant="outline">
                    {SERVICE_TYPE_LABELS[selectedInquiry.serviceType]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Source
                  </p>
                  <p className="text-sm">
                    {SOURCE_LABELS[selectedInquiry.source]}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Budget
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedInquiry.budget || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Project Area
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedInquiry.projectArea
                      ? `${selectedInquiry.projectArea} sq. ft.`
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Status
                  </p>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as InquiryStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(STATUS_LABELS) as unknown as [
                          InquiryStatus,
                          string
                        ][]
                      ).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Message
                </p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">
                  {selectedInquiry.message}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Notes
                </p>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Activity Log
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>
                      {format(
                        new Date(selectedInquiry.createdAt),
                        "MMM dd, yyyy h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Last Updated
                    </span>
                    <span>
                      {format(
                        new Date(selectedInquiry.updatedAt),
                        "MMM dd, yyyy h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Current Status
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGE_CLASSES[editStatus]
                      }`}
                    >
                      {STATUS_LABELS[editStatus]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4 -mx-4 -mb-4 px-4 pb-4 bg-muted/50 rounded-b-xl">
            <div className="flex items-center gap-2 w-full sm:justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (selectedInquiry) {
                    setDeleteId(selectedInquiry._id);
                    setDeleteDialogOpen(true);
                  }
                }}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <DialogClose render={<Button variant="outline">Close</Button>} />
                <Button onClick={saveDetail} disabled={saving}>
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inquiry? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={submitting}
            >
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
