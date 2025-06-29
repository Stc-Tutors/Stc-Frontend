const Approach = () => {
    return (
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-orange-600">Our Values and Approach</h3>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                Our Approach
              </h2>
              <ul className="list-disc pl-4">
                <li><span className="font-semibold">Learner-centric:</span> Custom paths tailored to grade level, age, and personal goals.</li>
                <li><span className="font-semibold">Quality-guaranteed:</span> All instructors are thoroughly vetted, trained, and re-vetted by STC.</li>
                <li><span className="font-semibold">Privacy-first:</span> Student-tutor connections happen through secure, admin-managed tools.</li>
                <li><span className="font-semibold">Global-ready:</span> Present in Nigeria, UK, US, Canada, designed for global standards.</li>
              </ul>
            </div>
  
            {/* Why Choose Us? */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-orange-600">Why Choose Us?</h3>
              <ul className="list-disc pl-5">
                <li>Fully virtual, learn anytime, anywhere.</li>
                <li>Cross-border curriculum coverage.</li>
                <li>Free monthly group counseling webinars.</li>
                <li>Secure platform ensuring student and tutor privacy.</li>
                <li>Transparent pricing, no hidden fees, no direct payments.</li>
                </ul>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default Approach;
  