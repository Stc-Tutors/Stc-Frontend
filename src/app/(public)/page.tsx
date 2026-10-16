import HomeSlideshow from '../components/HomeSlideshow';
import Hero from '../components/Hero';
import CommunitySection from '../components/CommunitySection';
import TutorsSection from '../components/TutorsSection';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import CareersTeaser from '../components/CareersTeaser';
import Footer from '../components/Footer';
import PageFaq from '@/components/faq-section';
import { PageSectionKey } from '@/types/content';

export default function HomePage() {
  return (
    <>
      <main>
        <HomeSlideshow />
        <Hero />
        <CommunitySection />
        <TutorsSection />
        <Features />
        <Testimonials />
        <PageFaq sectionKey={PageSectionKey.FAQ_HOME} />
        <CareersTeaser />
        <CTA />
      </main>
      <Footer />

    </>
  );
}
