"use client";
import Image from "next/image";

const Headline = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">

          {/* Right Side: Text */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About STC Tutors - 
              <span className="text-[#38b6ff]"> Shaping Tomorrow's Champion</span>
            </h2>
            <p className="mt-6 text-gray-700 leading-relaxed">
              At STC Edu Consult, an education initiative of Statcomm TC Limited, 
              we are redefining the future of learning by seamlessly connecting students to qualified, 
              carefully vetted tutors through a secure and user-friendly virtual platform. 
              With a focus on learners in Nigeria, Africa, the UK, the USA, Canada, and worldwide, 
              we’re building a global education ecosystem that prioritizes accessibility, quality, and impact. <br/>
              </p>

              <p className="mt-6 text-gray-700 leading-relaxed">
              Our services span primary, secondary, and post-secondary tutoring, 
              adult education, and language learning across major world languages and African languages. 
              We also offer specialized skill-building courses in areas such as tech skill development for kids 
              between the ages of 5 and 20 years, in partnership with top tech institutions, 
              as well as soft skills and career readiness. <br />
              </p>
              
              <p className="mt-6 text-gray-700 leading-relaxed">
              Beyond academics, we take a wholesome approach to student success, 
              offering monthly counseling sessions, career talks, 
              and live engagement events to promote well-being and clarity of purpose. <br />
              </p>

              <p className="mt-6 text-gray-700 leading-relaxed">
              Our fully integrated <span className="text-[#38b6ff]">Learning Management System (LMS) </span>
              provides tailored dashboards for students and parents/guardians, 
              ensuring seamless class access, performance tracking, 
              and real-time communication, all designed to support learning at every step.
              </p>
          </div>

          {/* Left Side: Image + Stats
          <div className="relative">
            <Image
              src="/image/about.jpg"
              alt="Tutoring session"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div> */}
        </div>
    </section>

    
  );
};

export default Headline;
