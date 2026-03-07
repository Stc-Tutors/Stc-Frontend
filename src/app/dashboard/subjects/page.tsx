"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignupLogo from "@/app/components/SignupLogo";
import { bootcampAgeLevels } from "@/lib/bootcamp";
import { useEnrollment } from "@/contexts/enrollment-context";

type CurriculumType = "Nigerian" | "British" | "American" | "Canada" | "";

type GradeSubjects = {
  [curriculum: string]: {
    [educationLevel: string]: {
      grades: string[];
      subjects: string[];
    };
  };
};

const examOptions: { [key: string]: string[] } = {
  Nigeria: ["NCEE (Primary 6)", "BECE (JSS3)", "SSCE (SS3)", "JAMB", "IJMB-Science", "IJMB-Commercial", "IJMB-Arts", "JUPEB-Science", "JUPEB-Commercial", "JUPEB-Arts", "NABTEB"],
  UK: ["11+", "IGCSE", "GCSE", "A-Levels"],
  USA: ["SAT", "ACT", "AP"],
  Canada: ["Provincinal-Assessments (Graduation Exams)", "Diploma-Exams (Grade 12)","SAT", "AP/IB"],
};

const examSubjects: { [key: string]: string[] } = {
  NCEE: ["English Language", "Mathematics", "General Paper"],
  BECE: ["English Language", "Mathematics", "Basic Science", "Social Studies"],
  SSCE: ["English Language", "Mathematics", "Physics", "Biology", "Chemistry"],
  JAMB: ["English", "Mathematics", "Biology", "Physics", "Chemistry", "Government"],
  NABTEB: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics", "Literature-in-Engish", "Economics", "Geography", "Government", "Civic Education"],
  "IJMB-Science": ["English", "Biology", "Chemistry", "Physics", "Mathematics", "Geography", "Agricultural Science", "Geology", "Technical Drawing", "Further Mathematics"],
  "IJMB-Commercial": ["English", "Business Management", "Economics", "Accounting", "Government", "Commerce", "Geography", "Mathematics"],
  "IJMB-Arts": ["Literature-in-English", "CRS", "IRS", "History", "Government", "English", "French", "Hausa/Igbo/Yoruba", "Arabic", "Music"],
  "JUPEB-Science": ["English", "Biology", "Chemistry", "Physics", "Mathematics", "Agricultural Science", "Geography", "Further Mathematics", "Geology"],
  "JUPEB-Commercial": ["English", "Accounting", "Business Studies (Business Management", "Economics", "Government", "Commerce", "Geography", "Mathematics"],
  "JUPEB-Arts": ["Literature-in-English", "Christian Religious Studies (CRS)", "Islamic Religious Studies (IRS)", "History", "English", "French", "Government", "Music", "Visual Arts", "Arabic", "Yoruba/Igbo/Hausa"],
  "11+": ["Maths", "English", "Verbal Reasoning", "Non-verbal Reasoning"],
  IGCSE: ["English", "Mathematics", "Biology", "Physics", "Chemistry"],
  GCSE: ["English Literature", "Maths", "Physics", "History"],
  "A-Levels": ["Mathematics", "Further Mathematics", "Economics", "Chemistry"],
  SAT: ["Reading", "Writing", "Math"],
  ACT: ["English", "Math", "Reading", "Science"],
  AP: ["Calculus", "Biology", "US History"],
  "Provincinal-Assessments": ["Reading", "Mathematics", "Writing"],
  "Diploma-Exams": ["English Language/Arts", "Mathematics (Calculus, Algebra)", "Biology", "Chemistry", "Physics", "History", "Geography"],
  "AP/IB": ["Sciences", "Mathematics", "Languages", "Social Sciences", "Arts", "Computer Science"]
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

export const dynamic = "force-dynamic"

export default function SubjectsPage() {
  const router = useRouter();

  const { updateServiceDetails } = useEnrollment();

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

//   const handleSubmit = () => {
//   updateServiceDetails({
//     serviceType:
//       learningFocus === "Academic Tutoring"
//         ? "academic-tutoring"
//         : learningFocus === "Exam Preparation"
//         ? "exam-preparation"
//         : "tech-bootcamp",

//     learningFocus,
//     curriculum,
//     ageLevel,
//     selectedSubjects,
//     learningGoals,
//     tutorGender,
//   });

//   router.push("/dashboard/schedule");
// };

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
            const value = e.target.value;
            setLearningFocus(value);
            setSelectedSubjects([]);
            // Reset depending on the learning focus
            if (value === "Tech for Kids") {
              setAgeLevel("");
              setCurriculum("");
              setEducationLevel("");
              setGradeLevel("");
            } else {
              setCurriculum("");
              setEducationLevel("");
              setGradeLevel("");
              setAgeLevel("");
            }
          }}
          className="w-full p-2 border mt-2 rounded"
          required
        >
          <option value="">Select Learning Focus</option>
          <option value="academic-tutoring">Academic Tutoring</option>
          <option value="exam-preparation">Exam Preparation</option>
          <option value="tech-bootcamp">Tech for Kids</option>
        </select>

        {/* ------------------ Subject Tutoring ------------------ */}
{learningFocus === "academic-tutoring" && (
  <>
    {/* Curriculum */}
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
  </>
)}

{/* ------------------ Exam Preparation ------------------ */}
{learningFocus === "exam-preparation" && (
  <>
    {/* Country */}
    <select
      value={curriculum}
      onChange={(e) => {
        setCurriculum(e.target.value);
        setGradeLevel("");
        setSelectedSubjects([]);
      }}
      className="w-full p-2 border mt-2 rounded"
      required
    >
      <option value="">Select Country/Curriculum</option>
      {Object.keys(examOptions).map((curr) => (
        <option key={curr} value={curr}>
          {curr}
        </option>
      ))}
    </select>

    {/* Exam */}
    {curriculum && (
      <select
        value={gradeLevel}
        onChange={(e) => {
          setGradeLevel(e.target.value);
          setSelectedSubjects([]);
        }}
        className="w-full p-2 border mt-2 rounded"
        required
      >
        <option value="">Select Exam</option>
        {(examOptions[curriculum] || []).map((exam) => (
          <option key={exam} value={exam}>
            {exam}
          </option>
        ))}
      </select>
    )}

    {/* Subjects */}
    {gradeLevel && (
      <div className="mt-4">
        <h3 className="font-bold">Select Subjects:</h3>
        {(examSubjects[gradeLevel.split(" ")[0]] || []).map((subject) => (
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
  </>
)}
        {/* Tech for Kids - Age Level and Track */}
        {learningFocus === "tech-bootcamp" && (
          <>
          {/*Curriculum for Tech for Kids*/}
            <select 
            value={curriculum}
            onChange={(e) => setCurriculum(e.target.value)}
            className="w-full p-2 border mt-2 rounded"
            required
            >
              <option value="">Select Country/Curriculum</option>
              <option value="Nigerian">Nigeria</option>
              <option value="British">UK</option>
              <option value="American">USA</option>
              <option value="Canada">Canada</option>
            </select>
            
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
                      type="radio"
                      name="techTrack"
                      value={track}
                      checked={selectedSubjects.includes(track)}
                      onChange={() => setSelectedSubjects([track])}
                      className="mr-2"
                    />
                    {track}
                  </label>
                ))}
              </div>
            )}
          </>
        )}

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