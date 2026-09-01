"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { UploadWidget } from "@/components/admin/UploadWidget";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { adminFetch } from "@/lib/admin-fetch";

export default function NewBlogPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    tags: "",
    coverImageUrl: "",
    coverImagePublicId: "",
    status: "draft" as "draft" | "published",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content || !form.excerpt || !form.author || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt,
        author: form.author,
        category: form.category,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: form.status,
      };
      if (form.coverImageUrl) {
        body.coverImage = { url: form.coverImageUrl, publicId: form.coverImagePublicId };
      }
      const res = await adminFetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create blog");
      }
      toast.success("Blog created successfully");
      router.push("/admin/blog");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Blog Article</h1>
          <p className="text-sm text-muted-foreground">Create a new blog post for your website.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Article Details</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter blog title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Engineering, Construction" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "draft" | "published" })}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input id="author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2, tag3" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Content</h2>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary of the article..." rows={3} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Start writing your article..."
              minHeight="400px"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Cover Image</h2>
          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              <Label htmlFor="coverImageUrl">Image URL</Label>
              <Input id="coverImageUrl" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://res.cloudinary.com/..." />
              <Input value={form.coverImagePublicId} onChange={(e) => setForm({ ...form, coverImagePublicId: e.target.value })} placeholder="Cloudinary Public ID (optional)" />
            </div>
            <UploadWidget onUpload={(result) => setForm({ ...form, coverImageUrl: result.url, coverImagePublicId: result.publicId })} />
          </div>
          {form.coverImageUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted">
              <Image src={form.coverImageUrl} alt="Cover preview" fill className="object-cover" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting} className="min-w-[140px]">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : "Create Blog"}
          </Button>
        </div>
      </form>
    </div>
  );
}
