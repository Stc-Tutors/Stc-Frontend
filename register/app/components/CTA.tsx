"use client";
import React from "react";
import Image from "next/image";

const CTA = () => {
  return (
    <section className="py-16 px-8 bg-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
        {/* Left Side: Image & Floating Elements */}
        <div className="relative flex-1">
          <Image
            src="/image/cta.jpeg"
            alt="Student with Phone"
            width={500}
            height={500}
            className="w-full rounded-lg"
          />

          {/* Floating Trophy */}
          <div className="absolute top-10 left-[-10%] bg-white p-4 rounded-lg shadow-lg">
            🏆
          </div>

          {/* Floating Grade Card */}
          <div className="absolute bottom-5 left-[-10%] bg-white p-4 rounded-lg shadow-lg text-sm">
            <p>A+</p>
            <p>Maths - 94%</p>
            <p>Physics - 92%</p>
            <p>Chemistry - 96%</p>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-blue-900">Unlock your potential with skilled instructors.</h2>
          <p className="mt-2 mb-4">Book a class with us today</p>
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder="Enter your message"
              rows={4}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-indigo-700 text-white py-3 rounded-md text-lg hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CTA;
