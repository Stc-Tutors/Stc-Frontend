import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Skills",
  description: "Practical digital skills training taught live online.",
  alternates: { canonical: "/services/digital-skills" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
