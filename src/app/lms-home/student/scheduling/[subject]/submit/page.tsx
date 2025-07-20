"use client";
import { useParams } from "next/navigation";

export default function SubmitPage() {
  const params = useParams();
  const subject = decodeURIComponent(params.subject as string);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Submit Assignment - {subject}</h1>
      <p className="mt-2 text-gray-600">Upload your assignment for {subject} here.</p>

      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Assignment Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded border-gray-300"
            placeholder="e.g. Week 2 Algebra"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload File</label>
          <input
            type="file"
            className="w-full border border-gray-300 rounded p-1"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Assignment
        </button>
      </form>
    </div>
  );
}