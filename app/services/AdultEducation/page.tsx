import Image from 'next/image';
import Head from 'next/head';

export default function AdultEducation() {
  return (
    <>
      <Head>
        <title>Adult Education | STC Tutors</title>
        <meta
          name="description"
          content="Unlock new opportunities with STC Tutors' Adult Education—because it's never too late to learn."
        />
      </Head>

      <main className="container mx-auto px-6 py-10">
        {/* Hero Banner */}
        <section className="text-center mb-12">
          <div className="relative h-64 w-full bg-gray-200">
            {/* Placeholder for hero image */}
            <Image
              src="/images/placeholder-adult-hero.jpg"
              alt="Adult Education"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h1 className="text-4xl font-bold mt-6">Adult Education</h1>
          <p className="text-xl text-gray-600 mt-2">
            It’s Never Too Late to Learn: Move from Illiterate to Literate, Grow with Knowledge
          </p>
        </section>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="mb-2">
            At STC Tutors, we believe age is not a limitation. Our Adult Education program empowers learners
            of all ages to acquire new skills, complete foundational exams, and pursue lifelong learning.
          </p>
          <p>
            Whether you want to improve literacy, prepare for exams, or master a new discipline, our dedicated
            tutors guide you every step of the way.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '📚', title: 'Foundational Literacy' },
              { icon: '📝', title: 'Exam Preparation' },
              { icon: '💡', title: 'Skill Development' },
              { icon: '👥', title: 'Peer Support Groups' },
            ].map((feature) => (
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
                <h3 className="text-xl font-semibold">Never Too Old to Learn</h3>
                <p>
                  Break free from the myth that learning has an age limit. Our tutors specialize in adult
                  learning techniques that respect your experience and pace.
                </p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image
                  src="/images/benefit-age.jpg"
                  alt="Never Too Old"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-6">
                <h3 className="text-xl font-semibold">Transform Your Future</h3>
                <p>
                  Move from being called illiterate to literate, gain certifications, and open doors to new
                  career and personal growth opportunities.
                </p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image
                  src="/images/benefit-future.jpg"
                  alt="Transform Future"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-6">
                <h3 className="text-xl font-semibold">Dedicated Adult Tutors</h3>
                <p>
                  Learn from tutors who understand adult challenges—balancing work, family, and studies—and
                  tailor lessons accordingly.
                </p>
              </div>
              <div className="md:w-1/2 h-48 w-full relative">
                <Image
                  src="/images/benefit-tutors.jpg"
                  alt="Dedicated Tutors"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Sign Up & Goal Setting:</strong> Share your learning goals and schedule constraints.
            </li>
            <li>
              <strong>Match with Specialist Tutor:</strong> We pair you with an expert trained in adult
              education methods.
            </li>
            <li>
              <strong>Flexible Classes:</strong> Book sessions around your life—morning, evening, or weekends.
            </li>
            <li>
              <strong>Track & Celebrate:</strong> Access progress reports, celebrate milestones, and plan next
              steps.
            </li>
          </ol>
        </section>

        {/* Media Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Experience Adult Learning</h2>
          <div className="mb-6">
            {/* Placeholder for video */}
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700">Video Placeholder</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative h-40 w-full bg-gray-200">
                <Image
                  src={`/images/adult-media-${i}.jpg`}
                  alt="Adult Learning Media"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Success Stories</h2>
          <div className="space-y-6">
            {[
              {
                quote:
                  "At 45, I passed my secondary school exams with flying colors—thanks to STC Tutors!",
                name: 'Mr. Ade, Adult Learner',
              },
              {
                quote:
                  "I never thought I could learn coding at 50, but my tutor made it fun and achievable.",
                name: 'Mrs. Smith, Career Changer',
              },
            ].map((t, idx) => (
              <blockquote
                key={idx}
                className="p-4 border-l-4 border-blue-500 bg-gray-50"
              >
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
            Start Your Adult Learning Journey
          </a>
          <p className="mt-2 text-gray-600">
            Rediscover the joy of learning—your first session is on us!
          </p>
        </section>
      </main>
    </>
  );
}
