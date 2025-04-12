import About from "./about";
import MissionVision from "./mission";
import MeetOurCEO from "./MeetOurCEO";
import TeamSection from './TeamSection';
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <About />
      <MissionVision />
      <MeetOurCEO />
      <TeamSection />
      <Footer />
    </>
  );
}
