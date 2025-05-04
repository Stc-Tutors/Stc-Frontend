import Image from 'next/image';
import Head from 'next/head';

export default function LanguageAndCulture() {
  return (
    <>
      <Head>
        <title>Language & Culture | STC Tutors</title>
        <meta name="description" content="Learn global and African languages along with cultural insights at STC Tutors." />
      </Head>

      <main className="container mx-auto px-6 py-10">
        {/* Hero Banner */}
        <section className="text-center mb-12 relative">
          <div className="h-64 w-full bg-[#38b6ff] relative">
            <Image src="/images/placeholder-language-hero.jpg" alt="Language and Culture" layout="fill" objectFit="cover" className="opacity-70" />
          </div>
          <h1 className="text-4xl font-bold text-white mt-6">Language & Culture</h1>
          <p className="text-xl text-gray-200 mt-2">Explore Languages, Embrace Cultures, Connect Worlds</p>
        </section>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1c2574] mb-4">Overview</h2>
          <p className="mb-2">
            Dive into the world’s most spoken languages—from English, Spanish, and Mandarin to Arabic, French, and Portuguese—
            plus key Nigerian and African tongues like Yoruba, Hausa, Igbo, Swahili, and Zulu.
          </p>
          <p>
            Our Language & Culture service blends linguistic mastery with cultural immersion, empowering learners to communicate authentically and understand global traditions.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1c2574] mb-6">Key Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🗣️', title: 'Conversational Practice' },
              { icon: '🎥', title: 'Cultural Videos' },
              { icon: '📚', title: 'Authentic Materials' },
              { icon: '🌍', title: 'Global & African Focus' },
            ].map(f => (
              <div key={f.title} className="text-center p-4 border rounded-lg">
                <div className="text-4xl mb-2">{f.icon}</div>
                <h3 className="font-medium text-[#38b6ff]">{f.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1c2574] mb-4">Benefits</h2>
          <div className="space-y-8">
            {[
              {
                title: 'Speak with Confidence',
                desc: 'Gain fluency through interactive speaking & listening exercises.',
                img: '/images/benefit-language1.jpg'
              },
              {
                title: 'Cultural Fluency',
                desc: 'Understand traditions, etiquette, and social norms for real-world interactions.',
                img: '/images/benefit-language2.jpg'
              },
              {
                title: 'Career & Travel Edge',
                desc: 'Stand out in global job markets and travel experiences with language skills.',
                img: '/images/benefit-language3.jpg'
              }
            ].map((b, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-6">
                  <h3 className="text-xl font-semibold text-[#38b6ff]">{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
                <div className="md:w-1/2 h-48 w-full relative mt-4 md:mt-0">
                  <Image src={b.img} alt={b.title} layout="fill" objectFit="cover" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1c2574] mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            {[
              'Choose your language and culture track',
              'Complete a cultural background assessment',
              'Book interactive sessions with native-speaking tutors',
              'Access multimedia resources and live cultural workshops'
            ].map((step, i) => (
              <li key={i}><span className="font-semibold text-[#38b6ff]">Step {i+1}:</span> {step}</li>
            ))}
          </ol>
        </section>

        {/* Media Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1c2574] mb-4">Experience It</h2>
          <div className="mb-6">
            <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700">Video Placeholder</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(n => (
              <div key={n} className="relative h-40 w-full bg-gray-200">
                <Image src={`/images/media-lang-placeholder-${n}.jpg`} alt="Media" layout="fill" objectFit="cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1c2574] mb-4">Testimonials</h2>
          <div className="space-y-6">
            {[
              { quote: 'Learning Yoruba and its culture was eye-opening—I feel connected to my roots!', name: 'Chinelo, Student' },
              { quote: 'My Spanish improved fast, and I loved the flamenco workshop!', name: 'Maria, Adult Learner' }
            ].map((t, i) => (
              <blockquote key={i} className="p-4 border-l-4 border-[#38b6ff] bg-gray-50">
                <p className="italic">“{t.quote}”</p>
                <footer className="mt-2 text-right font-semibold">— {t.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mb-12">
          <a
            href="/signup"
            className="inline-block bg-[#38b6ff] text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-600"
          >
            Start Language & Culture Journey
          </a>
          <p className="mt-2 text-gray-600">Unlock a world of languages and traditions today!</p>
        </section>
      </main>
    </>
  );
}
