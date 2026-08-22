"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetServicesAction } from "@/server/service-catalog";
import { GetServicePageBySlugAction } from "@/server/content";
import { ServiceCatalogStatus } from "@/types/service-catalog";

interface DisplayService {
  slug: string;
  title: string;
  description: string;
  image: string;
}

const FALLBACK_IMAGE = "/image/tutoring.jpg";

// Shown until the real Service Catalog loads. Once it does, every Active
// service gets a card automatically - no more maintaining this list by hand
// and no more a service existing in the catalog with nowhere to click
// through to it from the services listing page.
const DEFAULT_SERVICES: DisplayService[] = [
  { slug: "academic-tutoring", title: "Academic Tutoring", description: "We offer personalized tutoring across different levels of basic education from Basic school to post-high school across different curricula, helping students master core subjects, boost performance, and build lasting academic confidence", image: "/image/tutoring.jpg" },
  { slug: "exam-preparation", title: "Exam Preparation", description: "Ace Your Exams. Prepare with confidence for major international exams, including IGCSE, A-Levels, WAEC, JAMB, SAT, ACT, NECO, and others.", image: "/image/exam prep.jpg" },
  { slug: "tech-training", title: "Tech Training for Kids", description: "Master Modern Technology. Get certified by equipping learners between the ages of 5 and 20 with essential digital skills.", image: "/image/tech.jpg" },
  { slug: "digital-skills", title: "Digital Skills Development", description: "Learn the skills that help you earn, grow, and stay relevant in the digital age.", image: "/image/adult-learners.jpg" },
  { slug: "music-training", title: "Music Training", description: "Explore your musical talent with professional guidance.", image: "/image/music.jpg" },
  { slug: "adult-education", title: "Adult Education", description: "Learning has no age limit - personal development, literacy, and practical skill-building.", image: "/image/adult education.jpg" },
  { slug: "language-culture", title: "Language and Culture", description: "Speak any language with confidence, from French and Spanish to Yoruba, Hausa, and Igbo.", image: "/image/culture.jpg" },
  { slug: "soft-skill", title: "Soft Skill Development", description: "Build professional excellence with expert-led job training programs.", image: "/image/skills.jpg" },
  { slug: "career-coaching", title: "Career Coaching", description: "Guidance at your convenience - CV reviews, interview prep, and personalized coaching.", image: "/image/career.jpg" },
  { slug: "self-development", title: "Self-Development", description: "Shape your career path with leadership, productivity, and mindset development.", image: "/image/self development.jpg" },
];

const AcademicSession = () => {
  const [services, setServices] = useState<DisplayService[]>(DEFAULT_SERVICES);

  useEffect(() => {
    GetServicesAction(ServiceCatalogStatus.ACTIVE).then(async ([res]) => {
      const catalog = res?.data ?? [];
      if (catalog.length === 0) return;

      const withContent = await Promise.all(
        catalog.map(async (s) => {
          const [pageRes] = await GetServicePageBySlugAction(s.slug);
          const page = pageRes?.data;
          return {
            slug: s.slug,
            title: s.serviceName,
            description: page?.heroSubtitle || page?.overview || s.description || "",
            image: page?.heroImageUrl || FALLBACK_IMAGE,
          };
        })
      );
      setServices(withContent);
    });
  }, []);

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-24">
        {services.map((service, index) => (
          <div
            key={service.slug}
            className={`grid md:grid-cols-2 gap-12 ${index % 2 === 0 ? '' : 'md:[&>div:first-child]:order-2'}`}
          >
            {/* Text Content */}
            <div className="flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-xl text-gray-600 mb-6">{service.description}</p>
              <Link
                href={`/services/${service.slug}`}
                className="flex items-center text-[#38b6ff] font-medium hover:text-indigo-300 transition-colors w-fit"
              >
                Learn More <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Image - Alternates sides */}
            <div className="relative h-80 rounded-lg overflow-hidden">
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AcademicSession;
