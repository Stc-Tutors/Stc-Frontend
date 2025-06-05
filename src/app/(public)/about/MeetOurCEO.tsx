"use client";
import Image from "next/image";

const MeetOurCEO = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: CEO Image */}
          <div className="relative">
            <Image
              src="/image/management.jpg"
              alt="Olalayo Ayodeji - CEO"
              width={500}
              height={500}
              className="rounded-lg shadow-lg"
            />
            {/* <div className="absolute bottom-4 left-4 bg-gray-900 text-white shadow-md p-3 rounded-md text-center">
              {/* <p className="text-lg font-bold">SC TUTORS</p> */}
              {/* <p className="text-sm text-gray-300">CEO/Founder</p> */}
            {/* </div> */} 
          </div>

          {/* Right Side: CEO Message */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              We Are Your Bridge to Educational Excellence
            </h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              As the management of STC Edu. Consult, I am passionate about 
              transforming the educational landscape by making high-quality 
              tutoring accessible to everyone, regardless of their geographical 
              location. Our mission is to empower both students and adults to 
              reach their full potential through personalized learning experiences 
              and dedicated support. Alongside our committed team, we aim to 
              create an inclusive and innovative platform that not only educates 
              but also inspires and motivates our learners to succeed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetOurCEO;
