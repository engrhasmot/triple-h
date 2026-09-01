"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "2d-plan",
    title: "2D Architectural & Structural Plan",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800",
    description: "Our core service. We draft meticulous 2D floor plans, elevations, and structural drawings using AutoCAD, ensuring absolute precision for construction.",
    scope: [
      "Floor Plan Layouts",
      "Elevation & Section Drawings",
      "Foundation Details",
      "Column & Beam Layouts",
      "Plumbing & Electrical Drafts"
    ]
  },
  {
    id: "3d-design",
    title: "3D Exterior & Interior Renderings",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800",
    description: "Visualize your future building. We create highly detailed, photorealistic 3D models using Revit, SketchUp, and Lumion.",
    scope: [
      "Photorealistic Exterior Views",
      "Interior Design & Material Selection",
      "Day/Night Lighting Simulations",
      "3D Walkthrough Animations"
    ]
  },
  {
    id: "boq",
    title: "BOQ Construction Cost Estimation",
    image: "https://images.unsplash.com/photo-1541888086925-920a0eb56a11?q=80&w=800",
    description: "Never go over budget. We calculate the exact quantities of materials needed and provide current market rates for accurate cost prediction.",
    scope: [
      "Rod/Steel Quantity Calculation",
      "Cement, Sand, and Brick Estimation",
      "Labor Cost Projections",
      "Finishing Material Budgeting"
    ]
  },
  {
    id: "plan-passing",
    title: "Municipal Plan Passing Approvals",
    image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=800",
    description: "We handle the bureaucracy. From union parishad to Paurashava and RAJUK, we ensure your building plan gets legal approval.",
    scope: [
      "Documentation Preparation",
      "Soil Test Reports",
      "Authority Liaison",
      "Real-time File Tracking"
    ]
  },
  {
    id: "supervision",
    title: "On-site Technical Supervision",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356f12?q=80&w=800",
    description: "Our engineers visit your site during critical construction phases to ensure the contractor is following the structural design perfectly.",
    scope: [
      "Foundation Pouring Inspection",
      "Column & Roof Casting Supervision",
      "Material Quality Checking",
      "Safety Protocol Enforcement"
    ]
  }
];

export function ServicesHero() {
  return (
    <section className="bg-primary pt-32 pb-20 text-center px-4">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold font-heading text-primary-foreground mb-6"
      >
        Our <span className="text-accent">Services</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
      >
        From the first sketch to the final brick. TRIPLE H provides end-to-end civil engineering solutions.
      </motion.p>
    </section>
  );
}

export function ServicesList() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        {services.map((svc, idx) => (
          <div key={svc.id} id={svc.id} className={`flex flex-col gap-12 scroll-mt-20 lg:items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
            
            <motion.div 
              initial={{ opacity: 0, x: idx % 2 === 1 ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10"></div>
                  <Image src={svc.image} alt={svc.title} width={800} height={400} className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-1/2 space-y-6"
            >
              <h2 className="text-3xl font-bold font-heading text-foreground">{svc.title}</h2>
              <p className="text-lg text-muted-foreground">{svc.description}</p>
              
              <div className="bg-secondary/50 p-6 rounded-xl border border-border">
                <h4 className="font-semibold mb-4 text-primary">Scope of Work:</h4>
                <ul className="space-y-3">
                  {svc.scope.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-accent mr-3 shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link href="/contact" className="inline-block mt-4">
                <Button className="font-bold">
                  Inquire Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

          </div>
        ))}
      </div>
    </section>
  );
}
