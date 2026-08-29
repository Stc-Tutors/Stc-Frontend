"use client";
import { usePageSection } from "@/hooks/use-page-section";
import { AboutHeadlineContent, PageSectionKey } from "@/types/content";
import { sanitizeRichText } from "@/lib/sanitize-html";

const DEFAULT_HEADLINE: AboutHeadlineContent = {
  title: "About STC Tutors - Shaping Tomorrow's Champion",
  paragraphs: [
    "At STC Edu Consult, an education initiative of Statcomm TC Limited, we are redefining the future of learning by seamlessly connecting students to qualified, carefully vetted tutors through a secure and user-friendly virtual platform. With a focus on learners in Nigeria, Africa, the UK, the USA, Canada, and worldwide, we're building a global education ecosystem that prioritizes accessibility, quality, and impact.",
    "Our services span primary, secondary, and post-secondary tutoring, adult education, and language learning across major world languages and African languages. We also offer specialized skill-building courses in areas such as tech skill development for kids between the ages of 5 and 20 years, in partnership with top tech institutions, as well as soft skills and career readiness.",
    "Beyond academics, we take a wholesome approach to student success, offering monthly counseling sessions, career talks, and live engagement events to promote well-being and clarity of purpose.",
    "Our fully integrated Learning Management System (LMS) provides tailored dashboards for students and parents/guardians, ensuring seamless class access, performance tracking, and real-time communication, all designed to support learning at every step.",
  ],
};

const Headline = () => {
  const content = usePageSection(PageSectionKey.ABOUT_HEADLINE, DEFAULT_HEADLINE);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{content.title}</h2>
          {content.paragraphs.map((p, i) => (
            <p key={i} className="mt-6 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeRichText(p) }} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Headline;
