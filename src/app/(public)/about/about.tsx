"use client";
import Image from "next/image";

const About = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex justify-center">
          {/* Left Side: Image + Stats */}
          <div className="relative">
            <Image
              src="/image/history.jpg"
              alt="Tutoring session"
              width={400}
              height={300}
              className="rounded-lg shadow-lg"
            />
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