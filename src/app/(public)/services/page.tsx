import type { Metadata } from "next";
import AcademicSection from "./AcademicSession";
import ServicesSection from "./services";
import Footer from "@/app/components/Footer"
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
        </main>
        <Footer />
      </>
    );
  }