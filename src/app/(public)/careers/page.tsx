"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, MapPin } from "lucide-react";
import { usePageSection } from "@/hooks/use-page-section";
import { GetJobOpeningsAction } from "@/server/content";
import { CareersIntroContent, JobEmploymentType, JobOpening, PageSectionKey } from "@/types/content";
import { sanitizeRichText } from "@/lib/sanitize-html";
import CareerApplicationForm from "./CareerApplicationForm";

// Mirrors Stc-SuperAdmin's DEFAULT_CAREERS_INTRO (page-sections-tab.tsx) - keep in sync.
const DEFAULT_INTRO: CareersIntroContent = {
  heading: "Join the STC Tutors Team",
  body: "STC Tutors is a global online tutoring platform connecting students in Nigeria, Africa, the UK, the USA, Canada and beyond with expert tutors and staff. We're always looking for talented people to grow with us - as a tutor or across our wider team.",
  aboutHeading: "Who we are",
  aboutBody: "STC Tutors is a fully virtual education company serving learners worldwide. Our team works remotely across time zones to deliver tutoring, tech training, and personal development programs to students of all ages.",
  lookingForHeading: "The tutors and staff we look for",
  lookingForItems: [
    "Subject-matter experts across academic tutoring, exam preparation, tech skills, and languages",
    "Patient, reliable communicators who can teach students of different ages and backgrounds",
    "Comfortable teaching online and using virtual classroom tools",
    "Available for consistent, scheduled sessions with students across different time zones",
    "Committed to STC's vetting, training, and quality standards",
  ],
  whyJoinHeading: "Why join STC Tutors",
  whyJoinItems: [
    "Work remotely, from anywhere in the world",
    "Flexible scheduling that fits around your life",
    "Be part of a genuinely global learning community",
    "Ongoing training and support, not just a one-off onboarding",
    "Transparent pay, handled entirely through the platform",
  ],
};

const EMPLOYMENT_TYPE_LABEL: Record<JobEmploymentType, string> = {
  [JobEmploymentType.FULL_TIME]: "Full-time",
  [JobEmploymentType.PART_TIME]: "Part-time",
  [JobEmploymentType.CONTRACT]: "Contract",
  [JobEmploymentType.INTERNSHIP]: "Internship",
  [JobEmploymentType.VOLUNTEER]: "Volunteer",
};

// The standing "Become a Tutor" opening (see stcbe's IJobOpening.isTutorRole)
// only ever exists once an admin creates it in Site Content > Job Openings -
// this is the fallback so the platform's single most important opening is
// never missing from its own careers page on a fresh deploy.
const FALLBACK_TUTOR_OPENING: JobOpening = {
  id: "__become-a-tutor__",
  title: "Become a Tutor",
  slug: "become-a-tutor",
  department: "Teaching",
  location: "Remote / Online",
  employmentType: JobEmploymentType.PART_TIME,
  summary: "Teach students online on your own schedule - subjects, exam prep, skills and more.",
  description: "",
  requirements: [],
  isTutorRole: true,
};

export default function CareersPage() {
  const intro = usePageSection(PageSectionKey.CAREERS_INTRO, DEFAULT_INTRO);
  const [openings, setOpenings] = useState<JobOpening[] | null>(null);
  const [applyingTo, setApplyingTo] = useState<JobOpening | null>(null);

  useEffect(() => {
    GetJobOpeningsAction().then(([res]) => setOpenings(res?.data ?? []));
  }, []);

  const hasTutorOpening = openings?.some((o) => o.isTutorRole);
  const listed = openings ? (hasTutorOpening ? openings : [FALLBACK_TUTOR_OPENING, ...openings]) : null;

  return (
    <main>
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{intro.heading}</h1>
          <p
            className="text-gray-500 max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro.body) }}
          />
        </div>
      </div>

      {/* Who we are / what we look for / why join - the employer-branding
          content a candidate should see before a bare list of postings. */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{intro.aboutHeading}</h2>
          <p
            className="text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro.aboutBody) }}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{intro.whyJoinHeading}</h2>
          <ul className="space-y-2">
            {intro.whyJoinItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-600">
                <CheckCircle2 className="size-5 text-[#38b6ff] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{intro.lookingForHeading}</h2>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {intro.lookingForItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-600">
                <CheckCircle2 className="size-5 text-[#38b6ff] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Open positions */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Open positions</h2>

        {listed === null ? (
          <p className="text-gray-500">Loading openings...</p>
        ) : listed.length === 0 ? (
          <p className="text-gray-500">No open positions right now - check back soon.</p>
        ) : (
          <div className="space-y-4">
            {listed.map((opening) => (
              <div
                key={opening.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{opening.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-4" /> {opening.department} · {EMPLOYMENT_TYPE_LABEL[opening.employmentType]}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" /> {opening.location}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">{opening.summary}</p>
                  {opening.requirements.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-500 mt-2 space-y-0.5">
                      {opening.requirements.map((req) => (
                        <li key={req}>{req}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="shrink-0">
                  {opening.isTutorRole ? (
                    <Link
                      href="/auth/apply-tutor"
                      className="inline-block bg-[#38b6ff] text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition text-center"
                    >
                      Become a Tutor
                    </Link>
                  ) : (
                    <button
                      onClick={() => setApplyingTo(opening)}
                      className="bg-[#38b6ff] text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {applyingTo && <CareerApplicationForm opening={applyingTo} onClose={() => setApplyingTo(null)} />}
    </main>
  );
}
