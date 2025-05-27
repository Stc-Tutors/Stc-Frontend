// "use client";

// import Image from 'next/image';
// import Head from 'next/head';
// import YouTubePlayer from '@/app/components/YouTubePlayer';

// import { useRouter } from 'next/navigation';

// export default function TechTraining() {
//   const router = useRouter();
//   return (
//     <>
//       <Head>
//         <title>Tech Training for Kids | STC Tutors</title>
//         <meta name="description" content="Virtual tech training for kids: coding, app dev, UI/UX, video editing and more." />
//       </Head>

//       <main className="container mx-auto px-6 py-10">
//         {/* Hero Banner */}
//         <section className="text-center mb-12">
//           <div className="relative h-64 w-full bg-gray-200">
//             {/* Placeholder for hero image */}
//             <Image src="/images/placeholder-tech-hero.jpg" alt="Tech Training for Kids" layout="fill" objectFit="cover" />
//           </div>
//           <h1 className="text-4xl font-bold mt-6 text-[#1c2574]">Tech Training for Kids</h1>
//           <p className="text-xl text-[#38b6ff] mt-2">
//             Empower young minds with future-ready tech skills, one virtual lesson at a time.
//           </p>
//         </section>

//         {/* Overview */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4">Why Tech Training for Kids?</h2>
//           <p className="mb-2">
//             In a world driven by technology, introducing children to tech skills early sparks creativity, confidence, and problem-solving abilities.
//             Our virtual Tech Training program lets kids explore coding, app development, UI/UX design, video editing, and more—all from the safety of home.
//           </p>
//           <p>
//             STC Tutors’ engaging curriculum nurtures critical thinking and prepares young learners for tomorrow’s digital challenges.
//           </p>
//         </section>

//         {/* Media Section */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4">See Our Young Innovators</h2>
//           <div className="mb-6">

//             {/* Video placeholder */}
//             <div className="w-full max-w-3xl mx-auto aspect-video">
//                 <YouTubePlayer videoId={"DPKCjJViqo"} />
//             </div>
//           </div>
//           {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {[1,2,3].map(i => (
//               <div key={i} className="relative h-40 w-full bg-gray-200">
//                 <Image src={`/images/tech-media-placeholder-${i}.jpg`} alt="Tech project" layout="fill" objectFit="cover" />
//               </div>
//             ))}
//           </div> */}
//         </section>

//         {/* Tech Skills List */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-6">Tech Skills They Can Learn</h2>
//           <div className="space-y-8">
//             {[
//               { skill: 'Coding Basics (Scratch, Python)', desc: 'Learn fundamentals of logic and problem-solving through fun, block-based and text-based coding.' },
//               { skill: 'App Development', desc: 'Build simple mobile apps using kid-friendly frameworks and see your ideas come to life.' },
//               { skill: 'Web Development', desc: 'Design and code your own websites with HTML, CSS, and JavaScript.' },
//               { skill: 'UI/UX Design', desc: 'Explore user interface principles, wireframing, and prototyping for engaging digital experiences.' },
//               { skill: 'Graphic Design', desc: 'Create stunning visuals and learn design tools like Canva and beginner-friendly Photoshop.' },
//               { skill: 'Video Editing', desc: 'Edit videos, add effects, and tell stories using simple editing software.' },
//               { skill: 'Game Development', desc: 'Design interactive games with platforms like Unity or Scratch Game Engine.' },
//               { skill: 'Robotics & Electronics', desc: 'Get hands-on with basic circuits, microcontrollers, and robotics kits.' },
//               { skill: '3D Modeling & Animation', desc: 'Shape 3D objects and animate characters using beginner-friendly tools.' },
//               { skill: 'Data Science for Kids', desc: 'Discover data visualization and simple analytics with kid-friendly datasets.' },
//             ].map(item => (
//               <div key={item.skill} className="p-4 border rounded-lg">
//                 <h3 className="text-xl font-semibold text-[#1c2574]">{item.skill}</h3>
//                 <p className="text-gray-700 mt-1">{item.desc}</p>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Key Features */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {[
//               { icon: '💻', title: 'Live Coding Sessions' },
//               { icon: '🎨', title: 'Creative Projects' },
//               { icon: '📝', title: 'Hands-on Assignments' },
//               { icon: '📊', title: 'Progress Reports' },
//             ].map(feature => (
//               <div key={feature.title} className="text-center p-4 border rounded-lg">
//                 <div className="text-4xl mb-2">{feature.icon}</div>
//                 <h3 className="font-medium text-[#38b6ff]">{feature.title}</h3>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* How It Works */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
//           <ol className="list-decimal list-inside space-y-2">
//             <li><strong>Enroll & Skill Assessment:</strong> Quick quiz to gauge current level and interests.</li>
//             <li><strong>Choose Your Tech Path:</strong> Select from coding, design, robotics, and more.</li>
//             <li><strong>Schedule Virtual Labs:</strong> Book interactive sessions with experienced tech tutors.</li>
//             <li><strong>Create & Showcase:</strong> Build projects, share with peers, and earn digital badges.</li>
//           </ol>
//         </section>

//         {/* Testimonials */}
//         <section className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4">What Parents & Kids Say</h2>
//           <div className="space-y-6">
//             {[
//               { quote: "My daughter built her first game in a month—she's so proud!", name: "Mrs. Adebanjo, parent" },
//               { quote: "I love coding with STC Tutors—it's fun and I learn new things every class.", name: "Tunde, age 12" },
//             ].map((t, idx) => (
//               <blockquote key={idx} className="p-4 border-l-4 border-[#38b6ff] bg-gray-50">
//                 <p className="italic text-gray-800">“{t.quote}”</p>
//                 <footer className="mt-2 text-right font-semibold text-[#1c2574]">— {t.name}</footer>
//               </blockquote>
//             ))}
//           </div>
//         </section>

//         {/* Call to Action */}
//         <section className="text-center mb-12">
//           <div className="flex flex-col md:flex-row justify-center items-center gap-4">
//             {/* Back Button */}
//             <button
//             onClick={() => window.history.back()}
//             className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition">
//               ← Back
//               </button>

//             <a
//             href="/signup"
//             className="inline-block bg-[#38b6ff] text-white px-8 py-4 rounded-lg text-lg hover:bg-[#1c2574]"
//           >
//             Start Tech Training Now
//           </a>
//           </div>
          
//           <p className="mt-2 text-gray-600">Ignite your child's tech journey today!</p>
//         </section>
//       </main>
//     </>
//   );
// }


"use client";

import Image from 'next/image';
import Head from 'next/head';

import YouTubePlayer from '@/app/components/YouTubePlayer';
import { useRouter } from 'next/navigation';

export default function TechTraining() {
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

