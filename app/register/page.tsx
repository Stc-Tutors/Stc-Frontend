"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function RegisterPage() {
  const router = useRouter();
  const steps = ["/register", "/register/child-info", "/register/subjects", "/register/schedule", "/register/payment"];
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    surname: "",
    email: "",
    phone: "",
    //password: "",
  });

  useEffect(() => {
    setIsClient(true);
    const savedData = typeof window !== "undefined" ? sessionStorage.getItem("registerFormData") : null;
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      sessionStorage.setItem("registerFormData", JSON.stringify(formData));
    }
  }, [formData, isClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prevData) => ({ ...prevData, phone: value }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstName: "",
      surname: "",
      email: "",
      phone: "",
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    const res = await fetch("http://localhost:4000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.firstName,
        middleName: formData.middleName,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        //password: formData.password,
      }),
    });

    const data = await res.json();
    console.log(data);
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      sessionStorage.setItem("registerFormData", JSON.stringify(formData));
      await handleRegister();
      router.push("/register/child-info");
    }
  };

  const handleBack = () => {
    const currentStepIndex = steps.findIndex((step) => step === window.location.pathname);
    if (currentStepIndex > 0) {
      router.push(steps[currentStepIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <p className="text-2xl font-bold text-center">Welcome, great parent! </p>
        <p className="text-gray-500 text-center mb-4">Create your parent account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="firstName"
              placeholder="First Name*"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          
          <input
            type="text"
            name="middleName"
            placeholder="Middle Name"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          
          <div>
            <input
              type="text"
              name="surname"
              placeholder="Surname*"
              value={formData.surname}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.surname ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address*"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <PhoneInput
              country={"us"}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputClass={`w-full p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* <div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password*"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, email:e.target.value})}
              className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
          </div> */}
          
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </form>

        <div className="text-center mt-4">
          <button className="text-blue-500 hover:underline" onClick={handleBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}