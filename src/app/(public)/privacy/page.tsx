import type { Metadata } from "next";
import Footer from "@/app/components/Footer";
import LegalDocument from "@/components/legal/LegalDocument";
import { LEGAL_LAST_UPDATED, PRIVACY_INTRO, PRIVACY_SECTIONS } from "@/constants/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal information STC Tutors collects, why, who it is shared with, and your rights.",
};

export default function PrivacyPage() {
  return (
    <>
      <main>
        <LegalDocument
          title="Privacy Policy"
          intro={PRIVACY_INTRO}
          lastUpdated={LEGAL_LAST_UPDATED}
          sections={PRIVACY_SECTIONS}
          otherDocument={{ href: "/terms", label: "Terms & Conditions" }}
        />
      </main>
      <Footer />
    </>
  );
}
