// // app/lms-home/student/schedule/[subject]/attempt/page.tsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { useState } from "react";

// export default function AttemptAssignmentPage() {
//   const [response, setResponse] = useState("");

//   const handleSubmit = () => {
//     // You can hook this to backend later
//     console.log("Assignment submitted:", response);
//     alert("Assignment submitted successfully!");
//   };

//   return (
//     <div className="p-6 space-y-6 max-w-3xl mx-auto">
//       <h2 className="text-2xl font-bold">📘 Attempt Assignment</h2>

//       <div className="border rounded-md p-4 shadow-sm space-y-2">
//         <p className="font-semibold">Subject: Mathematics (SS1)</p>
//         <p>Instructor: Mr Peter Kolawole</p>
//         <p className="text-sm text-red-500">Due: July 18, 11:00 PM</p>
//       </div>

//       <div className="space-y-2">
//         <label className="block font-medium">Your Answer</label>
//         <Textarea
//           placeholder="Write your answer here..."
//           value={response}
//           onChange={(e) => setResponse(e.target.value)}
//           rows={10}
//         />
//       </div>

//       <Button onClick={handleSubmit} className="mt-4">
//         Submit Assignment
//       </Button>
//     </div>
//   );
// }


// app/lms-home/student/schedule/[subject]/submit/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AttemptAssignmentPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = () => {
    if (!file) return alert("Please attach your file first.");
    // Upload logic here
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6 space-x-2">
        <ArrowLeft
          className="cursor-pointer hover:text-blue-500"
          onClick={() => router.back()}
        />
        <h1 className="text-2xl font-semibold">Attempt Assignment</h1>
      </div>

      {submitted ? (
        <div className="text-green-600 flex items-center space-x-2">
          <CheckCircle />
          <p>Assignment successfully submitted!</p>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-3 border">
            <h2 className="text-xl font-semibold">Essay on Climate Change</h2>
            <p className="text-gray-700 text-sm">
              Write an essay explaining the effects of climate change on agriculture in West Africa.
            </p>
            <p className="text-sm text-red-500">Due: July 28, 2025</p>
          </div>

          <div className="space-y-4 bg-white p-4 rounded-lg shadow border">
            <div>
              <label className="block mb-1 font-medium">Attach File (PDF, DOCX)</label>
              <Input type="file" onChange={handleFileChange} />
              {file && <p className="mt-1 text-sm text-green-600">Selected: {file.name}</p>}
            </div>

            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <Upload size={16} />
              Submit Assignment
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
