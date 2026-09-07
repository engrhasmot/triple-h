"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Portal Error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <AlertTriangle className="w-14 h-14 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold font-heading">Dashboard Error</h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred while loading this page.
        </p>
        {error?.message && (
          <div className="bg-destructive/10 text-destructive text-xs font-mono p-3 rounded-lg border border-destructive/20 text-left overflow-x-auto">
            {error.message}
          </div>
        )}
        <div className="pt-2 flex justify-center gap-3">
          <Button onClick={reset} className="font-bold gap-2">
            <RefreshCw className="w-4 h-4" /> Reload Page
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/admin/dashboard";
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

