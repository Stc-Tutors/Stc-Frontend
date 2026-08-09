"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import RegisterCTA from "@/components/register-cta";

export default function AdultEducation() {
  const router = useRouter();
  return (
    <main className="container mx-auto px-6 py-10">
      <section className="text-center mb-12">
        <div className="relative h-64 w-full md:h-96 bg-gray-200 rounded-lg overflow-hidden">
          <Image src="/image/adult education.jpg" alt="Adult Education" fill className="object-cover" />
        </div>
        <h1 className="text-4xl font-bold mt-6">Adult Education</h1>
        <p className="text-xl text-gray-600 mt-2">Learning Has No Age Limit</p>
      </section>

      <section className="mb-12 max-w-3xl mx-auto text-center">
        <p className="text-lg text-gray-700">
          It&apos;s never too late to learn. Our adult education programs are tailored for personal development,
          literacy improvement, and practical skill-building for everyday life and career advancement.
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
          <RegisterCTA serviceType="adult-education" label="Start Adult Education Now" />
        </div>
      </section>
    </main>
  );
}
