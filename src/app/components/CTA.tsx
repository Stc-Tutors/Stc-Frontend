"use client";
import Image from "next/image";
import { usePageSection } from "@/hooks/use-page-section";
import { CTAContent, PageSectionKey } from "@/types/content";

const DEFAULT_CTA: CTAContent = {
  imageUrl: "/image/happy.jpg",
  headline: "Unlock your potential with skilled instructors.",
  subtext: "Book a class with us today",
  overallGrade: "A+",
  grades: [
    { subject: "Maths", score: "94%" },
    { subject: "Physics", score: "92%" },
    { subject: "Chemistry", score: "96%" },
  ],
};

const CTA = () => {
  const content = usePageSection(PageSectionKey.CTA, DEFAULT_CTA);

  return (
    <section className="py-16 px-8 bg-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
        {/* Left Side: Image & Floating Elements */}
        <div className="relative flex-1">
          <Image
            src={content.imageUrl}
            alt="Student with Phone"
            width={500}
            height={500}
            className="w-full rounded-lg"
          />

          {/* Floating Trophy */}
          <div className="absolute top-10 left-[-10%] bg-white p-4 rounded-lg shadow-lg">
            🏆
          </div>

          {/* Floating Grade Card */}
          <div className="absolute bottom-5 left-[-10%] bg-white p-4 rounded-lg shadow-lg text-sm">
            {content.overallGrade && <p>{content.overallGrade}</p>}
            {content.grades.map((grade) => (
              <p key={grade.subject}>
                {grade.subject} - {grade.score}
              </p>
            ))}
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-[#38b6ff]">{content.headline}</h2>
          <p className="mt-2 mb-4">{content.subtext}</p>
          <form className="space-y-4">
            <input
              type="name"
              placeholder="Enter your name"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="subject"
              placeholder="Subject(Optional)"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder="Enter your message"
              rows={4}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-[#38b6ff] text-white py-3 rounded-md text-lg hover:bg-[#1c2574] transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CTA;
