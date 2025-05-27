"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type CurriculumType = "Nigerian" | "British" | "American" | "Canada" | "";

type GradeSubjects = {
  [curriculum: string]: {
    [educationLevel: string]: {
      grades: string[];
      subjects: string[];
    };
  };
};

// educationData - Keep as you already wrote
const educationData: GradeSubjects = {
  Nigerian: {
    "Primary School": {
      grades: ["Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6"],
      subjects: [
        "English Language",
        "Mathematics",
        "Social Studies",
        "Basic Science",
        "Religious Knowledge",
        "Physical and Health Education",
        "Creative Arts",
        "Agricultural Science",
        "Computer Studies",
        "French",
        "Verbal Reasoning",
        "Quantitative Reasoning",
      ],
    },
    "Junior Secondary School": {
      grades: ["JSS 1", "JSS 2", "JSS 3"],
      subjects: [
        "English Language",
        "Mathematics",
        "Basic Science and Technology",
        "Social Studies",
        "Civic Education",
        "Agricultural Science",
        "Business Studies",
        "Home Economics",
        "Physical and Health Education",
        "Religious Knowledge",
        "Computer Studies",
        "Creative Arts",
      ],
    },
    "Senior Secondary School": {
      grades: ["SS 1", "SS 2", "SS 3"],
      subjects: [
        "English Language",
        "Mathematics",
        "Civic Education",
        "Biology",
        "Chemistry",
        "Physics",
        "Agricultural Science",
        "Further Mathematics",
        "Technical Drawing",
        "Economics",
        "Government",
        "Literature in English",
        "Religious Studies",
        "Geography",
        "Commerce",
      ],
    },
  },
  British: {
    "Primary School": {
      grades: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"],
      subjects: [
        "English",
        "Mathematics",
        "Science",
        "History",
        "Geography",
        "Art and Design",
        "Physical Education",
        "Music",
        "Computing",
        "Religious Education",
      ],
    },
    "Secondary School": {
      grades: ["Year 7", "Year 8", "Year 9"],
      subjects: [
        "English",
        "Mathematics",
        "Science",
        "History",
        "Geography",
        "Modern Foreign Languages",
        "Design and Technology",
        "Religious Education",
        "Computing",
      ],
    },
  },
  American: {
    "Elementary School": {
      grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
      subjects: [
        "English Language Arts",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Art and Music",
      ],
    },
    "Middle School": {
      grades: ["Grade 6", "Grade 7", "Grade 8"],
      subjects: [
        "English Language Arts",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Technology",
        "Computer Science",
      ],
    },
  },
  Canada: {
    "Elementary School": {
      grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
      subjects: [
        "English Language Arts",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Art and Music",
      ],
    },

    "Middle School": {
      grades: ["Grade 7", "Grade 8"],
      subjects: [
        "English Language Arts",
        "Mathematics",
        "Science",
        "Social Studies",
        "Physical Education",
        "Technology",
        "Computer Science",
      ],
    },

    "High School": {
      grades: ["Grade 7", "Grade 8"],
      subjects: [
        "English/Language Arts",
        "Mathematics",
        "Science",
        "Social Studies/History",
        "Physical Education",
        "Technology",
        "Computer Science",
        "French",
        "Business Studies",
        "Computer Science/ICT",
        "Arts",
        "Technology & Trades",
        "Psychology & Social Sciences",
        "Law & Political Science",
      ],
    },
  },
};


export default function SubjectsPage() {
  const router = useRouter();

  const [curriculum, setCurriculum] = useState<CurriculumType>("");
  const [educationLevel, setEducationLevel] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState("");
  const [tutorGender, setTutorGender] = useState("");

  useEffect(() => {
    const savedData = sessionStorage.getItem("childInfo");
    if (savedData) {
      const data = JSON.parse(savedData);
      setCurriculum(data.curriculum || "");
      setEducationLevel(data.educationLevel || "");
      setGradeLevel(data.gradeLevel || "");
      setSelectedSubjects(data.selectedSubjects || []);
      setLearningGoals(data.learningGoals || "");
      setTutorGender(data.tutorGender || "");
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
        curriculum,
        educationLevel,
        gradeLevel,
        selectedSubjects,
        learningGoals,
        tutorGender,
      })
    );
    router.push("/register/schedule");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center">Subjects</h2>

        {/* Curriculum Selection */}
        <select
          value={curriculum}
          onChange={(e) => {
            setCurriculum(e.target.value as CurriculumType);
            setEducationLevel("");
            setGradeLevel("");
            setSelectedSubjects([]);
          }}
          className="w-full p-2 border mt-2 rounded"
          required
        >
          <option value="">Select Curriculum</option>
          {Object.keys(educationData).map((curr) => (
            <option key={curr} value={curr}>
              {curr}
            </option>
          ))}
        </select>

        {/* Education Level */}
        {curriculum && (
          <select
            value={educationLevel}
            onChange={(e) => {
              setEducationLevel(e.target.value);
              setGradeLevel("");
              setSelectedSubjects([]);
            }}
            className="w-full p-2 border mt-2 rounded"
            required
          >
            <option value="">Select Education Level</option>
            {Object.keys(educationData[curriculum]).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        )}

        {/* Grade Level */}
        {educationLevel && (
          <select
            value={gradeLevel}
            onChange={(e) => {
              setGradeLevel(e.target.value);
              setSelectedSubjects([]);
            }}
            className="w-full p-2 border mt-2 rounded"
            required
          >
            <option value="">Select Grade Level</option>
            {educationData[curriculum][educationLevel].grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        )}

        {/* Subjects */}
        {gradeLevel && (
          <div className="mt-4">
            <h3 className="font-bold">Select Subjects:</h3>
            {educationData[curriculum][educationLevel].subjects.map((subject) => (
              <label key={subject} className="block">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectChange(subject)}
                  className="mr-2"
                />
                {subject}
              </label>
            ))}
          </div>
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

        {/* Preferred Tutor Gender */}
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

        <button
        onClick={() => router.push("/register/child-info")}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded mt-2">
          Back
          </button>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
