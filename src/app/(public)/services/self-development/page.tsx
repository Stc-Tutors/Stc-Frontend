"use client";

import Image from 'next/image';
import Head from 'next/head';

import YouTubePlayer from '@/app/components/YouTubePlayer';
import { useRouter } from 'next/navigation';

export default function SelfDevelopment() {
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


// export default function SelfDevelopment() {
//     return (
//       <div className="p-6">
//         <h1 className="text-4xl font-bold mb-4">SELF DEVELOPMENT</h1>
//         <p className="text-lg text-gray-700">
//           COMING SOON!!!!!!!
//         </p>
//       </div>
//     );
//   }
  