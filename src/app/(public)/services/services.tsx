// components/ServicesSection.tsx
import Image from 'next/image';
import { FaGraduationCap, FaLaptopCode, FaUserTie, FaBrain } from 'react-icons/fa';

import YouTubeCard from './YouTubeCard';

const ServicesSection = () => {
  const services = [
    { icon: <FaGraduationCap size={20} />, text: "Academic Tutoring" },
    { icon: <FaUserTie size={20} />, text: "Professional Development" },
    { icon: <FaLaptopCode size={20} />, text: "Tech Training" },
    { icon: <FaBrain size={20} />, text: "Personal Growth Programs" }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Image on left - 50% width on desktop */}
          <div className="w-full md:w-1/2">
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
              <Image
                src="/image/images2.jpg" // Replace with your image path
                alt="Learning solutions"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Text content on right - 50% width on desktop */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              We are Your Complete Learning Solution to Education, Skills & Development
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We combine academic tutoring, professional development, tech training, and personal growth programs to help you achieve your goals.
            </p>
            
            {/* Services list with icons */}
            <ul className="space-y-4">
              {services.map((service, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-[#38b6ff]">{service.icon}</span>
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