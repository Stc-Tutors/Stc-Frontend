import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "White-label LMS for Organisations",
  description: "Run your own branded tutoring platform on our learning management system.",
  alternates: { canonical: "/services/b2b-white-label-lms" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
