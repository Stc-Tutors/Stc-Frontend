import type { Metadata } from "next";
import Contact from "./contact";
import Footer from "@/app/components/Footer"
import PageFaq from "@/components/faq-section";
import { PageSectionKey } from "@/types/content";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function Home() {
    return (
      <>
      <main>
        <Contact />
        <PageFaq sectionKey={PageSectionKey.FAQ_CONTACT} />
      </main>
      <Footer />
      </>
    );
  }