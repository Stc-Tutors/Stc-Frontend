import Hero from '../components/Hero';
import CommunitySection from '../components/CommunitySection';
import TutorsSection from '../components/TutorsSection';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <CommunitySection />
        <TutorsSection />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />

    </>
  );
}
