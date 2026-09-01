"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import PageTransitionLoader from "@/components/shared/PageTransitionLoader";
import { Suspense } from "react";

const FloatingWhatsApp = dynamic(() => import("@/components/shared/FloatingWhatsApp"), { ssr: false });
const ChatBot = dynamic(() => import("@/components/shared/ChatBot"), { ssr: false });
const AnalyticsTracker = dynamic(() => import("@/components/shared/AnalyticsTracker"), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PageTransitionLoader />
      </Suspense>
      <Navbar />
      <div className="flex flex-col min-h-screen pt-16 md:pt-20">
        {children}
      </div>
      <Footer />
      <FloatingWhatsApp />
      <ChatBot />
      <AnalyticsTracker />
    </>
  );
}
