"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useRouter } from "next/navigation";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function WelcomeModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl h-[70vh] rounded-2xl overflow-visible bg-white shadow-2xl">

        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-[9999] flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-bold text-gray-700 shadow-lg hover:bg-gray-100"
        >
          ×
        </button>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
          className="h-full"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="flex h-full flex-col items-center justify-center bg-[#1c2574] px-8 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold">
                Welcome to
              </h2>

              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold text-[#38b6ff]">
                STC Tutors
              </h1>

              <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed">
                Empowering learners through Academic Tutoring,
                Exam Preparation, and Digital Skills Training.
              </p>

              <button
              onClick={() => {
                setOpen(false);
                router.push("/services");
              }}
              className="mt-8 bg-[#38b6ff] px-6 py-3 cursor-pointer rounded-lg font-semibold hover:bg-blue-500 transition"
              >
                Explore Programs
                </button>
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div className="flex h-full items-center justify-center bg-white p-4">
              <img
                src="/image/bootcamp.jpeg"
                alt="Tech Bootcamp"
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}


// "use client";

// import { useEffect, useState } from "react";

// export default function WelcomeModal() {
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     setOpen(true);
//   }, []);

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
//       <div className="relative w-[90%] max-w-4xl rounded-2xl overflow-hidden">

//         {/* Close button */}
//         <button
//           onClick={() => setOpen(false)}
//           className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white text-black text-2xl shadow-lg hover:bg-gray-200"
//         >
//           ×
//         </button>

//         {/* Flyer Image */}
//         <img
//           src="/image/bootcamp.jpeg"
//           alt="Welcome to STC Tutors"
//           className="w-full h-auto rounded-2xl"
//         />
//       </div>
//     </div>
//   );
// }