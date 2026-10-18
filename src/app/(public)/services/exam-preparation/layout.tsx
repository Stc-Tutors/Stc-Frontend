import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Preparation",
  description: "Targeted exam preparation with mock tests and expert tutors.",
  alternates: { canonical: "/services/exam-preparation" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
