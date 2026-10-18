import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soft Skills",
  description: "Communication, leadership and teamwork skills training.",
  alternates: { canonical: "/services/soft-skill" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
