import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Tutoring",
  description: "Live one-on-one and group online tutoring across curricula, matched to your child by vetted tutors.",
  alternates: { canonical: "/services/academic-tutoring" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
