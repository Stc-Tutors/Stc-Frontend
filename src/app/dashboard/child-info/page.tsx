"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneInput, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Countries and Flags
const countries = [
  { name: "United States", code: "us", dialCode: "+1" },
  { name: "United Kingdom", code: "gb", dialCode: "+44" },
  { name: "Nigeria", code: "ng", dialCode: "+234" },
  { name: "Canada", code: "ca", dialCode: "+1" },
];

/*
// Education Levels
const educationLevels: Record<string, string[]> = {
  British: ["Primary", "Secondary", "A-Level", "Undergraduate", "Postgraduate"],
  American: ["Elementary", "Middle School", "High School", "Undergraduate", "Graduate"],
  Nigerian: ["Primary 1-6", "JSS 1-3", "SSS 1-3", "Undergraduate", "Postgraduate"],
  //EYFS: ["Nursery", "Reception", "Primary", "Undergraduate"],
  Montessori: ["Toddler", "Primary", "Secondary", "Higher Education"],
};

// Grade Levels per Country
const gradeLevels: Record<string, string[]> = {
  "United States": ["Kindergarten", "Grade 1-5", "Grade 6-8", "Grade 9-12"],
  "United Kingdom": ["Reception", "Year 1-6", "Year 7-9", "Year 10-13"],
  Nigeria: ["Primary 1-6", "JSS 1-3", "SSS 1-3"],
  Canada: ["Grade 1-6", "Grade 7-9", "Grade 10-12"],
};*/

const languages = ["English", "French", "Spanish", "Mandarin", "Arabic"];

export default function ChildInfoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    countryCode: countries[0].dialCode, // Default
    countryOfResidence: "",
    curriculum: "",
    educationLevel: "",
    primaryLanguage: "",
    gradeLevel: "",
  });

  // Load saved form data from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = sessionStorage.getItem("childInfoFormData");
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
    }
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle phone input change
  const handlePhoneChange = (value: string, country: CountryData) => {
    setFormData((prevData) => ({
      ...prevData,
      phone: value,
      countryCode: String(country.dialCode),
    }));
  };

  /* Reset educationLevel when curriculum changes
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      educationLevel: "",
    }));
  }, [formData.curriculum]);

  // Reset grade level when country changes
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      gradeLevel: "",
    }));
  }, [formData.countryOfResidence]); */

  // Save form data and navigate to next step
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("childInfoFormData", JSON.stringify(formData));
    router.push("/dashboard/subjects");
  };

  // Save form data and navigate back
  const handleBack = () => {
    if (typeof window !== "undefined" && formData) {
      sessionStorage.setItem("childInfoFormData", JSON.stringify(formData));
    }
    router.push("/dashboard"); // Navigate to the previous step
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center">Child Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <input
            type="text"
            name="fullName"
            placeholder="Child's Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

         {/* Gender Dropdown 
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select> */}

          {/* Date of Birth */}
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          {/* Phone Number Input with Auto-detect Country Code */}
          <PhoneInput
            country={formData.countryCode.replace("+", "").toLowerCase() || "us"}
            value={formData.phone}
            onChange={handlePhoneChange}
            inputClass="w-full p-2 border border-gray-300 rounded"
            containerClass="w-full"
            dropdownClass="w-full"
            enableSearch
          />

          {/* Primary Teaching Language Dropdown */}
          <select
            name="primaryLanguage"
            value={formData.primaryLanguage}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Primary Teaching Language</option>
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>

          {/* Country of Residence Dropdown*/}
          <select
            name="countryOfResidence"
            value={formData.countryOfResidence}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Country of Residence</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>  

          {/* Curriculum Selection 
          <select
            name="curriculum"
            value={formData.curriculum}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Curriculum</option>
            <option value="British">British</option>
            <option value="American">American</option>
            <option value="Nigerian">Nigerian</option>
            <option value="Montessori">Montessori</option>
          </select> */}

          {/* Education Level Selection 
          <select
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Education Level</option>
            {formData.curriculum &&
              educationLevels[formData.curriculum]?.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
          </select> */}

          {/* Grade Level
          <select
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            disabled={!formData.curriculum}
          >
            <option value="">Select Grade Level</option>
            {formData.countryOfResidence &&
              gradeLevels[formData.countryOfResidence]?.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
          </select>  */}

          {/* Continue Button */}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Continue
          </button>
        </form>

        {/* Back Button */}
        <div className="text-center mt-4">
          <button className="text-blue-500 hover:underline" onClick={handleBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}