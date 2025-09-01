"use client";
export default function InfoCard({ title }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="text-sm space-y-2 text-gray-700">
        <p><strong>Name:</strong> Derickson William</p>
        <p><strong>Email:</strong> derickson124@gmail.com</p>
        <p><strong>Nationality:</strong> Nigerian</p>
        <p><strong>Career:</strong> Art</p>
        <p><strong>Gender:</strong> Male</p>
        <p><strong>Current Result:</strong> Excellent</p>
      </div>
    </div>
  );
}
