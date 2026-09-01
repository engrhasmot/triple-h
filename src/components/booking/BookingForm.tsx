"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { MapPin, Building, User, Phone, Loader2, Calendar } from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/constants";
import "react-day-picker/style.css";

type ProjectType = "Residential" | "Commercial" | "Industrial";

const TIME_SLOTS = ["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"];

export default function BookingForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"details" | "calendar">("details");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeSlot, setTimeSlot] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("Residential");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const disabledDays = { before: new Date(today.getTime() + 86400000) };

  const handleNext = () => {
    if (!name || !phone) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setStep("calendar");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !timeSlot) {
      toast.error("Please select a date and time slot.");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          location,
          date: format(selectedDate, "yyyy-MM-dd"),
          timeSlot,
          appointmentType: "site-visit",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit booking");
      }

      setSuccess(true);
      toast.success("Site visit requested successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = () => {
    const message = `Hi TRIPLE H PLANDRAFT & ENGINEERING,
I just booked a site visit via your website!
*Details:*
- Name: ${name}
- Location: ${location}
- Proposed Date: ${selectedDate ? format(selectedDate, 'MMM dd, yyyy') : ''}
- Time: ${timeSlot}
- Type: ${projectType}

Please confirm this appointment.`;

    return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const resetForm = () => {
    setSuccess(false);
    setStep("details");
    setName("");
    setPhone("");
    setLocation("");
    setSelectedDate(undefined);
    setTimeSlot("");
  };

  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-xl p-6 md:p-8 border border-border">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Book a Site Visit</h2>
        <p className="text-muted-foreground text-sm">
          Schedule an on-site consultation with our expert engineers.
        </p>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit}>
          {step === "details" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name *</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4" /> Mobile Number *</Label>
                <Input id="phone" placeholder="017........" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Project Location</Label>
                <Input id="location" placeholder="e.g. Ashulia, Dhaka" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              <div className="space-y-3 pt-2">
                <Label className="flex items-center gap-2"><Building className="w-4 h-4" /> Project Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Residential", "Commercial", "Industrial"] as ProjectType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProjectType(type)}
                      className={`py-2 px-1 text-xs md:text-sm font-medium rounded-md border transition-all ${
                        projectType === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="button" onClick={handleNext} className="w-full h-12 mt-4 text-md">
                <Calendar className="w-4 h-4 mr-2" /> Select Date & Time
              </Button>
            </div>
          )}

          {step === "calendar" && (
            <div className="space-y-5">
              <div className="flex justify-center">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="!m-0 bg-card p-4 rounded-xl border border-border"
                />
              </div>

              {selectedDate && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Label>Available Time Slots *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                          timeSlot === slot
                            ? "bg-accent text-primary-foreground border-accent"
                            : "bg-background hover:bg-secondary text-foreground border-border"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep("details")} className="w-1/3">
                  Back
                </Button>
                <Button type="submit" className="w-2/3 h-12 text-md" disabled={loading || !selectedDate || !timeSlot}>
                  {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Requesting...</> : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="py-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Request Received!</h3>
          <p className="text-muted-foreground text-sm mb-8">
            {selectedDate && (
              <>Your site visit is requested for <strong>{format(selectedDate, "MMMM dd, yyyy")}</strong> at <strong>{timeSlot}</strong>.<br /></>
            )}
            Our team will contact you shortly to confirm.
          </p>

          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-sm font-medium mb-3">Want immediate confirmation?</p>
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white">
                <WhatsAppIcon className="w-5 h-5 mr-2" />
                Message Us on WhatsApp
              </Button>
            </a>
          </div>

          <button onClick={resetForm} className="mt-6 text-sm text-primary hover:underline">
            Book another visit
          </button>
        </div>
      )}
    </div>
  );
}
