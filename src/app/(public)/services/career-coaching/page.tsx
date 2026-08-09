"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import RegisterCTA from "@/components/register-cta";

export default function CareerCoaching() {
  const router = useRouter();
  return (
    <main className="container mx-auto px-6 py-10">
      <section className="text-center mb-12">
        <div className="relative h-64 w-full md:h-96 bg-gray-200 rounded-lg overflow-hidden">
          <Image src="/image/career.jpg" alt="Career Coaching" fill className="object-cover" />
        </div>
        <h1 className="text-4xl font-bold mt-6">Career Coaching</h1>
        <p className="text-xl text-gray-600 mt-2">Guidance At Your Convenience</p>
      </section>

      <section className="mb-12 max-w-3xl mx-auto text-center">
        <p className="text-lg text-gray-700">
          We help learners prepare for future opportunities with CV reviews, interview prep, public speaking,
          digital literacy, and personalized coaching. Perfect for teens, graduates, and job seekers.
        </p>
      </section>

      <section className="text-center mb-12">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back
          </button>
          <RegisterCTA serviceType="career-coaching" label="Start Career Coaching Now" />
        </div>
      </section>
    </main>
  );
}
