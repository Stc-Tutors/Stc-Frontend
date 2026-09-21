import type { Metadata } from "next";
import Footer from "@/app/components/Footer";
import LegalDocument from "@/components/legal/LegalDocument";
import { GetSiteContentAction } from "@/server/site-content";
import { LEGAL_LAST_UPDATED, TERMS_CONTENT_KEY, TERMS_INTRO, TERMS_SECTIONS, type LegalSection } from "@/constants/legal-content";
import { formatDate } from "@/lib/datetime";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms for using STC Tutors as a parent, student or tutor.",
};

// Terms a Super Admin has saved in Site Content win over the built-in wording (the sign-in Terms gate reads the
// same entry), so the page and the gate always agree. Blank-line-separated blocks become paragraphs.
function sectionsFromCmsText(text: string): LegalSection[] {
  return [
    {
      id: "terms",
      heading: "Terms & Conditions",
      paragraphs: text
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean),
    },
  ];
}

export default async function TermsPage() {
  const [res] = await GetSiteContentAction();
  const cms = res?.data?.find((entry) => entry.key === TERMS_CONTENT_KEY);
  const cmsText = cms?.value?.trim();

  return (
    <>
      <main>
        <LegalDocument
          title="Terms & Conditions"
          intro={cmsText ? "" : TERMS_INTRO}
          lastUpdated={cmsText && cms?.updatedAt ? formatDate(cms.updatedAt) : LEGAL_LAST_UPDATED}
          sections={cmsText ? sectionsFromCmsText(cmsText) : TERMS_SECTIONS}
          otherDocument={{ href: "/privacy", label: "Privacy Policy" }}
        />
      </main>
      <Footer />
    </>
  );
}
