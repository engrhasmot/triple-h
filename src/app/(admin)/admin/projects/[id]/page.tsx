"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { UploadWidget } from "@/components/admin/UploadWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { adminFetch } from "@/lib/admin-fetch";

const CATEGORIES = [
  { value: "2d-plan", label: "2D Plan" },
  { value: "3d-exterior", label: "3D Exterior" },
  { value: "3d-interior", label: "3D Interior" },
  { value: "construction", label: "Construction" },
];

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "2d-plan",
    client: "",
    location: "",
    area: "",
    tags: "",
    status: "draft",
    coverImageUrl: "",
    coverImagePublicId: "",
  });

  useEffect(() => {
    adminFetch(`/api/admin/projects/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        const p = data.data || data;
        setForm({
          title: p.title || "",
          description: p.description || "",
          category: p.category || "2d-plan",
          client: p.client || "",
          location: p.location || "",
          area: p.area ? String(p.area) : "",
          tags: (p.tags || []).join(", "),
          status: p.status || "draft",
          coverImageUrl: p.images?.[0]?.url || "",
          coverImagePublicId: p.images?.[0]?.publicId || "",
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Project not found");
        router.push("/admin/projects");
      });
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        category: form.category,
        client: form.client || undefined,
        location: form.location || undefined,
        area: form.area ? Number(form.area) : undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: form.status,
      };
      if (form.coverImageUrl) {
        body.images = [{ url: form.coverImageUrl, publicId: form.coverImagePublicId, alt: form.title, isBefore: false }];
      }
      const res = await adminFetch(`/api/admin/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Project updated successfully");
      router.push("/admin/projects");
    } catch {
      toast.error("Failed to update project");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-sm text-muted-foreground">Update your portfolio project.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Project Details</h2>
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input id="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description *</Label>
            <Textarea id="desc" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} required />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="cat">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({...form, category: v ?? ""})}>
                <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({...form, status: v ?? "draft"})}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area (sq ft)</Label>
              <Input id="area" type="number" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" value={form.client} onChange={e => setForm({...form, client: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="modern, residential, 2-story" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Cover Image</h2>
          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              <Label htmlFor="coverImageUrl">Image URL</Label>
              <Input id="coverImageUrl" value={form.coverImageUrl} onChange={e => setForm({...form, coverImageUrl: e.target.value})} />
              <Input value={form.coverImagePublicId} onChange={e => setForm({...form, coverImagePublicId: e.target.value})} placeholder="Cloudinary Public ID" />
            </div>
            <UploadWidget onUpload={(r) => setForm({...form, coverImageUrl: r.url, coverImagePublicId: r.publicId})} />
          </div>
          {form.coverImageUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted">
              <Image src={form.coverImageUrl} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting} className="min-w-[140px]">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : "Update Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
