import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-2">পেজটি খুঁজে পাওয়া যায়নি</p>
        <p className="text-sm text-muted-foreground mb-8">The page you are looking for does not exist or has been moved.</p>
        <Link href="/">
          <Button className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold h-12 px-8 text-lg">
            হোম পেজে ফিরুন
          </Button>
        </Link>
      </div>
    </div>
  );
}
