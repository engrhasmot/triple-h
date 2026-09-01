"use client";

import { useEffect, useState, useCallback } from "react";
import { ImageIcon, Trash2, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { UploadWidget } from "@/components/admin/UploadWidget";
import { adminFetch } from "@/lib/admin-fetch";

interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/media?page=${page}&limit=24`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setMedia(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = (result: { url: string; publicId: string }) => {
    fetchMedia();
  };

  const deleteMedia = async (item: MediaItem) => {
    if (!confirm("Delete this image from Cloudinary?")) return;
    try {
      const res = await adminFetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, publicId: item.publicId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Image deleted");
      fetchMedia();
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(url);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground mt-1">Upload and manage images for your content.</p>
      </div>

      <div className="max-w-sm">
        <UploadWidget onUpload={handleUpload} />
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No media yet</h3>
          <p className="text-muted-foreground">Upload your first image using the widget above.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <Card key={item._id} className="overflow-hidden group">
                <div className="relative aspect-square bg-muted">
                  <img
                    src={item.url}
                    alt={item.originalFilename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      onClick={() => copyUrl(item.url)}
                      title="Copy URL"
                    >
                      {copiedId === item.url ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => deleteMedia(item)}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground truncate" title={item.originalFilename}>
                    {item.originalFilename}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">{formatSize(item.sizeBytes)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
