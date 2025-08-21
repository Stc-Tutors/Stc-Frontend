"use client";
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const CourseCard = () => {
  return (
    <div className="rounded-md shadow-sm w-full max-w-sm bg-white">
      <div className="relative">
        <Image
          src="/premium.png"
          width={400}
          height={200}
          alt="Course thumbnail"
          className="rounded-t-md"
        />
        <div className="absolute top-2 right-2 bg-white text-yellow-500 px-2 py-1 rounded text-sm flex items-center">
          <FaStar size={12} className="mr-1" />
          4.9
        </div>
      </div>
      <div className="p-4 space-y-2">
        <span className="text-xs text-blue-600 font-semibold uppercase">Mathematics</span>
        <h2 className="font-medium text-gray-800">Mathematics full Course with Tables</h2>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>👨‍🏫 Mr James Prowse</span>
          <span>⏳ 3 weeks</span>
        </div>
        <div className="text-green-600 text-sm font-medium">
          Paid <span className="line-through text-gray-400">$29.0</span>{' '}
          <span className="text-gray-600">Expiring in 8 days</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
