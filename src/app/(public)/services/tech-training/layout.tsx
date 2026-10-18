import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Training",
  description: "Coding and technology training for kids and adults.",
  alternates: { canonical: "/services/tech-training" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
