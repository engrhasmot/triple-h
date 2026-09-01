"use client";

import { motion } from "framer-motion";
import { Shield, Target, Users, Award } from "lucide-react";

export function AboutHero() {
  return (
    <section className="bg-primary pt-32 pb-20 text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold font-heading text-primary-foreground mb-6"
      >
        About <span className="text-accent">TRIPLE H</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-primary-foreground/80 max-w-3xl mx-auto"
      >
        পরিকল্পিত নকশা, নিরাপদ নির্মাণ &mdash; Planned Design, Safe Construction
      </motion.p>
    </section>
  );
}

export function AboutStory() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              TRIPLE H PLANDRAFT & ENGINEERING is a premier civil engineering consultancy based in Dhaka, Bangladesh. We specialize in transforming architectural visions into structurally sound, legally approved, and beautifully designed buildings.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Founded by a team of experienced civil engineers and architects, we bridge the gap between traditional construction methods and modern engineering standards. From single-family homes to multi-story commercial complexes, every project receives the same meticulous attention to detail.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our name represents our core values: <strong>Honesty, Hard work, and High quality</strong> — the three pillars that guide every engagement with our clients.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Shield, label: "100+ Plans Approved", desc: "Successful municipal approvals" },
              { icon: Target, label: "50+ 3D Projects", desc: "Completed designs & renders" },
              { icon: Users, label: "200+ Clients", desc: "Satisfied property owners" },
              { icon: Award, label: "5+ Years", desc: "Industry experience" },
            ].map((item, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl border border-border text-center hover:shadow-lg transition-shadow">
                <item.icon className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-bold text-lg">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function AboutWhyChoose() {
  return (
    <section className="py-24 bg-muted/30 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Why Choose TRIPLE H?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
          {[
            {
              title: "End-to-End Service",
              desc: "From concept sketches to municipal approval and site supervision, we handle everything under one roof."
            },
            {
              title: "Local Expertise",
              desc: "Deep knowledge of Bangladesh's building codes, municipal procedures, and construction practices."
            },
            {
              title: "Cost Transparency",
              desc: "Clear, itemized BOQ estimates with no hidden charges. Know exactly what your construction will cost."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-8 rounded-2xl border border-border"
            >
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutCTA({ children }: { children?: React.ReactNode }) {
  return (
    <section className="py-24 bg-primary text-primary-foreground text-center">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <h2 className="text-3xl md:text-5xl font-bold font-heading">Ready to Start Your Project?</h2>
        <p className="text-lg text-primary-foreground/80">Let our engineers bring your vision to life with precision and safety.</p>
        {children}
      </div>
    </section>
  );
}
