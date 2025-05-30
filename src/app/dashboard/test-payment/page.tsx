"use client";

import { useState } from "react";

export default function FullPaymentForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    gender: "",
    dob: "",
    country: "",
    curriculum: "",
    language: "",
    grade: "",
    subjects: "",
    tutorGender: "",
    amount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    alert("Form submitted! Check console.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-xl grid gap-4">
        <h2 className="text-2xl font-bold mb-4">Tutoring & Payment Setup</h2>

        <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="p-2 border rounded" required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="p-2 border rounded" required />

        <select name="gender" value={form.gender} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input type="date" name="dob" value={form.dob} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="country" placeholder="Country of Residence" value={form.country} onChange={handleChange} className="p-2 border rounded" required />

        <select name="curriculum" value={form.curriculum} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">Select Curriculum</option>
          <option value="British">British</option>
          <option value="American">American</option>
          <option value="Nigerian">Nigerian</option>
          <option value="Montessori">Montessori</option>
          <option value="EYFS">EYFS</option>
        </select>

        <input type="text" name="language" placeholder="Primary Language" value={form.language} onChange={handleChange} className="p-2 border rounded" required />

        <input type="text" name="grade" placeholder="Grade Level" value={form.grade} onChange={handleChange} className="p-2 border rounded" required />

        <input type="text" name="subjects" placeholder="Subjects (comma-separated)" value={form.subjects} onChange={handleChange} className="p-2 border rounded" required />

        <select name="tutorGender" value={form.tutorGender} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">Preferred Tutor Gender</option>
          <option value="Any">Any</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} className="p-2 border rounded" required />

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
}