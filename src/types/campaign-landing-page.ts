// Mirrors stcbe's ICampaignLandingPage - a dedicated, admin-managed signup
// page for one marketing campaign (Site Content Manager's Landing Pages
// tab). The service/course/cohort/age-range are locked by the admin; the
// price is never stored here, only ever resolved live via /pricing/quote.
export interface CampaignLandingPage {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  serviceType: string;
  courseId?: string;
  classGroupId?: string;
  ageLevel?: string;
  heroImageUrl?: string;
  heading: string;
  subheading?: string;
  body: string;
  scheduleNote?: string;
  benefits: string[];
  ctaLabel: string;
}
