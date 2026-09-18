"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Check,
  X,
  Layers,
  ArrowUpDown,
} from "lucide-react";

export interface ProjectCategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isDefault?: boolean;
  projectCount?: number;
}

interface ProjectCategoryManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesUpdated?: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0980-\u09FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProjectCategoryManagerModal({
  open,
  onOpenChange,
  onCategoriesUpdated,
}: ProjectCategoryManagerModalProps) {
  const [categories, setCategories] = useState<ProjectCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Category Form State
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newOrder, setNewOrder] = useState<number>(0);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editOrder, setEditOrder] = useState<number>(0);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<ProjectCategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/project-categories");
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch {
      toast.error("ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
      // Reset form
      setNewName("");
      setNewSlug("");
      setNewDesc("");
      setNewOrder(categories.length + 1);
      setSlugManuallyEdited(false);
      setEditingId(null);
      setDeleteTarget(null);
    }
  }, [open]);

  // Handle Name Input change with auto-slug
  const handleNameChange = (val: string) => {
    setNewName(val);
    if (!slugManuallyEdited) {
      setNewSlug(slugify(val));
    }
  };

  // Create Category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("ক্যাটাগরির নাম দিন");
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/project-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          slug: newSlug.trim() || slugify(newName),
          description: newDesc.trim(),
          order: Number(newOrder) || categories.length + 1,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "ক্যাটাগরি তৈরি ব্যর্থ হয়েছে");
      }

      toast.success("নতুন ক্যাটাগরি সফলভাবে যুক্ত করা হয়েছে");
      setNewName("");
      setNewSlug("");
      setNewDesc("");
      setSlugManuallyEdited(false);
      fetchCategories();
      onCategoriesUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  // Start Edit
  const startEdit = (cat: ProjectCategoryItem) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDesc(cat.description || "");
    setEditOrder(cat.order || 0);
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Save Edit
  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      toast.error("ক্যাটাগরির নাম খালি রাখা যাবে না");
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/project-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName.trim(),
          slug: editSlug.trim() || slugify(editName),
          description: editDesc.trim(),
          order: Number(editOrder),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "আপডেট ব্যর্থ হয়েছে");
      }

      toast.success("ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে");
      setEditingId(null);
      fetchCategories();
      onCategoriesUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async (cat: ProjectCategoryItem, force = false) => {
    setDeleting(true);
    try {
      const res = await adminFetch(
        `/api/admin/project-categories?id=${cat._id}${force ? "&force=true" : ""}`,
        { method: "DELETE" }
      );

      const json = await res.json();
      if (!res.ok) {
        if (json.hasProjects) {
          setDeleteTarget(cat);
          return;
        }
        throw new Error(json.error || "ডিলিট ব্যর্থ হয়েছে");
      }

      toast.success("ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
      fetchCategories();
      onCategoriesUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-border shadow-2xl">
        {/* Header */}
        <div className="bg-muted/70 border-b border-border px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-lg font-bold text-foreground font-heading">
              পোর্টফোলিও ক্যাটাগরি ম্যানেজমেন্ট
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              প্রজেক্টের ক্যাটাগরি যোগ, এডিট এবং ডিলিট করুন।
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Category Card */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-foreground">
              <Plus className="w-4 h-4 text-primary" /> নতুন ক্যাটাগরি যোগ করুন
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="catName" className="text-xs font-semibold">
                    ক্যাটাগরির নাম *
                  </Label>
                  <Input
                    id="catName"
                    value={newName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="যেমন: বাণিজ্যিক ভবন / Industrial"
                    className="h-9 text-xs mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="catSlug" className="text-xs font-semibold">
                    URL স্লাগ (স্বয়ংক্রিয়) *
                  </Label>
                  <Input
                    id="catSlug"
                    value={newSlug}
                    onChange={(e) => {
                      setNewSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="e.g. commercial-projects"
                    className="h-9 text-xs font-mono mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="catDesc" className="text-xs font-semibold">
                    বিবরণ (ঐচ্ছিক)
                  </Label>
                  <Input
                    id="catDesc"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="ক্যাটাগরি সম্পর্কে সংক্ষিপ্ত বিবরণ"
                    className="h-9 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="catOrder" className="text-xs font-semibold">
                    ক্রম (Order)
                  </Label>
                  <Input
                    id="catOrder"
                    type="number"
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value))}
                    className="h-9 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !newName.trim()}
                  className="gap-1.5 h-8 text-xs"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  ক্যাটাগরি সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>

          {/* Delete Warning Prompt Modal/Banner */}
          {deleteTarget && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-xs space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5 text-destructive">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">সতর্কতা: ক্যাটাগরির অধীনে প্রজেক্ট রয়েছে!</h4>
                  <p className="mt-1 text-muted-foreground">
                    <span className="font-bold text-foreground font-mono">"{deleteTarget.name}"</span>{" "}
                    ক্যাটাগরির অধীনে বর্তমানে{" "}
                    <span className="font-bold text-destructive font-mono">{deleteTarget.projectCount || 0}</span>{" "}
                    টি প্রজেক্ট রয়েছে। আপনি ক্যাটাগরিটি ডিলিট করলে প্রজেক্টগুলো{" "}
                    <span className="font-bold text-foreground">"Uncategorized"</span> এ স্থানান্তরিত হবে।
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  className="h-7 text-xs"
                >
                  বাতিল করুন
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleting}
                  onClick={() => handleDelete(deleteTarget, true)}
                  className="h-7 text-xs gap-1.5"
                >
                  {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                  হ্যাঁ, ফোর্স ডিলিট করুন
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <FolderKanban className="w-4 h-4 text-muted-foreground" />
                বর্তমান ক্যাটাগরি তালিকা ({categories.length})
              </h3>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>

            <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
              {categories.map((cat) => {
                const isEditing = editingId === cat._id;
                return (
                  <div
                    key={cat._id}
                    className="p-3.5 sm:p-4 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {isEditing ? (
                      <div className="w-full space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="ক্যাটাগরির নাম"
                            className="h-8 text-xs font-semibold"
                          />
                          <Input
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            placeholder="স্লাগ"
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="বিবরণ"
                            className="h-8 text-xs sm:col-span-2"
                          />
                          <Input
                            type="number"
                            value={editOrder}
                            onChange={(e) => setEditOrder(Number(e.target.value))}
                            placeholder="ক্রম"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-7 text-xs gap-1"
                          >
                            <X className="w-3 h-3" /> বাতিল
                          </Button>
                          <Button
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleSaveEdit(cat._id)}
                            className="h-7 text-xs gap-1"
                          >
                            {submitting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            সংরক্ষণ করুন
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              {cat.name}
                            </span>
                            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 text-muted-foreground">
                              {cat.slug}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0"
                            >
                              {cat.projectCount || 0} টি প্রজেক্ট
                            </Badge>
                            {cat.isDefault && (
                              <span className="text-[10px] text-muted-foreground italic">
                                (ডিফল্ট)
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-muted-foreground font-mono mr-2 flex items-center gap-0.5">
                            <ArrowUpDown className="w-3 h-3" /> {cat.order}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit(cat)}
                            title="এডিট করুন"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(cat)}
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {categories.length === 0 && !loading && (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  কোনো ক্যাটাগরি তৈরি করা হয়নি। উপরের ফর্ম ব্যবহার করে নতুন ক্যাটাগরি তৈরি করুন।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/50 border-t border-border px-6 py-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs"
          >
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
