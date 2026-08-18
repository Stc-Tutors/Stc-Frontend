"use client";
import Image from "next/image";
import { usePageSection } from "@/hooks/use-page-section";
import { AboutHistoryContent, PageSectionKey } from "@/types/content";

const DEFAULT_HISTORY: AboutHistoryContent = {
  heading: "History & Mission",
  body: "Founded in 2024, STC Tutors began as a mission-driven virtual education platform. We aim to equip students across multiple education systems, including Nigeria, the UK, the USA, and Canada, with the skills to succeed academically, professionally, and personally. What started as a lean academic tutoring initiative has expanded into a multi-disciplinary online academy.",
  imageUrl: "/image/about.jpg",
};

const History = () => {
  const content = usePageSection(PageSectionKey.ABOUT_HISTORY, DEFAULT_HISTORY);

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">{content.heading}</h2>
            <p className="mt-6 text-gray-700 italic leading-relaxed">{content.body}</p>
          </div>

          <div className="relative">
            <Image src={content.imageUrl} alt="Tutoring session" width={600} height={400} className="rounded-lg shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;
