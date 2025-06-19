"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignupLogo from "@/app/components/SignupLogo";
import { bootcampAgeLevels } from "@/lib/bootcamp";

export default function SubjectsPage() {
  const router = useRouter();

  const [learningFocus, setLearningFocus] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState("");
  const [tutorGender, setTutorGender] = useState("");
  const [childName, setChildName] = useState("");
  const [ageLevel, setAgeLevel] = useState("");

  useEffect(() => {
    const infoData = sessionStorage.getItem("childInfo");
    const formData = sessionStorage.getItem("childInfoFormData");

    if (formData) {
      const parsed = JSON.parse(formData);
      setChildName(parsed.fullName || "");
    }

    if (infoData) {
      const data = JSON.parse(infoData);
      setLearningFocus(data.learningFocus || "");
      setCurriculum(data.curriculum || "");
      setEducationLevel(data.educationLevel || "");
      setGradeLevel(data.gradeLevel || "");
      setSelectedSubjects(data.selectedSubjects || []);
      setLearningGoals(data.learningGoals || "");
      setTutorGender(data.tutorGender || "");
      setAgeLevel(data.ageLevel || "");
    }
  }, []);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = () => {
    sessionStorage.setItem(
      "childInfo",
      JSON.stringify({
        learningFocus,
        curriculum,
        educationLevel,
        gradeLevel,
        selectedSubjects,
        learningGoals,
        tutorGender,
        ageLevel,
      })
    );
    router.push("/dashboard/schedule");
  };

  const techTrackOptions =
    learningFocus === "Tech for Kids" && ageLevel
      ? bootcampAgeLevels[ageLevel] || []
      : [];

  return (
    <div className="min-h-screen bg-blue-900 flex flex-col items-center px-4 py-8">
      <SignupLogo />
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center">Subjects for {childName || "Child"}</h2>

        {/* Learning Focus */}
        <select
          value={learningFocus}
          onChange={(e) => {
            setLearningFocus(e.target.value);
            setCurriculum("");
            setEducationLevel("");
            setGradeLevel("");
            setAgeLevel("");
            setSelectedSubjects([]);
          }}
          className="w-full p-2 border mt-2 rounded"
          required
        >
          <option value="">Select Learning Focus</option>
          <option value="Exam Preparation">Exam Preparation</option>
          <option value="Subject Tutoring">Subject Tutoring</option>
          <option value="Tech for Kids">Tech for Kids</option>
        </select>

        {/* Tech for Kids - Age & Track Selection */}
        {learningFocus === "Tech for Kids" && (
          <>
            <select
              value={ageLevel}
              onChange={(e) => {
                setAgeLevel(e.target.value);
                setSelectedSubjects([]);
              }}
              className="w-full p-2 border mt-2 rounded"
              required
            >
              <option value="">Select Age Level</option>
              {Object.keys(bootcampAgeLevels).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            {ageLevel && (
              <div className="mt-4">
                <h3 className="font-bold">Select Tech Track:</h3>
                {techTrackOptions.map((track) => (
                  <label key={track} className="block">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(track)}
                      onChange={() => handleSubjectChange(track)}
                      className="mr-2"
                    />
                    {track}
                  </label>
                ))}
              </div>
            )}
          </>
        )}

        {/* Learning Goals */}
        <div className="mt-4">
          <h3 className="font-bold">Learning Goals:</h3>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="E.g. Improve English speaking skills"
            value={learningGoals}
            onChange={(e) => setLearningGoals(e.target.value)}
          ></textarea>
        </div>

        {/* Tutor Gender */}
        <div className="mt-4">
          <h3 className="font-bold">Preferred Tutor's Gender:</h3>
          {["Male", "Female", "Prefer not to say"].map((gender) => (
            <label key={gender} className="mr-4">
              <input
                type="radio"
                name="tutorGender"
                value={gender}
                checked={tutorGender === gender}
                onChange={(e) => setTutorGender(e.target.value)}
                className="mr-1"
              />
              {gender}
            </label>
          ))}
        </div>

        {/* Buttons */}
        <button
          onClick={() => router.push("/dashboard/child-info")}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded mt-2"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded mt-4"
        >
          Continue
        </button>
      </div>
    </div>
  );
}