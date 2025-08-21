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



// "use client";

// import {
//   ArrowLeft,
//   FileText,
//   Headphones,
//   Video,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// const resources = [
//   {
//     title: "Mathematics Formula Sheet",
//     size: "2MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/math.pdf",
//     audioUrl: "/resources/math.mp3",
//     videoUrl: "/resources/math.mp4",
//   },
//   {
//     title: "English Comprehensive Sheet",
//     size: "2MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/english.pdf",
//     audioUrl: "/resources/english.mp3",
//     videoUrl: "/resources/english.mp4",
//   },
//   {
//     title: "Biology: Reproductive System",
//     size: "3MB",
//     added: "Added today",
//     pdfUrl: "/resources/biology.pdf",
//     audioUrl: "/resources/biology.mp3",
//     videoUrl: "/resources/biology.mp4",
//   },
//   {
//     title: "Physics: Velocity",
//     size: "2.5MB",
//     added: "Added 2 days ago",
//     pdfUrl: "/resources/physics.pdf",
//     audioUrl: "/resources/physics.mp3",
//     videoUrl: "/resources/physics.mp4",
//   },
//   {
//     title: 'Home Economics: Grooming',
//     size: "2.5MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/home economics.pdf",
//     audioUrl: "/resources/home economics.mp3",
//     videoUrl: "/resources/home economics.mp4",
//   },
//   {
//     title: 'Computer Science: Binary',
//     size: "20MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/computer science.pdf",
//     audioUrl: "/resources/computer science.mp3",
//     videoUrl: "/resources/computer science.mp4",
//   },
//   {
//     title: 'Agricultural Science: Mixed Farming and Crop Farming',
//     size: "10MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/agricultural science.pdf",
//     audioUrl: "/resources/agricultural science.mp3",
//     videoUrl: "/resources/agricultural science.mp4",
//   },
//   {
//     title: 'Civic Education',
//     size: "5MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/civic education.pdf",
//     audioUrl: "/resources/civic education.mp3",
//     videoUrl: "/resources/civic education.mp4",
//   },
//   {
//     title: 'Government: Democracy',
//     size: "6MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/government.pdf",
//     audioUrl: "/resources/government.mp3",
//     videoUrl: "/resources/government.mp4",
//   },
//   {
//     title: 'Book Keeping',
//     size: "2MB",
//     added: "Added 3 days ago",
//     pdfUrl: "/resources/book keeping.pdf",
//     audioUrl: "/resources/book keeping.mp3",
//     videoUrl: "/resources/book keeping.mp4",
//   },
//   {
//     title: 'Literature-in-English: Figures of Speech',
//     size: "2MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/literature-in-english.pdf",
//     audioUrl: "/resources/literature-in-english.mp3",
//     videoUrl: "/resources/literature-in-english.mp4",
//   },
//   {
//     title: 'Accounting',
//     size: "2MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/acconting.pdf",
//     audioUrl: "/resources/acconting.mp3",
//     videoUrl: "/resources/acconting.mp4",
//   },
//   {
//     title: 'Social Studies: Family',
//     size: "2MB",
//     added: "Added yesterday",
//     pdfUrl: "/resources/social studies.pdf",
//     audioUrl: "/resources/social studies.mp3",
//     videoUrl: "/resources/social studies.mp4",
//   },
// ];

// export default function ResourcesMaterials() {
//   const router = useRouter();

//   return (
//     <div className="min-h-screen bg-white p-4 md:p-8">
//       {/* Top Navigation */}
//       <div className="flex items-center gap-2 mb-6">
//         <ArrowLeft
//           className="w-5 h-5 cursor-pointer hover:text-blue-500"
//           onClick={() => router.back()}
//         />
//         <p className="text-gray-500 text-sm">
//           Course Details{" "}
//           <span className="text-black font-semibold">/ Resources</span>
//         </p>
//       </div>

