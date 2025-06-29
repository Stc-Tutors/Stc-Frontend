import Headline from "./headline";
import History from "./history"
import About from "./about";
import MissionVision from "./mission";
import Approach from "./approach";
// import MeetOurCEO from "./MeetOurCEO";
import TeamSection from './TeamSection';
import CallToAction from "@/app/components/CallToAction";
import Footer from "../../components/Footer";


export default function Home() {
  return (
    <>
      <Headline />
      <History />
      <About />
      <MissionVision />
      <Approach />
      {/* <MeetOurCEO /> */}
      <TeamSection />
      <CallToAction />
      <Footer />
    </>
  );
}
