"use client";

import Image from "next/image";
import { Star, UserRound, ChevronLeft, ChevronRight } from "lucide-react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useRef } from "react";

const lectures = [
  {
    title: "Mathematics full Course with Tables",
    rating: 4.9,
    students: "982,941 students",
    price: "$29.0",
    image: "/image/lecture-thumbnail.jpg",
    subject: "Mathematics",
  },
  {
    title: "English full Course with Verbs",
    rating: 4.9,
    students: "982,941 students",
    price: "$29.0",
    image: "/image/lecture-thumbnail.jpg",
    subject: "English",
  },
  {
    title: "Biology Intro Course",
    rating: 4.7,
    students: "741,200 students",
    price: "$19.0",
    image: "/image/lecture-thumbnail.jpg",
    subject: "Biology",
  },
];

export default function TodayLectures() {
  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: 1,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 2, spacing: 16 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 2.5, spacing: 16 },
      },
    },
  });

  return (
    <div className="relative space-y-4">
      <h3 className="font-semibold text-gray-800">Today's Lecture</h3>

      <div ref={sliderRef} className="keen-slider">
        {lectures.map((lecture, i) => (
          <div
            key={i}
            className="keen-slider__slide bg-white rounded-lg shadow-sm p-4"
          >
            <Image
              src={lecture.image}
              alt={lecture.title}
              width={400}
              height={200}
              className="rounded-md w-full object-cover"
            />
            <span className="text-xs font-medium text-blue-600 mt-2 inline-block">
              {lecture.subject.toUpperCase()}
            </span>
            <h4 className="font-semibold text-md mt-1">{lecture.title}</h4>

            <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span>{lecture.rating}</span>
              </div>

              <div className="flex items-center gap-1">
                <UserRound size={14} className="text-blue-500" />
                <span>{lecture.students}</span>
              </div>
            </div>

            <div className="mt-2 text-sm flex justify-between items-center">
              <span className="text-green-600 font-medium">Paid</span>
              <span className="line-through text-gray-400">{lecture.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute -top-2 right-0 flex space-x-2">
        <button
          onClick={() => instanceRef.current?.prev()}
          className="bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => instanceRef.current?.next()}
          className="bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
