"use client";

import Image from 'next/image';
import Head from 'next/head';
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { useRouter } from 'next/navigation';

export default function TechAdult() {
  const router = useRouter();
  const courseBundles = [
  {
    id: 1,
    title: "Freelancer Launch Pack",
    price: "₦80,000",
    summary: "Build the foundation for a successful freelance career.",
    includes: "Copywriting, Virtual Assistance & Project Management Tools.",
    extra: "Learn how to manage clients, build your portfolio, and start earning online.",
  },
  {
    id: 2,
    title: "Social Media Management Bundle",
    price: "₦85,000",
    summary: "Master the art of creating, designing, and managing content that drives engagement and sales.",
    includes: "Content Creation, Graphics Design, Video Editing & Social Media Management.",
    extra: "Perfect for aspiring social media managers, brand strategists, and entrepreneurs.",
  },
  {
    id: 3,
    title: "Digital Business Bundle",
    price: "₦85,000",
    summary: "Learn how to grow and automate your business online.",
    includes: "Social Media Strategy, Branding, and Ads Management.",
    extra: "Ideal for business owners and digital entrepreneurs who want to scale online.",
  },
  {
    id: 4,
    title: "Tech Essentials Pack",
    price: "₦90,000",
    summary: "Build the tech foundation that keeps you ahead in the modern workforce.",
    includes: "Web Design, Data Analytics & Digital Marketing.",
    extra: "Perfect for professionals transitioning into tech roles.",
  },
];
  return (
    <>
      <Head>
        <title>Digital Skills Training Program | STC Tutors</title>
        <meta name="description" content="Digital Skills Training Program for Adults: no coding, copy writing, web design, UI/UX, video editing and more." />
      </Head>

      <main className="container mx-auto px-6 py-10">
        {/* Hero Banner */}
        <section className="text-center mb-12">
          <div className="relative h-64 w-full bg-gray-200">
            {/* Placeholder for hero image */}
            <Image src="/image/tech kids.png" alt="Tech Training for Kids" layout="fill" objectFit="cover" />
          </div>
          <h1 className="text-4xl font-bold mt-6 text-[#1c2574]">Digital Skills Training Program</h1>
          <p className="text-xl text-[#38b6ff] mt-2">
            Learn the Skills That Help you Earn, Grow, and Stay Relevant in the Digital Age.
          </p>
        </section>

        {/* Enroll */}
        <div className="my-8 flex justify-center">
          <Link
          href="/services/tech-adult/register-form"
          className="inline-flex items-center gap-2 bg-[#38b6ff] text-white px-6 py-3 rounded-lg text-base md:text-lg hover:bg-[#1c2574] transition duration-200"
          >
            <BookOpen className="w-5 h-5" />
            Enroll
            </Link>
            </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Why Choose STC Tutors?</h2>
          <p className="mb-2">
            At STC Tutors, we don't just teach, <strong>we transform. </strong>
            <br />Every session is <strong>100% practical </strong> guided by expert tutors, and designed to help you apply what you learn immediately.
          </p>
  
          <br /><h2 className="text-2xl font-semibold mb-6">Here's What Makes Our Training Different:</h2>
            <ul className="list-none">
              <li>✅ Learn in-demand skills that help you get freelance and remote opportunities</li>
              <li>✅ Small group virtual classes; learn from anywhere</li>
              <li>✅ Access to live mentorship and community support</li>
              <li>✅ Build real-world projects for your portfolio</li>
              <li>✅ Affordable fees with flexible installment options</li>
              <li>✅ Internship opportunities and post-training career guidance</li>
            </ul>
        </section>

        {/* Digital Skills Courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">💻 Our Digital Skills Courses</h2>
          <p>Whether you are beginner or looking to expandyour digital career, there's a course for you.
            Each course is one month long, fully online and packed with practical projects.
          </p>
          <br /> <h2 className="text-2xl font-semibold mb-4">Single Courses</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Copy writing and Content Creation</li>
            <li>Virtual Assistance</li>
            <li>Social Media Management</li>
            <li>Graphics Design</li>
            <li>Web Development (No-code Tools)</li>
            <li>Project Management Tools</li>
            <li>Data Analytics</li>
          </ul>
        </section>
        
        {/* Course Bundle */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">💼 Course Bundle</h2>
          <p className="mb-6">
            Each bundle runs for 3 months, is 100% online, and includes real projects + certification.
            </p>

          <div className="space-y-6">
            {courseBundles.map(bundle => (
              <div key={bundle.id} className="border rounded-lg p-6 bg-white shadow-md">
                <h3 className="text-xl font-bold text-[#1c2574]">{bundle.title}</h3>
                <p className="text-lg text-[#38b6ff] mt-2">{bundle.price}</p>
                <p className="mt-2">{bundle.summary}</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {bundle.includes.split(', ').map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <p className="mt-2 italic">{bundle.extra}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Program Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🌱 Who This Program Is For</h2>
          <p className='mb-4'>This training is perfect for:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Adults seeking a <strong>career switch</strong> or a new digital income stream</li>
            <li>Freelancers who want to <strong> add new, high-income skills</strong></li>
            <li>Business owners who want to <strong> grow their online presence</strong></li>
            <li>Students or graduated looking to <strong> build employable skills</strong></li>
            <li>Professionals who want to <strong> stay competitive</strong> in today's digital job market</li>
          </ul>
        </section>

        {/* Advantage */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🚀 What You’ll Gain</h2>
          <p className='mb-4'>By the end of your program, you will have:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>A professional digital portfolio to showcase your work</li>
            <li>Practical experience through projects and internships</li>
            <li>Confidence to apply for remote or freelance roles</li>
            <li>A professional digital portfolio to showcase your work</li>
            <li>A certificate of completion from STC Tutors and other partner institution</li> 
            <li>Lifelong access to our learning and support community</li>
          </ul>
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">💬 What Learners Are Saying</h2>
          <div className="space-y-6">
            {[
              { quote: "I joined STC’s Copywriting class with zero experience. Two months later, I’m writing for clients and earning online", name: "Mary O." },
              { quote: "The sessions were engaging, the tutors were patient, and the community helped me stay motivated", name: "Olu A." },
            ].map((t, idx) => (
              <blockquote key={idx} className="p-4 border-l-4 border-[#38b6ff] bg-gray-50">
                <p className="italic text-gray-800">“{t.quote}”</p>
                <footer className="mt-2 text-right font-semibold text-[#1c2574]">— {t.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* Next Cohort */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">📅 Next Cohort: February 2026 — Limited Slots Available</h2>
          <p className='mb-4'>
            Our new cohort begins soon, and seats fill up fast.
            Take the first step today!!! Start learning skills that will pay you for life.
            <p>📞 Flexible Payment Options Available</p>
            <p>💬 Learn from Anywhere</p>
            <p>🎓 No Experience Needed</p>
          </p>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-12">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            {/* Back Button */}
            <button
            onClick={() => window.history.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition">
              ← Back
              </button>

            <Link
            href="/services/tech-adult/register-form"
            className="inline-block bg-[#38b6ff] text-white px-8 py-4 rounded-lg text-lg hover:bg-[#1c2574]"
            >
              Enroll Now
              </Link>
          </div>
        </section>
      </main>
    </>
  );
}
