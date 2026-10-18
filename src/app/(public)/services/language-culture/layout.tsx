import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Language and Culture",
  description: "Learn languages and culture online with native and expert tutors.",
  alternates: { canonical: "/services/language-culture" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
