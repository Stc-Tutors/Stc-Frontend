// components/ActionDropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function ActionDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        ⋮
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg z-10">
          <ul className="py-1 text-sm text-gray-700">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">View Details</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Tutor Profile</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Submit Assignment</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Resources</li>
          </ul>
        </div>
      )}
    </div>
  );
}