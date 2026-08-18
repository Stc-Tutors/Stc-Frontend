"use client";
import { usePageSection } from "@/hooks/use-page-section";
import { AboutApproachContent, PageSectionKey } from "@/types/content";

const DEFAULT_APPROACH: AboutApproachContent = {
  approachTitle: "Our Approach",
  approachItems: [
    "Learner-centric: Custom paths tailored to grade level, age, and personal goals.",
    "Quality-guaranteed: All instructors are thoroughly vetted, trained, and re-vetted by STC.",
    "Privacy-first: Student-tutor connections happen through secure, admin-managed tools.",
    "Global-ready: Present in Nigeria, UK, US, Canada, designed for global standards.",
  ],
  whyChooseTitle: "Why Choose Us?",
  whyChooseItems: [
    "Fully virtual, learn anytime, anywhere.",
    "Cross-border curriculum coverage.",
    "Free monthly group counseling webinars.",
    "Secure platform ensuring student and tutor privacy.",
    "Transparent pricing, no hidden fees, no direct payments.",
  ],
};

const Approach = () => {
  const content = usePageSection(PageSectionKey.ABOUT_APPROACH, DEFAULT_APPROACH);

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-orange-600">Our Values and Approach</h3>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{content.approachTitle}</h2>
            <ul className="list-disc pl-4">
              {content.approachItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-orange-600">{content.whyChooseTitle}</h3>
            <ul className="list-disc pl-5">
              {content.whyChooseItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;
