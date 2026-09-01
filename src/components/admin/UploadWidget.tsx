"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadResult {
  url: string;
  publicId: string;
}

interface UploadWidgetProps {
  onUpload: (result: UploadResult) => void;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
}

export function UploadWidget({
  onUpload,
  accept = "image/*",
  maxSizeMB = 5,
  folder = "triple-h/uploads",
}: UploadWidgetProps) {
  const [state, setState] = useState<"idle" | "dragging" | "uploading" | "preview" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedResult, setUploadedResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setProgress(0);
    setErrorMsg("");
    setUploadedResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") && accept !== "*/*") {
      setState("error");
      setErrorMsg("Please select an image file");
      toast.error("Please select an image file");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setState("error");
      setErrorMsg(`File exceeds ${maxSizeMB}MB limit`);
      toast.error(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setState("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const result = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setUploadedResult(result);
      setState("preview");
      toast.success("Image uploaded successfully");
      onUpload(result);
    } catch (err: any) {
      setState("error");
      setErrorMsg(err.message || "Upload failed");
      toast.error(err.message || "Upload failed");
    }
  }, [maxSizeMB, folder, onUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      } else {
        setState("idle");
        toast.error("No file detected");
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState("idle");
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = async () => {
    if (uploadedResult?.publicId) {
      try {
        await fetch("/api/admin/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: uploadedResult.publicId }),
        });
      } catch {}
    }
    reset();
  };

  const handleRetry = () => {
    reset();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (state === "preview" && previewUrl) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 group">
        <img
          src={previewUrl}
          alt="Uploaded preview"
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
        {uploadedResult && (
          <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={state === "error" ? undefined : openFileDialog}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors cursor-pointer min-h-[100px]",
        state === "dragging" && "border-primary bg-primary/5 scale-[1.02]",
        state === "uploading" && "border-muted-foreground/30 pointer-events-none",
        state === "error" && "border-destructive/50 bg-destructive/5",
        state === "idle" && "border-border hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
      />

      {state === "idle" || state === "dragging" ? (
        <>
          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-medium text-foreground">Click to browse</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept === "image/*" ? "Images" : accept} up to {maxSizeMB}MB
          </p>
        </>
      ) : state === "uploading" ? (
        <>
          <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Uploading... {progress}%</p>
          <div className="w-full max-w-[200px] h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : state === "error" ? (
        <>
          <AlertCircle className="w-6 h-6 text-destructive mb-2" />
          <p className="text-sm text-destructive text-center mb-1">{errorMsg}</p>
          <Button variant="outline" size="xs" onClick={(e) => { e.stopPropagation(); handleRetry(); }}>
            Try Again
          </Button>
        </>
      ) : null}
    </div>
  );
}
