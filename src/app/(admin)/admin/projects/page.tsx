"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus, Trash2, Star, Loader2, Image as ImageIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { adminFetch } from "@/lib/admin-fetch";

const CATEGORY_LABELS: Record<string, string> = {
  "2d-plan": "2D Plan",
  "3d-exterior": "3D Exterior",
  "3d-interior": "3D Interior",
  construction: "Construction",
};

export default function AdminProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      setProjects(json.data || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await adminFetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, featured: !current }),
      });
      if (!res.ok) throw new Error();
      toast.success("Featured updated");
      fetchProjects();
    } catch {
      toast.error("Failed to update");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await adminFetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Project deleted");
      fetchProjects();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio projects.</p>
        </div>
        <Button onClick={() => router.push("/admin/projects/new")}>
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <Card key={p._id} className="overflow-hidden group border-border/60 hover:border-accent/30 transition-colors">
            <div className="relative h-48 bg-muted">
              {p.images && p.images[0] ? (
                <Image src={p.images[0].url} alt={p.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-10 h-10 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <Button size="icon" variant="secondary" className={`h-9 w-9 shadow-lg ${p.featured ? 'text-yellow-500' : 'text-muted-foreground'}`} onClick={() => toggleFeatured(p._id, p.featured)}>
                  <Star className="w-4 h-4" fill={p.featured ? "currentColor" : "none"} />
                </Button>
                <Button size="icon" variant="secondary" className="h-9 w-9 shadow-lg" onClick={() => router.push(`/admin/projects/${p._id}`)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" className="h-9 w-9 shadow-lg" onClick={() => deleteProject(p._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Badge className="absolute bottom-3 left-3 bg-background/80 text-foreground backdrop-blur-sm border-0">
                {CATEGORY_LABELS[p.category] || p.category}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  {p.location && <p className="text-xs text-muted-foreground mt-0.5">{p.location}</p>}
                </div>
                <Badge variant={p.status === "published" ? "default" : "secondary"} className="shrink-0 text-[10px] px-2 py-0.5">
                  {p.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
              {p.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.tags.slice(0, 3).map((t: string) => <Badge key={t} variant="outline" className="text-[10px] px-2 py-0.5">{t}</Badge>)}
                  {p.tags.length > 3 && <span className="text-[10px] text-muted-foreground self-center">+{p.tags.length - 3}</span>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl">
            <FolderKanban className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Create your first portfolio project to showcase your work.</p>
            <Button onClick={() => router.push("/admin/projects/new")}><Plus className="w-4 h-4 mr-2" /> Create Project</Button>
          </div>
        )}
      </div>
    </div>
  );
}
