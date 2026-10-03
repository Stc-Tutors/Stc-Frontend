// Mirrors stcbe's ICampaignLandingPage - a dedicated, admin-managed signup
// page for one marketing campaign (Site Content Manager's Landing Pages
// tab). The service/cohort are locked by the admin; the price is never
// stored here, only ever resolved live via /pricing/quote.
export interface CampaignLandingPage {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  serviceType: string;
  // FLOW_TREE (the default): enroll via a plain curriculum-tree pick, no
  // Course involved - taxonomyNodeId, if set, locks the visitor's starting
  // point (any depth). COURSE: enroll into a full Course - courseId, if
  // set, locks a specific one; course browsing needs auth either way.
  pricingMode: "FLOW_TREE" | "COURSE";
  courseId?: string;
  taxonomyNodeId?: string;
  classGroupId?: string;
  heroImageUrl?: string;
  heading: string;
  subheading?: string;
  body: string;
  scheduleNote?: string;
  benefits: string[];
  ctaLabel: string;

  promoLabel?: string;
  promoDeadline?: string;
  promoCouponCode?: string;
  stats?: { value: string; label: string }[];
  howItWorks?: { title: string; description: string }[];
  faqs?: { question: string; answer: string }[];
  testimonials?: { quote: string; name: string; location?: string }[];
}
