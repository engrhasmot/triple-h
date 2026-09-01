"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface Project {
  title: string;
  location: string;
  lat?: number;
  lng?: number;
  category: string;
}

const COLORS: Record<string, string> = {
  "2d-plan": "#d4a017",
  "3d-exterior": "#3b82f6",
  "3d-interior": "#8b5cf6",
  construction: "#10b981",
};

const LEGEND = [
  { key: "2d-plan", label: "2D Plan" },
  { key: "3d-exterior", label: "3D Exterior" },
  { key: "3d-interior", label: "3D Interior" },
  { key: "construction", label: "Construction" },
];

// Default project locations (fallback when DB entries lack coords)
const DEFAULT_PROJECTS: Project[] = [
  { title: "Shahin Residence", location: "Ashulia, Savar, Dhaka", lat: 23.8978, lng: 90.2717, category: "3d-exterior" },
  { title: "Karim Villa", location: "Gazipur, Dhaka", lat: 23.9999, lng: 90.4152, category: "2d-plan" },
  { title: "Rahman Apartment", location: "Tongi, Gazipur", lat: 23.9826, lng: 90.4013, category: "construction" },
  { title: "Ahmed Commercial", location: "Uttara, Dhaka", lat: 23.8759, lng: 90.3795, category: "3d-interior" },
  { title: "Nabil Duplex", location: "Savar, Dhaka", lat: 23.8573, lng: 90.2666, category: "2d-plan" },
  { title: "Mamun Bungalow", location: "Narayanganj", lat: 23.6238, lng: 90.4996, category: "3d-exterior" },
];

export default function ProjectMap({ projects }: { projects?: Project[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const displayProjects = (projects && projects.length > 0)
    ? projects.filter((p: Project) => p.lat && p.lng)
    : DEFAULT_PROJECTS;

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Check if already loaded
      if ((window as any).L) {
        initMap((window as any).L);
        return;
      }

      // Inject Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Inject Leaflet JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap((window as any).L);
      document.head.appendChild(script);
    };

    const initMap = (L: any) => {
      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

      const map = L.map(mapRef.current, {
        center: [23.88, 90.36],
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      displayProjects.forEach((project: Project) => {
        if (!project.lat || !project.lng) return;

        const color = COLORS[project.category] || "#d4a017";

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:32px;height:32px;
            background:${color};
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 4px 12px rgba(0,0,0,0.3);
            cursor:pointer;
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([project.lat, project.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px;font-family:system-ui,sans-serif;">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${project.title}</div>
              <div style="font-size:12px;color:#666;margin-bottom:6px;">📍 ${project.location}</div>
              <span style="
                display:inline-block;
                background:${color}20;
                color:${color};
                border:1px solid ${color}40;
                border-radius:4px;
                padding:2px 8px;
                font-size:11px;
                font-weight:600;
                text-transform:uppercase;
              ">${project.category.replace("-", " ")}</span>
            </div>
          `, { maxWidth: 240 });

        marker.on("mouseover", () => marker.openPopup());
      });

      setMapLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        const L = (window as any).L;
        if (L) L.map(mapRef.current).remove?.();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {LEGEND.map(item => (
          <div key={item.key} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[item.key] }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg">
        <div ref={mapRef} style={{ height: "420px", width: "100%" }} className="z-10" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-20">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-accent mx-auto mb-2 animate-bounce" />
              <p className="text-muted-foreground text-sm">Loading Map...</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Map data © OpenStreetMap contributors · {displayProjects.length} projects shown
      </p>
    </div>
  );
}
