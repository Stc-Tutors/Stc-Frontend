"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SubjectSchedule {
  subject: string;
  days: string[];
  time: string;
  duration: number;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const durationOptions = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hr 30 mins" },
  { value: 120, label: "2 hours" }
];
const timeOptions = [
  "8:00am", "9:00am", "10:00am", "11:00am", "12:00pm",
  "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm", "7:00pm"
];

export default function SchedulingPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectSchedule[]>([]);
  const [isTechForKids, setIsTechForKids] = useState(false);

  const [childName, setChildName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [curriculum, setCurriculum] = useState("");


  // useEffect(() => {
  //   const saved = sessionStorage.getItem("childInfo");
  //   if (saved) {
  //     const { selectedSubjects, learningFocus, fullName } = JSON.parse(saved);
  //     setChildName(fullName || "Child");
  //     if (learningFocus === "Tech for Kids") {
  //       setIsTechForKids(true);
  //       // Treat each subject as a fixed track (no scheduling needed)
  //       setSubjects(selectedSubjects.map((track: string) => ({
  //         subject: track,
  //         days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  //         time: "4:00pm",
  //         duration: 60
  //       })));
  //     } else {
  //       // For regular tutoring / exam prep
  //       setSubjects(
  //         selectedSubjects.map((subject: string) => ({
  //           subject,
  //           days: [],
  //           time: "8:00am",
  //           duration: 60
  //         }))
  //       );
  //     }
  //   }
  // }, []);

  useEffect(() => {
  const info = sessionStorage.getItem("childInfo");
  const form = sessionStorage.getItem("childInfoFormData");

  if (form) {
    const parsedForm = JSON.parse(form);
    setChildName(parsedForm.fullName || "Child");
  }

  if (info) {
    const parsedInfo = JSON.parse(info);
    const { selectedSubjects, learningFocus, curriculum } = parsedInfo;

    setCurriculum(curriculum || "");

    if (learningFocus === "Tech for Kids") {
      setIsTechForKids(true);
      setSubjects(
        selectedSubjects.map((track: string) => ({
          subject: track,
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          time: "4:00pm",
          duration: 60,
        }))
      );
    } else {
      setSubjects(
        selectedSubjects.map((subject: string) => ({
          subject,
          days: [],
          time: "8:00am",
          duration: 60,
        }))
      );
    }
  }
}, []);

  useEffect(() => {
    sessionStorage.setItem("schedule", JSON.stringify(subjects));
  }, [subjects]);

  const handleDayChange = (subjectIndex: number, day: string) => {
    setSubjects(prevSubjects =>
      prevSubjects.map((subject, idx) => {
        if (idx === subjectIndex) {
          const newDays = subject.days.includes(day)
            ? subject.days.filter(d => d !== day)
            : [...subject.days, day];
          return { ...subject, days: newDays };
        }
        return subject;
      })
    );
  };

  const handleTimeChange = (subjectIndex: number, time: string) => {
    setSubjects(prev => {
      const updated = [...prev];
      updated[subjectIndex].time = time;
      return updated;
    });
  };

  const handleDurationChange = (subjectIndex: number, duration: number) => {
    setSubjects(prev => {
      const updated = [...prev];
      updated[subjectIndex].duration = duration;
      return updated;
    });
  };

  const handleSubmit = () => {
  const hasValidSchedule = subjects.some(subject => subject.days.length > 0);

  if (!hasValidSchedule) {
    setErrorMessage("⚠️ Please select at least one day for at least one subject before continuing.");
    return;
  }

  sessionStorage.setItem("schedule", JSON.stringify(subjects));
  sessionStorage.setItem("totalAmount", totalMonthly.toString());
  router.push("/dashboard/payment");
};

  const calculateTotal = () => {
    const ratePerHour = 1000;
    return subjects.reduce((total, subject) => {
      const hoursPerDay = subject.duration / 60;
      const totalHours = subject.days.length * hoursPerDay;
      return total + totalHours * ratePerHour;
    }, 0);
  };

  // const totalWeekly = calculateTotal();
  // const totalMonthly = totalWeekly * 4;

  // const totalMonthly = isTechForKids ? 25000 : calculateTotal() * 4;

  const totalMonthly =
  isTechForKids && curriculum === "Nigerian" ? 25000 :
  isTechForKids ? 50000 :
  calculateTotal() * 4;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Schedule Your Subjects for {childName || "Child"}</h2>

        {isTechForKids ? (
          // ✅ Tech Bootcamp UI
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Tech for Kids Bootcamp</h3>
            <p className="text-gray-700 mb-4">
              Our bootcamps run <strong>Monday to Friday, 4:00pm–5:00pm</strong>. You’ll receive details by email.
            </p>
            <div className="mt-4">
              <h4 className="font-bold mb-2">Selected Track(s):</h4>
              <ul className="list-disc list-inside text-left max-w-md mx-auto">
                {subjects.map((track, idx) => (
                  <li key={idx}>{track.subject}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  sessionStorage.setItem("schedule", JSON.stringify(subjects)); // Save first
                  router.push("/dashboard/subjects");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        ) : (
          // 🧠 Academic/Exam Tutoring UI
          <div className="flex flex-col lg:flex-row gap-6">
            {/* <div className="overflow-x-auto"> */}
            <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                {/* <table className="min-w-full divide-y divide-gray-200 text-sm"> */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((subject, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 font-medium text-gray-900">{subject.subject}</td>
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-2">
                          {/* <div className="flex flex-wrap gap-2"> */}
                          {daysOfWeek.map((day) => (
                            <label key={day} className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={subject.days.includes(day)}
                                onChange={() => handleDayChange(index, day)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{day}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={subject.time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="block w-full rounded border-gray-300 shadow-sm sm:text-sm"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={subject.duration}
                          onChange={(e) => handleDurationChange(index, Number(e.target.value))}
                          className="block w-full rounded border-gray-300 shadow-sm sm:text-sm"
                        >
                          {durationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-4 bg-gray-50 flex justify-between">
                <button
                  onClick={() => {
                    sessionStorage.setItem("schedule", JSON.stringify(subjects)); // Save first
                    router.push("/dashboard/subjects");
}}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Continue to Payment
                </button>
              </div>
            </div>

            {/* Schedule Cart */}
            <div className="bg-white p-4 rounded-lg shadow-md h-fit">
              {errorMessage && (
                <div className="mb-4 text-red-600 font-semibold bg-red-100 border border-red-400 p-3 rounded">
                  {errorMessage}
                  </div>
                )}

              <h3 className="text-lg font-bold mb-4">Schedule Summary</h3>
              {subjects.map((subject, index) => {
                const hours = (subject.duration / 60) * subject.days.length;
                const cost = hours * 1000;
                return (
                  <div key={index} className="mb-4 border-b pb-2 text-sm">
                    <p className="font-semibold">{subject.subject}</p>
                    <p>Days: {subject.days.join(", ") || "None"}</p>
                    <p>Duration/day: {subject.duration} mins</p>
                    <p>Time: {subject.time}</p>

                    {isTechForKids && (
                      <p>Monthly Total: ₦{totalMonthly.toLocaleString()}</p>
                    )}
                  </div>
                );
              })}

              {isTechForKids && (
                <div className="text-sm font-semibold mt-4">
                  Total for Tech Bootcamp: ₦{totalMonthly.toLocaleString()}
                  </div>
                )}
              
              <div className="text-sm text-gray-500 mt-2">
              Est. Monthly: ₦{isTechForKids ? curriculum === "Nigerian" ?
              "25,000" : "50,000" :
              totalMonthly.toLocaleString()}
              </div>
              {!isTechForKids && (

              <div className="text-sm text-gray-500">
                Based on selected days and durations
              </div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}