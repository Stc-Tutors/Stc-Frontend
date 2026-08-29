"use client";
import { usePageSection } from "@/hooks/use-page-section";
import { AboutMissionContent, PageSectionKey } from "@/types/content";
import { sanitizeRichText } from "@/lib/sanitize-html";

const DEFAULT_MISSION: AboutMissionContent = {
  missionTitle: "We bridge the gap between students and educators",
  missionBody:
    "To connect learners with qualified educators and deliver accessible, high-quality academic and personal development programs through a secure and supportive virtual platform. We aim to promote excellence, foster confidence, and empower individuals of all ages to thrive in school, in their careers, and life.",
  visionTitle: "We make quality tutoring accessible to everyone",
  visionBody:
    "To become a global leader in virtual education, making personalized tutoring, skill training, mentorship universally accessible, and equipping learners with the tools they need to succeed in a rapidly evolving world.",
};

const MissionVision = () => {
  const content = usePageSection(PageSectionKey.ABOUT_MISSION, DEFAULT_MISSION);

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-orange-600">Our Mission</h3>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{content.missionTitle}</h2>
            <p className="mt-4 text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeRichText(content.missionBody) }} />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-orange-600">Our Vision</h3>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{content.visionTitle}</h2>
            <p className="mt-4 text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeRichText(content.visionBody) }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
