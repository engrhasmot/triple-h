export interface ExpenseCategoryDef {
  value: string;
  label: string;
  labelBn: string;
  color: string;
  subCategories: { value: string; label: string; labelBn: string }[];
}

export const EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  {
    value: "civil-materials",
    label: "Civil Materials",
    labelBn: "সিভিল মালামাল",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    subCategories: [
      { value: "rebar-steel", label: "Rebar / Rod (BSRM / AKS)", labelBn: "রড / রিবার" },
      { value: "cement-opc", label: "Cement (OPC / PCC)", labelBn: "সিমেন্ট" },
      { value: "sand-sylhet", label: "Sylhet Sand (Coarse FM 2.5+)", labelBn: "সিলেট বালু / মোটা বালু" },
      { value: "stone-chips", label: "Stone Chips (3/4\" down)", labelBn: "ভাঙা পাথর (Stone Chips)" },
      { value: "brick-chips", label: "Brick Chips / Khoa", labelBn: "ইটের খোয়া" },
      { value: "rmc-concrete", label: "Ready-mix Concrete (RMC)", labelBn: "রেডি-মিক্স কনক্রিট" },
      { value: "waterproofing-admixture", label: "Waterproofing & Admixture", labelBn: "ওয়াটারপ্রুফিং কেমিক্যাল" },
      { value: "binding-wire-cover", label: "Binding Wire & Cover Blocks", labelBn: "গুনা তার ও কভার ব্লক" },
      { value: "other-civil-material", label: "Other Civil Material", labelBn: "অন্যান্য সিভিল সামগ্রী" },
    ],
  },
  {
    value: "civil-contractor",
    label: "Civil Contractor",
    labelBn: "সিভিল ঠিকাদার বিল",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    subCategories: [
      { value: "piling-contractor", label: "Piling Contractor", labelBn: "পাইলিং ঠিকাদার বিল" },
      { value: "pile-head-breaking", label: "Pile Head Breaking", labelBn: "পাইল হেড ব্রেকিং বিল" },
      { value: "rod-binder-contractor", label: "Rod Binder Mistri Bill", labelBn: "রড মিস্ত্রি / বাইন্ডিং বিল" },
      { value: "shuttering-contractor", label: "Shuttering & Formwork Bill", labelBn: "শাটারিং ঠিকাদার বিল" },
      { value: "casting-pouring", label: "Concrete Casting Contractor", labelBn: "ঢালাই ঠিকাদার বিল" },
      { value: "general-civil-contractor", label: "General Civil Contractor", labelBn: "সার্বিক সিভিল ঠিকাদার বিল" },
    ],
  },
  {
    value: "daily-labour",
    label: "Daily Labour",
    labelBn: "দৈনিক লেবার ও হাজিরা",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    subCategories: [
      { value: "general-labour-hazira", label: "General Helper Hazira", labelBn: "সাধারণ লেবার হাজিরা" },
      { value: "earthwork-excavation", label: "Earthwork / Soil Excavation", labelBn: "মাটি কাটা ও ভরাট লেবার" },
      { value: "loading-unloading", label: "Material Loading & Unloading", labelBn: "মালামাল লোড-আনলোড লেবার" },
      { value: "site-cleaning-curing", label: "Site Cleaning & Water Curing", labelBn: "সাইট কিউরিং ও পরিচ্ছন্নতা" },
      { value: "overtime-night-duty", label: "Overtime & Night Pouring", labelBn: "ওভারটাইম ও নাইট ডিউটি" },
    ],
  },
  {
    value: "masonry-plaster",
    label: "Masonry & Plaster",
    labelBn: "গাঁথুনি ও প্লাস্টার",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    subCategories: [
      { value: "bricks-first-class", label: "1st Class Auto Bricks", labelBn: "দেয়ালের ইট / অটো ব্রিকস" },
      { value: "concrete-blocks", label: "Concrete / AAC Hollow Blocks", labelBn: "কনক্রিট হলো ব্লক" },
      { value: "plaster-cement-sand", label: "Plaster Cement & Fine Sand", labelBn: "প্লাস্টার সিমেন্ট ও লোকাল বালি" },
      { value: "chicken-mesh-wire", label: "Chicken Wire Mesh (Crack Guard)", labelBn: "চিকেন মেশ / তারের জাল" },
      { value: "pvc-corner-bead", label: "PVC Corner Beads", labelBn: "পিভিসি কর্নার বিড" },
      { value: "masonry-mistri-bill", label: "Masonry Mistri Labour Bill", labelBn: "রাজমিস্ত্রি বিল (গাঁথুনি)" },
      { value: "plaster-mistri-bill", label: "Plaster Mistri Labour Bill", labelBn: "প্লাস্টার মিস্ত্রি বিল" },
    ],
  },
  {
    value: "sanitary-materials",
    label: "Sanitary Materials",
    labelBn: "স্যানিটারি মালামাল",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    subCategories: [
      { value: "cpvc-ppr-pipes", label: "cPVC & PPR Pipes / Fittings", labelBn: "cPVC ও PPR পাইপ-ফিটিংস" },
      { value: "upvc-pipes-fittings", label: "uPVC Supply Pipes & Fittings", labelBn: "uPVC সাপ্লাই পাইপ" },
      { value: "swr-drain-pipes", label: "SWR Drain & Sewerage Pipes (4\"/6\")", labelBn: "ড্রেন ও সিউয়ারেজ পাইপ" },
      { value: "commode-pan-basin", label: "Sanitary Ware (Commode, Basin)", labelBn: "কমোড, প্যান ও বেসিন" },
      { value: "cp-bath-fittings", label: "CP Fittings (Mixer, Taps, Showers)", labelBn: "সিপি ফিটিংস (মিক্সার, ট্যাপ)" },
      { value: "overhead-water-tank", label: "Overhead Water Tank", labelBn: "পানির ট্যাংক" },
      { value: "water-pump-motor", label: "Water Pump / Submersible Motor", labelBn: "পানির মোটর ও পাম্প" },
      { value: "glue-teflon-clamps", label: "Solvent Glue, Teflon & Clamps", labelBn: "আঠা, থ্রেড টেপ ও ক্ল্যাম্প" },
    ],
  },
  {
    value: "sanitary-contractor",
    label: "Sanitary Contractor",
    labelBn: "স্যানিটারি ঠিকাদার বিল",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    subCategories: [
      { value: "concealed-pipe-fixing", label: "Concealed Piping Labour Bill", labelBn: "কনসিল্ড পাইপ ফিটিংস মজুরি" },
      { value: "sanitary-ware-install", label: "Commode & Basin Installation", labelBn: "কমোড-বেসিন ফিটিং লেবার" },
      { value: "pump-tank-fitting", label: "Water Pump & Tank Connection", labelBn: "পাম্প ও ট্যাংক কানেকশন বিল" },
    ],
  },
  {
    value: "electrical-materials",
    label: "Electrical Materials",
    labelBn: "ইলেকট্রিক্যাল মালামাল",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    subCategories: [
      { value: "pvc-conduit-pipes", label: "PVC Conduit Pipes & Gang Boxes", labelBn: "পিভিসি কন্ডুইট পাইপ ও সার্কুলার বক্স" },
      { value: "electric-cables", label: "Electric Cables (1.5, 2.5, 4, 6 RM)", labelBn: "ইলেকট্রিক কেবল ও তার" },
      { value: "switch-socket-board", label: "Switches, Sockets & Gang Boards", labelBn: "সুইচ, সকেট ও বোর্ড" },
      { value: "breaker-distribution", label: "Circuit Breakers & DB/SDB Box", labelBn: "সার্কিট ব্রেকার ও ডিবি বক্স" },
      { value: "lights-fixtures", label: "LED Panels, COB & Tube Lights", labelBn: "লাইট ও ফিটিংস" },
      { value: "fans-exhaust", label: "Ceiling & Exhaust Fans", labelBn: "সিলিং ফ্যান ও এগজস্ট ফ্যান" },
      { value: "sub-main-cables", label: "Sub-Main / Substation Cables", labelBn: "সাব-মেইন ও মেইন কেবল" },
    ],
  },
  {
    value: "electrical-contractor",
    label: "Electrical Contractor",
    labelBn: "ইলেকট্রিক্যাল ঠিকাদার",
    color: "bg-amber-600/10 text-amber-700 border-amber-600/20",
    subCategories: [
      { value: "pipe-dropping-labour", label: "Conduit Laying & Slab Piping", labelBn: "ছাদ পাইপিং ও পাইপ ড্রপিং বিল" },
      { value: "wire-pulling-labour", label: "Wire Pulling & Circuit Wiring", labelBn: "তার টানা ও ওয়্যারিং বিল" },
      { value: "switch-light-fitting", label: "Board, Switch & Light Fixing", labelBn: "সুইচ বোর্ড ও লাইট ফিটিং বিল" },
    ],
  },
  {
    value: "grill-metal-works",
    label: "Grill, Metal & Gates",
    labelBn: "গ্রিল, গেট ও মেটাল কাজ",
    color: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    subCategories: [
      { value: "window-safety-grill", label: "Window MS Safety Grills", labelBn: "জানালার এমএস গ্রিল" },
      { value: "balcony-ss-railing", label: "Balcony / Stair SS 304 Railing", labelBn: "বারান্দা ও সিঁড়ির এসএস রেলিং" },
      { value: "main-gate-sliding", label: "Main Gate / Sliding Entrance Gate", labelBn: "মেইন গেট ও স্লাইডিং গেট" },
      { value: "collapsible-gate", label: "Collapsible Gate", labelBn: "কলাপসিবল গেট" },
      { value: "roof-parapet-grill", label: "Rooftop Parapet Safety Grills", labelBn: "ছাদের প্যারাপেট রেলিং" },
      { value: "primer-metal-paint", label: "Red Oxide Primer & Enamel Paint", labelBn: "রেড অক্সাইড প্রাইমার ও পেইন্ট" },
      { value: "fabrication-labour", label: "Grill Maker Fabrication Bill", labelBn: "গ্রিল মেকার ফ্যাব্রিকেশন বিল" },
    ],
  },
  {
    value: "tiles-flooring",
    label: "Tiles & Flooring",
    labelBn: "টাইলস ও ফ্লোরিং",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    subCategories: [
      { value: "floor-tiles", label: "Floor Tiles (Homogeneous / Vitrified)", labelBn: "ফ্লোর টাইলস" },
      { value: "wall-tiles-bath-kitchen", label: "Wall Tiles (Bath & Kitchen)", labelBn: "বাথরুম ও কিচেন ওয়াল টাইলস" },
      { value: "stair-step-tiles", label: "Stair Step & Nosing Tiles", labelBn: "সিঁড়ির টাইলস" },
      { value: "marble-granite-top", label: "Marble & Granite Slabs", labelBn: "মার্বেল ও গ্রানাইট পাথর" },
      { value: "tile-adhesive-grout", label: "Tile Adhesive & Epoxy Grout", labelBn: "টাইল আঠা ও গ্রাউটিং পাউডার" },
      { value: "tiles-mistri-bill", label: "Tiles Contractor Labour Bill", labelBn: "টাইলস মিস্ত্রি লেবার বিল" },
      { value: "marble-polish-bill", label: "Marble Cutting & Polish Bill", labelBn: "মার্বেল কাটিং ও পলিশিং বিল" },
    ],
  },
  {
    value: "paint-finishing",
    label: "Paint & Finishing",
    labelBn: "রং ও ফিনিশিং",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    subCategories: [
      { value: "wall-putty-skim", label: "Wall Putty & Skim Coat", labelBn: "ওয়াল পুটি ও স্কিম কোট" },
      { value: "primer-sealer", label: "Interior / Exterior Primer & Sealer", labelBn: "সিলার ও প্রাইমার" },
      { value: "interior-plastic-paint", label: "Interior Plastic Emulsion Paint", labelBn: "অভ্যন্তরীণ প্লাস্টিক পেইন্ট" },
      { value: "exterior-weather-coat", label: "Exterior All-Weather Coat", labelBn: "বাইরের ওয়েদার কোট পেইন্ট" },
      { value: "wood-varnish-polish", label: "Wood Polish & Varnish Materials", labelBn: "কাঠের বার্নিশ ও গালা পলিশ" },
      { value: "painter-labour-bill", label: "Painter Contractor Labour Bill", labelBn: "রং মিস্ত্রি লেবার বিল" },
    ],
  },
  {
    value: "doors-windows",
    label: "Doors & Windows",
    labelBn: "দরজা ও জানালা",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    subCategories: [
      { value: "wooden-chawkhat", label: "Wooden Door Frames (Chawkhat)", labelBn: "কাঠের চৌকাঠ" },
      { value: "solid-wood-shutters", label: "Main Entrance Solid Wood Door", labelBn: "সলিড কাঠের পাল্লা" },
      { value: "flush-veneered-doors", label: "Flush / Veneered Bedroom Doors", labelBn: "ফ্ল্যাশ ডোর ও ভিনিয়ার্ড পাল্লা" },
      { value: "pvc-waterproof-doors", label: "PVC / uPVC Waterproof Toilet Doors", labelBn: "পিভিসি ওয়াটারপ্রুফ ডোর" },
      { value: "thai-aluminum-glass", label: "Thai Aluminum Windows & Glass", labelBn: "থাই অ্যালুমিনিয়াম ও গ্লাস" },
      { value: "locks-hinges-hardware", label: "Door Locks, Handles, Hinges", labelBn: "ডোর লক, হ্যান্ডেল ও কবজা" },
      { value: "carpenter-labour-bill", label: "Carpenter Labour Bill", labelBn: "কাঠমিস্ত্রি লেবার বিল" },
      { value: "thai-fitting-bill", label: "Thai Glass Window Fitting Bill", labelBn: "থাই ফিটিং লেবার বিল" },
    ],
  },
  {
    value: "safety-security",
    label: "Safety, Fire & CCTV",
    labelBn: "সেফটি, ফায়ার ও সিসিটিভি",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    subCategories: [
      { value: "site-ppe-safety-nets", label: "PPE (Helmets, Boots) & Safety Nets", labelBn: "পিপিই ও সেফটি নেট" },
      { value: "fire-extinguisher-alarm", label: "Fire Extinguisher & Smoke Alarms", labelBn: "ফায়ার এক্সটিঙ্গুইশার ও অ্যালার্ম" },
      { value: "lightning-protection-earthing", label: "Lightning Protection & Chemical Earthing", labelBn: "বজ্রপাত নিরোধক ও আর্থিং" },
      { value: "ip-cctv-cameras", label: "IP Cameras (Bullet & Dome)", labelBn: "আইপি সিসিটিভি ক্যামেরা" },
      { value: "nvr-hard-drive", label: "NVR & Surveillance Hard Drive", labelBn: "এনভিআর ও সার্ভিল্যান্স হার্ডডিস্ক" },
      { value: "cat6-cabling-rack", label: "Cat6 Cable, PoE Switch & Rack", labelBn: "ক্যাট-৬ কেবল, পোই সুইচ ও র‍্যাক" },
      { value: "cctv-technician-bill", label: "CCTV Installation & Technician Bill", labelBn: "সিসিটিভি টেকনিশিয়ান বিল" },
      { value: "intercom-access-control", label: "Video Intercom & RFID Access", labelBn: "ভিডিও ইন্টারকম ও এক্সেস কন্ট্রোল" },
    ],
  },
  {
    value: "machinery-logistics",
    label: "Machinery & Transport",
    labelBn: "যন্ত্রপাতি ও পরিবহন",
    color: "bg-zinc-600/10 text-zinc-700 border-zinc-600/20",
    subCategories: [
      { value: "mixer-machine-rent", label: "Concrete Mixer Machine Rent", labelBn: "মিক্সার মেশিন ভাড়া" },
      { value: "vibrator-machine-rent", label: "Concrete Vibrator Machine Rent", labelBn: "ভাইব্রেটর মেশিন ভাড়া" },
      { value: "props-scaffolding-rent", label: "Steel Props & Scaffolding Rent", labelBn: "খুঁটি ও স্টিল প্রপস ভাড়া" },
      { value: "truck-pickup-freight", label: "Truck / Pickup Transport Freight", labelBn: "ট্রাক ও পিকআপ পরিবহন ভাড়া" },
      { value: "generator-rent-fuel", label: "Generator Rental & Fuel", labelBn: "জেনারেটর ভাড়া ও ডিজেল" },
      { value: "hand-tools-purchase", label: "Trolleys, Shovels, Buckets", labelBn: "ট্রলি, বেলচা ও ছোট টুলস" },
    ],
  },
  {
    value: "in-house-technical",
    label: "In-House & Technical",
    labelBn: "ইন-হাউস ও টেকনিক্যাল",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    subCategories: [
      { value: "engineer-supervisor-salary", label: "Site Engineer & Supervisor Salary", labelBn: "সাইট ইঞ্জিনিয়ার স্যালারি" },
      { value: "site-visit-travel", label: "Site Visit Car Fuel & Toll", labelBn: "সাইট ভিজিট জ্বালানি ও যাতায়াত" },
      { value: "drawing-plotting-print", label: "CAD Drawing Plotting & Printing", labelBn: "ব্লু-প্রিন্ট ও ড্রয়িং প্লটিং" },
      { value: "soil-test-lab-fees", label: "Soil Test & Concrete Cube Test Fee", labelBn: "সয়েল টেস্ট ও কিউব টেস্ট ফি" },
      { value: "architectural-design-fee", label: "Consultancy & Design Team Overhead", labelBn: "ডিজাইন ও কনসালটেন্সি খরচ" },
    ],
  },
  {
    value: "regulatory-overheads",
    label: "Regulatory & Overheads",
    labelBn: "অনুমোদন ও সাইট বিবিধ",
    color: "bg-stone-500/10 text-stone-700 border-stone-500/20",
    subCategories: [
      { value: "rajuk-municipal-fees", label: "RAJUK / Pourashava Plan Approval Fee", labelBn: "রাজউক / পৌরসভা প্ল্যান পাস ফি" },
      { value: "utility-connection-fees", label: "Electricity / WASA Connection Fee", labelBn: "বিদ্যুৎ ও পানি সংযোগ ফি" },
      { value: "site-shed-office", label: "Labour Shed & Temporary Site Office", labelBn: "লেবার শেড ও সাইট অফিস নির্মাণ" },
      { value: "site-tea-refreshment", label: "Site Tea & Entertainment Overhead", labelBn: "সাইট চা-নাস্তা ও আপ্যায়ন" },
      { value: "security-guard-salary", label: "Night Security Guard Salary", labelBn: "সাইট গার্ড বেতন" },
      { value: "miscellaneous-overhead", label: "Emergency & Miscellaneous Overhead", labelBn: "অন্যান্য বিবিধ খরচ" },
    ],
  },
  // Backward compatibility with legacy categories:
  {
    value: "site-visit",
    label: "Site Visit & Transport (Legacy)",
    labelBn: "সাইট ভিজিট (পুরাতন)",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    subCategories: [],
  },
  {
    value: "rajuk-municipal",
    label: "RAJUK / Municipal Fee (Legacy)",
    labelBn: "রাজউক ফি (পুরাতন)",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    subCategories: [],
  },
  {
    value: "printing-plotting",
    label: "Printing & Plotting (Legacy)",
    labelBn: "প্রিন্টিং ও প্লটিং (পুরাতন)",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    subCategories: [],
  },
  {
    value: "staff-salary",
    label: "Staff & Salary (Legacy)",
    labelBn: "স্টাফ স্যালারি (পুরাতন)",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    subCategories: [],
  },
  {
    value: "office-utility",
    label: "Office Utility (Legacy)",
    labelBn: "অফিস ইউটিলিটি (পুরাতন)",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    subCategories: [],
  },
  {
    value: "equipment-software",
    label: "Equipment & Software (Legacy)",
    labelBn: "সফটওয়্যার ও ইকুইপমেন্ট (পুরাতন)",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    subCategories: [],
  },
  {
    value: "marketing",
    label: "Marketing & Ads (Legacy)",
    labelBn: "মার্কেটিং (পুরাতন)",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    subCategories: [],
  },
  {
    value: "other",
    label: "Other Expenses",
    labelBn: "অন্যান্য খরচ",
    color: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    subCategories: [],
  },
];

export function getCategoryDef(categoryValue: string): ExpenseCategoryDef | undefined {
  return EXPENSE_CATEGORIES.find((c) => c.value === categoryValue);
}

export function getCategoryLabel(categoryValue: string): string {
  const cat = getCategoryDef(categoryValue);
  return cat ? `${cat.label} (${cat.labelBn})` : categoryValue;
}

export function getSubCategoryLabel(categoryValue: string, subCategoryValue?: string): string {
  if (!subCategoryValue) return "—";
  const cat = getCategoryDef(categoryValue);
  if (!cat) return subCategoryValue;
  const sub = cat.subCategories.find((s) => s.value === subCategoryValue);
  return sub ? `${sub.labelBn} / ${sub.label}` : subCategoryValue;
}
