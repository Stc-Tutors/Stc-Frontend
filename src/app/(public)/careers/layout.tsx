import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the team: open roles and partnership opportunities.",
  alternates: { canonical: "/careers" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
