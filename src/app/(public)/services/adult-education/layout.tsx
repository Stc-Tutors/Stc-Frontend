import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adult Education",
  description: "Online courses and tutoring for adult learners, taught live by vetted tutors.",
  alternates: { canonical: "/services/adult-education" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
