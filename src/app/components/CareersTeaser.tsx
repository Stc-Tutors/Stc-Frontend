"use client";
import Link from "next/link";
import Image from "next/image";
import { usePageSection } from "@/hooks/use-page-section";
import { CareersTeaserContent, PageSectionKey } from "@/types/content";

const DEFAULT_CAREERS_TEASER: CareersTeaserContent = {
  heading: "We're Hiring",
  body: "Join a global team building the future of online education - as a tutor or across our wider staff.",
  buttonText: "Become a Tutor",
  buttonLink: "/auth/apply-tutor",
  secondaryButtonText: "View Other Openings",
  secondaryButtonLink: "/careers",
  imageUrl: "/image/happy.jpg",
};

const CareersTeaser = () => {
  const content = usePageSection(PageSectionKey.CAREERS_TEASER, DEFAULT_CAREERS_TEASER);

  return (
    <section className="py-16 px-8 bg-[#38b6ff]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {content.imageUrl && (
          <div className="flex-1">
            <Image
              src={content.imageUrl}
              alt={content.heading}
              width={500}
              height={350}
              className="w-full rounded-lg object-cover"
            />
          </div>
        )}
        <div className="flex-1 text-white text-center md:text-left">
          <h2 className="text-3xl font-bold mb-3">{content.heading}</h2>
          <p className="text-white/90 mb-6 max-w-md mx-auto md:mx-0">{content.body}</p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link
              href={content.buttonLink}
              className="inline-block bg-white text-[#38b6ff] px-6 py-3 rounded-md font-semibold hover:bg-blue-100 transition"
            >
              {content.buttonText}
            </Link>
            <Link
              href={content.secondaryButtonLink}
              className="inline-block border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white/10 transition"
            >
              {content.secondaryButtonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareersTeaser;
