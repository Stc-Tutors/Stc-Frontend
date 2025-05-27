import AcademicSection from "./AcademicSession";
import ServicesSection from "./services";
import Footer from "@/app/components/Footer"
import YouTubePlayer from "../components/YouTubePlayer";

export default function Home() {
    return (
      <>
        <ServicesSection />
        <AcademicSection />
        <Footer />
      </>
    );
  }