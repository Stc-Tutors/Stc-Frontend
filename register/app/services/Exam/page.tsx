import Image from 'next/image';
import Head from 'next/head';

export default function ExamPreparation() {
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
            <Image src="/images/placeholder-exam.jpg" alt="Exam Preparation" layout="fill" objectFit="cover" />
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

        {/* Detailed Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-6">
                <h3 className="text-xl font-semibold">Exam Confidence</h3>
                <p>Master exam formats and question types to reduce test anxiety.</p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image src="/images/benefit-confidence2.jpg" alt="Exam Confidence" layout="fill" objectFit="cover" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-6">
                <h3 className="text-xl font-semibold">Score Improvement</h3>
                <p>Target weak areas with data-driven insights for maximum score gains.</p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image src="/images/benefit-scores.jpg" alt="Scores Improvement" layout="fill" objectFit="cover" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-6">
                <h3 className="text-xl font-semibold">Time Management Skills</h3>
                <p>Learn pacing strategies to complete exams efficiently under timed conditions.</p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image src="/images/benefit-time.jpg" alt="Time Management" layout="fill" objectFit="cover" />
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

        {/* Media Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">See It in Action</h2>
          <div className="mb-6">
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700">Video Placeholder</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="relative h-40 w-full bg-gray-200">
                <Image src={`/images/media-exam-${i}.jpg`} alt="Exam Media" layout="fill" objectFit="cover" />
              </div>
            ))}
          </div>
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
          <a
            href="/signup"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-green-700"
          >
            Start Exam Prep Now
          </a>
          <p className="mt-2 text-gray-600">Secure your spot—limited seats for top exam performance!</p>
        </section>
      </main>
    </>
  );
}
