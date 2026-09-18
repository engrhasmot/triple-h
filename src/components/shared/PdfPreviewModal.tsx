"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  Loader2,
  Calendar,
  HardDrive,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";

interface PdfPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  fileId?: string;
  uploadedAt?: string | Date;
  sizeBytes?: number;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfPreviewModal({
  open,
  onOpenChange,
  url,
  title,
  fileId,
  uploadedAt,
  sizeBytes,
}: PdfPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const isCloudinaryPdf = Boolean(
    url &&
    url.includes("res.cloudinary.com") &&
    (url.toLowerCase().endsWith(".pdf") || url.includes("/plan-documents/"))
  );

  // High-resolution image transformation of the PDF pages via Cloudinary
  const cloudinaryImgSrc = isCloudinaryPdf
    ? url.replace(/\/image\/upload\/(v\d+\/)?/, "/image/upload/f_jpg,q_auto:best/$1")
    : "";

  // Direct download handler (works for same-origin and cloud URLs)
  const handleDownload = async () => {
    const downloadTargetUrl = isCloudinaryPdf ? cloudinaryImgSrc : url;
    try {
      const response = await fetch(downloadTargetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const cleanFileName = (title.trim() || "plan-document").replace(/[^\w\u0980-\u09FF\s.-]/g, "_");
      const ext = isCloudinaryPdf ? ".jpg" : ".pdf";
      a.download = cleanFileName.toLowerCase().endsWith(ext)
        ? cleanFileName
        : `${cleanFileName}${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch {
      // Fallback to standard anchor download
      const a = document.createElement("a");
      a.href = downloadTargetUrl;
      a.download = `${title || "document"}${isCloudinaryPdf ? ".jpg" : ".pdf"}`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const previewSrc = url ? `${url}#toolbar=1&view=FitH` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 gap-0 overflow-hidden flex flex-col bg-background transition-all duration-200 border-border shadow-2xl ${
          isFullscreen
            ? "!max-w-[98vw] !w-[98vw] !h-[96vh] rounded-2xl"
            : "!max-w-5xl !w-[95vw] !h-[88vh] rounded-2xl"
        }`}
        showCloseButton={false}
      >
        {/* Top Header Bar */}
        <div className="bg-muted/70 border-b border-border px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold truncate text-foreground font-heading">
                  {title || "PDF ডকুমেন্ট প্রিভিউ"}
                </DialogTitle>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold shrink-0">
                  {isCloudinaryPdf ? "DRAWING / PDF" : "PDF"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground mt-0.5">
                {fileId && (
                  <span className="font-mono text-primary font-semibold">
                    File: {fileId}
                  </span>
                )}
                {sizeBytes && sizeBytes > 0 && (
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {formatFileSize(sizeBytes)}
                  </span>
                )}
                {uploadedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(uploadedAt), "dd MMM yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isCloudinaryPdf && (
              <div className="hidden md:flex items-center gap-1 bg-background/80 border border-border rounded-lg p-0.5 mr-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  title="জুম আউট"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <span className="text-[11px] font-mono font-medium px-1 min-w-10 text-center">
                  {zoomLevel}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
                  title="জুম ইন"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setZoomLevel(100)}
                  title="রিসেট"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="gap-1.5 h-8 text-xs font-semibold hover:bg-accent/10 hover:text-accent hover:border-accent/40"
              title="ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">ডাউনলোড</span>
            </Button>

            <a
              href={isCloudinaryPdf ? cloudinaryImgSrc : url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8 text-xs"
                title="নতুন ট্যাবে ওপেন করুন"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">নতুন ট্যাব</span>
              </Button>
            </a>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hidden sm:flex"
              title={isFullscreen ? "ছোট করুন" : "বড় করুন"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground ml-1"
            >
              বন্ধ করুন ✕
            </Button>
          </div>
        </div>

        {/* Cloudinary Notice Banner */}
        {isCloudinaryPdf && (
          <div className="bg-sky-500/10 border-b border-sky-500/20 px-4 py-1.5 text-[11px] text-sky-800 dark:text-sky-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate">
              <ImageIcon className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
              হাই-রেজোলিউশন ড্রয়িং ভিউয়ার (Cloudinary থেকে সরাসরি রেন্ডার করা হয়েছে)
            </span>
            <div className="flex items-center gap-2 shrink-0 md:hidden">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                className="font-bold underline"
              >
                জুম -
              </button>
              <span>•</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
                className="font-bold underline"
              >
                জুম +
              </button>
            </div>
          </div>
        )}

        {/* Mobile/Quick Notice Banner for non-cloudinary */}
        {!isCloudinaryPdf && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-[11px] text-amber-700 dark:text-amber-400 flex items-center justify-between sm:hidden">
            <span className="flex items-center gap-1 truncate">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              মোবাইলে প্রিভিউ না দেখা গেলে:
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-amber-800 dark:text-amber-300"
              >
                ওপেন
              </a>
              <span>•</span>
              <button
                onClick={handleDownload}
                className="font-bold underline text-amber-800 dark:text-amber-300"
              >
                ডাউনলোড
              </button>
            </div>
          </div>
        )}

        {/* Main PDF / Drawing Viewer Container */}
        <div className="flex-1 relative bg-slate-900/5 dark:bg-black/20 overflow-hidden flex flex-col">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">
                {isCloudinaryPdf ? "হাই-রেজোলিউশন ড্রয়িং লোড হচ্ছে..." : "পিডিএফ ডকুমেন্ট লোড হচ্ছে..."}
              </p>
            </div>
          )}

          {url ? (
            isCloudinaryPdf ? (
              <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center bg-slate-100 dark:bg-slate-950/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cloudinaryImgSrc}
                  alt={title || "Architecural Drawing"}
                  style={{ width: `${zoomLevel}%`, maxWidth: "none" }}
                  className="rounded-lg shadow-xl border border-border object-contain transition-all duration-150"
                  onLoad={() => setIframeLoading(false)}
                  onError={() => {
                    setIframeLoading(false);
                    setLoadError(true);
                  }}
                />
              </div>
            ) : (
              <iframe
                src={previewSrc}
                className="w-full flex-1 border-0"
                title={title}
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false);
                  setLoadError(true);
                }}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-muted-foreground space-y-3">
              <FileText className="w-12 h-12 opacity-40 text-rose-500" />
              <p className="text-sm font-medium">ডকুমেন্টটির কোনো সঠিক লিংক পাওয়া যায়নি।</p>
            </div>
          )}

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <h4 className="text-base font-bold">ব্রাউজারে সরাসরি প্রিভিউ লোড করা সম্ভব হয়নি</h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                আপনার ব্রাউজার সিকিউরিটি বা মোবাইল ডিভাইস সরাসরি ইন-লাইন ফাইল সমর্থন না করতে পারে। নিচের বাটন চেপে ফাইলটি সরাসরি দেখুন বা ডাউনলোড করুন।
              </p>
              <div className="flex gap-2">
                <a href={isCloudinaryPdf ? cloudinaryImgSrc : url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1.5">
                    <ExternalLink className="w-4 h-4" /> নতুন ট্যাবে দেখুন
                  </Button>
                </a>
                <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5">
                  <Download className="w-4 h-4" /> ডাউনলোড করুন
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
