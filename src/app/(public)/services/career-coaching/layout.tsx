import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Coaching",
  description: "One-on-one career coaching with experienced professionals.",
  alternates: { canonical: "/services/career-coaching" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
