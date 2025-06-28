"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const [role, setRole] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
  const savedRole = sessionStorage.getItem("userRole");
  if (savedRole) {
    setRole(savedRole);
}

const savedInfo = sessionStorage.getItem("userRoleInfo");
  if (savedInfo) {
    const data = JSON.parse(savedInfo);
    setRole(data.role);
    setParentName(data.parentName);
    setEmail(data.email);
    setPhone(data.phone);
    setPreferredContact(data.preferredContact || []);
  }
}, []);

const handleRoleChange = (value: string) => {
  setRole(value);
  sessionStorage.setItem("userRole", value); // ✅ Save on select
};

  // optional: prevent access if service not selected
  useEffect(() => {
    const serviceType = sessionStorage.getItem("serviceType");
    if (!serviceType) {
      router.push("/dashboard/select-service");
    }
  }, []);

  const handleCheckbox = (method: string) => {
    setPreferredContact(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleContinue = () => {
    const roleData = {
      role,
      parentName,
      email,
      phone,
      preferredContact,
    };

    sessionStorage.setItem("userRole", role);
    sessionStorage.setItem("userRoleInfo", JSON.stringify(roleData));
    router.push("/dashboard/child-info");
  };

  const isParentFormValid =
    parentName.trim() && email.trim() && phone.trim() && preferredContact.length > 0;

  return (
    // <div className="min-h-screen bg-blue-900 flex items-center justify-center px-4 py-10">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Who's Signing Up?</h1>

        {/* Role selection */}
        <div className="mb-4 space-y-2">
          <label className="block">
            <input
              type="radio"
              name="role"
              value="parent"
              checked={role === "parent"}
              onChange={() => handleRoleChange("parent")}
            //   onChange={() => setRole("parent")}
            />
            <span className="ml-2">I am a parent/guardian</span>
          </label>
          <label className="block">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={() => handleRoleChange("student")}
            //   onChange={() => setRole("student")}
            />
            <span className="ml-2">I am a student (16+)</span>
          </label>
        </div>

        {/* Parent-only fields */}
        {role === "parent" && (
          <>
            <div className="mb-3">
              <label className="block font-semibold">Full Name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-3">
              <label className="block font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-3">
              <label className="block font-semibold">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Preferred Contact</label>
              {["Email", "SMS/Text message", "WhatsApp"].map((method) => (
                <label key={method} className="block">
                  <input
                    type="checkbox"
                    checked={preferredContact.includes(method)}
                    onChange={() => handleCheckbox(method)}
                    className="mr-2"
                  />
                  {method}
                </label>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleContinue}
          disabled={
            !role || (role === "parent" && !isParentFormValid)
          }
          className={`w-full py-2 px-4 rounded ${
            !role || (role === "parent" && !isParentFormValid)
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Continue
        </button>

        <button
        type="button"
        onClick={() => {
            sessionStorage.setItem("userRole", role);
            router.push("/dashboard/select-service");
        }}
        className="text-blue-500 hover:underline mt-4 block mx-auto">
            ← Back
            </button>
            </div>
            );
        }