"use client";
import Image from 'next/image';
import { usePageSection } from '@/hooks/use-page-section';
import { PageSectionKey, ServicesIntroContent } from '@/types/content';

const DEFAULT_SERVICES_INTRO: ServicesIntroContent = {
  heading: "We are Your Complete Learning Solution to Education, Skills & Development",
  body: "We combine academic tutoring, professional development, tech training, and personal growth programs to help you achieve your goals.",
  imageUrl: "/image/images2.jpg",
  features: [
    { icon: "🎓", text: "Academic Tutoring" },
    { icon: "💼", text: "Professional Development" },
    { icon: "💻", text: "Tech Training" },
    { icon: "🧠", text: "Personal Growth Programs" },
  ],
};

const ServicesSection = () => {
  const content = usePageSection(PageSectionKey.SERVICES_INTRO, DEFAULT_SERVICES_INTRO);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={content.imageUrl}
                alt="Learning solutions"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{content.heading}</h2>
            <p className="text-lg text-gray-600 mb-8">{content.body}</p>

            <ul className="space-y-4">
              {content.features.map((service, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-[#38b6ff] text-xl">{service.icon}</span>
                  <span className="text-gray-700">{service.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
