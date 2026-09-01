"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ClientError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold font-heading">Something went wrong</h2>
        <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
        <Button onClick={reset} className="font-bold">
          Try Again
        </Button>
      </div>
    </div>
  );
}
