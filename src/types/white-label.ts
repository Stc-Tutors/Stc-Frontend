import { ServiceBenefit, ServiceFeature, ServiceHowItWorksStep, ServiceTestimonial } from "./content";
import { ServiceCatalogStatus } from "./service-catalog";

// The B2B White-Label LMS offering - formerly Service Catalog entry SRV-009
// (ArchitecturalPath.TENANT_DEPLOYMENT), now its own singleton fetched from
// /public/white-label instead of the generic Service Catalog/ServicePage
// endpoints. See src/app/(public)/services/b2b-white-label-lms/page.tsx.
export interface WhiteLabelOffering {
  id: string;
  heroImageUrl?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  overview?: string;
  videoUrl?: string | null;
  keyFeatures: ServiceFeature[];
  benefits: ServiceBenefit[];
  whoFor?: string[];
  howItWorks: ServiceHowItWorksStep[];
  testimonials: ServiceTestimonial[];
  ctaLabel?: string;
  secondaryCtaLabel?: string;
  // Anything other than Active shows "Coming Soon" instead of the real page.
  status: ServiceCatalogStatus;
}
