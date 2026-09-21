import type { Metadata } from "next";
import Contact from "./contact";
import Footer from "@/app/components/Footer"

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function Home() {
    return (
      <>
      <main>
        <Contact />
      </main>
      <Footer />
      </>
    );
  }