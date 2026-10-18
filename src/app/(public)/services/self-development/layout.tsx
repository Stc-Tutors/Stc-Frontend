import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Self Development",
  description: "Personal growth and development programmes taught live online.",
  alternates: { canonical: "/services/self-development" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
