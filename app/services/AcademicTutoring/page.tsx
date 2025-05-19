import Image from 'next/image';
import Head from 'next/head';
import YouTubePlayer from '@/app/components/YouTubePlayer';

export default function AcademicTutoring() {
  return (
    <>
      <Head>
        <title>Academic Tutoring | STC Tutors</title>
        <meta name="description" content="Personalized academic tutoring to boost confidence, grades, and learning retention." />
      </Head>

      <main className="container mx-auto px-6 py-10">
        {/* Hero Banner */}
        <section className="text-center mb-12">
          <div className="relative h-64 w-full md:h-96 bg-gray-200">
            {/* Placeholder for hero image */}
            <Image src="/image/academic2.jpg" alt="Academic Tutoring" layout="fill" objectFit="cover" />
          </div>
          <h1 className="text-4xl font-bold mt-6">Academic Tutoring</h1>
          <p className="text-xl text-gray-600 mt-2">Personalized Support to Unlock Every Student's Potential</p>
        </section>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="mb-2">
            STC Tutors' Academic Tutoring provides personalized, one-on-one support in core subjects—Mathematics, English,
            Sciences, and Social Studies. Our expert tutors tailor each lesson to your curriculum (WAEC, GCSE, SAT, etc.),
            ensuring you master every concept.
          </p>
          <p>
            Research shows personalized tutoring can boost grades by up to 20%, while building critical thinking and study
            skills that last a lifetime.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🎯', title: 'Customized Lesson Plans' },
              { icon: '⏰', title: 'Flexible Scheduling' },
              { icon: '📈', title: 'Progress Tracking' },
              { icon: '🌐', title: 'Virtual Classroom' },
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
          <h2 className="text-2xl font-semibold mb-8 text-center">Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            
            {/* Benefit 1 */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Improved Confidence & Engagement</h3>
              <p className="mb-4">Our interactive whiteboard keeps students engaged and motivated to learn.</p>
              <div className="mx-auto w-[250px] h-[160px] relative">
                <Image
                src="/image/3.jpg"
                alt="Confidence"
                layout="fill"
                className="object-cover rounded-md"
                />
                </div>
                </div>
                
                {/* Benefit 2 */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Measurable Grade Improvement</h3>
                  <p className="mb-4">On average, our students improve by 15–20% in their exam scores.</p>
                  <div className="mx-auto w-[250px] h-[160px] relative">
                    <Image
                    src="/image/confidence.jpg"
                    alt="Grades Improvement"
                    layout="fill"
                    className="object-cover rounded-md"
                    />
                    </div>
                    </div>
                    
                    {/* Benefit 3 */}
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Lifelong Learning Skills</h3>
                      <p className="mb-4">Build study habits and critical thinking skills for continued academic success.</p>
                      <div className="mx-auto w-[250px] h-[160px] relative">
                        <Image
                        src="/image/5.jpg"
                        alt="Learning Skills"
                        layout="fill"
                        className="object-cover rounded-md"/>
                        </div>
                        </div>
                        </div>
                        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Sign Up & Assessment:</strong> Complete a quick diagnostic quiz.</li>
            <li><strong>Match with Tutor:</strong> We pair you with an expert in your subject and exam board.</li>
            <li><strong>Schedule Sessions:</strong> Book slots via your dashboard (max 2 hrs/day per subject).</li>
            <li><strong>Learn & Review:</strong> Attend live classes, access recordings, and track your progress.</li>
          </ol>
        </section>

        {/* Media Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">See It in Action</h2>
          <div className="mb-6">
            {/* Placeholder for video */}
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700">
                <YouTubePlayer videoId={"DPKCjJViqo"} />
              </span>
            </div>
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="relative h-40 w-full bg-gray-200">
                <Image src={`/image/Exam.jpg`} alt="Media" layout="fill" objectFit="cover" />
              </div>
            ))}
          </div> */}
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Testimonials</h2>
          <div className="space-y-6">
            {[
              { quote: "I went from a C to an A in Mathematics in just three months!", name: "Aisha, WAEC candidate" },
              { quote: "The flexible schedule meant I could fit sessions around my job.", name: "David, adult learner" },
            ].map((t, idx) => (
              <blockquote key={idx} className="p-4 border-l-4 border-blue-500 bg-gray-50">
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
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700"
          >
            Start Academic Tutoring Now
          </a>
          <p className="mt-2 text-gray-600">First session 20% off when you sign up today.</p>
        </section>
      </main>
    </>
  );
}
