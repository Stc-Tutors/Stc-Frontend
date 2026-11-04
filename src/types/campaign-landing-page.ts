// Mirrors stcbe's ICampaignLandingPage - a dedicated, admin-managed signup
// page for one marketing campaign (Site Content Manager's Landing Pages
// tab). The service/cohort are locked by the admin; the price is never
// stored here, only ever resolved live via /pricing/quote.
export interface CampaignQuestion {
  id: string;
  label: string;
  fieldType: "TEXT" | "TEXTAREA" | "DROPDOWN" | "CHECKBOX" | "DATE" | "NUMBER";
  options?: string[];
  required: boolean;
}

export interface CampaignLandingPage {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  // Absent on a SPECIAL_COURSE page.
  serviceType?: string;
  // FLOW_TREE (the default): enroll via a plain curriculum-tree pick, no
  // Course involved - taxonomyNodeId, if set, locks the visitor's starting
  // point (any depth). COURSE: enroll into a full Course - courseId, if
  // set, locks a specific one; course browsing needs auth either way.
  // SPECIAL_COURSE: enrolls into one standalone Special Course (courseId) at
  // the course's own flat price (see specialCourse below).
  pricingMode: "FLOW_TREE" | "COURSE" | "SPECIAL_COURSE";
  // Who fills in the form: a parent registering a child (default), or a
  // student registering themselves (no parent step; signup age rules apply).
  registrantType?: "PARENT" | "STUDENT";
  // SPECIAL_COURSE only: take payment on the page right after sign-up (default)
  // or leave it to the dashboard.
  payOnPage?: boolean;
  // Optional built-in fields switched off for this page: gender, primaryLanguage,
  // couponCode, referralCode.
  hiddenFields?: string[];
  customQuestions?: CampaignQuestion[];
  specialCourse?: {
    id: string;
    title: string;
    price: number;
    currency: string;
    // Prices for specific countries (keyed by the country option value) - override price/currency for them.
    countryPrices?: { country: string; currency: string; amount: number }[];
  };
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