//       {/* Heading */}
//       <div className="flex items-center gap-2 mb-4">
//         <FileText className="h-6 w-6 text-blue-500" />
//         <h2 className="text-lg font-semibold text-blue-500">
//           Lecture Materials
//         </h2>
//       </div>

//       {/* Resource List */}
//       <div className="space-y-4">
//         {resources.map((resource, index) => (
//           <div
//             key={index}
//             className="flex flex-col md:flex-row md:items-center justify-between bg-white px-4 py-3 rounded-md shadow-sm hover:bg-gray-100 transition"
//           >
//             {/* Subject Info */}
//             <div className="mb-2 md:mb-0">
//               <h3 className="text-sm font-medium text-gray-800">
//                 {resource.title}
//               </h3>
//               <p className="text-xs text-gray-500">{resource.added}</p>
//             </div>

//             {/* File Type Links */}
//             <div className="flex gap-4">
//               {/* PDF */}
//               <a
//                 href={resource.pdfUrl}
//                 download
//                 className="flex items-center gap-1 text-blue-500 text-sm hover:underline"
//               >
//                 <FileText className="w-5 h-5" />
//                 {resource.size}
//               </a>
//               {/* Audio */}
//               <a
//                 href={resource.audioUrl}
//                 download
//                 className="flex items-center gap-1 text-green-500 text-sm hover:underline"
//               >
//                 <Headphones className="w-5 h-5" />
//                 Audio
//               </a>
//               {/* Video */}
//               <a
//                 href={resource.videoUrl}
//                 download
//                 className="flex items-center gap-1 text-red-500 text-sm hover:underline"
//               >
//                 <Video className="w-5 h-5" />
//                 Video
//               </a>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


// app/subjects/[subject]/resources/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileAudio, FileVideo, FileText, ArrowLeft } from "lucide-react";

type Resource = {
  id: number;
  title: string;
  type: "audio" | "video" | "pdf";
  url: string;
};

const mockData: Record<string, Resource[]> = {
  mathematics: [
    { id: 1, title: "Algebra Basics", type: "audio", url: "/math/algebra.mp3" },
    { id: 2, title: "Geometry Lecture", type: "video", url: "/math/geometry.mp4" },
    { id: 3, title: "Calculus Notes", type: "pdf", url: "/math/calculus.pdf" },
  ],
  biology: [
    { id: 4, title: "Cell Structure", type: "audio", url: "/bio/cell.mp3" },
    { id: 5, title: "DNA Replication", type: "video", url: "/bio/dna.mp4" },
    { id: 6, title: "Genetics Notes", type: "pdf", url: "/bio/genetics.pdf" },
  ],
};

export default function SubjectResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const subject = params.subject as string;

  const [activeTab, setActiveTab] = useState<"audio" | "video" | "pdf">("audio");

  const resources = mockData[subject] || [];
  const filteredResources = resources.filter((res) => res.type === activeTab);

  const handleBack = () => {
    router.push(`/lms-home/student/scheduling`);
  };

  return (
    <div className="p-6">
      <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-blue-500 mb-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

      <h1 className="text-2xl font-bold capitalize mb-4">
        {subject} - Resources & Materials
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2 mb-4">
        <button
          className={`flex items-center gap-2 px-3 py-1 rounded ${
            activeTab === "pdf" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("pdf")}
        >
          <FileText size={18} /> DOCUMENT
        </button>

          <button
          className={`flex items-center gap-2 px-3 py-1 rounded ${
            activeTab === "video" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("video")}
        >
          <FileVideo size={18} /> Video
        </button>

        <button
          className={`flex items-center gap-2 px-3 py-1 rounded ${
            activeTab === "audio" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("audio")}
        >
          <FileAudio size={18} /> Audio
        </button>     
      </div>

      {/* Resource List */}
      {filteredResources.length > 0 ? (
        <ul className="space-y-3">
          {filteredResources.map((res) => (
            <li
              key={res.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <span>{res.title}</span>
              <a
                href={res.url}
                className="text-blue-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No {activeTab} files available for {subject}.</p>
      )}
    </div>
  );
}
