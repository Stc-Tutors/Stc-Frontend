"use client";
import Image from "next/image";

const History = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Side: Text */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900">
              History <span className="text-[#38b6ff]">&</span> Mission
            </h2>
            <p className="mt-6 text-gray-700 italic leading-relaxed">
              Founded in 2024, STC Tutors began as a mission-driven virtual education platform.
              We aim to equip students across multiple education systems, including Nigeria, the UK,
              the USA, and Canada, with the skills to succeed academically, professionally, and personally.
              What started as a lean academic tutoring initiative has expanded into a multi-disciplinary online academy.
            </p>
          </div>

          {/* Right Side: Image + Stats */}
          <div className="relative">
            <Image
              src="/image/about.jpg"
              alt="Tutoring session"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>

    
  );
};

export default History;
