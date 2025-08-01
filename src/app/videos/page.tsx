"use client";
import Head from 'next/head';
import { useState } from 'react';

export default function VideosPage() {
  const [showVideos, setShowVideos] = useState(false);

  const toggleVideos = () => {
    setShowVideos(!showVideos);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Tutors Dashboard</title>
        <meta name="description" content="Tutors dashboard page" />
      </Head>

      <div className="max-w-4xl mx-auto p-6">
        {/* Course Section */}
        <div className="mb-10">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Data Analysis & Fundamentals
          </h3>
          <p className="text-gray-600 mb-6">
            <strong>Prof. Allison Peters</strong>
          </p>
        </div>

        {/* Video Container */}
        <div className="mb-10 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="aspect-w-16 aspect-h-9 bg-black">
            <video 
              className="w-full h-full object-cover"
              controls
              poster="/video-poster.jpg"
            >
              <source src="/your-video-file.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Introduction to Data Analysis</h3>
            <div className="flex items-center text-gray-600 mb-4">
              <span className="mr-4">Lecture 1</span>
              <span>Duration: 12:45</span>
            </div>
            <p className="text-gray-600 mb-4">
              In this introductory lesson, we'll cover the basic concepts of data analysis, 
              including data types, data structures, and the data analysis process.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-sky-100 hover:text-sky-600 rounded-md text-gray-700 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-sky-100 hover:text-sky-600 rounded-md text-gray-700 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Course Description */}
        <div className="mb-10">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Course Description
          </h3>
          <p className="text-gray-600">
            This beginner-friendly course provides a comprehensive introduction to the fundamentals of data analysis. Designed for students, professionals, and curious minds with the eye no prior experience, the course equips learners with the essential skills to collect, clean, explore, and interpret data using practical tools and real-world examples.
          </p>
        </div>

        {/* Mentor Profile Section - Added under course description */}
        {/* Mentor Profile Section - Improved Styling */}
<div className="mb-10 bg-white rounded-lg shadow-md p-6">
  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
    {/* Photo Container - Improved Styling */}
    
    
    <div className="text-center md:text-left">
      {/* Header - Improved Styling */}
      <h3 className="text-2xl font-bold text-sky-600 mb-3">Instructor</h3>
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Allison Peters</h4>
        <p className="text-sm text-gray-500">Senior Data Analysis Mentor</p>
      </div>
      
      {/* Mentor Description */}
      <div className="space-y-2 text-gray-600">
        <p>
          Our mentor, Allison Peters, has been mentoring for many years and provides 
          independent experience with a focus on helping students succeed in their studies.
        </p>
        <p>
          She creates a supportive learning environment with personalized guidance 
          to help students achieve their academic goals.
        </p>
      </div>
    </div>
  </div>
</div>

        {/* AI Videos Section */}
         <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">AI Videos</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <button 
              onClick={toggleVideos}
              className={`flex items-center px-4 py-2 rounded-md ${
                showVideos 
                  ? 'bg-sky-100 text-sky-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-sky-100 hover:text-sky-600'
              } transition-colors`}
            >
              All Videos
              <svg
                className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                  showVideos ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-sky-100 hover:text-sky-600 rounded-md text-gray-700 transition-colors">
              Resources
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-sky-100 hover:text-sky-600 rounded-md text-gray-700 transition-colors">
              Support
            </button>
          </div>
          
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showVideos ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <ul className="space-y-3 pb-2">
              {Array(8).fill(0).map((_, index) => (
                <li 
                  key={index} 
                  className="flex items-center text-gray-600 hover:text-sky-500 cursor-pointer transition-colors hover:bg-gray-100 rounded px-3 py-2"
                >
                  <svg
                    className="h-5 w-5 mr-3 text-sky-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Basic fundamental of maths {index % 2 === 0 ? '0:24' : '0:34'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}