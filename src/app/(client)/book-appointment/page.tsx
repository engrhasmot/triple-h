"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SEOHead from "@/components/shared/SEOHead";

const BookingForm = dynamic(() => import("@/components/booking/BookingForm"), {
  loading: () => (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
});

export default function BookAppointmentPage() {
  return (
    <div className="w-full">
      <SEOHead title="Book Appointment" description="ইঞ্জিনিয়ার বা আর্কিটেক্টের সাথে অ্যাপয়েন্টমেন্ট বুক করুন।" />
      <section className="bg-primary pt-32 pb-20 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold font-heading text-primary-foreground mb-6"
        >
          Book an <span className="text-accent">Appointment</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
        >
          Schedule a site visit or office consultation with our expert engineers.
        </motion.p>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingForm />
        </div>
      </section>
    </div>
  );
}
