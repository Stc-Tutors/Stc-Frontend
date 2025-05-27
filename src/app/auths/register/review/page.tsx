"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  lastName: string;
  firstName: string;
  gender: string;
  class: string;
  preferredTutorGender: string;
};

type Location = {
  lessonType: string;
  address: string;
  country: string;
};

type Schedule = {
  lessonDays: string;
  startTime: string;
  duration: string;
  hoursPerDay: string;
  startDate: string;
};

type ChildData = {
  profile: Profile;
  location: Location;
  schedule: Schedule;
};

export default function SchedulePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [children, setChildren] = useState<ChildData[]>([
    {
      profile: {
        lastName: "Grey",
        firstName: "Tofunmi",
        gender: "Male",
        class: "SS2",
        preferredTutorGender: "Male",
      },
      location: {
        lessonType: "Physical",
        address: "22, Tild Street, Kas Gas bus stop, Ota, Ogun State",
        country: "Nigeria",
      },
      schedule: {
        lessonDays: "Mondays, Tuesdays, and Thursdays",
        startTime: "2:00pm",
        duration: "1 month",
        hoursPerDay: "2 hours",
        startDate: "1 week time",
      },
    },
  ]);

  // Toggle edit mode
  const toggleEdit = () => setIsEditing(!isEditing);

  // Handle changes for profile, location, and schedule
  const handleInputChange = (
    index: number,
    section: keyof ChildData,
    field: string,
    value: string
  ) => {
    const updatedChildren = [...children];
    updatedChildren[index] = {
      ...updatedChildren[index],
      [section]: {
        ...updatedChildren[index][section],
        [field]: value,
      },
    };
    setChildren(updatedChildren);
  };

  // Add another child with empty fields
  const addChild = () => {
    setChildren([
      ...children,
      {
        profile: { lastName: "", firstName: "", gender: "", class: "", preferredTutorGender: "" },
        location: { lessonType: "", address: "", country: "" },
        schedule: { lessonDays: "", startTime: "", duration: "", hoursPerDay: "", startDate: "" },
      },
    ]);
  };

  return (
    <div className="min-h-screen flex justify-center bg-blue-900 py-12 px-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-center text-xl font-bold text-gray-900">Schedule</h2>

        {children.map((child, index) => (
          <div key={index} className="mt-6 border-b pb-6">
            {/* Profile Setup */}
            <section>
              <h3 className="font-semibold text-lg text-gray-700 flex justify-between">
                Profile Setup ({index + 1})
                <button onClick={toggleEdit} className="text-blue-600 hover:underline text-sm">
                  {isEditing ? "Save ✓" : "Edit ✎"}
                </button>
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg mt-2">
                {Object.keys(child.profile).map((key) => (
                  <div key={key} className="flex justify-between py-1">
                    <p className="text-gray-700">{key.replace(/([A-Z])/g, " $1")}:</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border p-1 rounded w-1/2"
                        value={child.profile[key as keyof Profile]}
                        onChange={(e) =>
                          handleInputChange(index, "profile", key, e.target.value)
                        }
                      />
                    ) : (
                      <p className="font-semibold">{child.profile[key as keyof Profile]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Location Section */}
            <section className="mt-6">
              <h3 className="font-semibold text-lg text-gray-700">Location</h3>
              <div className="bg-gray-100 p-4 rounded-lg mt-2">
                {Object.keys(child.location).map((key) => (
                  <div key={key} className="flex justify-between py-1">
                    <p className="text-gray-700">{key.replace(/([A-Z])/g, " $1")}:</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border p-1 rounded w-1/2"
                        value={child.location[key as keyof Location]}
                        onChange={(e) =>
                          handleInputChange(index, "location", key, e.target.value)
                        }
                      />
                    ) : (
                      <p className="font-semibold">{child.location[key as keyof Location]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Schedule Section */}
            <section className="mt-6">
              <h3 className="font-semibold text-lg text-gray-700">Schedule</h3>
              <div className="bg-gray-100 p-4 rounded-lg mt-2">
                {Object.keys(child.schedule).map((key) => (
                  <div key={key} className="flex justify-between py-1">
                    <p className="text-gray-700">{key.replace(/([A-Z])/g, " $1")}:</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border p-1 rounded w-1/2"
                        value={child.schedule[key as keyof Schedule]}
                        onChange={(e) =>
                          handleInputChange(index, "schedule", key, e.target.value)
                        }
                      />
                    ) : (
                      <p className="font-semibold">{child.schedule[key as keyof Schedule]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        ))}

        {/* Add Another Child */}
        <button
          onClick={addChild}
          className="w-full bg-gray-300 text-gray-700 py-2 mt-4 rounded hover:bg-gray-400"
        >
          + Add Another Child
        </button>

        {/* Proceed to Payment */}
        <button
          onClick={() => router.push("/register/payment")}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
}