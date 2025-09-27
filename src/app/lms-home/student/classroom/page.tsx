"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LibraryBig } from "lucide-react";

export default function VideosPage() {
  const [showVideos, setShowVideos] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.push(`/lms-home/student/dashboard`);
  };

  const toggleVideos = () => {
    setShowVideos(!showVideos);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      <Head>
        <title>Classroom</title>
        <meta name="description" content="Classroom page" />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/**************** BACK BUTTON ****************/}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-700 mb-6 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-bold">BACK</span>
        </button>

        {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <LibraryBig className="text-blue-500"/>
        <h1 className="text-lg font-semibold text-gray-800">Classroom</h1>
      </div>

        {/**************** COURSE SECTION ****************/}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Data Analysis & Fundamentals
          </h3>
          <p className="text-gray-600">
            <strong>Prof. Allison Peters</strong>
          </p>
        </div>

        {/**************** VIDEO CONTAINER ****************/}
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Introduction to Data Analysis
            </h3>
            <div className="flex items-center text-gray-600 mb-4">
              <span className="mr-4">Lecture 1</span>
              <span>Duration: 12:45</span>
            </div>
            <p className="text-gray-600 mb-4">
              In this introductory lesson, we'll cover the basic concepts of data
              analysis, including data types, data structures, and the data
              analysis process.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-md text-gray-700 transition-colors">
                Download
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-md text-gray-700 transition-colors">
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/**************** COURSE DESCRIPTION ****************/}
        <div className="mb-10">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Course Description
          </h3>
          <p className="text-gray-600">
            This beginner-friendly course provides a comprehensive introduction
            to the fundamentals of data analysis. Designed for students,
            professionals, and curious minds with no prior experience, the course
            equips learners with the essential skills to collect, clean, explore,
            and interpret data using practical tools and real-world examples.
          </p>
        </div>

        {/**************** MENTOR PROFILE ****************/}
        <div className="mb-10 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-blue-600 mb-3">Instructor</h3>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Allison Peters
            </h4>
            <p className="text-sm text-gray-500">Senior Data Analysis Mentor</p>
          </div>
          <div className="space-y-2 text-gray-600">
            <p>
              Our mentor, Allison Peters, has been mentoring for many years and
              provides independent experience with a focus on helping students
              succeed in their studies.
            </p>
            <p>
              She creates a supportive learning environment with personalized
              guidance to help students achieve their academic goals.
            </p>
          </div>
        </div>

        {/**************** AI VIDEOS SECTION ****************/}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">AI Videos</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={toggleVideos}
              className={`flex items-center px-4 py-2 rounded-md ${
                showVideos
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
              } transition-colors`}
            >
              All Videos
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-md text-gray-700 transition-colors">
              Resources
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-md text-gray-700 transition-colors">
              Support
            </button>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showVideos ? "max-h-96" : "max-h-0"
            }`}
          >
            <ul className="space-y-3 pb-2">
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <li
                    key={index}
                    className="flex items-center text-gray-600 hover:text-blue-500 cursor-pointer transition-colors hover:bg-gray-100 rounded px-3 py-2"
                  >
                    ▶ Basic fundamental of maths{" "}
                    {index % 2 === 0 ? "0:24" : "0:34"}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
