"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SubjectSchedule {
  subject: string;
  days: string[];
  timeSlots: {
    morning: string;
    afternoon: string;
    evening: string;
  };
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
  "8:00am", "9:00am", "10:00am", "11:00am",
  "12:00pm", "1:00pm", "2:00pm", "3:00pm",
  "4:00pm", "5:00pm", "6:00pm", "7:00pm"
];

export default function SchedulingPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectSchedule[]>([]);

  useEffect(() => {
    const savedData = sessionStorage.getItem("childInfo");
    if (savedData) {
      const { selectedSubjects } = JSON.parse(savedData);
      setSubjects(
        selectedSubjects.map((subject: string) => ({
          subject,
          days: [],
          timeSlots: {
            morning: "8:00am",
            afternoon: "12:00pm",
            evening: "4:00pm"
          },
          duration: 60
        }))
      );
    }
  }, []);

  const handleDayChange = (subjectIndex: number, day: string) => {
    setSubjects(prevSubjects => 
      prevSubjects.map((subject, idx) => {
        if (idx === subjectIndex) {
          const newDays = subject.days.includes(day)
            ? subject.days.filter(d => d !== day) // Remove the day if it's selected
            : [...subject.days, day]; // Add the day if it's not selected
  
          return { ...subject, days: newDays };
        }
        return subject;
      })
    );
  };
  

  const handleTimeChange = (subjectIndex: number, slot: 'morning' | 'afternoon' | 'evening', time: string) => {
    setSubjects(prev => {
      const updated = [...prev];
      updated[subjectIndex].timeSlots[slot] = time;
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
    sessionStorage.setItem("schedule", JSON.stringify(subjects));
    router.push("/register/payment");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Schedule Your Subjects</h2>
        
        {subjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No subjects selected yet.</p>
            <button 
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back to Select Subjects
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days of the week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {subject.subject}
                    </td>
                    <td className="px-6 py-4">
  <div className="grid grid-cols-4 gap-2">
    {daysOfWeek.map((day) => (
      <label key={day} className="flex items-center space-x-2">
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
                      <div className="space-y-2">
                        <select
                          value={subject.timeSlots.morning}
                          onChange={(e) => handleTimeChange(index, 'morning', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          {timeOptions.filter(t => t.includes('am')).map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <select
                          value={subject.timeSlots.afternoon}
                          onChange={(e) => handleTimeChange(index, 'afternoon', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          {timeOptions.filter(t => t.includes('pm') && parseInt(t) < 4).map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <select
                          value={subject.timeSlots.evening}
                          onChange={(e) => handleTimeChange(index, 'evening', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          {timeOptions.filter(t => t.includes('pm') && parseInt(t) >= 4).map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={subject.duration}
                        onChange={(e) => handleDurationChange(index, Number(e.target.value))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {durationOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}