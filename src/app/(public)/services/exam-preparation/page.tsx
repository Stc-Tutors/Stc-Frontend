"use client";

import Image from 'next/image';
import Head from 'next/head';


import { useRouter } from 'next/navigation';
// import YouTubePlayer from '../../components/YouTubePlayer';

export default function ExamPreparation() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Exam Preparation | STC Tutors</title>
        <meta name="description" content="Targeted exam preparation for WAEC, JAMB, GCSE, SAT, and more." />
      </Head>

      <main className="container mx-auto px-6 py-10">
        {/* Hero Banner */}
        <section className="text-center mb-12">
          <div className="relative h-64 w-full bg-gray-200">
            <Image src="/image/Exam2.jpg" alt="Exam Preparation" layout="fill" objectFit="cover" />
          </div>
          <h1 className="text-4xl font-bold mt-6">Exam Preparation</h1>
          <p className="text-xl text-gray-600 mt-2">Focused Training to Ace Your Exams</p>
        </section>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="mb-2">
            Our Exam Preparation service offers specialized coaching for major exams—WAEC, JAMB, NECO, GCSE, SAT, and ACT.
            We use past papers, timed drills, and expert strategies to build confidence and improve scores.
          </p>
          <p>
            With targeted practice and personalized feedback, students consistently achieve top grades and secure admissions.
          </p>
        </section>

        {/* Media Section
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">See It in Action</h2>
          <div className="mb-6">
            {/* Placeholder for video */}
            {/* <div className="w-full max-w-3xl mx-auto aspect-video">
              <YouTubePlayer videoId={"DPKCjJViqo"} />
            </div>
          </div> */} 
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="relative h-40 w-full bg-gray-200">
                <Image src={`/image/Exam.jpg`} alt="Media" layout="fill" objectFit="cover" />
              </div>
            ))}
          </div> */}
        {/* </section> */}

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '📝', title: 'Past Paper Drills' },
              { icon: '⏱️', title: 'Timed Practice' },
              { icon: '📊', title: 'Performance Analytics' },
              { icon: '🎯', title: 'Strategy Workshops' },
            ].map(feature => (
              <div key={feature.title} className="text-center p-4 border rounded-lg">
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h3 className="font-medium">{feature.title}</h3>
              </div>
            ))}
          </div>
        </section>


        <section className="mb-12 px-4">
          <h2 className="text-2xl font-semibold mb-10 text-center">Benefits</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <h3 className="text-lg font-bold">Improved Confidence & Engagement</h3>
              <p>Our interactive whiteboard keeps students engaged and motivated to learn.</p>
              <div className="w-full h-[180px] relative">
                <Image
                  src="/image/score.jpg"
                  alt="Engaged Students"
                  layout="fill"
                  className="object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <h3 className="text-lg font-bold">Measurable Grade Improvement</h3>
              <p>On average, our students improve by 15–20% in their exam scores.</p>
              <div className="w-full h-[180px] relative">
                <video
                  src='/video/demo.mp4'
                  controls
                  autoPlay
                  loop
                  muted
                  className='rounded-xl w-full h-auto'>

                </video>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <h3 className="text-lg font-bold">Lifelong Learning Skills</h3>
              <p>Build study habits and critical thinking skills for continued academic success.</p>
              <div className="w-full h-[180px] relative">
                <Image
                  src="/image/time management.jpg"
                  alt="Study Skills"
                  layout="fill"
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>


        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Diagnostic Test:</strong> Identify strengths and areas for improvement.</li>
            <li><strong>Customized Study Plan:</strong> Focus on high-impact topics and question types.</li>
            <li><strong>Practice Sessions:</strong> Timed drills with real exam papers.</li>
            <li><strong>Review & Feedback:</strong> Detailed analysis and strategy coaching.</li>
          </ol>
        </section>



        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Testimonials</h2>
          <div className="space-y-6">
            {[
              { quote: "I increased my JAMB score by 50 points after just 6 sessions!", name: "Emeka, JAMB candidate" },
              { quote: "The exam strategies were a game-changer for my GCSEs.", name: "Sophie, GCSE student" },
            ].map((t, idx) => (
              <blockquote key={idx} className="p-4 border-l-4 border-green-500 bg-gray-50">
                <p className="italic">“{t.quote}”</p>
                <footer className="mt-2 text-right font-semibold">— {t.name}</footer>
              </blockquote>
            ))}
          </div>
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

            <a
              href="/signup"
              className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-green-700">
              Start Exam Prep Now
            </a>
          </div>

          <p className="mt-2 text-gray-600">Secure your spot—limited seats for top exam performance!</p>
        </section>
      </main>
    </>
  );
}
