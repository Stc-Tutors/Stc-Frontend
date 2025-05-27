const MissionVision = () => {
    return (
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-orange-600">Our Mission</h3>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                We bridge the gap between students and educators
              </h2>
              <p className="mt-4 text-gray-700">
                STC Edu. Consult connects students with qualified tutors and provides 
                comprehensive educational services that promote academic excellence, 
                personal growth, and lifelong learning in a secure and supportive virtual 
                learning environment.
              </p>
            </div>
  
            {/* Vision Card */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-orange-600">Our Vision</h3>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                We make quality tutoring accessible to everyone
              </h2>
              <p className="mt-4 text-gray-700">
                Our vision is to be a global leader in online education, empowering individuals 
                of all ages to achieve their academic and personal potential through innovative 
                and accessible learning solutions.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default MissionVision;
  