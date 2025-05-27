"use client";
import Image from "next/image";

const About = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Image + Stats */}
          <div className="relative">
            <Image
              src="/image/about.jpg"
              alt="Tutoring session"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
            {/* Floating Stat Boxes
            <div className="absolute top-4 right-4 bg-gray-100 shadow-md p-3 rounded-md text-center">
              <p className="text-xl font-bold">5k+</p>
              <p className="text-sm text-gray-600">Tutors</p>
            </div>
            <div className="absolute bottom-4 right-8 bg-gray-100 shadow-md p-3 rounded-md text-center">
              <p className="text-xl font-bold">20k+</p>
              <p className="text-sm text-gray-600">Students</p>
            </div>
            <div className="absolute bottom-16 left-4 bg-gray-800 text-white shadow-md p-3 rounded-md text-center">
              <p className="text-xl font-bold">5+</p>
              <p className="text-sm">Years</p>
            </div>
            <div className="absolute bottom-4 left-8 bg-gray-100 shadow-md p-3 rounded-md text-center">
              <p className="text-xl font-bold">10k+</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div> */}
          </div>

          {/* Right Side: Text */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900">
              We Are Committed To <br />
              Your <span className="text-[#38b6ff]">Success</span>
            </h2>
            <p className="mt-6 text-gray-700 leading-relaxed">
              STC Edu Consult, a subsidiary of Statcomm TC Limited, aims to
              transform the tutoring landscape by connecting students with
              qualified tutors through a robust online platform. Initially
              focusing on Nigeria, the UK, the USA, Canada, and several other
              countries, our mission is to provide accessible, high-quality
              education and exam preparation services for primary, secondary,
              and post-secondary students. We also offer adult education services,
              among others. In addition to academic tutoring, we provide language courses
              snd specialized training in various skills. Our comprehensive approach includes
              monthly counselling sessions, career talks, and interactive support to ensure
              holistic student development.
            </p>
          </div>
        </div>
      </div>
    </section>

    
  );
};

export default About;



{/*export default function AboutPage() {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold">About Us</h1>
        <p className="mt-4 text-lg">Welcome to STC Tutors! This is the about page.</p>
      </main>
    );
  }*/}