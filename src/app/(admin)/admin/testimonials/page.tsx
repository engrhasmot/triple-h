"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Star, Upload } from "lucide-react";
import { UploadWidget } from "@/components/admin/UploadWidget";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { adminFetch } from "@/lib/admin-fetch";

interface Testimonial {
  _id: string;
  clientName: string;
  designation?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: { url: string; publicId: string };
  projectImage?: { url: string; publicId: string };
  isFeatured: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  clientName: "",
  designation: "",
  company: "",
  content: "",
  rating: "5",
  avatarUrl: "",
  avatarPublicId: "",
  projectImageUrl: "",
  projectImagePublicId: "",
  isFeatured: false,
  order: "0",
  isActive: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setTestimonials(json.data || []);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
  }

  function openEdit(t: Testimonial) {
    setEditingId(t._id);
    setForm({
      clientName: t.clientName,
      designation: t.designation || "",
      company: t.company || "",
      content: t.content,
      rating: String(t.rating),
      avatarUrl: t.avatar?.url || "",
      avatarPublicId: t.avatar?.publicId || "",
      projectImageUrl: t.projectImage?.url || "",
      projectImagePublicId: t.projectImage?.publicId || "",
      isFeatured: t.isFeatured,
      order: String(t.order),
      isActive: t.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.clientName || !form.content || !form.rating) {
      toast.error("clientName, content, and rating are required");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        clientName: form.clientName,
        designation: form.designation || undefined,
        company: form.company || undefined,
        content: form.content,
        rating: parseInt(form.rating),
        isFeatured: form.isFeatured,
        order: parseInt(form.order) || 0,
        isActive: form.isActive,
      };
      if (form.avatarUrl) {
        body.avatar = { url: form.avatarUrl, publicId: form.avatarPublicId };
      }
      if (form.projectImageUrl) {
        body.projectImage = { url: form.projectImageUrl, publicId: form.projectImagePublicId };
      }

      let res;
      if (editingId) {
        res = await adminFetch("/api/admin/testimonials", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editingId, ...body }),
        });
      } else {
        res = await adminFetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      toast.success(editingId ? "Testimonial updated" : "Testimonial created");
      setDialogOpen(false);
      resetForm();
      fetchTestimonials();
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
      const res = await adminFetch("/api/admin/testimonials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: deleteId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Testimonial deleted");
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchTestimonials();
    } catch {
      toast.error("Failed to delete testimonial");
    } finally {
      setSubmitting(false);
    }
  }

  function renderStars(rating: number) {
    return (
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </span>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Testimonials</h1>
          <p className="text-sm text-muted-foreground">Manage client reviews and testimonials.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> New Testimonial</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update the testimonial fields below." : "Fill in the details to add a client review."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input id="clientName" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="CEO" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea id="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Testimonial text..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating *</Label>
                  <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v ?? "" })}>
                    <SelectTrigger id="rating" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <SelectItem key={r} value={String(r)}>
                          {renderStars(r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input id="avatarUrl" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." />
                    <Input id="avatarPublicId" value={form.avatarPublicId} onChange={(e) => setForm({ ...form, avatarPublicId: e.target.value })} placeholder="optional" />
                  </div>
                  <div className="w-36 shrink-0">
                    <UploadWidget
                      onUpload={(result) => setForm({ ...form, avatarUrl: result.url, avatarPublicId: result.publicId })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Project Image</Label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input id="projectImageUrl" value={form.projectImageUrl} onChange={(e) => setForm({ ...form, projectImageUrl: e.target.value })} placeholder="https://..." />
                    <Input id="projectImagePublicId" value={form.projectImagePublicId} onChange={(e) => setForm({ ...form, projectImagePublicId: e.target.value })} placeholder="optional" />
                  </div>
                  <div className="w-36 shrink-0">
                    <UploadWidget
                      onUpload={(result) => setForm({ ...form, projectImageUrl: result.url, projectImagePublicId: result.publicId })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
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
      ) : testimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No testimonials yet. Create your first one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Client</th>
                <th className="px-4 py-3 text-left font-medium">Rating</th>
                <th className="px-4 py-3 text-left font-medium">Featured</th>
                <th className="px-4 py-3 text-left font-medium">Active</th>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t._id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{t.clientName}</td>
                  <td className="px-4 py-3">{renderStars(t.rating)}</td>
                  <td className="px-4 py-3">
                    {t.isFeatured ? <Badge variant="default">Featured</Badge> : <Badge variant="ghost">—</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.isActive ? "default" : "destructive"}>
                      {t.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setDeleteId(t._id); setDeleteDialogOpen(true); }}
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
              Are you sure you want to delete this testimonial? This action cannot be undone.
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
