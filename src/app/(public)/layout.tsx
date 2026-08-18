import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { GetPageSectionsAction } from "@/server/content";
import { HeadSeoContent, PageSectionKey } from "@/types/content";

const DEFAULT_HEAD_SEO: HeadSeoContent = {
  siteTitle: "STC Tutors",
  description: "Personalized online tutoring platform",
};

// Scoped to the (public) marketing route group only - the authenticated LMS
// pages under (protected)/lms-home keep the root layout's static metadata
// instead of this admin-managed one, since "site title/description" here
// specifically means the marketing site.
export async function generateMetadata(): Promise<Metadata> {
  const [res] = await GetPageSectionsAction();
  const match = res?.data?.find((s) => s.sectionKey === PageSectionKey.HEAD_SEO);
  const data = { ...DEFAULT_HEAD_SEO, ...(match?.data ?? {}) } as HeadSeoContent;

  return {
    title: data.siteTitle,
    description: data.description,
    openGraph: {
      title: data.siteTitle,
      description: data.description,
      images: data.ogImageUrl ? [data.ogImageUrl] : undefined,
    },
  };
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}