// Mirrors Stc-SuperAdmin's src/types/content.ts exactly - keep both in sync
// when adding a section. See stcbe's PageSectionKey enum for the source of truth.
export enum PageSectionKey {
  HERO = "HERO",
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
  phone: string;
  email: string;
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

// Single content shape every /services/:slug page renders from. Same fields
// as ServicePage minus id/slug, which the page/route supplies separately.
export type ServiceContent = Omit<ServicePage, "id" | "slug">;

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
