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
                To connect learners with <span className="font-semibold"> qualified educators</span> and deliver accessible,  
                <span className="font-semibold"> high-quality academic</span> and personal development programs 
                through a secure and supportive <span className="font-semibold">virtual platform.</span> We aim 
                to promote excellence, foster confidence, and empower individuals 
                of all ages to thrive in school, in their careers, and life.
              </p>
            </div>
  
            {/* Vision Card */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-orange-600">Our Vision</h3>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                We make quality tutoring accessible to everyone
              </h2>
              <p className="mt-4 text-gray-700">
                To become a global leader in virtual education, making personalized tutoring, skill training, 
                mentorship universally accessible, and equipping learners with the tools they need to succeed 
                in a rapidly evolving world
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default MissionVision;
  