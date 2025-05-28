import Image from 'next/image';
import Head from 'next/head';

export default function CareerCoaching() {
  return (
    <>
      <Head>
        <title>Career Coaching | STC Tutors</title>
        <meta name="description" content="Unlock your professional potential with personalized career coaching from STC Tutors." />
      </Head>

      <main className="container mx-auto px-6 py-10">
        {/* Hero Banner */}
        <section className="text-center mb-12 relative h-64 bg-[#1c2574] text-white flex items-center justify-center">
          {/* Placeholder for hero image */}
          <Image src="/images/placeholder-career-hero.jpg" alt="Career Coaching" layout="fill" objectFit="cover" className="opacity-20" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold">Career Coaching</h1>
            <p className="text-xl mt-2 text-[#38b6ff]">Chart Your Path to Professional Success</p>
          </div>
        </section>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">Overview</h2>
          <p className="mb-2">
            STC Tutors’ Career Coaching service empowers learners and professionals to define clear career goals, build essential skills,
            and navigate the job market with confidence. From resume crafting to interview mastery, our expert coaches guide your journey.
          </p>
          <p>
            Whether you're a recent graduate or seeking advancement, our personalized coaching helps you stand out and achieve your ambitions.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-[#1c2574]">Key Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🛠️', title: 'Skill Gap Analysis' },
              { icon: '📄', title: 'Resume & CV Building' },
              { icon: '💼', title: 'Mock Interviews' },
              { icon: '📈', title: 'Career Roadmap' },
            ].map(feature => (
              <div key={feature.title} className="text-center p-4 border rounded-lg">
                <div className="text-4xl mb-2 text-[#38b6ff]">{feature.icon}</div>
                <h3 className="font-medium text-[#1c2574]">{feature.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">Benefits</h2>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-6">
                <h3 className="text-xl font-semibold">Clarity in Career Goals</h3>
                <p>Define your strengths and aspirations to create a clear, actionable career plan.</p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image src="/images/benefit-clarity.jpg" alt="Clarity" layout="fill" objectFit="cover" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-6">
                <h3 className="text-xl font-semibold">Enhanced Job Market Readiness</h3>
                <p>Master interview techniques and polish your resume to stand out to top employers.</p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image src="/images/benefit-interview.jpg" alt="Interview Prep" layout="fill" objectFit="cover" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-6">
                <h3 className="text-xl font-semibold">Long-Term Professional Growth</h3>
                <p>Develop soft skills and networking strategies for sustained career advancement.</p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image src="/images/benefit-growth.jpg" alt="Growth" layout="fill" objectFit="cover" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Initial Consultation:</strong> We assess your background, goals, and challenges.</li>
            <li><strong>Personalized Plan:</strong> Create a roadmap with milestones, resources, and timelines.</li>
            <li><strong>Coaching Sessions:</strong> Engage in targeted one-on-one or group workshops.</li>
            <li><strong>Review & Adjust:</strong> Track progress, refine strategy, and prepare for next steps.</li>
          </ol>
        </section>

        {/* Media Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">See It in Action</h2>
          <div className="mb-6">
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700">Video Placeholder</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="relative h-40 w-full bg-gray-200">
                <Image src={`/images/media-career-${i}.jpg`} alt="Media" layout="fill" objectFit="cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">Testimonials</h2>
          <div className="space-y-6">
            {[
              { quote: "STC Tutors helped me land my dream job within two months!", name: "Emeka, Software Engineer" },
              { quote: "Their coaching gave me the confidence to negotiate my salary.", name: "Sarah, Marketing Specialist" },
            ].map((t, idx) => (
              <blockquote key={idx} className="p-4 border-l-4 border-[#38b6ff] bg-gray-50">
                <p className="italic">“{t.quote}”</p>
                <footer className="mt-2 text-right font-semibold text-[#1c2574]">— {t.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-12">
          <a
            href="/signup"
            className="inline-block bg-[#38b6ff] text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-400"
          >
            Start Career Coaching Now
          </a>
          <p className="mt-2 text-gray-600">Book your free consultation today!</p>
        </section>
      </main>
    </>
  );
}
