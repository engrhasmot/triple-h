"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { adminFetch } from "@/lib/admin-fetch";
import { truncate } from "@/lib/utils";

interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  question: "",
  answer: "",
  category: "",
  order: "0",
  isPublished: true,
};

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/faqs");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setFaqs(json.data || []);
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
  }

  function openEdit(f: Faq) {
    setEditingId(f._id);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category,
      order: String(f.order),
      isPublished: f.isPublished,
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.question || !form.answer || !form.category) {
      toast.error("question, answer, and category are required");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        order: parseInt(form.order) || 0,
        isPublished: form.isPublished,
      };

      let res;
      if (editingId) {
        res = await adminFetch("/api/admin/faqs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editingId, ...body }),
        });
      } else {
        res = await adminFetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      toast.success(editingId ? "FAQ updated" : "FAQ created");
      setDialogOpen(false);
      resetForm();
      fetchFaqs();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/faqs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: deleteId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("FAQ deleted");
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchFaqs();
    } catch {
      toast.error("Failed to delete FAQ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">FAQs</h1>
          <p className="text-sm text-muted-foreground">Manage frequently asked questions.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> New FAQ</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit FAQ" : "New FAQ"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update the FAQ fields below." : "Fill in the details to add a new FAQ."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input id="question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="What is..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea id="answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Detailed answer..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. General" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span className="text-sm">Published</span>
              </label>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <HelpCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No FAQs yet. Create your first one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Question</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f._id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium max-w-xs">
                    <span className="truncate block">{truncate(f.question, 60)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{f.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={f.isPublished ? "default" : "ghost"}>
                      {f.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{f.order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(f)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setDeleteId(f._id); setDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button variant="destructive" onClick={confirmDelete} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
