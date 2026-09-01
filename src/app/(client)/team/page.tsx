"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Globe, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import SEOHead from "@/components/shared/SEOHead";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  image?: { url: string; publicId: string };
  email?: string;
  phone?: string;
  expertise: string[];
  socialLinks: { platform: string; url: string }[];
  order: number;
  isActive: boolean;
}

function getSocialIcon(platform: string) {
  const p = platform.toLowerCase();
  return <ExternalLink className="w-4 h-4" />;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((json) => setMembers(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full">
      <SEOHead title="Our Team" description="TRIPLE H এর অভিজ্ঞ ইঞ্জিনিয়ার ও আর্কিটেক্ট টিম সম্পর্কে জানুন।" />
      <section className="bg-primary pt-32 pb-20 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-black text-primary-foreground mb-4"
        >
          Our Engineering Team
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-primary-foreground/80 max-w-2xl mx-auto text-lg"
        >
          Meet the skilled engineers and drafters behind every project at TRIPLE H.
        </motion.p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse p-4 space-y-4">
                <div className="w-full aspect-[4/3] rounded-lg bg-muted-foreground/10" />
                <div className="h-5 w-3/4 rounded bg-muted-foreground/10" />
                <div className="h-4 w-1/2 rounded bg-muted-foreground/10" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-muted-foreground/10" />
                  <div className="h-6 w-20 rounded-full bg-muted-foreground/10" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No team members to show yet.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {members.map((member) => (
              <motion.div key={member._id} variants={item}>
                <Dialog>
                  <DialogTrigger render={<div />}>
                    <div
                      onClick={() => setSelected(member)}
                      className="group cursor-pointer rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden hover:ring-accent/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="pt-8 pb-4 flex justify-center">
                        <div className="relative w-32 h-32 rounded-full bg-muted overflow-hidden ring-4 ring-accent/20 group-hover:ring-accent/50 transition-all duration-300">
                          {member.image?.url ? (
                            <Image
                              src={member.image.url}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Users className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4 space-y-2 text-center">
                        <h3 className="font-bold text-foreground">{member.name}</h3>
                        <p className="text-sm text-accent font-medium">{member.designation}</p>
                        {member.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 justify-center">
                            {member.expertise.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-[10px]">
                                {skill}
                              </Badge>
                            ))}
                            {member.expertise.length > 3 && (
                              <Badge variant="ghost" className="text-[10px]">
                                +{member.expertise.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2 text-center">
                          {member.bio.length > 100
                            ? member.bio.slice(0, 100).trimEnd() + "..."
                            : member.bio}
                        </p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg" showCloseButton>
                    <DialogHeader>
                      <DialogTitle>{selected?.name}</DialogTitle>
                      <DialogDescription>{selected?.designation}</DialogDescription>
                    </DialogHeader>
                    {selected && (
                      <div className="space-y-4">
                        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-muted">
                          {selected.image?.url ? (
                            <Image
                              src={selected.image.url}
                              alt={selected.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Users className="w-16 h-16" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{selected.bio}</p>
                        {selected.expertise.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Expertise</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.expertise.map((skill) => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {(selected.email || selected.phone) && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
                            {selected.email && (
                              <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                                <Mail className="w-4 h-4" /> {selected.email}
                              </a>
                            )}
                            {selected.phone && (
                              <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                                <Phone className="w-4 h-4" /> {selected.phone}
                              </a>
                            )}
                          </div>
                        )}
                        {selected.socialLinks.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Social</p>
                            <div className="flex gap-2">
                              {selected.socialLinks.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent hover:text-primary-foreground transition-colors"
                                >
                                  {getSocialIcon(link.platform)}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-end pt-2">
                      <DialogClose render={<Button variant="outline">Close</Button>} />
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

function Users(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
