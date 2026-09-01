"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-destructive mb-4">!</h1>
            <h2 className="text-2xl font-bold mb-2">কিছু ভুল হয়েছে</h2>
            <p className="text-muted-foreground mb-8">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold h-12 px-8 text-lg rounded-lg"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
