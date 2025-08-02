// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useState } from "react";

// export default function SubmitAssignmentPage() {
//   const router = useRouter();

//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [file, setFile] = useState<File | null>(null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile) setFile(selectedFile);
//   };

//   const handleSubmit = () => {
//     // Submit logic here
//     console.log({ name, description, file });
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-8">
//       <button onClick={() => router.back()} className="text-sm mb-4">&larr; Back</button>

//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-semibold">Submission File</h1>
//         <Button
//           disabled={!name || !description || !file}
//           onClick={handleSubmit}
//         >
//           Upload
//         </Button>
//       </div>

//       <div className="space-y-6">
//         <div>
//           <label className="text-sm font-medium block mb-1">Name</label>
//           <Input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Write Name……………"
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium block mb-1">Description</label>
//           <Textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Write Name……………"
//           />
//         </div>

//         <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
//           <label htmlFor="file-upload" className="cursor-pointer block">
//             <div className="text-sm text-gray-500 mb-2">Drop your file here, or <span className="text-blue-600 underline">Browse</span></div>
//             <div className="text-xs text-gray-400">{file?.name || "No file selected"}</div>
//           </label>
//           <input
//             id="file-upload"
//             type="file"
//             className="hidden"
//             onChange={handleFileChange}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }


// app/lms-home/student/schedule/[subject]/submit/page.tsx
"use client";

import { useState } from "react";
import { Upload, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";

export default function SubmitAssignmentPage() {
  const { subject } = useParams();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("Please upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("description", description);

    // Replace this with actual API call
    console.log("Submitting", formData.get("file"), formData.get("description"));
    alert("Submitted successfully!");
  };
  
  const handleBack = () => {
    router.push(`/lms-home/student/scheduling`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-blue-500 mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <h1 className="text-xl font-bold text-gray-800 capitalize">
          Submit Assignment – {decodeURIComponent(subject as string)}
        </h1>

        <div>
          <label className="block text-sm font-medium text-gray-700">Assignment Title</label>
          <input
            type="text"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. Algebra Homework"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            placeholder="Add details about your submission..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
          <div className="relative">
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-blue-400 rounded-md cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              <Upload className="w-4 h-4" />
              <span>{selectedFile ? selectedFile.name : "Browse"}</span>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <button
                onClick={handleFileRemove}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <Button
          className={`w-full ${selectedFile ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
          disabled={!selectedFile}
          onClick={handleSubmit}
        >
          Upload Assignment
        </Button>
      </div>
    </div>
  );
}

