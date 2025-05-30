"use client";

import Image from 'next/image';
import Head from 'next/head';

import YouTubePlayer from '@/app/components/YouTubePlayer';
import { useRouter } from 'next/navigation';

export default function SoftSkillDevelopment() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-5xl md:text-7xl font-extrabold text-black text-center mb-6">COMING SOON!!!</h1>
      
      <button
        onClick={() => router.back()}
        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
      >
        ← Go Back
      </button>
    </div>
  )
}

// import Image from 'next/image';
// import Head from 'next/head';

// export default function SoftSkillDevelopment() {
//   return (
//     <>
//       <Head>
//         <title>Soft Skill Development | STC Tutors</title>
//         <meta name="description" content="Enhance your professional and IT soft skills for career success with STC Tutors." />
//       </Head>

//       <main className="container mx-auto px-6 py-10">
//         {/* Hero Banner */}
//         <section className="text-center mb-12 relative">
//           <div className="h-64 w-full bg-gray-200 relative">
//             {/* Placeholder for hero image */}
//             <Image src="/images/placeholder-hero-softskills.jpg" alt="Soft Skill Development" layout="fill" objectFit="cover" />
//           </div>
//           <h1 className="text-4xl font-bold mt-6 text-[#1c2574]">Soft Skill Development</h1>
//           <p className="text-xl text-[#38b6ff] mt-2">Build Essential Professional & IT Skills for Career Success</p>
//         </section>

//         {/* Overview */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">Overview</h2>
//           <p className="mb-2">
//             In today’s dynamic workplace, technical know-how must be paired with strong soft skills. Our Soft Skill Development
//             program equips you with communication, leadership, teamwork, and digital collaboration abilities to excel in any role.
//           </p>
//           <p>
//             Additionally, master critical IT soft skills—PowerPoint, Word, Excel, graphic design—and stand out in an increasingly digital world.
//           </p>
//         </section>

//          {/* Media Section */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">See It in Action</h2>
//           <div className="mb-6">
//             <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
//               <span className="text-gray-700">Video Placeholder</span>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {[1,2,3].map(i => (
//               <div key={i} className="relative h-40 w-full bg-gray-200">
//                 <Image src={`/images/media-softskill-${i}.jpg`} alt="Media" layout="fill" objectFit="cover" />
//               </div>
//             ))}
//           </div>
//         </section>


//         {/* Key Features */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-6 text-[#1c2574]">Key Skills Covered</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {[
//               { icon: '💬', title: 'Effective Communication' },
//               { icon: '🤝', title: 'Teamwork & Collaboration' },
//               { icon: '🧩', title: 'Problem-Solving' },
//               { icon: '⏱️', title: 'Time Management' },
//               { icon: '🎨', title: 'Graphic Design Basics' },
//               { icon: '📊', title: 'Microsoft Excel' },
//               { icon: '🖥️', title: 'PowerPoint Mastery' },
//               { icon: '📄', title: 'Word Proficiency' },
//             ].map(skill => (
//               <div key={skill.title} className="text-center p-4 border rounded-lg">
//                 <div className="text-4xl mb-2">{skill.icon}</div>
//                 <h3 className="font-medium text-[#1c2574]">{skill.title}</h3>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Detailed Benefits */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">Benefits of Soft Skill Training</h2>
//           <div className="space-y-8">
//             <div className="flex flex-col md:flex-row items-center">
//               <div className="md:w-1/2 md:pr-6">
//                 <h3 className="text-xl font-semibold text-[#1c2574]">Boosted Employability</h3>
//                 <p>Stand out in job interviews with strong communication and presentation skills, and mastery of essential office software.</p>
//               </div>
//               <div className="md:w-1/2 h-48 w-full relative">
//                 <Image src="/images/benefit-employability.jpg" alt="Employability" layout="fill" objectFit="cover" />
//               </div>
//             </div>
//             <div className="flex flex-col md:flex-row items-center">
//               <div className="md:w-1/2 md:pr-6">
//                 <h3 className="text-xl font-semibold text-[#1c2574]">Increased Productivity</h3>
//                 <p>Learn time management and problem-solving frameworks to work smarter, manage deadlines, and lead projects successfully.</p>
//               </div>
//               <div className="md:w-1/2 h-48 w-full relative">
//                 <Image src="/images/benefit-productivity.jpg" alt="Productivity" layout="fill" objectFit="cover" />
//               </div>
//             </div>
//             <div className="flex flex-col md:flex-row items-center">
//               <div className="md:w-1/2 md:pr-6">
//                 <h3 className="text-xl font-semibold text-[#1c2574]">Career Advancement</h3>
//                 <p>Master leadership and digital collaboration tools to take on managerial roles and drive team success.</p>
//               </div>
//               <div className="md:w-1/2 h-48 w-full relative">
//                 <Image src="/images/benefit-career.jpg" alt="Career Growth" layout="fill" objectFit="cover" />
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* How It Works */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">How It Works</h2>
//           <ol className="list-decimal list-inside space-y-2">
//             <li><strong>Sign Up & Assessment:</strong> Evaluate your current soft skill level.</li>
//             <li><strong>Customized Learning Plan:</strong> Receive a roadmap combining professional and IT soft skills.</li>
//             <li><strong>Interactive Workshops:</strong> Engage in live sessions and hands-on exercises.</li>
//             <li><strong>Practice & Feedback:</strong> Complete real-world tasks and get constructive feedback.</li>
//           </ol>
//         </section>

//         {/* Testimonials */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4 text-[#1c2574]">Testimonials</h2>
//           <div className="space-y-6">
//             {[
//               { quote: "Learning Excel and PowerPoint here landed me a promotion!", name: "Emeka, Project Coordinator" },
//               { quote: "Improved my communication skills and teamwork ability dramatically.", name: "Sara, Marketing Associate" },
//             ].map((t, idx) => (
//               <blockquote key={idx} className="p-4 border-l-4 border-[#38b6ff] bg-gray-50">
//                 <p className="italic">“{t.quote}”</p>
//                 <footer className="mt-2 text-right font-semibold">— {t.name}</footer>
//               </blockquote>
//             ))}
//           </div>
//         </section>

//         {/* Call to Action */}
//         <section className="text-center mb-12">
//           <a
//             href="/signup"
//             className="inline-block bg-[#38b6ff] text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-600"
//           >
//             Start Soft Skill Development
//           </a>
//           <p className="mt-2 text-gray-600">Unlock your potential with professional & IT soft skills training today.</p>
//         </section>
//       </main>
//     </>
//   );
// }
