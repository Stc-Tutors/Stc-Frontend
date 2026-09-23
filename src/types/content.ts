// Mirrors Stc-SuperAdmin's src/types/content.ts exactly - keep both in sync
// when adding a section. See stcbe's PageSectionKey enum for the source of truth.
export enum PageSectionKey {
  HERO = "HERO",
  HEADER = "HEADER",
  FOOTER = "FOOTER",
  HEAD_SEO = "HEAD_SEO",
  FEATURES = "FEATURES",
  CTA = "CTA",
  COMMUNITY = "COMMUNITY",
  ABOUT_HEADLINE = "ABOUT_HEADLINE",
  ABOUT_HISTORY = "ABOUT_HISTORY",
  ABOUT_MISSION = "ABOUT_MISSION",
  ABOUT_APPROACH = "ABOUT_APPROACH",
  SERVICES_INTRO = "SERVICES_INTRO",
  CONTACT_INFO = "CONTACT_INFO",
  CAREERS_INTRO = "CAREERS_INTRO",
  CAREERS_TEASER = "CAREERS_TEASER",
}

export interface PageSection {
  id: string;
  sectionKey: PageSectionKey;
  data: Record<string, unknown>;
}

export interface HeroContent {
  headline: string;
  // Rendered highlighted (accent color) between headline and headlineSuffix
  // - e.g. headline="Empowering", highlightText="Learners,",
  // headlineSuffix="Anywhere, Anytime" reproduces "Empowering **Learners,**
  // Anywhere, Anytime". Leave highlightText blank to skip the styled span.
  highlightText?: string;
  headlineSuffix?: string;
  body: string;
  imageUrl: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSocialLink {
  platform: string;
  url: string;
}

// The logo isn't part of this: it comes from the tenant's own branding
// (Navbar.tsx), not from platform-owned marketing content.
export interface HeaderContent {
  navLinks: FooterLink[];
  ctaText: string;
  ctaLink: string;
}

export interface FooterContent {
  copyrightName: string;
  socialLinks: FooterSocialLink[];
  companyLinks: FooterLink[];
}

export interface HeadSeoContent {
  siteTitle: string;
  description: string;
  ogImageUrl?: string;
}

export interface FeatureStep {
  title: string;
  description: string;
  icon: string;
}

export interface FeaturesContent {
  title: string;
  subtitle: string;
  steps: FeatureStep[];
}

export interface CTAGrade {
  subject: string;
  score: string;
}

export interface CTAContent {
  imageUrl: string;
  headline: string;
  subtext: string;
  overallGrade?: string;
  grades: CTAGrade[];
}

export interface CommunityContent {
  eyebrow: string;
  title: string;
  highlightText?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  images: string[];
}

export interface AboutHeadlineContent {
  title: string;
  paragraphs: string[];
}

export interface AboutHistoryContent {
  heading: string;
  body: string;
  imageUrl: string;
}

export interface AboutMissionContent {
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
}

export interface AboutApproachContent {
  approachTitle: string;
  approachItems: string[];
  whyChooseTitle: string;
  whyChooseItems: string[];
}

export interface ServicesIntroFeature {
  icon: string;
  text: string;
}

export interface ServicesIntroContent {
  heading: string;
  body: string;
  imageUrl: string;
  features: ServicesIntroFeature[];
}

export interface ContactSocialLink {
  platform: string;
  url: string;
}

export interface ContactInfoContent {
  phones: string[];
  emails: string[];
  address?: string;
  hours?: string;
  socialLinks: ContactSocialLink[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  behance?: string;
  github?: string;
}

export interface ServiceFeature {
  icon?: string;
  title: string;
  description?: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceCourse {
  name: string;
  items?: string[];
}

export interface ServiceHowItWorksStep {
  step: string;
  description: string;
}

export interface ServiceTestimonial {
  quote: string;
  author: string;
}

export interface ServicePage {
  id: string;
  slug: string;
  heroImageUrl?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  overview?: string;
  // YouTube URL (any watch/youtu.be/embed form). Empty/null hides the whole
  // video section - never render a broken or empty player.
  videoUrl?: string | null;
  keyFeatures: ServiceFeature[];
  // Course/bundle listing - only for services sold as discrete courses or
  // bundles (e.g. Digital Skills). Omit entirely for services without one.
  courses?: ServiceCourse[];
  benefits: ServiceBenefit[];
  // "Who this is for" bullet list. Optional - thinner services skip it.
  whoFor?: string[];
  howItWorks: ServiceHowItWorksStep[];
  testimonials: ServiceTestimonial[];
  ctaLabel?: string;
  // Copy for the closing CTA banner, distinct from the hero CTA (ctaLabel).
  // Falls back to a generic closing line when unset.
  secondaryCtaLabel?: string;
}

export interface ServicePricingPlan {
  name: string;
  price: string;
  billingNote?: string;
  features?: string[];
}

// Single content shape every /services/:slug page renders from. Same fields
// as ServicePage minus id/slug, which the page/route supplies separately,
// plus a handful of template-only fields that aren't part of the
// CMS-synced ServicePage record (not admin-editable yet) - these exist for
// pages that deviate from the individual-student self-enroll model, like
// b2b-white-label-lms.
export type ServiceContent = Omit<ServicePage, "id" | "slug"> & {
  // When set, both CTAs render as a plain link to this href (e.g. a mailto:
  // link) instead of routing through RegisterCTA's individual-student
  // enroll/register flow - for sales-motion services where "register"
  // doesn't apply.
  ctaHref?: string;
  // Pricing/plans as their own section, rendered after Benefits. Omit
  // entirely for services that don't show pricing publicly.
  pricing?: ServicePricingPlan[];
  // Overrides the Testimonials section heading (defaults to "Testimonials")
  // - e.g. "Case Studies & Partners" for B2B-style pages.
  testimonialsHeading?: string;
  // Overrides the closing CTA banner's heading/body (defaults to "Ready to
  // Get Started?" / "Join STC Tutors today...") for pages where that
  // individual-student framing doesn't fit.
  closingHeading?: string;
  closingBody?: string;
};

export interface FeaturedTutor {
  id: string;
  tutor: { id: string; firstName: string; lastName: string; avatarUrl?: string } | string;
  bio?: string;
  teachingCombinations: { subjectsTaught: string[] }[];
  yearsOfExperience?: number;
  rating: { averageRating: number; totalRatings: number };
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  program?: string;
  imageUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl?: string;
  author?: string;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CareersIntroContent {
  heading: string;
  body: string;
  // "Who we are" - framed for a candidate audience, distinct from
  // ABOUT_HEADLINE's student-facing copy.
  aboutHeading: string;
  aboutBody: string;
  // "The kind of tutors/staff we look for" - bullet list.
  lookingForHeading: string;
  lookingForItems: string[];
  // "Why join us" - bullet list.
  whyJoinHeading: string;
  whyJoinItems: string[];
}

// The homepage's "We're hiring" teaser - a short pointer at the full
// /careers page, not a duplicate of CareersIntroContent's fuller copy.
export interface CareersTeaserContent {
  heading: string;
  body: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
}

export enum JobEmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
  VOLUNTEER = "VOLUNTEER",
  // Revenue-share/equity-style operating partnerships - not an employment
  // relationship at all, so it doesn't fit any of the above.
  PARTNERSHIP = "PARTNERSHIP",
}

export interface JobOpening {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: JobEmploymentType;
  summary: string;
  description: string;
  requirements: string[];
  // The standing "Become a Tutor" listing - its Apply button routes to
  // /auth/apply-tutor instead of the generic application form below.
  isTutorRole: boolean;
}

export enum JobOpeningQuestionFieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  DROPDOWN = "DROPDOWN",
  CHECKBOX = "CHECKBOX",
  DATE = "DATE",
  NUMBER = "NUMBER",
}

// Per-opening extra apply-form questions a Super Admin can attach to any
// JobOpening - e.g. "Which vertical are you interested in?" on Operating
// Partner. An opening with none just gets the plain apply form.
export interface JobOpeningQuestion {
  id: string;
  jobOpening: string;
  label: string;
  fieldType: JobOpeningQuestionFieldType;
  options?: string[];
  required: boolean;
  order: number;
}

export enum CareerApplicationStatus {
  NEW = "NEW",
  REVIEWED = "REVIEWED",
  SHORTLISTED = "SHORTLISTED",
  REJECTED = "REJECTED",
  HIRED = "HIRED",
}

export interface CareerApplication {
  id: string;
  jobOpening: { id: string; title: string; slug: string } | string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  coverLetter?: string;
  status: CareerApplicationStatus;
  createdAt: string;
}
