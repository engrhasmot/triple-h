"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, PlusCircle, X, Upload } from "lucide-react";
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
import { adminFetch } from "@/lib/admin-fetch";

interface SocialLink {
  platform: string;
  url: string;
}

interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  image?: { url: string; publicId: string };
  email?: string;
  phone?: string;
  expertise: string[];
  socialLinks: SocialLink[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  name: "",
  designation: "",
  bio: "",
  imageUrl: "",
  imagePublicId: "",
  email: "",
  phone: "",
  expertiseText: "",
  order: "0",
  isActive: true,
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([{ platform: "", url: "" }]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/team");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setMembers(json.data || []);
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  function resetForm() {
    setForm(defaultForm);
    setSocialLinks([{ platform: "", url: "" }]);
    setEditingId(null);
  }

  function openEdit(m: TeamMember) {
    setEditingId(m._id);
    setForm({
      name: m.name,
      designation: m.designation,
      bio: m.bio,
      imageUrl: m.image?.url || "",
      imagePublicId: m.image?.publicId || "",
      email: m.email || "",
      phone: m.phone || "",
      expertiseText: m.expertise.join(", "),
      order: String(m.order),
      isActive: m.isActive,
    });
    setSocialLinks(
      m.socialLinks.length > 0
        ? m.socialLinks
        : [{ platform: "", url: "" }]
    );
    setDialogOpen(true);
  }

  function addSocialLink() {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  }

  function removeSocialLink(index: number) {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  }

  function updateSocialLink(index: number, field: keyof SocialLink, value: string) {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  }

  async function handleSubmit() {
    if (!form.name || !form.designation || !form.bio) {
      toast.error("Name, designation, and bio are required");
      return;
    }
    setSubmitting(true);
    try {
      const expertise = form.expertiseText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const filteredSocials = socialLinks.filter(
        (s) => s.platform.trim() && s.url.trim()
      );

      const body: Record<string, unknown> = {
        name: form.name,
        designation: form.designation,
        bio: form.bio,
        email: form.email || undefined,
        phone: form.phone || undefined,
        expertise,
        socialLinks: filteredSocials,
        order: parseInt(form.order) || 0,
        isActive: form.isActive,
      };
      if (form.imageUrl) {
        body.image = { url: form.imageUrl, publicId: form.imagePublicId };
      }

      let res;
      if (editingId) {
        res = await adminFetch("/api/admin/team", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editingId, ...body }),
        });
      } else {
        res = await adminFetch("/api/admin/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      toast.success(editingId ? "Team member updated" : "Team member created");
      setDialogOpen(false);
      resetForm();
      fetchMembers();
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
      const res = await adminFetch("/api/admin/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: deleteId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Team member deleted");
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchMembers();
    } catch {
      toast.error("Failed to delete team member");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Team Members</h1>
          <p className="text-sm text-muted-foreground">Manage your engineering team.</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> New Member</Button>} />
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Team Member" : "New Team Member"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update the member fields below." : "Fill in the details to add a team member."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input id="designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Senior Engineer" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="About the team member..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                    <Input id="imagePublicId" value={form.imagePublicId} onChange={(e) => setForm({ ...form, imagePublicId: e.target.value })} placeholder="optional" />
                  </div>
                  <div className="w-36 shrink-0">
                    <UploadWidget
                      onUpload={(result) => setForm({ ...form, imageUrl: result.url, imagePublicId: result.publicId })}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880 1XXX-XXXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                <Input id="expertise" value={form.expertiseText} onChange={(e) => setForm({ ...form, expertiseText: e.target.value })} placeholder="Structural Design, AutoCAD, 3D Modeling" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                </div>
                <div className="flex items-end pb-2">
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Social Links</Label>
                  <Button variant="ghost" size="xs" onClick={addSocialLink} type="button">
                    <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>
                {socialLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder="Platform (e.g. LinkedIn)"
                      value={link.platform}
                      onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon-sm" onClick={() => removeSocialLink(i)} type="button">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
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
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No team members yet. Add your first one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Designation</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.designation}</td>
                  <td className="px-4 py-3">
                    <Badge variant={m.isActive ? "default" : "destructive"}>
                      {m.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setDeleteId(m._id); setDeleteDialogOpen(true); }}
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
              Are you sure you want to delete this team member? This action cannot be undone.
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
