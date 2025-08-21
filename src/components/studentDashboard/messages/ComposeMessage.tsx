"use client";

import React, { useState } from "react";

interface ComposeMessageProps {
  onCancel: () => void;
}

export default function ComposeMessage({ onCancel }: ComposeMessageProps) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const recipients = ["Admin", "John Doe", "Jane Smith"]; // ✅ only allowed people

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Message sent to:", recipient, { subject, body });
    onCancel(); // close after sending
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold mb-4">Compose Message</h2>

      {/* Recipient Dropdown */}
      <label className="block mb-2 font-semibold">Recipient</label>
      <select
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        required
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select Recipient</option>
        {recipients.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {/* Subject */}
      <label className="block mb-2 font-semibold">Subject</label>
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        className="w-full p-2 border rounded mb-4"
      />

      {/* Body */}
      <label className="block mb-2 font-semibold">Message</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        className="w-full p-2 border rounded mb-4 h-32"
      ></textarea>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
