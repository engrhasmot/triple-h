import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AboutHero, AboutStory, AboutWhyChoose, AboutCTA } from "./AboutContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "TRIPLE H PLANDRAFT & ENGINEERING সম্পর্কে জানুন। আমাদের অভিজ্ঞতা, সেবা ও মূল্যবোধ।",
};

export default function AboutPage() {
  return (
    <div className="w-full">
      <AboutHero />
      <AboutStory />
      <AboutWhyChoose />
      <AboutCTA>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold h-14 px-10 text-lg">
              Get a Free Consultation
            </Button>
          </Link>
          <Link href="/portfolio">
            <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-14 px-10 text-lg bg-transparent">
              View Our Work
            </Button>
          </Link>
        </div>
      </AboutCTA>
    </div>
  );
}
