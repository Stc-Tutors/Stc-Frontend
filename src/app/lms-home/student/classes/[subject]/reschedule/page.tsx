"use client";
import { useState } from "react";

export default function RescheduleForm() {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    link: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // TODO: Handle submission logic (e.g., API call)
    console.log("Form submitted:", formData);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded-md">
      <h2 className="text-xl font-semibold mb-4">Reschedule</h2>

      <input
        type="text"
        name="title"
        placeholder="New Event Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <div className="flex gap-2 mb-3">
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className="w-1/2 p-2 border rounded"
        />
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="w-1/2 p-2 border rounded"
        />
      </div>

      <input
        type="url"
        name="link"
        placeholder="https://googlemeet.com"
        value={formData.link}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded text-blue-600"
      />

      <textarea
        name="description"
        placeholder="Add Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <div className="flex justify-between">
        <button className="px-4 py-2 border rounded text-gray-600">Cancel</button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// // Example usage inside a Dashboard component:
// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import RescheduleModal from "@/components/studentDashboard/RescheduleModal";

// export default function Dashboard() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <>
//       <Button onClick={() => setIsOpen(true)}>Open Reschedule Modal</Button>
//       <RescheduleModal open={isOpen} onOpenChange={setIsOpen} />
//     </>
//   );
// }

