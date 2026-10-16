import type { Metadata } from "next";
import AcademicSection from "./AcademicSession";
import ServicesSection from "./services";
import Footer from "@/app/components/Footer"
import PageFaq from "@/components/faq-section";
import { PageSectionKey } from "@/types/content";
// import YouTubePlayer from "../components/YouTubePlayer";

export const metadata: Metadata = {
  title: "Our Services",
};

export default function Home() {
    return (
      <>
        <main>
          <ServicesSection />
          <AcademicSection />
          <PageFaq sectionKey={PageSectionKey.FAQ_SERVICES} />
        </main>
        <Footer />
      </>
    );
  }