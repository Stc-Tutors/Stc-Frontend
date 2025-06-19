import React from "react";

interface SummaryProps {
  childName: string;
  serviceType: string;
  curriculum?: string;
  educationLevel?: string;
  gradeLevel?: string;
  selectedSubjects: string[];
  learningGoals?: string;
  tutorGender?: string;
  schedule?: {
    subject: string;
    days: string[];
    time: string;
    duration: number;
  }[];
  totalCost?: number;
}

export default function ServiceSummaryCard({
  childName,
  serviceType,
  curriculum,
  educationLevel,
  gradeLevel,
  selectedSubjects,
  learningGoals,
  tutorGender,
  schedule,
  totalCost
}: SummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">📄 Summary for {childName}</h3>

      <div className="text-sm text-gray-700 space-y-2">
        <p><strong>Service Type:</strong> {serviceType}</p>
        {curriculum && <p><strong>Curriculum:</strong> {curriculum}</p>}
        {educationLevel && <p><strong>Education Level:</strong> {educationLevel}</p>}
        {gradeLevel && <p><strong>Grade/Exam:</strong> {gradeLevel}</p>}
        {tutorGender && <p><strong>Preferred Tutor:</strong> {tutorGender}</p>}
        {learningGoals && <p><strong>Learning Goals:</strong> {learningGoals}</p>}

        <div>
          <strong>Subjects:</strong>
          <ul className="list-disc list-inside ml-2">
            {selectedSubjects.map((subj, idx) => (
              <li key={idx}>{subj}</li>
            ))}
          </ul>
        </div>

        {schedule && (
          <div>
            <strong>Schedule:</strong>
            <ul className="list-inside ml-2 mt-1">
              {schedule.map((s, idx) => (
                <li key={idx}>
                  <span className="font-medium">{s.subject}:</span>{" "}
                  {s.days.join(", ")} at {s.time} ({s.duration} mins)
                </li>
              ))}
            </ul>
          </div>
        )}

        {typeof totalCost === "number" && (
          <div className="text-right mt-4 font-bold text-blue-600">
            Estimated Monthly Cost: ₦{totalCost.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}