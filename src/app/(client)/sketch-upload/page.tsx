"use client";

import { useState } from "react";
import { 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  Ruler, 
  MapPin, 
  Phone, 
  User, 
  Building2, 
  Layers, 
  MessageCircle, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles, 
  Loader2,
  Camera,
  Compass
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SEOHead from "@/components/shared/SEOHead";
import { toast } from "sonner";
import Link from "next/link";

const BUILDING_TYPES = [
  { id: "Duplex Home", label: "ডুপ্লেক্স / ট্রিপ্লেক্স বাড়ি", icon: "🏡" },
  { id: "4-6 Storied Residential", label: "৪–৬ তলা আবাসিক ভবন", icon: "🏢" },
  { id: "7-10 Storied High-rise", label: "৭–১০ তলা বহুতল ভবন", icon: "🏙️" },
  { id: "Commercial / Market", label: "বাণিজ্যিক ভবন / মার্কেট", icon: "🏬" },
  { id: "Industrial / Factory", label: "ইন্ডাস্ট্রিয়াল শেড / ফ্যাক্টরি", icon: "🏭" },
  { id: "Interior Architecture", label: "লাক্সারি ইন্টেরিয়র ডিজাইন", icon: "🛋️" },
];

export default function SketchUploadPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [landArea, setLandArea] = useState("");
  const [roadWidth, setRoadWidth] = useState("");
  const [buildingType, setBuildingType] = useState("Duplex Home");
  const [floors, setFloors] = useState("৪ তলা");
  const [requirements, setRequirements] = useState("");
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error("ফাইলের সর্বোচ্চ সাইজ ১৫ মেগাবাইট");
        return;
      }
      setSketchFile(file);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("সঠিক ১১ ডিজিটের ফোন নম্বর লিখুন");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("phone", phone.trim());
      formData.append("location", location.trim());
      formData.append("landArea", landArea.trim());
      formData.append("roadWidth", roadWidth.trim());
      formData.append("buildingType", buildingType);
      formData.append("floors", floors);
      formData.append("requirements", requirements.trim());
      if (sketchFile) {
        formData.append("sketchFile", sketchFile);
      }

      const res = await fetch("/api/sketch-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "সাবমিট করতে ব্যর্থ হয়েছে");
      }

      setSuccessData({
        trackingId: data.trackingId,
        name,
        phone,
        buildingType,
        sketchUrl: data.sketchUrl,
      });

      toast.success("আপনার জমির স্কেচ সফলভাবে জমা হয়েছে!");
    } catch (err: any) {
      toast.error(err.message || "সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="জমির স্কেচ আপলোড ও ফ্রি প্ল্যান কনসালটেন্সি"
        description="আপনার জমির খসড়া স্কেচ বা মাপ লিখে পাঠান। ট্রিপল এইচ ইঞ্জিনিয়ারিং কনসালটেন্সির প্রধান প্রকৌশলী সরাসরি পর্যালোচনা করে খসড়া প্ল্যান দেবেন।"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-3">
          <Badge className="px-3 py-1 bg-accent/10 text-accent border-accent/30 text-xs font-bold gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> ফ্রি আর্কিটেকচারাল স্কেচ ইভ্যালুয়েশন
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            জমির স্কেচ পাঠান, পান <span className="text-accent">পরিকল্পিত নকশা</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            কাগজে হাতে আঁকা জমির মাপের ছবি তুলুন অথবা জমির দাগ/পরিমাপ লিখে জমা দিন। আমাদের প্রধান পরামর্শক{" "}
            <strong className="text-foreground">ইঞ্জিনিয়ার মোঃ হাসমত আলী</strong> সরাসরি খসড়া ফ্লোর প্ল্যান পর্যালোচনা করবেন।
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border bg-card/60 backdrop-blur shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">রাজউক ও বিএনবিসি মান</p>
                <p className="text-muted-foreground">আইনসম্মত সেটব্যাক ও সর্বোচ্চ ফ্লোর হিসাব</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 backdrop-blur shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">২৪ ঘণ্টার মধ্যে রেসপন্স</p>
                <p className="text-muted-foreground">সরাসরি চীফ কনসালটেন্টের সাথে কথা</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 backdrop-blur shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">হোয়াটসঅ্যাপে ড্রয়িং আপডেট</p>
                <p className="text-muted-foreground">ছবি ও পিডিএফ সরাসরি মোবাইলে</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <Card className="border-border shadow-xl bg-card overflow-hidden">
          <CardHeader className="bg-muted/40 border-b border-border pb-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Ruler className="w-5 h-5 text-accent" /> জমির বিবরণ ও স্কেচ সাবমিশন ফর্ম
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              ফর্মটি পূরণ করে নিচে আপনার হাতে আঁকা খসড়া স্কেচের ছবি বা জমির দলিল/নকশার কপি আপলোড করুন।
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" /> আপনার নাম *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: হাজী মোঃ রফিকুল ইসলাম"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-accent" /> ফোন / হোয়াটসঅ্যাপ নম্বর *
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    required
                    className="h-11 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Land & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> প্রজেক্টের অবস্থান
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="যেমন: সাভার, ঢাকা"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landArea" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-accent" /> জমির পরিমাণ
                  </Label>
                  <Input
                    id="landArea"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    placeholder="যেমন: ৫ শতক / ৩ কাঠা (৪০'×৫৫')"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roadWidth" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" /> সামনের রাস্তা
                  </Label>
                  <Input
                    id="roadWidth"
                    value={roadWidth}
                    onChange={(e) => setRoadWidth(e.target.value)}
                    placeholder="যেমন: ২০ ফুট / ১২ ফুট"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Building Type Selector */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-accent" /> আপনি কেমন ভবন নির্মাণ করতে চান?
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BUILDING_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setBuildingType(type.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        buildingType === type.id
                          ? "border-accent bg-accent/10 text-foreground font-bold ring-2 ring-accent/30"
                          : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs leading-snug">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Floors */}
              <div className="space-y-2">
                <Label htmlFor="floors" className="text-xs font-bold uppercase tracking-wider">
                  সম্ভাব্য তলা সংখ্যা (Floor Height)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["ডুপ্লেক্স (২ তলা)", "৩ তলা", "৪ তলা", "৫ তলা", "৬ তলা", "৭–১০ তলা"].map((f) => (
                    <Button
                      type="button"
                      key={f}
                      variant={floors === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFloors(f)}
                      className={`text-xs ${floors === f ? "bg-accent text-primary-foreground font-bold" : ""}`}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {/* File Upload Box */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-accent" /> হাতে আঁকা স্কেচ / জমির নকশা আপলোড করুন
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">ছবি (JPG, PNG) বা PDF</span>
                </Label>

                <div className="border-2 border-dashed border-border hover:border-accent/50 rounded-2xl p-6 text-center transition-colors bg-muted/10 relative">
                  <input
                    type="file"
                    id="sketchFile"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {filePreview ? (
                    <div className="space-y-3">
                      <img
                        src={filePreview}
                        alt="Sketch Preview"
                        className="max-h-48 mx-auto rounded-xl object-contain border border-border shadow"
                      />
                      <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {sketchFile?.name} নির্বাচিত হয়েছে
                      </p>
                      <p className="text-[11px] text-muted-foreground">পরিবর্তন করতে পুনরায় ক্লিক করুন</p>
                    </div>
                  ) : sketchFile ? (
                    <div className="space-y-2">
                      <FileText className="w-10 h-10 text-accent mx-auto" />
                      <p className="text-sm font-semibold text-foreground">{sketchFile.name}</p>
                      <p className="text-xs text-muted-foreground">ফাইলটি সফলভাবে যুক্ত হয়েছে</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-foreground">এখানে ক্লিক করে ছবি নির্বাচন করুন বা ড্রপ করুন</p>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        মোবাইল থেকে সরাসরি কাগজের স্কেচের ছবি তুলে দিন অথবা জমির দাগ নম্বর/মৌজা ম্যাপ আপলোড করুন।
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-xs font-bold uppercase tracking-wider">
                  বিশেষ কোনো চাহিদা বা নির্দেশনা (ঐচ্ছিক)
                </Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="যেমন: গ্রাউন্ড ফ্লোরে ৩টি গাড়ি পার্কিং ও একটি ইউনিট, উপরের তলাগুলোতে প্রতি ফ্লোরে ২টি করে ইউনিট চাই..."
                  className="min-h-[90px] text-sm"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-primary-foreground font-black text-base shadow-lg transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> ড্রয়িং রিকোয়েস্ট প্রস্তুত হচ্ছে...
                  </>
                ) : (
                  <>
                    বিনামূল্যে স্কেচ ও প্ল্যান পরামর্শ জমা দিন <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={!!successData} onOpenChange={(open) => !open && setSuccessData(null)}>
        <DialogContent className="sm:max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-foreground">
              আপনার রিকোয়েস্ট সফলভাবে জমা হয়েছে! 🎉
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              ধন্যবাদ {successData?.name} সাহেব। আপনার জমির স্কেচ রিকোয়েস্ট নথিভুক্ত করা হয়েছে।
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/40 rounded-xl border border-border text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ট্র্যাকিং রেফারেন্স:</span>
              <strong className="font-mono text-accent font-bold text-sm">{successData?.trackingId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">প্রজেক্ট ধরণ:</span>
              <span className="font-semibold text-foreground">{successData?.buildingType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ফোন নম্বর:</span>
              <span className="font-mono text-foreground">{successData?.phone}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            আমাদের প্রধান প্রকৌশলী <strong>ইঞ্জিনিয়ার মোঃ হাসমত আলী</strong> দ্রুত আপনার স্কেচ দেখে ড্রয়িং সংক্রান্ত পরামর্শ দেবেন। আপনি সরাসরি হোয়াটসঅ্যাপেও আলোচনা করতে পারেন:
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <a
              href={`https://wa.me/8801778506500?text=${encodeURIComponent(
                `আসসালামুয়ালাইকুম ইঞ্জিনিয়ার হাসমত আলী সাহেব, আমি ওয়েবসাইটে আমার জমির একটি খসড়া স্কেচ জমা দিয়েছি (রেফারেন্স: ${successData?.trackingId})। আমার প্রজেক্ট: ${successData?.buildingType}। প্ল্যান ড্রয়িং নিয়ে বিস্তারিত আলোচনা করতে চাই।`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold gap-2">
                <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপে ড্রয়িং নিয়ে কথা বলুন
              </Button>
            </a>

            <Button variant="outline" onClick={() => setSuccessData(null)}>
              ঠিক আছে
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
