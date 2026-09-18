"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, ZoomIn, MapPin, SlidersHorizontal, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageSlider from "@/components/portfolio/ImageSlider";
import dynamic from "next/dynamic";
import SEOHead from "@/components/shared/SEOHead";
import { SITE_CONFIG } from "@/lib/constants";

const ProjectMap = dynamic(() => import("@/components/portfolio/ProjectMap"), { ssr: false, loading: () => <div className="h-[420px] bg-muted animate-pulse rounded-2xl" /> });

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [categories, setCategories] = useState<{ name: string; slug: string; projectCount?: number }[]>([
    { name: "All", slug: "All" },
    { name: "2D Plans", slug: "2d-plan" },
    { name: "3D Exterior", slug: "3d-exterior" },
    { name: "3D Interior", slug: "3d-interior" },
    { name: "Construction", slug: "construction" },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/project-categories");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setCategories([
            { name: "All", slug: "All" },
            ...json.data.map((c: any) => ({
              name: c.name,
              slug: c.slug,
              projectCount: c.projectCount,
            })),
          ]);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();
        setProjects(json.data || []);
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProjects();
  }, []);

  // Fast map for slug -> display name
  const categoryMap: Record<string, string> = {};
  categories.forEach((c) => {
    if (c.slug !== "All") categoryMap[c.slug] = c.name;
  });

  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="w-full min-h-screen bg-background">
      <SEOHead title="Portfolio" description="আমাদের সম্পন্ন প্রকল্পগুলো দেখুন - Residential, Commercial, Industrial ও Government projects।" />
      
      {/* Header */}
      <section className="bg-primary pt-32 pb-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-primary-foreground mb-6">
          Our <span className="text-accent">Portfolio</span>
        </h1>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          Explore our completed 2D plans, 3D renderings, and construction projects.
        </p>
      </section>

      {/* Filter Pills */}
      <section className="py-8 border-b border-border sticky top-16 md:top-20 bg-background/90 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeCategory === cat.slug 
                ? "bg-accent text-primary shadow-lg scale-105" 
                : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <span>{cat.name}</span>
              {cat.slug !== "All" && cat.projectCount !== undefined && cat.projectCount > 0 && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat.slug
                      ? "bg-primary/20 text-primary font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.projectCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative cursor-pointer rounded-2xl overflow-hidden glass-panel border border-border shadow-md hover:shadow-2xl"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/20 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                    <Image 
                      src={project.images[0]?.url || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"} 
                      alt={project.title} 
                      width={600}
                      height={450}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                      <ZoomIn className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-5 bg-card">
                    <h3 className="font-bold text-lg text-foreground mb-1 font-heading">{project.title}</h3>
                    <p className="text-sm text-accent uppercase tracking-wider font-semibold">{categoryMap[project.category] || project.category.replace('-', ' ')}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-24 text-muted-foreground">
                No projects found in this category.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Before / After Showcase */}
      <section className="py-20 bg-primary/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4">
              <SlidersHorizontal className="w-4 h-4" /> Before / After Transformation
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
              See the <span className="text-accent">Difference</span> We Make
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Drag the slider to compare before and after our 3D transformation work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <ImageSlider
                beforeImage="https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&q=80"
                afterImage="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                beforeAlt="Residential Villa — Before"
                afterAlt="Residential Villa — After 3D Render"
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <ImageSlider
                beforeImage="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80"
                afterImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                beforeAlt="Modern Apartment — Before"
                afterAlt="Modern Apartment — After 3D Render"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Project Map */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4">
            <MapPin className="w-4 h-4" /> Project Locations
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            Where We&apos;ve <span className="text-accent">Built</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Our projects span across Dhaka, Gazipur, Narayanganj, and beyond.
          </p>
        </div>
        <ProjectMap projects={projects} />
      </section>

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-border relative"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-3/5 h-64 md:h-[80vh] bg-muted relative">
                <Image 
                  src={selectedProject.images[0]?.url || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"} 
                  alt={selectedProject.title} 
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full md:w-2/5 p-8 flex flex-col justify-between overflow-y-auto">
                <div>
                  <h2 className="text-3xl font-bold font-heading text-foreground mb-2">{selectedProject.title}</h2>
                  <p className="text-accent font-semibold uppercase tracking-wider text-sm mb-6">{categoryMap[selectedProject.category] || selectedProject.category.replace('-', ' ')}</p>
                  
                  <div className="space-y-4 mb-8">
                    {selectedProject.location && (
                      <div><strong className="text-muted-foreground">Location:</strong> <span className="text-foreground">{selectedProject.location}</span></div>
                    )}
                    {selectedProject.area && (
                      <div><strong className="text-muted-foreground">Area:</strong> <span className="text-foreground">{selectedProject.area} Sq.Ft</span></div>
                    )}
                  </div>

                  <h4 className="font-semibold text-lg mb-2 border-b border-border pb-2">Project Details</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="pt-8">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
                      `আসসালামুয়ালাইকুম ইঞ্জিনিয়ার মোঃ হাসমত আলী সাহেব, আমি আপনার ওয়েবসাইটের পোর্টফোলিওতে "${selectedProject.title}" (${selectedProject.category}) ডিজাইনটি দেখেছি। আমার জমিতে অনুরূপ ডিজাইন ও ড্রয়িং সংক্রান্ত পরামর্শ নিতে আগ্রহী।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-12 text-sm sm:text-base gap-2 shadow-lg">
                      <MessageCircle className="w-5 h-5" /> এই ডিজাইনের ড্রয়িং নিয়ে কথা বলুন
                    </Button>
                  </a>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
