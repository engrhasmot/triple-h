"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Maximize, User } from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import ImageSlider from "./ImageSlider";
import Image from "next/image";
import { format } from "date-fns";
import { ReactNode } from "react";
import { SITE_CONFIG } from "@/lib/constants";

// Using a partial representation of the IProject interface from the DB
export interface ProjectData {
  _id: string;
  title: string;
  category: string;
  description: string;
  client?: string;
  location: string;
  area?: number;
  completionDate?: string | Date;
  images: { url: string; publicId: string; alt: string; isBefore: boolean }[];
  tags: string[];
}

interface ProjectModalProps {
  project: ProjectData;
  children: ReactNode; // The trigger component
}

export default function ProjectModal({ project, children }: ProjectModalProps) {
  const formatCategory = (cat: string) => {
    return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const beforeImage = project.images.find(img => img.isBefore);
  const afterImage = project.images.find(img => !img.isBefore) || project.images[0]; // fallback to first image

  const message = encodeURIComponent(
    `Hi TRIPLE H PLANDRAFT & ENGINEERING, I am interested in your project: "${project.title}". Can we discuss something similar?`
  );
  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="%23f1f5f9"><rect width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="%2394a3b8" font-size="20" font-family="sans-serif">No Image Available</text></svg>');
const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${message}`;

  return (
    <Dialog>
      <DialogTrigger render={<div />}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 mr-6">
            <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
            <Badge variant="secondary" className="whitespace-nowrap">
              {formatCategory(project.category)}
            </Badge>
          </div>
          <DialogDescription className="text-muted-foreground mt-2">
            <div className="flex flex-wrap gap-4 text-sm mt-2">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {project.location}</span>
              {project.area && <span className="flex items-center gap-1"><Maximize className="w-4 h-4"/> {project.area} Sq. Ft.</span>}
              {project.client && <span className="flex items-center gap-1"><User className="w-4 h-4"/> {project.client}</span>}
              {project.completionDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {format(new Date(project.completionDate), "MMMM yyyy")}</span>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {beforeImage && afterImage && beforeImage.url !== afterImage.url ? (
            <ImageSlider
              beforeImage={beforeImage.url}
              afterImage={afterImage.url}
              beforeAlt={beforeImage.alt || "Before"}
              afterAlt={afterImage.alt || "After"}
            />
          ) : (
            <div className="relative w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={afterImage?.url || PLACEHOLDER_IMAGE}
                alt={afterImage?.alt || project.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Project Overview</h3>
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
          
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {project.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white">
              <WhatsAppIcon className="w-4 h-4 mr-2" />
              Inquire About Similar Project
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
