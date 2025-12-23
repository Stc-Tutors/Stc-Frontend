"use client";

import { Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ParentHeader() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Left Section */}
      <div>
        {/* Top Line — Dashboard Title */}
        <h2 className="text-xl font-semibold text-gray-800">
          Parent Dashboard
        </h2>
        <p className="text-gray-500 text-sm">
          Manage your child education journey
        </p>

        {/* Student selector, grade and track */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Select defaultValue="emmanuel">
            <SelectTrigger className="w-[180px] border-gray-300 text-gray-700 focus:ring-0">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emmanuel">Emmanuel Jobe</SelectItem>
              <SelectItem value="mary">Mary Ann</SelectItem>
              <SelectItem value="daniel">Daniel Scott</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-gray-500 text-sm">Grade 9 • Science Track</span>
        </div>
      </div>

      {/* Right Section (Buttons) */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
            <Settings className="w-4 h-4" />
          Manage
        </Button>
        
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
            Add Student
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
