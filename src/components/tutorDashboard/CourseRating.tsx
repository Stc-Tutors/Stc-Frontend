"use client";

import { Card } from "@/components/ui/card";

export default function CourseRatingCard() {
  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Overall Course Rating</h3>
      <div className="flex items-center gap-4 mb-6">
        <p className="text-4xl font-bold text-gray-800">4.6</p>
        <div className="flex flex-col">
          <div className="flex text-yellow-400 text-lg">
            ★★★★★
          </div>
          <span className="text-sm text-gray-500">Overall rating</span>
        </div>
      </div>

      {/* Star breakdown */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(stars => (
          <div key={stars} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-10">{stars}★</span>
            <div className="flex-1 bg-gray-200 h-2 rounded">
              <div className="bg-blue-500 h-2 rounded" style={{ width: `${stars * 15}%` }} />
            </div>
            <span>{stars * 8}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
