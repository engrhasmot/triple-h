"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ProjectModal, { ProjectData } from "./ProjectModal";

interface ProjectCardProps {
  project: ProjectData;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const coverImage = project.images.find(img => !img.isBefore) || project.images[0];

  const formatCategory = (cat: string) => {
    return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <ProjectModal project={project}>
        <div className="h-full">
          <Card className="group overflow-hidden cursor-pointer h-full flex flex-col hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50">
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
            {coverImage ? (
              <Image
                src={coverImage.url}
                alt={coverImage.alt || project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                No Image
              </div>
            )}
            
            <div className="absolute top-3 right-3 z-10">
              <Badge className="shadow-sm bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 border-none">
                {formatCategory(project.category)}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-5 flex-grow">
            <h3 className="text-xl font-bold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 mr-1 shrink-0" />
              <span className="line-clamp-1">{project.location}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </CardContent>
          
          <CardFooter className="p-5 pt-0 mt-auto">
            <div className="flex items-center text-primary font-medium text-sm">
              View Details 
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </CardFooter>
        </Card>
        </div>
      </ProjectModal>
    </motion.div>
  );
}
