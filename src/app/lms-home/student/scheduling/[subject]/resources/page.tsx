// // app/lms-home/student/schedule/[subject]/resource/page.tsx
// "use client";

// import { FileText } from "lucide-react";

// function ResourceCard({ title, size, date }: { title: string; size: string; date: string }) {
//   return (
//     <div className="flex items-center justify-between py-4 border-b">
//       <div className="flex gap-4 items-center">
//         <FileText className="text-red-500" />
//         <div>
//           <p className="font-semibold">{title}</p>
//           <p className="text-xs text-gray-500">PDF • Added {date}</p>
//         </div>
//       </div>
//       <div className="text-gray-500 text-sm">{size}</div>
//     </div>
//   );
// }

// export default function ResourcePage() {
//   return (
//     <div className="p-6 space-y-10">
//       <h2 className="text-xl font-bold mb-4">📄 Resources & Materials</h2>

//       <ResourceCard title="Mathematics Formula Sheet" date="yesterday" size="2MB" />
//       <ResourceCard title="Algebra Revision Notes" date="2 days ago" size="1.5MB" />
//       <ResourceCard title="Graph Paper (Printable)" date="last week" size="500KB" />
//     </div>
//   );
// }

// app/lms-home/student/schedule/[subject]/resources/page.tsx
// "use client";

// import { ArrowLeft, Folder, FileText, Download } from "lucide-react";
// import Link from "next/link";

// const lectureMaterials = [
//   {
//     title: "Mathematics Formular Sheet",
//     type: "PDF",
//     dateAdded: "Added yesterday",
//     size: "2MB",
//   },
//   {
//     title: "Mathematics Formular Sheet",
//     type: "PDF",
//     dateAdded: "Added yesterday",
//     size: "2MB",
//   },
//   {
//     title: "Mathematics Formular Sheet",
//     type: "PDF",
//     dateAdded: "Added yesterday",
//     size: "2MB",
//   },
// ];

// export default function ResourcesPage() {
//   return (
//     <div className="p-6 md:p-10 bg-[#f9f9f9] min-h-screen">
//       {/* Top nav */}
//       <div className="flex items-center text-sm text-gray-500 space-x-1 mb-6">
//         <ArrowLeft size={18} />
//         <Link href="/lms-home/student/schedule">
//           <span className="hover:underline">Course Details</span>
//         </Link>
//         <span>/</span>
//         <span className="font-semibold text-black">Resources</span>
//       </div>

//       {/* Card container */}
//       <div className="bg-white rounded-2xl shadow-sm p-6">
//         {/* Header */}
//         <div className="flex items-center space-x-2 mb-6">
//           <Folder className="text-blue-500" />
//           <h2 className="text-lg font-semibold text-blue-600">
//             Lecture Materials
//           </h2>
//         </div>

//         {/* Material List */}
//         <div className="space-y-6">
//           {lectureMaterials.map((material, idx) => (
//             <div
//               key={idx}
//               className="flex items-center justify-between border-b pb-4 last:border-b-0"
//             >
//               <div className="flex items-center space-x-4">
//                 <FileText className="text-blue-400" />
//                 <div>
//                   <h3 className="font-semibold text-gray-800">
//                     {material.title}
//                   </h3>
//                   <p className="text-xs text-gray-500">
//                     {material.type} • {material.dateAdded}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2 text-gray-500 text-sm">
//                 <Download size={16} className="text-gray-500" />
//                 <span>{material.size}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import { ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const resources = [
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf', // Replace with actual file URLs
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
  {
    title: 'Mathematics Formular Sheet',
    fileType: 'PDF',
    size: '2MB',
    added: 'Added yesterday',
    url: '/sample.pdf',
  },
];

export default function ResourcesMaterials() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Top Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <ArrowLeft
          className="w-5 h-5 cursor-pointer hover:text-blue-500"
          onClick={() => router.back()}
        />
        <p className="text-gray-500 text-sm">
          Course Details <span className="text-black font-semibold">/ Resources</span>
        </p>
      </div>

      {/* Heading */}
      <div className="flex items-center gap-2 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-6-4h4a2 2 0 012 2v0a2 2 0 01-2 2h-4m-6 0H5a2 2 0 01-2-2v0a2 2 0 012-2h4"
          />
        </svg>
        <h2 className="text-lg font-semibold text-blue-500">Lecture Materials</h2>
      </div>

      {/* Resource List */}
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white-100 px-4 py-3 rounded-md shadow-sm hover:bg-gray-200 transition"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="bg-white p-2 rounded-full border">
                <img
                  src="/pdf-icon.png" // Replace with your own icon if needed
                  alt="PDF"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">{resource.title}</h3>
                <p className="text-xs text-gray-500">
                  {resource.fileType} • {resource.added}
                </p>
              </div>
            </div>

            {/* Download Button */}
            <a
              href={resource.url}
              download
              className="flex items-center gap-1 text-blue-500 text-sm hover:underline"
            >
              <Download className="w-4 h-4" />
              {resource.size}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
