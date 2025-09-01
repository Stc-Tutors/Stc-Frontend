"use client";
import Image from "next/image";

const HeaderBanner = () => {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6">
      {/* Background Image */}
      <Image
        src="/download.jpg" // Replace this with your actual image path
        alt="Library Background"
        layout="fill"
        objectFit="cover"
        quality={100} // Make it sharp
        className="rounded-lg"
      />

      {/* Download Button */}
      <div className="absolute top-4 right-6">
        <button className="bg-white text-blue-600 px-4 py-2 rounded shadow-md hover:bg-blue-50 flex items-center gap-1 text-sm">
          Download Report
          <span className="text-lg">📥</span>
        </button>
      </div>

      {/* Profile Image */}
      <div className="absolute -bottom-6 left-6">
        <Image
          src="/download (1).jpg" // Replace with your actual profile picture
          alt="Profile"
          width={70}
          height={70}
          className="rounded-full border-4 border-white shadow-lg object-cover"
        />
      </div>
    </div>
  );
};

export default HeaderBanner;
