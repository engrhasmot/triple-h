"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CalendarDays, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import SEOHead from "@/components/shared/SEOHead";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    appointmentType: "site-visit",
    date: "",
    timeSlot: "",
    location: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [minDate] = useState(() => format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        setShowSuccess(true);
        setFormData({ name: "", phone: "", email: "", appointmentType: "site-visit", date: "", timeSlot: "", location: "", notes: "" });
      } else {
        toast.error(json.error || "Failed to book appointment");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <SEOHead title="Contact" description="যোগাযোগ করুন। অ্যাপয়েন্টমেন্ট বুক করুন বা আমাদের অফিসে আসুন।" />
      {/* Header */}
      <section className="bg-primary pt-32 pb-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-primary-foreground mb-6">
          Contact <span className="text-accent">& Booking</span>
        </h1>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          Get in touch with our experts or book a site visit directly.
        </p>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column: Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold font-heading mb-6">Get In Touch</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Whether you have a question about our services, pricing, or want to discuss a new project, our team is ready to answer all your questions.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start p-6 glass-panel rounded-2xl border border-border">
                <div className="bg-primary/10 p-3 rounded-full mr-5">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground mb-1">Phone & WhatsApp</h4>
                  <p className="text-muted-foreground">+880 1631-186218</p>
                  <p className="text-muted-foreground">+880 1778-506500</p>
                </div>
              </div>

              <div className="flex items-start p-6 glass-panel rounded-2xl border border-border">
                <div className="bg-primary/10 p-3 rounded-full mr-5">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground mb-1">Email</h4>
                  <p className="text-muted-foreground">info@tripleh.com.bd</p>
                </div>
              </div>

              <div className="flex items-start p-6 glass-panel rounded-2xl border border-border">
                <div className="bg-primary/10 p-3 rounded-full mr-5">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground mb-1">Office Location</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Aysha Monjil, House 14/05, Ward No 1<br/>
                    Noyabari, Savar Radio Colony, Dhaka
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="h-80 rounded-2xl overflow-hidden shadow-lg border border-border relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.8!2d90.2624181!3d23.8609885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755e92add9847fd%3A0xdc7dc2fa86128021!2sAyasha%20Manzil!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-all duration-300 group-hover:scale-105"
              ></iframe>
              <a 
                href="https://maps.app.goo.gl/wdBzkKfqCw4Kbggs7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div>
            <div className="bg-card p-8 md:p-10 rounded-3xl shadow-2xl border border-border">
              <div className="flex items-center mb-8">
                <CalendarDays className="w-8 h-8 text-accent mr-4" />
                <h2 className="text-2xl font-bold font-heading">Book an Appointment</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-2 block">Full Name</label>
                    <Input 
                      required 
                      placeholder="e.g. Anisur Rahman" 
                      className="h-12 bg-muted/50"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-2 block">Phone Number</label>
                    <Input 
                      required 
                      placeholder="017XXXXXXXX" 
                      className="h-12 bg-muted/50"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-muted-foreground mb-2 block">Appointment Type</label>
                  <select 
                    className="flex h-12 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.appointmentType}
                    onChange={e => setFormData({...formData, appointmentType: e.target.value})}
                  >
                    <option value="site-visit">Site Visit / Survey</option>
                    <option value="consultation">Office Consultation</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-2 block">Preferred Date</label>
                    <Input 
                      type="date" 
                      required 
                      min={minDate}
                      className="h-12 bg-muted/50"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-2 block">Preferred Time</label>
                    <select 
                      required
                      className="flex h-12 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.timeSlot}
                      onChange={e => setFormData({...formData, timeSlot: e.target.value})}
                    >
                      <option value="">Select a time...</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                {formData.appointmentType === 'site-visit' && (
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-2 block">Project Location (for Site Visit)</label>
                    <Input 
                      placeholder="e.g. Zirabo, Ashulia" 
                      className="h-12 bg-muted/50"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      required={formData.appointmentType === 'site-visit'}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-muted-foreground mb-2 block">Project Details (Optional)</label>
                  <textarea 
                    className="flex w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                    placeholder="Tell us about what you want to build..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-primary-foreground" disabled={loading}>
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </form>

            </div>
          </div>
        </div>
      </section>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center border border-border animate-in fade-in zoom-in duration-300 relative">
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-3">Appointment Booked!</h2>
            <p className="text-muted-foreground mb-2">
              আপনার অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে।
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে। ধন্যবাদ!
            </p>
            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-primary-foreground font-bold text-lg"
            >
              ঠিক আছে
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
