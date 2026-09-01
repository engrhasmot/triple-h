export const SITE_CONFIG = {
  name: 'TRIPLE H PLANDRAFT & ENGINEERING',
  shortName: 'Triple H',
  slogan: 'পরিকল্পিত নকশা, নিরাপদ নির্মাণ',
  sloganEn: 'Planned Design, Safe Construction',
  description:
    'Professional civil engineering consultancy specializing in 2D/3D architectural design, structural drafting, BOQ estimation, plan passing, and site supervision in Bangladesh.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801778506500',
  email: 'info@triplehengineering.com',
  phone: '+880-1XXX-XXXXXX',
  address: 'Dhaka, Bangladesh',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Cost Estimator', href: '/cost-estimator' },
  { label: 'Track Plan', href: '/track-plan' },
  { label: 'Book Appointment', href: '/book-appointment' },
  { label: 'Contact', href: '/contact' },
] as const;

export const SERVICES = [
  {
    id: '2d-drafting',
    title: '2D Architectural & Structural Drafting',
    description:
      'Precise floor plans, elevations, sections, and structural drawings compliant with local building codes.',
    icon: 'Ruler',
  },
  {
    id: '3d-design',
    title: '3D Exterior & Interior Design',
    description:
      'Photorealistic 3D renders of building exteriors and interior spaces for client visualization.',
    icon: 'Box',
  },
  {
    id: 'boq-estimation',
    title: 'BOQ & Cost Estimation',
    description:
      'Detailed Bill of Quantities and cost breakdowns for construction budget planning.',
    icon: 'Calculator',
  },
  {
    id: 'plan-passing',
    title: 'Plan Passing & Approval',
    description:
      'End-to-end assistance with RAJUK and local authority plan submission and approval process.',
    icon: 'FileCheck',
  },
  {
    id: 'site-supervision',
    title: 'Site Supervision',
    description:
      'On-site quality monitoring and construction supervision to ensure structural integrity.',
    icon: 'HardHat',
  },
  {
    id: 'consultation',
    title: 'Engineering Consultation',
    description:
      'Expert advice on structural feasibility, material selection, and construction planning.',
    icon: 'MessageSquare',
  },
] as const;

/**
 * Construction cost rates per sq. ft. (in BDT) for the BOQ estimator.
 * These are approximate ranges used for initial client estimates.
 */
export const COST_RATES = {
  standard: {
    foundation: { min: 350, max: 450 },
    structural: { min: 800, max: 1000 },
    finishing: { min: 450, max: 600 },
  },
  premium: {
    foundation: { min: 450, max: 600 },
    structural: { min: 1000, max: 1400 },
    finishing: { min: 700, max: 1000 },
  },
  luxury: {
    foundation: { min: 600, max: 800 },
    structural: { min: 1400, max: 2000 },
    finishing: { min: 1000, max: 1600 },
  },
} as const;

export const PROJECT_CATEGORIES = [
  { value: '2d-plan', label: '2D Plans' },
  { value: '3d-exterior', label: '3D Exterior' },
  { value: '3d-interior', label: '3D Interior' },
  { value: 'construction', label: 'Construction Sites' },
] as const;
